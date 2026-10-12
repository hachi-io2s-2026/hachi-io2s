import { useEffect, useState } from "react";
import { api, mensajeError } from "../api/client";
import { Bloque, Grafica, Tabla, Tarjeta } from "./Componentes";
import type { Datos, Fila, Filtros } from "./tipos";
import { fecha, moneda, numero } from "./utilidades";
import "./Reportes.css";
const hoy = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Guatemala",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const inicial: Filtros = {
  desde: hoy.slice(0, 4) + "-01-01",
  hasta: hoy,
  servicio: "TODOS",
  agrupacion: "MES",
  cv1: 50,
  cv2: 25,
  fijos: 10000,
  a1: 2,
  a2: 1,
  horas: 24,
  pertServicio: "DAYCARE",
  pesos: [5, 5, 35, 35, 15, 5],
};
const titulos = [
  "Finanzas y cobranza",
  "Capacidad y ocupación",
  "Mezcla óptima · PL",
  "Flujo operativo · CPM/PERT",
  "Tiempos y cumplimiento",
  "Clientes · ABC/Pareto",
];
const resumir = (filas: Fila[], campo: string) =>
  Object.entries(
    filas.reduce<Record<string, number>>((acc, r) => {
      const k = String(r[campo]);
      acc[k] = (acc[k] ?? 0) + Number(r.total);
      return acc;
    }, {}),
  ).map(([nombre, total]) => ({ nombre, total }));
export default function Reportes() {
  const [f, setF] = useState(inicial),
    [aplicado, setAplicado] = useState(inicial),
    [datos, setDatos] = useState<Datos | null>(null),
    [error, setError] = useState(""),
    [cargando, setCargando] = useState(true),
    [tab, setTab] = useState(0),
    [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    api<Datos>("/reportes/suite", { method: "POST", body: aplicado })
      .then((d) => {
        if (vigente) setDatos(d);
      })
      .catch((e) => {
        if (vigente) setError(mensajeError(e));
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });
    return () => {
      vigente = false;
    };
  }, [aplicado, intento]);
  const editar = (k: keyof Filtros, v: string | number) =>
    setF((p) => ({ ...p, [k]: v }));
  const numerico = (
    k: "cv1" | "cv2" | "fijos" | "a1" | "a2" | "horas",
    nombre: string,
    max: number,
    min = 0,
  ) => (
    <label>
      {nombre}
      <input
        type="number"
        min={min}
        max={max}
        step="0.01"
        required
        value={f[k]}
        onChange={(e) => editar(k, Number(e.target.value))}
      />
    </label>
  );
  return (
    <div className="reportes">
      <header>
        <p className="rep-ceja">HACHI / USAC · Feria EMI</p>
        <h1>Reportes financieros y operativos</h1>
        <p>Decisiones de capacidad, cobranza y servicio con datos del hotel.</p>
      </header>
      <form
        className="rep-controles"
        onSubmit={(e) => {
          e.preventDefault();
          setError("");
          setDatos(null);
          setCargando(true);
          setAplicado({ ...f });
          setIntento((i) => i + 1);
        }}
      >
        <div className="rep-filtros">
          <label>
            Desde
            <input
              type="date"
              required
              value={f.desde}
              max={f.hasta}
              onChange={(e) => editar("desde", e.target.value)}
            />
          </label>
          <label>
            Hasta
            <input
              type="date"
              required
              value={f.hasta}
              min={f.desde}
              onChange={(e) => editar("hasta", e.target.value)}
            />
          </label>
          <label>
            Servicio
            <select
              value={f.servicio}
              onChange={(e) => editar("servicio", e.target.value)}
            >
              {["TODOS", "HOSPEDAJE", "DAYCARE"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label>
            Agrupación
            <select
              value={f.agrupacion}
              onChange={(e) => editar("agrupacion", e.target.value)}
            >
              <option value="MES">Mensual</option>
              <option value="SEMANA">Semanal ISO</option>
            </select>
          </label>
          <button className="rep-primario" type="submit">
            Aplicar y recalcular
          </button>
          <button
            type="button"
            disabled={!datos || cargando}
            onClick={() => window.print()}
          >
            Imprimir reporte
          </button>
        </div>
        <details>
          <summary>Supuestos de costos, supervisión y PERT</summary>
          <p>
            Simulación; no representa costos contables registrados. Tarifas y
            capacidades vigentes al cierre del rango. Los cambios se aplican al
            recalcular.
          </p>
          <div className="rep-filtros">
            {numerico("cv1", "CV hospedaje (Q/cupo-noche)", 1e7)}
            {numerico("cv2", "CV daycare (Q/cupo-día)", 1e7)}
            {numerico("fijos", "Costos fijos mensuales (Q)", 1e7)}
            {numerico("a1", "Supervisión hospedaje (h/cupo)", 24, 0.01)}
            {numerico("a2", "Supervisión daycare (h/cupo)", 24, 0.01)}
            {numerico("horas", "Horas-persona disponibles/día", 10000)}
            <label>
              Historia para PERT
              <select
                value={f.pertServicio}
                disabled={f.servicio !== "TODOS"}
                onChange={(e) => editar("pertServicio", e.target.value)}
              >
                <option>DAYCARE</option>
                <option>HOSPEDAJE</option>
              </select>
            </label>
          </div>
          <p>
            Pesos de asignación del tiempo histórico a las actividades (se
            normalizan). C y D se modelan en paralelo.
          </p>
          <div className="rep-filtros">
            {f.pesos.map((v, i) => (
              <label key={i}>
                Peso {String.fromCharCode(65 + i)}
                <input
                  type="number"
                  required
                  min="0.01"
                  max="100"
                  step="0.01"
                  value={v}
                  onChange={(e) =>
                    setF((p) => ({
                      ...p,
                      pesos: p.pesos.map((w, j) =>
                        j === i ? Number(e.target.value) : w,
                      ),
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </details>
      </form>
      <nav className="rep-tabs" aria-label="Reportes">
        {titulos.map((t, i) => (
          <button
            key={t}
            aria-current={tab === i ? "page" : undefined}
            onClick={() => setTab(i)}
          >
            {i + 1}. {t}
          </button>
        ))}
      </nav>
      {cargando && <p role="status">Calculando reportes…</p>}
      {error && (
        <p role="alert" className="aviso aviso-error">
          {error}
        </p>
      )}
      {datos && !cargando && (
        <>
          <p className="rep-periodo">
            {titulos[tab]} · {fecha(datos.filtros.desde)} –{" "}
            {fecha(datos.filtros.hasta)} · {datos.filtros.servicio}
          </p>
          {tab === 0 && <Finanzas d={datos} />}
          {tab === 1 && <Capacidad d={datos} />}
          {tab === 2 && <Mezcla d={datos} />}
          {tab === 3 && <Pert d={datos} />}
          {tab === 4 && <Rendimiento d={datos} />}
          {tab === 5 && <Clientes d={datos} />}
        </>
      )}
    </div>
  );
}
export function Finanzas({ d }: { d: Datos }) {
  const [servicio, setServicio] = useState("HOSPEDAJE");
  const elegibles = d.modelos.filter(
      (m) => d.filtros.servicio === "TODOS" || m.tipo === d.filtros.servicio,
    ),
    m = elegibles.find((m) => m.tipo === servicio) ?? elegibles[0],
    eq = m?.equilibrio;
  const variable = m?.tipo === "HOSPEDAJE" ? d.filtros.cv1 : d.filtros.cv2,
    limite = Math.max(
      10,
      (eq?.unidades ?? Number(m?.capacidad ?? 1) * 30) * 1.5,
    );
  const curva = Array.from({ length: 21 }, (_, i) => {
    const unidades = Math.round((limite * i) / 20);
    return {
      unidades,
      ingresos: unidades * Number(m?.precio ?? 0),
      costos: d.filtros.fijos + unidades * variable,
    };
  });
  const tendencia = Object.values(
    d.finanzas.tendencia.reduce<Record<string, Fila>>((acc, r) => {
      const p = String(r.periodo);
      acc[p] ??= { periodo: p, HOSPEDAJE: 0, DAYCARE: 0 };
      acc[p][String(r.tipo)] = r.facturado;
      return acc;
    }, {}),
  );
  return (
    <>
      <div className="rep-kpis">
        <Tarjeta titulo="Facturación" valor={moneda(d.finanzas.facturado)} />
        <Tarjeta
          titulo="Cobros del período"
          valor={moneda(d.finanzas.cobrado)}
        />
        <Tarjeta
          titulo="Cartera de la cohorte"
          valor={moneda(d.finanzas.pendiente)}
        />
        <Tarjeta
          titulo="Sobrepagos de la cohorte"
          valor={moneda(d.finanzas.sobrepago)}
        />
        {d.utilizacion.map((u) => (
          <Tarjeta
            key={String(u.tipo)}
            titulo={`RevPAH · ${u.tipo}`}
            valor={moneda(u.revpah)}
            nota="Q por cupo disponible-día"
          />
        ))}
      </div>
      <p className="rep-nota">
        Facturación: reservas no canceladas que inician en el rango. Cartera:
        saldo de esas reservas con pagos liquidados hasta el cierre. Cobros:
        pagos PAGADO por fecha de pago, incluso de otras cohortes o reservas
        canceladas. No se restan entre sí como si fueran la misma base.
      </p>
      <Bloque titulo="Facturación por línea de servicio">
        <Grafica
          datos={tendencia}
          x="periodo"
          monetaria
          series={[
            { clave: "HOSPEDAJE", nombre: "Hospedaje", linea: true },
            { clave: "DAYCARE", nombre: "Daycare", linea: true },
          ].filter(
            (s) =>
              d.filtros.servicio === "TODOS" || s.clave === d.filtros.servicio,
          )}
        />
        <Tabla
          titulo="Facturación por período"
          filas={d.finanzas.tendencia}
          columnas={[
            { clave: "periodo", nombre: "Período" },
            { clave: "tipo", nombre: "Servicio" },
            { clave: "facturado", nombre: "Facturación", formato: "moneda" },
          ]}
        />
      </Bloque>
      <Bloque titulo="Canales de cobro">
        <Grafica
          datos={d.finanzas.canales}
          x="metodo"
          monetaria
          series={[{ clave: "cobrado", nombre: "Cobrado" }]}
        />
        <Tabla
          titulo="Cobros por canal"
          filas={d.finanzas.canales}
          columnas={[
            { clave: "metodo", nombre: "Método" },
            { clave: "cobrado", nombre: "Cobrado", formato: "moneda" },
          ]}
        />
      </Bloque>
      <Bloque titulo="Punto de equilibrio mensual · escenario por servicio">
        <label>
          Servicio del escenario{" "}
          <select
            value={m?.tipo ?? ""}
            onChange={(e) => setServicio(e.target.value)}
          >
            {elegibles.map((v) => (
              <option key={v.tipo}>{v.tipo}</option>
            ))}
          </select>
        </label>
        <p>
          Se asigna el total de costos fijos al servicio seleccionado. Resultado
          simulado = (precio − costo variable) × unidades − costos fijos; no es
          un estado de resultados contable.
        </p>
        {eq && m ? (
          <>
            <div className="rep-kpis">
              <Tarjeta titulo="Tarifa al cierre" valor={moneda(m.precio)} />
              <Tarjeta titulo="Margen unitario" valor={moneda(eq.margen)} />
              <Tarjeta
                titulo="Equilibrio (unidades/mes)"
                valor={numero(eq.unidades)}
                nota={
                  eq.unidadesEnteras === null
                    ? "Sin equilibrio con margen no positivo"
                    : `${eq.unidadesEnteras} cupos-unidad completos`
                }
              />
            </div>
            <p>
              Pérdida cuando ingresos &lt; costos; ganancia cuando ingresos &gt;
              costos.{" "}
              {eq.unidades !== null
                ? `Cruce en ${numero(eq.unidades)} unidades y ${moneda(eq.unidades * Number(m.precio))}.`
                : "El margen no permite cubrir costos fijos."}
            </p>
            <div className="rep-zonas">
              <span>
                Zona de pérdida:{" "}
                {eq.unidades === null
                  ? "todo el dominio"
                  : `0–${numero(eq.unidades)} unidades`}
              </span>
              <span>
                Zona de ganancia:{" "}
                {eq.unidades === null
                  ? "no disponible"
                  : `más de ${numero(eq.unidades)} unidades`}
              </span>
            </div>
            <Grafica
              datos={curva}
              x="unidades"
              monetaria
              equilibrio={{ cruce: eq.unidades, limite }}
              series={[
                { clave: "ingresos", nombre: "Ingresos", linea: true },
                {
                  clave: "costos",
                  nombre: "Costos totales",
                  linea: true,
                  color: "#ba3b39",
                },
              ]}
            />
            <Tabla
              titulo="Escenario de equilibrio"
              filas={curva.map((r) => ({
                ...r,
                resultado: r.ingresos - r.costos,
              }))}
              columnas={[
                {
                  clave: "unidades",
                  nombre: "Unidades/mes",
                  formato: "numero",
                },
                { clave: "ingresos", nombre: "Ingresos", formato: "moneda" },
                { clave: "costos", nombre: "Costos", formato: "moneda" },
                {
                  clave: "resultado",
                  nombre: "Resultado simulado",
                  formato: "moneda",
                },
              ]}
            />
          </>
        ) : (
          <p>Sin tarifa vigente para simular.</p>
        )}
      </Bloque>
    </>
  );
}
export function Capacidad({ d }: { d: Datos }) {
  return (
    <>
      <p className="rep-nota">
        Hospedaje: noches con entrada registrada, excluyendo la fecha de salida.
        Daycare: asistencias presentes/finalizadas con entrada. Demanda:
        reservas no canceladas, incluidas pendientes. Capacidad desconocida se
        muestra como — y no se interpreta como cero.
      </p>
      {d.utilizacion.map((u) => (
        <Bloque key={String(u.tipo)} titulo={String(u.tipo)}>
          <div className="rep-kpis">
            <Tarjeta
              titulo="Ocupación ponderada"
              valor={u.ocupacion === null ? "—" : numero(u.ocupacion) + "%"}
            />
            <Tarjeta
              titulo="Vacancia"
              valor={u.vacancia === null ? "—" : numero(u.vacancia) + "%"}
            />
            <Tarjeta
              titulo="Días saturados / sobredemanda"
              valor={`${u.saturados} / ${u.sobredemanda}`}
            />
            <Tarjeta
              titulo="Días sin capacidad registrada"
              valor={numero(u.diasSinCapacidad)}
            />
          </div>
          <Grafica
            datos={d.ocupacion.filter((r) => r.tipo === u.tipo)}
            x="fecha"
            series={[
              { clave: "ocupados", nombre: "Cupos ocupados" },
              { clave: "capacidad", nombre: "Capacidad vigente", linea: true },
              { clave: "demanda", nombre: "Demanda reservada", linea: true },
            ]}
          />
        </Bloque>
      ))}
      <Tabla
        titulo="Utilización por servicio"
        filas={d.utilizacion}
        columnas={[
          { clave: "tipo", nombre: "Servicio" },
          { clave: "cuposDisponibles", nombre: "Cupos-día", formato: "numero" },
          { clave: "pico", nombre: "Pico ocupado", formato: "numero" },
          { clave: "diasPico", nombre: "Fechas pico" },
          { clave: "bajaDemanda", nombre: "Días bajo 50%", formato: "numero" },
          { clave: "saturados", nombre: "Días saturados", formato: "numero" },
          { clave: "sobredemanda", nombre: "Sobredemanda", formato: "numero" },
        ]}
      />
      <Tabla
        titulo="Ocupación diaria"
        filas={d.ocupacion}
        columnas={[
          { clave: "fecha", nombre: "Fecha", formato: "fecha" },
          { clave: "tipo", nombre: "Servicio" },
          { clave: "ocupados", nombre: "Ocupados", formato: "numero" },
          { clave: "capacidad", nombre: "Capacidad", formato: "numero" },
          { clave: "demanda", nombre: "Demanda", formato: "numero" },
          { clave: "tasa", nombre: "Ocupación", formato: "porcentaje" },
          { clave: "vacancia", nombre: "Vacancia", formato: "porcentaje" },
        ]}
      />
    </>
  );
}
export function Mezcla({ d }: { d: Datos }) {
  const [hover, setHover] = useState("");
  if (!d.mezcla)
    return (
      <p>
        Faltan tarifas o capacidades vigentes al cierre para resolver la mezcla.
      </p>
    );
  const r = d.mezcla,
    f = d.filtros,
    c1 =
      f.servicio === "DAYCARE"
        ? 0
        : Number(d.modelos.find((v) => v.tipo === "HOSPEDAJE")?.capacidad ?? 0),
    c2 =
      f.servicio === "HOSPEDAJE"
        ? 0
        : Number(d.modelos.find((v) => v.tipo === "DAYCARE")?.capacidad ?? 0);
  const sx = (v: number) => 65 + (v / Math.max(1, c1)) * 570,
    sy = (v: number) => 310 - (v / Math.max(1, c2)) * 255;
  return (
    <Bloque titulo="Maximizar contribución diaria">
      <p>
        Max Z = (P₁ − CV₁)X₁ + (P₂ − CV₂)X₂. X₁ ≤ {c1}; X₂ ≤ {c2}; {f.a1}X₁ +{" "}
        {f.a2}X₂ ≤ {f.horas}; X₁, X₂ ≥ 0.
      </p>
      <p>
        P₁ = {moneda(d.modelos.find((v) => v.tipo === "HOSPEDAJE")?.precio)}, P₂
        = {moneda(d.modelos.find((v) => v.tipo === "DAYCARE")?.precio)}; CV₁ ={" "}
        {moneda(f.cv1)}, CV₂ = {moneda(f.cv2)}. Z es margen de contribución,
        antes de costos fijos. El filtro individual fija el otro servicio en
        cero.
      </p>
      <div className="rep-kpis">
        <Tarjeta
          titulo="Óptimo continuo (X₁, X₂)"
          valor={`(${numero(r.optimo.x)}, ${numero(r.optimo.y)})`}
        />
        <Tarjeta titulo="Contribución máxima/día" valor={moneda(r.optimo.z)} />
        <Tarjeta
          titulo="Cupos enteros recomendados"
          valor={`(${r.entero.x}, ${r.entero.y})`}
          nota={`Contribución ${moneda(r.entero.z)}`}
        />
      </div>
      <svg
        className="rep-svg"
        viewBox="0 0 720 380"
        role="img"
        aria-label="Región factible de hospedaje y daycare"
      >
        <defs>
          <clipPath id="pl-area">
            <rect x="65" y="40" width="585" height="270" />
          </clipPath>
        </defs>
        <path d="M65 40V310H660" fill="none" stroke="#333" />
        <g clipPath="url(#pl-area)">
          <polygon
            points={r.vertices.map((v) => `${sx(v.x)},${sy(v.y)}`).join(" ")}
            fill="#b8e4d4"
            stroke="#177560"
            strokeWidth="2"
          />
          <line
            x1={sx(c1)}
            y1="40"
            x2={sx(c1)}
            y2="310"
            stroke="#5968bd"
            strokeDasharray="5 5"
          />
          <line
            x1="65"
            y1={sy(c2)}
            x2="650"
            y2={sy(c2)}
            stroke="#b67d26"
            strokeDasharray="5 5"
          />
          <line
            x1={sx(0)}
            y1={sy(f.horas / f.a2)}
            x2={sx(f.horas / f.a1)}
            y2={sy(0)}
            stroke="#c34942"
            strokeWidth="2"
          />
        </g>
        {r.vertices.map((v, i) => (
          <circle
            key={i}
            cx={sx(v.x)}
            cy={sy(v.y)}
            r="5"
            fill="#177560"
            tabIndex={0}
            onFocus={() =>
              setHover(`X₁=${numero(v.x)}, X₂=${numero(v.y)}; Z=${moneda(v.z)}`)
            }
            onMouseEnter={() =>
              setHover(`X₁=${numero(v.x)}, X₂=${numero(v.y)}; Z=${moneda(v.z)}`)
            }
          >
            <title>{`X₁=${numero(v.x)}, X₂=${numero(v.y)}; Z=${moneda(v.z)}`}</title>
          </circle>
        ))}
        <circle cx={sx(r.optimo.x)} cy={sy(r.optimo.y)} r="8" fill="#c43b39">
          <title>Óptimo continuo</title>
        </circle>
        <text x="230" y="355">
          X₁ · Hospedaje (0 a {c1})
        </text>
        <text x="70" y="25">
          X₂ · Daycare (0 a {c2})
        </text>
      </svg>
      <p aria-live="polite">
        {hover || "Explore los vértices con el cursor o el teclado."}
      </p>
      <p>
        Verde: región factible · rojo: supervisión / óptimo · azul: capacidad
        hospedaje · ocre: capacidad daycare.
      </p>
      <Tabla
        titulo="Vértices factibles"
        filas={r.vertices}
        columnas={[
          { clave: "x", nombre: "X₁", formato: "numero" },
          { clave: "y", nombre: "X₂", formato: "numero" },
          { clave: "z", nombre: "Contribución", formato: "moneda" },
        ]}
      />
      <Tabla
        titulo="Holguras en el óptimo continuo"
        filas={[r.holguras]}
        columnas={[
          { clave: "hospedaje", nombre: "Cupos hospedaje", formato: "numero" },
          { clave: "daycare", nombre: "Cupos daycare", formato: "numero" },
          { clave: "horas", nombre: "Horas-persona", formato: "numero" },
        ]}
      />
    </Bloque>
  );
}
export function Pert({ d }: { d: Datos }) {
  if (!d.pert)
    return (
      <p>
        Sin estancias finalizadas con tiempos válidos para estimar PERT en{" "}
        {d.historia.servicio}.
      </p>
    );
  const pos: Record<string, [number, number]> = {
    A: [65, 115],
    B: [190, 115],
    C: [325, 55],
    D: [325, 175],
    E: [465, 115],
    F: [600, 115],
  };
  return (
    <Bloque titulo="Red de servicio · escenario PERT">
      <p className="rep-nota">
        El esquema no registra tiempos A–F. Se estiman a partir de mínimo,
        promedio y máximo de {d.historia.muestras} estancias de{" "}
        {d.historia.servicio}, multiplicados por los pesos configurados. No son
        mediciones por etapa. La red supone C y D en paralelo; la duración
        resultante es un escenario, no una validación del ciclo real.
      </p>
      <p>
        tₑ = (a + 4m + b)/6; varianza = ((b − a)/6)². Unidad: horas; varianza:
        horas². Historia: mínimo {numero(d.historia.minimo)}, media{" "}
        {numero(d.historia.media)}, máximo {numero(d.historia.maximo)} h.
      </p>
      <div className="rep-kpis">
        <Tarjeta
          titulo="Duración del proyecto modelado"
          valor={numero(d.pert.duracion) + " h"}
        />
        <Tarjeta
          titulo="Actividades críticas (holgura = 0)"
          valor={d.pert.criticas.join(", ")}
          nota={d.pert.rutasCriticas.map((r) => r.join(" → ")).join(" / ")}
        />
      </div>
      <svg
        className="rep-svg"
        viewBox="0 0 700 260"
        role="img"
        aria-label="Red CPM: A a B; B a C y D; C y D a E; E a F"
      >
        <defs>
          <marker
            id="flecha-pert"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M0 0L10 5L0 10Z" fill="#68746e" />
          </marker>
        </defs>
        {d.pert.filas.flatMap((a) =>
          a.predecesoras.map((p) => (
            <line
              key={p + a.id}
              x1={pos[p][0] + 30}
              y1={pos[p][1]}
              x2={pos[a.id][0] - 33}
              y2={pos[a.id][1]}
              stroke={
                a.critica && d.pert!.filas.find((v) => v.id === p)?.critica
                  ? "#c43b39"
                  : "#68746e"
              }
              strokeWidth="2"
              markerEnd="url(#flecha-pert)"
            />
          )),
        )}
        {d.pert.filas.map((a) => (
          <g key={a.id}>
            <circle
              cx={pos[a.id][0]}
              cy={pos[a.id][1]}
              r="30"
              fill={a.critica ? "#c43b39" : "#177560"}
            />
            <text
              x={pos[a.id][0]}
              y={pos[a.id][1] + 5}
              textAnchor="middle"
              fill="white"
            >
              {a.id}
              {a.critica ? "*" : ""}
            </text>
            <text x={pos[a.id][0]} y={pos[a.id][1] + 50} textAnchor="middle">
              {numero(a.te)} h
            </text>
            <title>
              {a.nombre} · holgura {numero(a.holgura)} h
            </title>
          </g>
        ))}
      </svg>
      <p>* Rojo: actividad crítica. A→B→(C y D)→E→F.</p>
      <Tabla
        titulo="Control CPM y PERT"
        filas={d.pert.filas}
        columnas={[
          { clave: "id", nombre: "ID" },
          { clave: "nombre", nombre: "Actividad" },
          { clave: "predecesoras", nombre: "Predecesoras" },
          { clave: "a", nombre: "a (h)", formato: "numero" },
          { clave: "m", nombre: "m (h)", formato: "numero" },
          { clave: "b", nombre: "b (h)", formato: "numero" },
          { clave: "te", nombre: "tₑ (h)", formato: "numero" },
          { clave: "varianza", nombre: "Varianza (h²)", formato: "numero" },
          { clave: "es", nombre: "ES", formato: "numero" },
          { clave: "ef", nombre: "EF", formato: "numero" },
          { clave: "ls", nombre: "LS", formato: "numero" },
          { clave: "lf", nombre: "LF", formato: "numero" },
          { clave: "holgura", nombre: "Holgura", formato: "numero" },
        ]}
      />
    </Bloque>
  );
}
export function Rendimiento({ d }: { d: Datos }) {
  return (
    <>
      <div className="rep-kpis">
        <Tarjeta
          titulo="Reservas canceladas"
          valor={numero(d.cancelaciones.canceladas)}
          nota={`${numero(d.cancelaciones.porcentaje)}% de ${d.cancelaciones.total} reservas iniciadas en el rango`}
        />
      </div>
      <p className="rep-nota">
        Estancias agrupadas por entrada real y daycare por fecha de asistencia.
        Sólo pares completos integran promedios. Puntualidad significa
        entrada/salida a la hora programada o antes (tolerancia cero); cada día
        de daycare usa la hora prevista en la reserva. Noches = diferencia entre
        fechas civiles.
      </p>
      {d.rendimiento.map((r) => {
        const registros = d.estancias.filter(
            (e) => e.tipo === r.tipo && e.horas !== null,
          ),
          ancho = r.tipo === "HOSPEDAJE" ? 24 : 2;
        const bins = Object.entries(
          registros.reduce<Record<string, number>>((acc, v) => {
            const k = Math.floor(Number(v.horas) / ancho) * ancho;
            acc[k] = (acc[k] ?? 0) + 1;
            return acc;
          }, {}),
        )
          .sort((a, b) => Number(a[0]) - Number(b[0]))
          .map(([k, frecuencia]) => ({
            rango: `${k}–<${Number(k) + ancho} h`,
            frecuencia,
          }));
        return (
          <Bloque key={String(r.tipo)} titulo={String(r.tipo)}>
            <div className="rep-kpis">
              <Tarjeta
                titulo="Duración promedio"
                valor={numero(r.horasPromedio) + " h"}
                nota={`${r.muestras} observaciones completas`}
              />
              {r.tipo === "HOSPEDAJE" && (
                <Tarjeta
                  titulo="Noches promedio"
                  valor={numero(r.nochesPromedio)}
                />
              )}
              <Tarjeta
                titulo="Puntualidad de entrada"
                valor={numero(r.puntualidadEntrada) + "%"}
              />
              <Tarjeta
                titulo="Puntualidad de salida"
                valor={numero(r.puntualidadSalida) + "%"}
              />
              <Tarjeta
                titulo="Salidas tardías"
                valor={numero(r.retrasosSalida)}
              />
              {r.tipo === "DAYCARE" && (
                <Tarjeta
                  titulo="Ausencias"
                  valor={numero(r.ausencias)}
                  nota={`${numero(r.tasaAusencia)}% de asistencias`}
                />
              )}
            </div>
            <Grafica
              datos={bins}
              x="rango"
              series={[{ clave: "frecuencia", nombre: "Estancias" }]}
            />
          </Bloque>
        );
      })}
      <Tabla
        titulo="Desviaciones de estancia"
        filas={d.estancias}
        columnas={[
          { clave: "id", nombre: "Reserva" },
          { clave: "tipo", nombre: "Servicio" },
          { clave: "estado", nombre: "Estado" },
          { clave: "entrada", nombre: "Entrada real", formato: "fecha" },
          { clave: "salida", nombre: "Salida real", formato: "fecha" },
          { clave: "horas", nombre: "Duración h", formato: "numero" },
          {
            clave: "demoraEntrada",
            nombre: "Δ entrada min",
            formato: "numero",
          },
          { clave: "demoraSalida", nombre: "Δ salida min", formato: "numero" },
        ]}
      />
      <Tabla
        titulo="Indicadores de cumplimiento"
        filas={d.rendimiento}
        columnas={[
          { clave: "tipo", nombre: "Servicio" },
          { clave: "muestras", nombre: "Muestras", formato: "numero" },
          {
            clave: "horasPromedio",
            nombre: "Horas promedio",
            formato: "numero",
          },
          {
            clave: "nochesPromedio",
            nombre: "Noches promedio",
            formato: "numero",
          },
          {
            clave: "puntualidadEntrada",
            nombre: "Entrada puntual",
            formato: "porcentaje",
          },
          {
            clave: "puntualidadSalida",
            nombre: "Salida puntual",
            formato: "porcentaje",
          },
          { clave: "tasaAusencia", nombre: "Ausencia", formato: "porcentaje" },
        ]}
      />
    </>
  );
}
export function Clientes({ d }: { d: Datos }) {
  const [segmento, setSegmento] = useState("talla");
  return (
    <>
      <Bloque titulo="Concentración de facturación por propietario">
        <p>
          ABC por facturación no cancelada. El cliente que cruza 80% permanece
          en A; el que cruza 95% permanece en B. Facturación cero se clasifica
          C. Los porcentajes se calculan sobre toda la cohorte.
        </p>
        <Grafica
          datos={d.clientes}
          x="cliente"
          monetaria
          series={[
            { clave: "total", nombre: "Facturación" },
            {
              clave: "acumulado",
              nombre: "Acumulado %",
              linea: true,
              derecha: true,
            },
          ]}
        />
        <Tabla
          titulo="Clientes ABC"
          filas={d.clientes}
          columnas={[
            { clave: "id", nombre: "ID" },
            { clave: "cliente", nombre: "Propietario" },
            { clave: "frecuencia", nombre: "Reservas", formato: "numero" },
            { clave: "total", nombre: "Facturación", formato: "moneda" },
            {
              clave: "porcentaje",
              nombre: "Participación",
              formato: "porcentaje",
            },
            { clave: "acumulado", nombre: "Acumulado", formato: "porcentaje" },
            { clave: "categoria", nombre: "ABC" },
          ]}
        />
      </Bloque>
      <Bloque titulo="Demanda por características de la mascota">
        <label>
          Agrupar por{" "}
          <select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
          >
            <option value="talla">Peso</option>
            <option value="raza">Raza</option>
            <option value="sexo">Sexo</option>
          </select>
        </label>
        <Grafica
          datos={resumir(d.segmentos, segmento)}
          x="nombre"
          monetaria
          series={[{ clave: "total", nombre: "Facturación" }]}
        />
        <Tabla
          titulo="Segmentación de demanda"
          filas={d.segmentos}
          columnas={[
            { clave: "raza", nombre: "Raza" },
            { clave: "sexo", nombre: "Sexo" },
            { clave: "talla", nombre: "Peso" },
            { clave: "frecuencia", nombre: "Reservas", formato: "numero" },
            { clave: "total", nombre: "Facturación", formato: "moneda" },
          ]}
        />
      </Bloque>
    </>
  );
}
