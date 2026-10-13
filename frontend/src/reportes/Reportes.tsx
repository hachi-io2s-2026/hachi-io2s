import { useEffect, useState } from "react";
import { api, mensajeError } from "../api/client";
import { Encabezado } from "../panel/ui";
import {
  Bloque,
  Grafica,
  Guia,
  Lectura,
  Tabla,
  Tarjeta,
  type Hallazgo,
  type Tono,
} from "./Componentes";
import type { Datos, Fila, Filtros } from "./tipos";
import {
  fecha,
  listaFechas,
  moneda,
  nombreServicio,
  numero,
} from "./utilidades";
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
// Mismos nombres que usa el backend para las etapas A–F del servicio
const ETAPAS = [
  "Recepción y triaje",
  "Asignación de área",
  "Alimentación y medicación",
  "Recreación y ejercicio",
  "Higiene pre-salida",
  "Cobro y check-out",
];
const PESTANAS = [
  {
    titulo: "Dinero",
    pregunta:
      "¿Cuánto vendimos, cuánto cobramos y cuánto hay que vender para no perder?",
  },
  {
    titulo: "Ocupación",
    pregunta: "¿Qué tan lleno estuvo el hotel y cuándo faltó o sobró espacio?",
  },
  {
    titulo: "Mezcla ideal",
    pregunta:
      "¿Cuántos perros de cada servicio conviene atender al día para ganar más?",
  },
  {
    titulo: "Tiempos de atención",
    pregunta:
      "¿Cuánto tarda atender a un perro y qué etapas no pueden retrasarse?",
  },
  {
    titulo: "Puntualidad",
    pregunta:
      "¿Se cumplen los horarios reservados y cuántas reservas se cancelan?",
  },
  {
    titulo: "Clientes",
    pregunta:
      "¿Quiénes son los clientes que más aportan y qué perros generan más ingresos?",
  },
];
const unidades = (tipo: unknown) =>
  tipo === "HOSPEDAJE" ? "noches" : "días de daycare";
const pct = (v: unknown) => (v == null ? "—" : numero(v) + "%");
// Semáforo para porcentajes donde más alto es mejor
const tonoMinimo = (v: unknown, minimo: number): Tono | undefined =>
  v == null ? undefined : Number(v) >= minimo ? "bueno" : "alerta";
const AYUDA_KEY = "hachi_reportes_ayuda";
function leerPreferenciaAyuda() {
  try {
    return localStorage.getItem(AYUDA_KEY) !== "0";
  } catch {
    return true;
  }
}
const resumir = (filas: Fila[], campo: string) =>
  Object.entries(
    filas.reduce<Record<string, number>>((acc, r) => {
      const k = String(r[campo]);
      acc[k] = (acc[k] ?? 0) + Number(r.total);
      return acc;
    }, {}),
  )
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total);
export default function Reportes() {
  const [f, setF] = useState(inicial),
    [aplicado, setAplicado] = useState(inicial),
    [datos, setDatos] = useState<Datos | null>(null),
    [error, setError] = useState(""),
    [cargando, setCargando] = useState(true),
    [tab, setTab] = useState(0),
    [intento, setIntento] = useState(0),
    [ayuda, setAyuda] = useState(leerPreferenciaAyuda);
  useEffect(() => {
    document.title = "Reportes · HACHI";
  }, []);
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
  const cambiarAyuda = (valor: boolean) => {
    setAyuda(valor);
    try {
      localStorage.setItem(AYUDA_KEY, valor ? "1" : "0");
    } catch {
      // Sin almacenamiento: la preferencia dura mientras la pestaña esté abierta
    }
  };
  const editar = (k: keyof Filtros, v: string | number) =>
    setF((p) => ({ ...p, [k]: v }));
  const numerico = (
    k: "cv1" | "cv2" | "fijos" | "a1" | "a2" | "horas",
    nombre: string,
    explicacion: string,
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
      <small className="rep-ayuda">{explicacion}</small>
    </label>
  );
  return (
    <div className={"reportes" + (ayuda ? "" : " rep-sin-ayuda")}>
      <Encabezado
        titulo="Reportes"
        subtitulo="Elige el rango de fechas, presiona «Aplicar y recalcular» y recorre las pestañas: cada una responde una pregunta del negocio."
        acciones={
          <label className="rep-interruptor">
            <input
              type="checkbox"
              checked={ayuda}
              onChange={(e) => cambiarAyuda(e.target.checked)}
            />
            Mostrar explicaciones
          </label>
        }
      />
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
                <option key={s} value={s}>
                  {nombreServicio(s)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Agrupar gráficas por
            <select
              value={f.agrupacion}
              onChange={(e) => editar("agrupacion", e.target.value)}
            >
              <option value="MES">Mes</option>
              <option value="SEMANA">Semana</option>
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
        <p className="rep-ayuda" style={{ marginTop: 12 }}>
          Se analizan las reservas que <strong>inician</strong> entre «Desde» y
          «Hasta» (máximo 366 días). Las canceladas no cuentan como venta.
        </p>
        <details>
          <summary>Supuestos para las simulaciones (costos y personal)</summary>
          <p className="rep-ayuda">
            Estos valores <strong>no salen del sistema</strong>: son
            estimaciones tuyas que se usan en el punto de equilibrio («Dinero»),
            en «Mezcla ideal» y en «Tiempos de atención». Si no los conoces,
            deja los valores por defecto. Los cambios se aplican al presionar
            «Aplicar y recalcular». Las tarifas y cupos se toman de lo vigente
            en la fecha «Hasta».
          </p>
          <div className="rep-filtros">
            {numerico(
              "cv1",
              "Costo por noche de hospedaje (Q)",
              "Lo que cuesta atender un perro una noche: comida, limpieza, insumos.",
              1e7,
            )}
            {numerico(
              "cv2",
              "Costo por día de daycare (Q)",
              "Lo que cuesta atender un perro un día de daycare.",
              1e7,
            )}
            {numerico(
              "fijos",
              "Costos fijos del mes (Q)",
              "Gastos que se pagan aunque no haya perros: alquiler, sueldos base, servicios.",
              1e7,
            )}
            {numerico(
              "a1",
              "Horas de personal por perro hospedado",
              "Horas de trabajo que requiere cada perro en hospedaje por día.",
              24,
              0.01,
            )}
            {numerico(
              "a2",
              "Horas de personal por perro en daycare",
              "Horas de trabajo que requiere cada perro en daycare por día.",
              24,
              0.01,
            )}
            {numerico(
              "horas",
              "Horas de personal disponibles al día",
              "Suma de las horas que trabaja todo el equipo en un día.",
              10000,
            )}
            <label>
              Servicio para tiempos de atención
              <select
                value={f.pertServicio}
                disabled={f.servicio !== "TODOS"}
                onChange={(e) => editar("pertServicio", e.target.value)}
              >
                <option value="DAYCARE">Daycare</option>
                <option value="HOSPEDAJE">Hospedaje</option>
              </select>
              <small className="rep-ayuda">
                Qué estancias reales se usan para estimar las etapas. Si
                filtraste un servicio, se usa ese.
              </small>
            </label>
          </div>
          <p className="rep-ayuda">
            <strong>Peso de cada etapa:</strong> qué parte del tiempo total de
            una estancia crees que ocupa cada etapa. No tienen que sumar 100; se
            reparten de forma proporcional. Alimentación (C) y recreación (D)
            ocurren al mismo tiempo.
          </p>
          <div className="rep-filtros">
            {f.pesos.map((v, i) => (
              <label key={i}>
                {String.fromCharCode(65 + i)} · {ETAPAS[i]}
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
        {PESTANAS.map((t, i) => (
          <button
            key={t.titulo}
            aria-current={tab === i ? "page" : undefined}
            title={t.pregunta}
            onClick={() => setTab(i)}
          >
            {i + 1}. {t.titulo}
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
            {PESTANAS[tab].titulo} · del {fecha(datos.filtros.desde)} al{" "}
            {fecha(datos.filtros.hasta)} · {nombreServicio(datos.filtros.servicio)}
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
  const fin = d.finanzas,
    pendientePct =
      fin.facturado > 0 ? (fin.pendiente / fin.facturado) * 100 : null,
    canal = [...fin.canales].sort(
      (a, b) => Number(b.cobrado) - Number(a.cobrado),
    )[0];
  const hallazgos: Hallazgo[] = [];
  if (pendientePct === null)
    hallazgos.push({
      tono: "alerta",
      texto:
        "No hay reservas vendidas que inicien en este rango. Prueba con otras fechas u otro servicio.",
    });
  else if (pendientePct <= 5)
    hallazgos.push({
      tono: "bueno",
      texto: `Casi todo lo vendido ya se cobró: quedan ${moneda(fin.pendiente)} pendientes (${numero(pendientePct)}% de lo vendido).`,
    });
  else
    hallazgos.push({
      tono: pendientePct > 25 ? "malo" : "alerta",
      texto: `Falta cobrar ${moneda(fin.pendiente)}, el ${numero(pendientePct)}% de lo vendido. Revisa en Reservaciones las que tienen saldo pendiente.`,
    });
  if (fin.sobrepago > 0)
    hallazgos.push({
      tono: "alerta",
      texto: `Se cobraron ${moneda(fin.sobrepago)} de más en algunas reservas. Verifica si corresponde devolverlos o aplicarlos a otra reserva.`,
    });
  if (canal && fin.cobrado > 0)
    hallazgos.push({
      texto: `El medio de pago más usado fue ${String(canal.metodo).toLowerCase()}: ${moneda(canal.cobrado)} (${numero((Number(canal.cobrado) / fin.cobrado) * 100)}% de lo recibido).`,
    });
  const capacidadMes = Number(m?.capacidad ?? 0) * 30,
    excede = !!eq?.unidades && capacidadMes > 0 && eq.unidades > capacidadMes;
  const hallazgosEq: Hallazgo[] =
    !eq || !m
      ? []
      : eq.unidades === null
        ? [
            {
              tono: "malo",
              texto: `Con el precio actual (${moneda(m.precio)}) y un costo de ${moneda(variable)} por unidad, ${nombreServicio(m.tipo)} no deja ganancia en cada venta, así que nunca cubriría los costos fijos. Sube el precio o reduce el costo.`,
            },
          ]
        : [
            {
              tono: excede ? "malo" : undefined,
              texto:
                `Para no perder dinero, ${nombreServicio(m.tipo)} debe vender al menos ${numero(eq.unidadesEnteras)} ${unidades(m.tipo)} al mes (unas ${numero(eq.unidades / 30)} por día).` +
                (excede
                  ? ` Eso supera su capacidad del mes (${numero(capacidadMes)}): ni con todo lleno se cubren los costos fijos.`
                  : capacidadMes > 0
                    ? ` Equivale al ${numero((eq.unidades / capacidadMes) * 100)}% de su capacidad del mes.`
                    : ""),
            },
          ];
  return (
    <>
      <Guia pregunta={PESTANAS[0].pregunta}>
        Resume el dinero del rango. Ojo: «Total vendido» se cuenta por la fecha
        de la reserva y «Dinero recibido» por la fecha del pago, así que no
        deben restarse entre sí.
      </Guia>
      <Lectura hallazgos={hallazgos} />
      <div className="rep-kpis">
        <Tarjeta
          titulo="Total vendido"
          valor={moneda(fin.facturado)}
          ayuda="Valor de las reservas no canceladas que inician en el rango, se hayan pagado o no."
        />
        <Tarjeta
          titulo="Dinero recibido"
          valor={moneda(fin.cobrado)}
          ayuda="Pagos confirmados con fecha dentro del rango. Puede incluir pagos de reservas de otras fechas."
        />
        <Tarjeta
          titulo="Pendiente de cobro"
          valor={moneda(fin.pendiente)}
          tono={fin.pendiente > 0 ? "alerta" : "bueno"}
          ayuda="Lo que todavía deben los clientes por las reservas vendidas en el rango."
        />
        <Tarjeta
          titulo="Cobrado de más"
          valor={moneda(fin.sobrepago)}
          tono={fin.sobrepago > 0 ? "alerta" : undefined}
          ayuda="Pagos que superan el valor de su reserva. Deberían devolverse o aplicarse a otra reserva."
        />
        {d.utilizacion.map((u) => (
          <Tarjeta
            key={String(u.tipo)}
            titulo={`Ingreso por cupo · ${nombreServicio(u.tipo)}`}
            valor={moneda(u.revpah)}
            nota="Q por cupo disponible al día (RevPAH)"
            ayuda="Lo que generó en promedio cada cupo cada día, estuviera ocupado o no. Sube si llenas más cupos o cobras mejor. «—» si faltan días con capacidad configurada."
          />
        ))}
      </div>
      <Bloque
        titulo="Ventas por período"
        ayuda={`Cuánto se vendió en cada ${d.filtros.agrupacion === "MES" ? "mes" : "semana"} por servicio. Sirve para detectar temporadas altas y bajas.`}
      >
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
          titulo="Ventas por período"
          filas={d.finanzas.tendencia}
          columnas={[
            {
              clave: "periodo",
              nombre: "Período",
              ayuda:
                "Mes (año-mes) o semana del año (año-S número de semana), según la agrupación elegida.",
            },
            { clave: "tipo", nombre: "Servicio", formato: "servicio" },
            {
              clave: "facturado",
              nombre: "Total vendido",
              formato: "moneda",
              ayuda: "Valor de las reservas no canceladas que inician en ese período.",
            },
          ]}
        />
      </Bloque>
      <Bloque
        titulo="¿Cómo pagan los clientes?"
        ayuda="Dinero recibido en el rango según el medio de pago."
      >
        <Grafica
          datos={d.finanzas.canales}
          x="metodo"
          monetaria
          series={[{ clave: "cobrado", nombre: "Recibido" }]}
        />
        <Tabla
          titulo="Dinero recibido por medio de pago"
          filas={d.finanzas.canales}
          columnas={[
            { clave: "metodo", nombre: "Medio de pago" },
            { clave: "cobrado", nombre: "Recibido", formato: "moneda" },
          ]}
        />
      </Bloque>
      <Bloque
        titulo="Punto de equilibrio: ¿cuánto hay que vender al mes para no perder?"
        ayuda="Compara ingresos contra costos según cuántas unidades se vendan en un mes. Se asume que el servicio elegido paga todos los costos fijos. Es una simulación con los costos de «Supuestos», no un estado contable."
      >
        <label>
          Servicio a simular{" "}
          <select
            value={m?.tipo ?? ""}
            onChange={(e) => setServicio(e.target.value)}
          >
            {elegibles.map((v) => (
              <option key={v.tipo} value={v.tipo}>
                {nombreServicio(v.tipo)}
              </option>
            ))}
          </select>
        </label>
        {eq && m ? (
          <>
            <Lectura hallazgos={hallazgosEq} />
            <div className="rep-kpis">
              <Tarjeta
                titulo="Precio actual"
                valor={moneda(m.precio)}
                ayuda="Tarifa vigente en la fecha «Hasta»."
              />
              <Tarjeta
                titulo="Ganancia por unidad"
                valor={moneda(eq.margen)}
                tono={eq.margen > 0 ? undefined : "malo"}
                ayuda="Precio menos el costo de atender una unidad. Es lo que aporta cada venta para pagar los costos fijos (margen de contribución)."
              />
              <Tarjeta
                titulo="Mínimo a vender al mes"
                valor={
                  eq.unidadesEnteras === null
                    ? "No alcanzable"
                    : `${numero(eq.unidadesEnteras)} ${unidades(m.tipo)}`
                }
                tono={eq.unidadesEnteras === null || excede ? "malo" : undefined}
                ayuda="A partir de esta cantidad se empieza a ganar dinero."
              />
            </div>
            <p className="rep-ayuda">
              <strong>Cómo leer la gráfica:</strong> la línea verde son los
              ingresos y la roja los costos totales. Donde se cruzan está el
              equilibrio: a la izquierda (zona rosada) se pierde dinero y a la
              derecha (zona verde) se gana.
            </p>
            <div className="rep-zonas">
              <span>
                Se pierde:{" "}
                {eq.unidades === null
                  ? "en todo momento"
                  : `de 0 a ${numero(eq.unidades)} ${unidades(m.tipo)}`}
              </span>
              <span>
                Se gana:{" "}
                {eq.unidades === null
                  ? "nunca con estos supuestos"
                  : `más de ${numero(eq.unidades)} ${unidades(m.tipo)}`}
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
              titulo="Simulación de ganancia o pérdida"
              filas={curva.map((r) => ({
                ...r,
                resultado: r.ingresos - r.costos,
              }))}
              columnas={[
                {
                  clave: "unidades",
                  nombre: `${unidades(m.tipo)} al mes`.replace(/^./, (c) =>
                    c.toUpperCase(),
                  ),
                  formato: "numero",
                },
                {
                  clave: "ingresos",
                  nombre: "Ingresos",
                  formato: "moneda",
                  ayuda: "Cantidad vendida × precio actual.",
                },
                {
                  clave: "costos",
                  nombre: "Costos",
                  formato: "moneda",
                  ayuda: "Costos fijos del mes + cantidad vendida × costo por unidad.",
                },
                {
                  clave: "resultado",
                  nombre: "Ganancia o pérdida",
                  formato: "moneda",
                  ayuda: "Ingresos menos costos. Un valor negativo es pérdida.",
                },
              ]}
            />
          </>
        ) : (
          <p>
            No hay tarifa vigente para simular. Regístrala en Configuración →
            Tarifas.
          </p>
        )}
      </Bloque>
    </>
  );
}
export function Capacidad({ d }: { d: Datos }) {
  const hallazgos = d.utilizacion.flatMap((u) => {
    const nombre = nombreServicio(u.tipo),
      oc = u.ocupacion === null ? null : Number(u.ocupacion),
      lista: Hallazgo[] = [];
    if (oc === null)
      lista.push({
        tono: "alerta",
        texto: `${nombre} no tiene capacidad configurada en el rango; regístrala en Configuración para poder medir su ocupación.`,
      });
    else if (oc < 50)
      lista.push({
        tono: "alerta",
        texto: `${nombre} usó solo el ${numero(oc)}% de sus cupos: hay espacio para vender más (promociones, convenios, temporadas bajas).`,
      });
    else if (oc >= 90)
      lista.push({
        tono: "alerta",
        texto: `${nombre} estuvo casi lleno (${numero(oc)}% de ocupación). Considera ampliar cupos o ajustar precios en fechas altas.`,
      });
    else
      lista.push({
        tono: "bueno",
        texto: `${nombre} usó el ${numero(oc)}% de sus cupos, un nivel saludable.`,
      });
    if (Number(u.sobredemanda) > 0)
      lista.push({
        tono: "malo",
        texto: `En ${u.sobredemanda} día(s) ${nombre} tuvo más reservas que cupos: riesgo de sobreventa. Búscalos en «Ocupación día por día».`,
      });
    if (Number(u.pico) > 0)
      lista.push({
        texto: `Máximo de perros en ${nombre} en un solo día: ${u.pico} (${listaFechas(u.diasPico)}).`,
      });
    return lista;
  });
  const tonoOcupacion = (v: unknown): Tono =>
    v === null || Number(v) < 50 || Number(v) >= 90 ? "alerta" : "bueno";
  return (
    <>
      <Guia pregunta={PESTANAS[1].pregunta}>
        Compara los cupos usados contra los disponibles cada día. En hospedaje
        se cuentan los perros que pasaron la noche (con entrada registrada); en
        daycare, los que asistieron. La «demanda» son las reservas hechas,
        aunque el perro no haya llegado. Un día sin capacidad configurada se
        muestra como «—» y no cuenta como cero.
      </Guia>
      <Lectura hallazgos={hallazgos} />
      {d.utilizacion.map((u) => (
        <Bloque
          key={String(u.tipo)}
          titulo={nombreServicio(u.tipo)}
          ayuda="Barras: perros atendidos cada día. Línea «Cupos disponibles»: capacidad del día. Línea «Reservas activas»: reservas hechas para ese día. Si la barra toca la línea de cupos, ese día se llenó."
        >
          <div className="rep-kpis">
            <Tarjeta
              titulo="Ocupación promedio"
              valor={pct(u.ocupacion)}
              tono={tonoOcupacion(u.ocupacion)}
              ayuda="Porcentaje de cupos usados sobre los disponibles en todo el rango. Entre 50% y 90% es un nivel sano."
            />
            <Tarjeta
              titulo="Cupos vacíos"
              valor={pct(u.vacancia)}
              ayuda="Porcentaje de cupos que no se usaron: venta que se dejó de hacer."
            />
            <Tarjeta
              titulo="Días llenos"
              valor={numero(u.saturados)}
              ayuda="Días en que se usaron todos los cupos."
            />
            <Tarjeta
              titulo="Días con sobreventa"
              valor={numero(u.sobredemanda)}
              tono={Number(u.sobredemanda) > 0 ? "malo" : "bueno"}
              ayuda="Días en que las reservas superaron los cupos disponibles."
            />
            <Tarjeta
              titulo="Días sin capacidad configurada"
              valor={numero(u.diasSinCapacidad)}
              tono={Number(u.diasSinCapacidad) > 0 ? "alerta" : undefined}
              ayuda="Días que no se pueden medir porque no había cupos registrados en Configuración."
            />
          </div>
          <Grafica
            datos={d.ocupacion.filter((r) => r.tipo === u.tipo)}
            x="fecha"
            series={[
              { clave: "ocupados", nombre: "Perros atendidos" },
              { clave: "capacidad", nombre: "Cupos disponibles", linea: true },
              { clave: "demanda", nombre: "Reservas activas", linea: true },
            ]}
          />
        </Bloque>
      ))}
      <Tabla
        titulo="Resumen de uso por servicio"
        filas={d.utilizacion.map((u): Fila => ({
          ...u,
          diasPico: listaFechas(u.diasPico, 5),
        }))}
        columnas={[
          { clave: "tipo", nombre: "Servicio", formato: "servicio" },
          {
            clave: "cuposDisponibles",
            nombre: "Cupos disponibles",
            formato: "numero",
            ayuda:
              "Suma de los cupos de todos los días medidos. Ej.: 10 cupos × 30 días = 300.",
          },
          {
            clave: "ocupados",
            nombre: "Cupos usados",
            formato: "numero",
            ayuda: "Suma de los perros atendidos cada día.",
          },
          { clave: "ocupacion", nombre: "Ocupación", formato: "porcentaje" },
          {
            clave: "pico",
            nombre: "Máximo en un día",
            formato: "numero",
            ayuda: "Mayor cantidad de perros atendidos en un mismo día.",
          },
          {
            clave: "diasPico",
            nombre: "Fecha(s) del máximo",
          },
          {
            clave: "bajaDemanda",
            nombre: "Días bajo 50%",
            formato: "numero",
            ayuda: "Días en que se usó menos de la mitad de los cupos.",
          },
          {
            clave: "saturados",
            nombre: "Días llenos",
            formato: "numero",
            ayuda: "Días en que se usaron todos los cupos.",
          },
          {
            clave: "sobredemanda",
            nombre: "Días con sobreventa",
            formato: "numero",
            ayuda: "Días con más reservas que cupos.",
          },
        ]}
      />
      <Tabla
        titulo="Ocupación día por día"
        filas={d.ocupacion}
        columnas={[
          { clave: "fecha", nombre: "Fecha", formato: "fecha" },
          { clave: "tipo", nombre: "Servicio", formato: "servicio" },
          {
            clave: "ocupados",
            nombre: "Perros atendidos",
            formato: "numero",
            ayuda:
              "Hospedaje: perros que pasaron la noche. Daycare: perros que asistieron.",
          },
          {
            clave: "capacidad",
            nombre: "Cupos disponibles",
            formato: "numero",
            ayuda: "Capacidad configurada ese día. «—» = no había capacidad registrada.",
          },
          {
            clave: "demanda",
            nombre: "Reservas activas",
            formato: "numero",
            ayuda:
              "Reservas no canceladas para ese día, incluidas las pendientes. El perro pudo no llegar.",
          },
          {
            clave: "tasa",
            nombre: "Ocupación",
            formato: "porcentaje",
            ayuda: "Perros atendidos ÷ cupos disponibles.",
          },
          {
            clave: "vacancia",
            nombre: "Cupos vacíos",
            formato: "porcentaje",
            ayuda: "Porcentaje de cupos sin usar ese día.",
          },
        ]}
      />
    </>
  );
}
export function Mezcla({ d }: { d: Datos }) {
  const [hover, setHover] = useState("");
  if (!d.mezcla)
    return (
      <>
        <Guia pregunta={PESTANAS[2].pregunta}>
          Este cálculo necesita la tarifa y la capacidad de cada servicio.
        </Guia>
        <p>
          Faltan tarifas o capacidades vigentes en la fecha «Hasta». Regístralas
          en Configuración y vuelve a calcular.
        </p>
      </>
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
  const describir = (v: { x: number; y: number; z: number }) =>
    `${numero(v.x)} en hospedaje y ${numero(v.y)} en daycare → ganancia de ${moneda(v.z)} al día`;
  const cero = (v: number) => Math.abs(v) < 1e-6;
  const hallazgos: Hallazgo[] = [
    {
      tono: "bueno",
      texto: `Mejor combinación: ${r.entero.x} perros en hospedaje y ${r.entero.y} en daycare por día, con una ganancia de ${moneda(r.entero.z)} diarios antes de costos fijos.`,
    },
  ];
  if (c1 > 0 && cero(r.holguras.hospedaje))
    hallazgos.push({
      tono: "alerta",
      texto:
        "Se usan todos los cupos de hospedaje: tener más cupos de hospedaje aumentaría la ganancia.",
    });
  if (c2 > 0 && cero(r.holguras.daycare))
    hallazgos.push({
      tono: "alerta",
      texto:
        "Se usan todos los cupos de daycare: tener más cupos de daycare aumentaría la ganancia.",
    });
  if (cero(r.holguras.horas))
    hallazgos.push({
      tono: "alerta",
      texto: `Las ${numero(f.horas)} horas diarias de personal se agotan: son el recurso que pone el límite. Más horas de personal permitirían atender más perros.`,
    });
  else
    hallazgos.push({
      texto: `Sobran ${numero(r.holguras.horas)} horas de personal al día; podrían dedicarse a otras tareas.`,
    });
  if (f.servicio === "TODOS")
    for (const [cupos, cantidad, nombre] of [
      [c1, r.entero.x, "hospedaje"],
      [c2, r.entero.y, "daycare"],
    ] as const)
      if (cupos > 0 && cantidad === 0)
        hallazgos.push({
          tono: "alerta",
          texto: `Con estos supuestos no conviene vender ${nombre}: deja menos ganancia por los recursos que consume. Revisa su precio y su costo.`,
        });
  return (
    <>
      <Guia pregunta={PESTANAS[2].pregunta}>
        Con los cupos de cada servicio, las horas de tu personal y los costos de
        «Supuestos», este modelo (programación lineal) busca la combinación
        diaria de perros en hospedaje y en daycare que deja la mayor ganancia.
        La ganancia aquí es antes de pagar costos fijos.
      </Guia>
      <Lectura hallazgos={hallazgos} />
      <Bloque titulo="Combinación que más ganancia deja">
        <div className="rep-kpis">
          <Tarjeta
            titulo="Recomendación diaria"
            valor={`${r.entero.x} hospedaje + ${r.entero.y} daycare`}
            ayuda="Cantidad de perros a atender por día (perros completos) que deja más ganancia con tus recursos."
          />
          <Tarjeta
            titulo="Ganancia diaria esperada"
            valor={moneda(r.entero.z)}
            ayuda="Ingresos menos el costo de atender a cada perro. Falta restar los costos fijos."
          />
          <Tarjeta
            titulo="Solución exacta del modelo"
            valor={`${numero(r.optimo.x)} + ${numero(r.optimo.y)}`}
            nota={`Ganancia ${moneda(r.optimo.z)} al día`}
            ayuda="Resultado matemático con decimales. La recomendación de arriba lo ajusta a perros completos."
          />
        </div>
        <p className="rep-ayuda">
          <strong>Cómo leer la gráfica:</strong> cada punto del área verde es
          una combinación posible. Eje horizontal: perros en hospedaje; eje
          vertical: perros en daycare. Línea azul punteada: límite de cupos de
          hospedaje; línea ocre punteada: límite de daycare; línea roja: límite
          de horas de personal. El punto rojo grande es la mejor combinación.
          Pasa el cursor por las esquinas verdes para ver su ganancia.
        </p>
        <svg
          className="rep-svg"
          viewBox="0 0 720 380"
          role="img"
          aria-label="Combinaciones posibles de perros en hospedaje y daycare"
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
              onFocus={() => setHover(describir(v))}
              onMouseEnter={() => setHover(describir(v))}
            >
              <title>{describir(v)}</title>
            </circle>
          ))}
          <circle cx={sx(r.optimo.x)} cy={sy(r.optimo.y)} r="8" fill="#c43b39">
            <title>Mejor combinación</title>
          </circle>
          <text x="230" y="355">
            Perros en hospedaje por día (0 a {c1})
          </text>
          <text x="70" y="25">
            Perros en daycare por día (0 a {c2})
          </text>
        </svg>
        <p aria-live="polite">
          {hover || "Explora las esquinas con el cursor o con el teclado (Tab)."}
        </p>
        <Tabla
          titulo="Combinaciones extremas evaluadas"
          filas={r.vertices}
          columnas={[
            { clave: "x", nombre: "Perros en hospedaje", formato: "numero" },
            { clave: "y", nombre: "Perros en daycare", formato: "numero" },
            {
              clave: "z",
              nombre: "Ganancia diaria",
              formato: "moneda",
              ayuda:
                "La mejor combinación siempre está en una de estas esquinas del área verde; se elige la de mayor ganancia.",
            },
          ]}
        />
        <Tabla
          titulo="Recursos que sobran en la solución exacta"
          filas={[r.holguras]}
          columnas={[
            {
              clave: "hospedaje",
              nombre: "Cupos de hospedaje libres",
              formato: "numero",
              ayuda: "0 = se usan todos; ese recurso limita la ganancia.",
            },
            {
              clave: "daycare",
              nombre: "Cupos de daycare libres",
              formato: "numero",
              ayuda: "0 = se usan todos; ese recurso limita la ganancia.",
            },
            {
              clave: "horas",
              nombre: "Horas de personal libres",
              formato: "numero",
              ayuda: "0 = el personal está ocupado al máximo.",
            },
          ]}
        />
        <details className="rep-experto">
          <summary>Modelo matemático (para expertos)</summary>
          <p>
            Max Z = (P₁ − CV₁)X₁ + (P₂ − CV₂)X₂ sujeto a X₁ ≤ {c1}; X₂ ≤ {c2};{" "}
            {f.a1}X₁ + {f.a2}X₂ ≤ {f.horas}; X₁, X₂ ≥ 0. X₁ = perros en
            hospedaje/día, X₂ = perros en daycare/día.
          </p>
          <p>
            P₁ ={" "}
            {moneda(d.modelos.find((v) => v.tipo === "HOSPEDAJE")?.precio)}, P₂
            = {moneda(d.modelos.find((v) => v.tipo === "DAYCARE")?.precio)};
            CV₁ = {moneda(f.cv1)}, CV₂ = {moneda(f.cv2)}. Z es margen de
            contribución, antes de costos fijos. Al filtrar un solo servicio,
            el otro se fija en cero. Las holguras son las del óptimo continuo.
          </p>
        </details>
      </Bloque>
    </>
  );
}
export function Pert({ d }: { d: Datos }) {
  if (!d.pert)
    return (
      <>
        <Guia pregunta={PESTANAS[3].pregunta}>
          Este cálculo usa estancias terminadas (con entrada y salida
          registradas).
        </Guia>
        <p>
          No hay estancias terminadas de {nombreServicio(d.historia.servicio)}{" "}
          en el rango para estimar los tiempos. Prueba con un rango más amplio u
          otro servicio en «Supuestos».
        </p>
      </>
    );
  const p = d.pert,
    porId = Object.fromEntries(p.filas.map((a) => [a.id, a])),
    ruta = p.rutasCriticas[0] ?? p.criticas,
    sigma = Math.sqrt(
      ruta.reduce((s, id) => s + (porId[id]?.varianza ?? 0), 0),
    ),
    holgada = p.filas
      .filter((a) => !a.critica)
      .sort((a, b) => b.holgura - a.holgura)[0];
  const hallazgos: Hallazgo[] = [
    {
      texto: `Atender un perro de ${nombreServicio(d.historia.servicio)} toma en promedio unas ${numero(p.duracion)} h de principio a fin.`,
    },
    {
      tono: "alerta",
      texto: `Etapas críticas: ${p.criticas.map((id) => porId[id]?.nombre ?? id).join(", ")}. Si cualquiera se atrasa, se atrasa todo el servicio: asegúrales personal.`,
    },
  ];
  if (holgada)
    hallazgos.push({
      tono: "bueno",
      texto: `«${holgada.nombre}» tiene margen: puede retrasarse hasta ${numero(holgada.holgura)} h sin afectar la hora de salida.`,
    });
  if (sigma > 0)
    hallazgos.push({
      texto: `Considerando la variación de los casos reales, cerca del 95% de las veces el servicio debería terminar antes de ${numero(p.duracion + 1.645 * sigma)} h.`,
    });
  const pos: Record<string, [number, number]> = {
    A: [65, 115],
    B: [190, 115],
    C: [325, 55],
    D: [325, 175],
    E: [465, 115],
    F: [600, 115],
  };
  return (
    <>
      <Guia pregunta={PESTANAS[3].pregunta}>
        La atención se divide en 6 etapas (A a F). Alimentación (C) y recreación
        (D) ocurren al mismo tiempo. Las etapas <strong>críticas</strong> (en
        rojo) no tienen margen: si una se atrasa, se atrasa todo el servicio.
      </Guia>
      <p className="rep-nota">
        <strong>Importante:</strong> el sistema no registra la hora de cada
        etapa. Los tiempos se estiman repartiendo la duración real de{" "}
        {d.historia.muestras} estancias de{" "}
        {nombreServicio(d.historia.servicio)} (mínimo{" "}
        {numero(d.historia.minimo)} h, promedio {numero(d.historia.media)} h,
        máximo {numero(d.historia.maximo)} h) según los pesos de «Supuestos».
        Es un escenario de planificación, no una medición.
      </p>
      <Lectura hallazgos={hallazgos} />
      <Bloque titulo="Etapas del servicio (método PERT/CPM)">
        <div className="rep-kpis">
          <Tarjeta
            titulo="Duración total estimada"
            valor={numero(p.duracion) + " h"}
            ayuda="Tiempo esperado desde la recepción hasta el check-out, siguiendo la secuencia de etapas más larga."
          />
          <Tarjeta
            titulo="Etapas críticas"
            valor={p.criticas.join(", ")}
            nota={p.rutasCriticas.map((r) => r.join(" → ")).join(" / ")}
            tono="alerta"
            ayuda="Etapas sin margen de retraso. Son las que hay que priorizar con personal y recursos."
          />
        </div>
        <svg
          className="rep-svg"
          viewBox="0 0 700 260"
          role="img"
          aria-label="Etapas: A, luego B, luego C y D a la vez, luego E y al final F"
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
          {p.filas.flatMap((a) =>
            a.predecesoras.map((pre) => (
              <line
                key={pre + a.id}
                x1={pos[pre][0] + 30}
                y1={pos[pre][1]}
                x2={pos[a.id][0] - 33}
                y2={pos[a.id][1]}
                stroke={a.critica && porId[pre]?.critica ? "#c43b39" : "#68746e"}
                strokeWidth="2"
                markerEnd="url(#flecha-pert)"
              />
            )),
          )}
          {p.filas.map((a) => (
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
              <title>{`${a.nombre} · ${numero(a.te)} h · margen ${numero(a.holgura)} h`}</title>
            </g>
          ))}
        </svg>
        <p className="rep-ayuda">
          Cada círculo es una etapa con su tiempo esperado debajo. Rojo con *:
          etapa crítica. Verde: etapa con margen. Las flechas indican el orden:
          A → B → (C y D a la vez) → E → F.
        </p>
        <Tabla
          titulo="Detalle de cada etapa"
          filas={p.filas}
          columnas={[
            { clave: "id", nombre: "Etapa" },
            { clave: "nombre", nombre: "Actividad" },
            {
              clave: "predecesoras",
              nombre: "Empieza después de",
              ayuda: "Etapas que deben terminar antes de iniciar esta.",
            },
            {
              clave: "a",
              nombre: "Optimista (h)",
              formato: "numero",
              ayuda: "Tiempo si todo sale bien (a).",
            },
            {
              clave: "m",
              nombre: "Más probable (h)",
              formato: "numero",
              ayuda: "Tiempo normal o típico (m).",
            },
            {
              clave: "b",
              nombre: "Pesimista (h)",
              formato: "numero",
              ayuda: "Tiempo si hay complicaciones (b).",
            },
            {
              clave: "te",
              nombre: "Esperado (h)",
              formato: "numero",
              ayuda: "Promedio ponderado: (optimista + 4 × más probable + pesimista) ÷ 6.",
            },
            {
              clave: "varianza",
              nombre: "Variabilidad (h²)",
              formato: "numero",
              ayuda:
                "Qué tan incierto es el tiempo: ((pesimista − optimista) ÷ 6)². Más alto = menos predecible.",
            },
            {
              clave: "es",
              nombre: "Inicio más temprano",
              formato: "numero",
              ayuda: "Hora (desde el inicio del servicio) en que la etapa puede empezar como pronto (ES).",
            },
            {
              clave: "ef",
              nombre: "Fin más temprano",
              formato: "numero",
              ayuda: "Inicio más temprano + tiempo esperado (EF).",
            },
            {
              clave: "ls",
              nombre: "Inicio más tardío",
              formato: "numero",
              ayuda: "Hora más tardía en que puede empezar sin atrasar el servicio (LS).",
            },
            {
              clave: "lf",
              nombre: "Fin más tardío",
              formato: "numero",
              ayuda: "Hora más tardía en que puede terminar sin atrasar el servicio (LF).",
            },
            {
              clave: "holgura",
              nombre: "Margen de retraso (h)",
              formato: "numero",
              ayuda: "Horas que puede retrasarse sin afectar el total. 0 = etapa crítica.",
            },
          ]}
        />
      </Bloque>
    </>
  );
}
export function Rendimiento({ d }: { d: Datos }) {
  const c = d.cancelaciones,
    hallazgos: Hallazgo[] = [];
  if (c.total === 0)
    hallazgos.push({
      tono: "alerta",
      texto: "No hay reservas que inicien en este rango.",
    });
  else if (Number(c.porcentaje) > 15)
    hallazgos.push({
      tono: "alerta",
      texto: `Se canceló el ${numero(c.porcentaje)}% de las reservas (${c.canceladas} de ${c.total}). Considera pedir anticipo o confirmar un día antes.`,
    });
  else
    hallazgos.push({
      tono: "bueno",
      texto: `Solo se canceló el ${numero(c.porcentaje)}% de las reservas (${c.canceladas} de ${c.total}).`,
    });
  for (const r of d.rendimiento) {
    const nombre = nombreServicio(r.tipo);
    if (!Number(r.muestras)) {
      hallazgos.push({
        tono: "alerta",
        texto: `No hay estancias de ${nombre} con entrada y salida registradas en el rango.`,
      });
      continue;
    }
    const entrada = r.puntualidadEntrada,
      salida = r.puntualidadSalida;
    if (entrada != null && Number(entrada) < 80)
      hallazgos.push({
        tono: "alerta",
        texto: `${nombre}: solo el ${numero(entrada)}% de los perros llegó a la hora reservada o antes.`,
      });
    if (salida != null && Number(salida) < 80)
      hallazgos.push({
        tono: "alerta",
        texto: `${nombre}: solo el ${numero(salida)}% de las salidas fue a tiempo (${r.retrasosSalida} tarde). Las salidas tarde bloquean cupos.`,
      });
    if (
      (entrada == null || Number(entrada) >= 80) &&
      (salida == null || Number(salida) >= 80)
    )
      hallazgos.push({
        tono: "bueno",
        texto: `${nombre}: los horarios se cumplen bien (entradas ${pct(entrada)}, salidas ${pct(salida)} a tiempo).`,
      });
    if (r.tasaAusencia != null && Number(r.tasaAusencia) > 10)
      hallazgos.push({
        tono: "alerta",
        texto: `${nombre}: el ${numero(r.tasaAusencia)}% de los días reservados el perro no llegó.`,
      });
  }
  return (
    <>
      <Guia pregunta={PESTANAS[4].pregunta}>
        Compara la hora reservada con la hora real de entrada y salida. «A
        tiempo» significa a la hora reservada o antes (sin tolerancia). En
        daycare cada día se compara con la hora de la reserva. Los promedios
        solo usan estancias con entrada y salida registradas.
      </Guia>
      <Lectura hallazgos={hallazgos} />
      <div className="rep-kpis">
        <Tarjeta
          titulo="Reservas canceladas"
          valor={numero(c.canceladas)}
          nota={`${pct(c.porcentaje)} de ${c.total} reservas`}
          tono={Number(c.porcentaje) > 15 ? "alerta" : undefined}
          ayuda="Reservas que iniciaban en el rango y se cancelaron. Más de 15% merece atención."
        />
      </div>
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
            rango: `${k} a ${Number(k) + ancho} h`,
            frecuencia,
          }));
        return (
          <Bloque
            key={String(r.tipo)}
            titulo={nombreServicio(r.tipo)}
            ayuda="La gráfica muestra cuántas estancias duraron cada rango de horas; la barra más alta es la duración más común."
          >
            <div className="rep-kpis">
              <Tarjeta
                titulo="Duración promedio"
                valor={numero(r.horasPromedio) + " h"}
                nota={`${r.muestras} estancias completas`}
                ayuda="Tiempo promedio entre la entrada y la salida reales."
              />
              {r.tipo === "HOSPEDAJE" && (
                <Tarjeta
                  titulo="Noches promedio"
                  valor={numero(r.nochesPromedio)}
                  ayuda="Noches promedio por estancia (diferencia entre fechas de entrada y salida)."
                />
              )}
              <Tarjeta
                titulo="Llegadas a tiempo"
                valor={pct(r.puntualidadEntrada)}
                tono={tonoMinimo(r.puntualidadEntrada, 80)}
                ayuda="Porcentaje de perros que llegaron a la hora reservada o antes."
              />
              <Tarjeta
                titulo="Salidas a tiempo"
                valor={pct(r.puntualidadSalida)}
                tono={tonoMinimo(r.puntualidadSalida, 80)}
                ayuda="Porcentaje de salidas a la hora reservada o antes."
              />
              <Tarjeta
                titulo="Salidas tarde"
                valor={numero(r.retrasosSalida)}
                ayuda="Salidas después de la hora reservada. Bloquean cupos y pueden justificar un cobro extra."
              />
              {r.tipo === "DAYCARE" && (
                <Tarjeta
                  titulo="Ausencias"
                  valor={numero(r.ausencias)}
                  nota={`${pct(r.tasaAusencia)} de los días reservados`}
                  tono={Number(r.tasaAusencia) > 10 ? "alerta" : undefined}
                  ayuda="Días de daycare reservados en que el perro no llegó."
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
        titulo="Entradas y salidas de cada estancia"
        filas={d.estancias}
        columnas={[
          { clave: "id", nombre: "Reserva #" },
          { clave: "tipo", nombre: "Servicio", formato: "servicio" },
          { clave: "estado", nombre: "Estado" },
          { clave: "entrada", nombre: "Entrada real", formato: "fecha" },
          { clave: "salida", nombre: "Salida real", formato: "fecha" },
          {
            clave: "horas",
            nombre: "Duración (h)",
            formato: "numero",
            ayuda: "Horas entre la entrada y la salida reales.",
          },
          {
            clave: "demoraEntrada",
            nombre: "Llegada vs. reserva (min)",
            formato: "numero",
            ayuda:
              "Minutos de diferencia con la hora reservada. Negativo = llegó antes; positivo = llegó tarde.",
          },
          {
            clave: "demoraSalida",
            nombre: "Salida vs. reserva (min)",
            formato: "numero",
            ayuda:
              "Minutos de diferencia con la hora de salida reservada. Negativo = salió antes; positivo = salió tarde.",
          },
        ]}
      />
      <Tabla
        titulo="Resumen de cumplimiento"
        filas={d.rendimiento}
        columnas={[
          { clave: "tipo", nombre: "Servicio", formato: "servicio" },
          {
            clave: "muestras",
            nombre: "Estancias completas",
            formato: "numero",
            ayuda: "Estancias con entrada y salida registradas; son la base de los promedios.",
          },
          { clave: "horasPromedio", nombre: "Horas promedio", formato: "numero" },
          {
            clave: "nochesPromedio",
            nombre: "Noches promedio",
            formato: "numero",
          },
          {
            clave: "puntualidadEntrada",
            nombre: "Llegadas a tiempo",
            formato: "porcentaje",
          },
          {
            clave: "puntualidadSalida",
            nombre: "Salidas a tiempo",
            formato: "porcentaje",
          },
          {
            clave: "tasaAusencia",
            nombre: "Ausencias",
            formato: "porcentaje",
            ayuda: "Solo aplica a daycare.",
          },
        ]}
      />
    </>
  );
}
export function Clientes({ d }: { d: Datos }) {
  const [segmento, setSegmento] = useState("talla");
  const total = d.clientes.length,
    claves = d.clientes.filter((c) => c.categoria === "A").length,
    mejor = d.clientes[0],
    grupos = resumir(d.segmentos, segmento),
    nombresSegmento: Record<string, string> = {
      talla: "tamaño",
      raza: "raza",
      sexo: "sexo",
    };
  const hallazgos: Hallazgo[] = [];
  if (!total)
    hallazgos.push({
      tono: "alerta",
      texto: "No hay clientes con reservas en este rango.",
    });
  else {
    hallazgos.push({
      tono: "bueno",
      texto: `${claves} de ${total} clientes (${numero((claves / total) * 100)}%) generan cerca del 80% de lo vendido. Son tus clientes clave: cuida su experiencia.`,
    });
    if (mejor)
      hallazgos.push({
        texto: `Tu mejor cliente es ${mejor.cliente}: ${moneda(mejor.total)} en ${mejor.frecuencia} reserva(s).`,
      });
  }
  if (grupos[0])
    hallazgos.push({
      texto: `Por ${nombresSegmento[segmento]}, el grupo que más vende es «${grupos[0].nombre}» con ${moneda(grupos[0].total)}.`,
    });
  return (
    <>
      <Guia pregunta={PESTANAS[5].pregunta}>
        Clasificación ABC (principio de Pareto): normalmente pocos clientes
        generan la mayor parte de los ingresos. <strong>A</strong> = los
        clientes que suman el 80% de lo vendido; <strong>B</strong> = el
        siguiente 15%; <strong>C</strong> = el 5% restante.
      </Guia>
      <Lectura hallazgos={hallazgos} />
      <Bloque
        titulo="¿Qué clientes aportan más?"
        ayuda="Barras: lo vendido a cada cliente, de mayor a menor. Línea: porcentaje acumulado (eje derecho). Donde la línea cruza el 80% termina el grupo A."
      >
        <Grafica
          datos={d.clientes}
          x="cliente"
          monetaria
          series={[
            { clave: "total", nombre: "Vendido" },
            {
              clave: "acumulado",
              nombre: "Acumulado %",
              linea: true,
              derecha: true,
            },
          ]}
        />
        <Tabla
          titulo="Clasificación ABC de clientes"
          filas={d.clientes}
          columnas={[
            { clave: "id", nombre: "ID" },
            { clave: "cliente", nombre: "Propietario" },
            {
              clave: "frecuencia",
              nombre: "Reservas",
              formato: "numero",
              ayuda: "Reservas no canceladas que inician en el rango.",
            },
            { clave: "total", nombre: "Vendido", formato: "moneda" },
            {
              clave: "porcentaje",
              nombre: "% del total",
              formato: "porcentaje",
              ayuda: "Parte de todas las ventas del rango que corresponde a este cliente.",
            },
            {
              clave: "acumulado",
              nombre: "% acumulado",
              formato: "porcentaje",
              ayuda: "Suma de su % y el de todos los clientes que están arriba en la lista.",
            },
            {
              clave: "categoria",
              nombre: "Grupo",
              ayuda: "A = clientes clave (80% de ventas); B = importantes (siguiente 15%); C = ocasionales (5% restante).",
            },
          ]}
        />
      </Bloque>
      <Bloque
        titulo="¿Qué perros generan más ingresos?"
        ayuda="Ventas agrupadas por una característica de la mascota. Útil para orientar promociones o preparar el espacio."
      >
        <label>
          Agrupar por{" "}
          <select
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
          >
            <option value="talla">Tamaño (peso)</option>
            <option value="raza">Raza</option>
            <option value="sexo">Sexo</option>
          </select>
        </label>
        <Grafica
          datos={grupos}
          x="nombre"
          monetaria
          series={[{ clave: "total", nombre: "Vendido" }]}
        />
        <Tabla
          titulo="Ventas por tipo de perro"
          filas={d.segmentos}
          columnas={[
            { clave: "raza", nombre: "Raza" },
            { clave: "sexo", nombre: "Sexo" },
            {
              clave: "talla",
              nombre: "Tamaño",
              ayuda: "Pequeño: menos de 10 kg; mediano: 10 a 25 kg; grande: 25 kg o más.",
            },
            { clave: "frecuencia", nombre: "Reservas", formato: "numero" },
            { clave: "total", nombre: "Vendido", formato: "moneda" },
          ]}
        />
      </Bloque>
    </>
  );
}
