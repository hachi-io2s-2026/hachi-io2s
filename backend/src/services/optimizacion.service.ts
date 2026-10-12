/** Modelos puros: no consultan MySQL ni confunden supuestos con observaciones. */
export interface Mezcla {
  p1: number;
  p2: number;
  cv1: number;
  cv2: number;
  c1: number;
  c2: number;
  a1: number;
  a2: number;
  horas: number;
}
export function optimizar(d: Mezcla) {
  if (
    Object.values(d).some((v) => !Number.isFinite(v) || v < 0) ||
    d.a1 <= 0 ||
    d.a2 <= 0
  )
    throw new Error("Parámetros de mezcla inválidos");
  const restricciones = [
    [1, 0, d.c1],
    [0, 1, d.c2],
    [d.a1, d.a2, d.horas],
    [1, 0, 0],
    [0, 1, 0],
  ];
  const vertices: { x: number; y: number; z: number }[] = [];
  const valor = (x: number, y: number) =>
    (d.p1 - d.cv1) * x + (d.p2 - d.cv2) * y;
  for (let i = 0; i < restricciones.length; i++)
    for (let j = i + 1; j < restricciones.length; j++) {
      const [a, b, c] = restricciones[i],
        [e, f, g] = restricciones[j];
      const det = a * f - b * e;
      if (Math.abs(det) < 1e-10) continue;
      const x = (c * f - b * g) / det,
        y = (a * g - c * e) / det;
      if (
        x >= -1e-8 &&
        y >= -1e-8 &&
        x <= d.c1 + 1e-8 &&
        y <= d.c2 + 1e-8 &&
        d.a1 * x + d.a2 * y <= d.horas + 1e-8 &&
        !vertices.some((v) => Math.abs(v.x - x) + Math.abs(v.y - y) < 1e-8)
      )
        vertices.push({ x: Math.max(0, x), y: Math.max(0, y), z: valor(x, y) });
    }
  const cx = vertices.reduce((s, v) => s + v.x, 0) / vertices.length,
    cy = vertices.reduce((s, v) => s + v.y, 0) / vertices.length;
  vertices.sort(
    (a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx),
  );
  const optimo = vertices.reduce((a, b) => (b.z > a.z ? b : a), {
    x: 0,
    y: 0,
    z: 0,
  });
  // Los cupos son indivisibles: además del óptimo continuo se entrega el entero exacto.
  if (d.c1 > 10000 || d.c2 > 10000)
    throw new Error("Capacidad fuera del límite de simulación");
  let entero = { x: 0, y: 0, z: 0 };
  for (let x = 0; x <= Math.floor(Math.min(d.c1, d.horas / d.a1)); x++) {
    const y =
      d.p2 > d.cv2
        ? Math.max(
            0,
            Math.floor(Math.min(d.c2, (d.horas - d.a1 * x) / d.a2) + 1e-9),
          )
        : 0;
    if (valor(x, y) > entero.z) entero = { x, y, z: valor(x, y) };
  }
  return {
    vertices,
    optimo,
    entero,
    holguras: {
      hospedaje: d.c1 - optimo.x,
      daycare: d.c2 - optimo.y,
      horas: d.horas - d.a1 * optimo.x - d.a2 * optimo.y,
    },
  };
}
export interface Actividad {
  id: string;
  nombre: string;
  predecesoras: string[];
  a: number;
  m: number;
  b: number;
}
export function cpm(actividades: Actividad[]) {
  const ids = new Set(actividades.map((a) => a.id));
  if (
    ids.size !== actividades.length ||
    actividades.some(
      (a) =>
        a.predecesoras.some((p) => !ids.has(p)) ||
        ![a.a, a.m, a.b].every(Number.isFinite) ||
        a.a < 0 ||
        a.a > a.m ||
        a.m > a.b,
    )
  )
    throw new Error("Red o tiempos PERT inválidos");
  const filas: (Actividad & {
    te: number;
    varianza: number;
    es: number;
    ef: number;
    ls: number;
    lf: number;
    holgura: number;
    critica: boolean;
  })[] = [];
  const pendientes = [...actividades];
  while (pendientes.length) {
    const i = pendientes.findIndex((a) =>
      a.predecesoras.every((p) => filas.some((f) => f.id === p)),
    );
    if (i < 0) throw new Error("La red contiene un ciclo");
    const a = pendientes.splice(i, 1)[0],
      te = (a.a + 4 * a.m + a.b) / 6;
    const es = Math.max(
      0,
      ...a.predecesoras.map((p) => filas.find((f) => f.id === p)!.ef),
    );
    filas.push({
      ...a,
      te,
      varianza: ((a.b - a.a) / 6) ** 2,
      es,
      ef: es + te,
      ls: 0,
      lf: 0,
      holgura: 0,
      critica: false,
    });
  }
  const duracion = Math.max(0, ...filas.map((f) => f.ef));
  for (let i = filas.length - 1; i >= 0; i--) {
    const f = filas[i],
      siguientes = filas.filter((s) => s.predecesoras.includes(f.id));
    f.lf = siguientes.length
      ? Math.min(...siguientes.map((s) => s.ls))
      : duracion;
    f.ls = f.lf - f.te;
    f.holgura = Math.max(0, f.ls - f.es);
    f.critica = f.holgura < 1e-8;
  }
  const rutasCriticas: string[][] = [];
  const recorrer = (actual: (typeof filas)[number], ruta: string[]) => {
    const siguientes = filas.filter(
      (s) =>
        s.critica &&
        s.predecesoras.includes(actual.id) &&
        Math.abs(s.es - actual.ef) < 1e-8,
    );
    if (!siguientes.length && Math.abs(actual.ef - duracion) < 1e-8)
      rutasCriticas.push(ruta);
    for (const siguiente of siguientes)
      recorrer(siguiente, [...ruta, siguiente.id]);
  };
  for (const raiz of filas.filter(
    (f) => f.critica && f.predecesoras.length === 0,
  ))
    recorrer(raiz, [raiz.id]);
  return {
    rutasCriticas,
    duracion,
    filas,
    criticas: filas.filter((f) => f.critica).map((f) => f.id),
  };
}
export function pareto<T extends { id: number; total: number }>(clientes: T[]) {
  if (clientes.some((c) => !Number.isFinite(c.total) || c.total < 0))
    throw new Error("Facturación inválida");
  const orden = [...clientes].sort((a, b) => b.total - a.total || a.id - b.id),
    total = orden.reduce((s, c) => s + c.total, 0);
  let acumulado = 0;
  return orden.map((c) => {
    const previo = total ? acumulado / total : 1;
    acumulado += c.total;
    return {
      ...c,
      porcentaje: total ? (c.total / total) * 100 : 0,
      acumulado: total ? (acumulado / total) * 100 : 0,
      categoria:
        c.total === 0
          ? "C"
          : previo < 0.8 - 1e-10
            ? "A"
            : previo < 0.95 - 1e-10
              ? "B"
              : "C",
    };
  });
}
export function equilibrio(precio: number, variable: number, fijo: number) {
  if ([precio, variable, fijo].some((v) => !Number.isFinite(v) || v < 0))
    throw new Error("Costos inválidos");
  const margen = precio - variable;
  return {
    margen,
    unidades: margen > 0 ? fijo / margen : null,
    unidadesEnteras: margen > 0 ? Math.ceil(fijo / margen) : null,
  };
}
