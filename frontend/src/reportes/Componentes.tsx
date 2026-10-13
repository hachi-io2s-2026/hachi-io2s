import type { ReactNode } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { csv, fecha, moneda, nombreServicio, numero } from "./utilidades";
// Semáforo de un indicador: el color siempre va acompañado de texto o símbolo
export type Tono = "bueno" | "alerta" | "malo";
export interface Hallazgo {
  tono?: Tono;
  texto: ReactNode;
}
const MARCAS: Record<Tono | "info", string> = {
  bueno: "✓",
  alerta: "!",
  malo: "✕",
  info: "i",
};
export function Tarjeta({
  titulo,
  valor,
  nota,
  ayuda,
  tono,
}: {
  titulo: string;
  valor: string;
  nota?: string;
  ayuda?: string;
  tono?: Tono;
}) {
  return (
    <article className={"rep-kpi" + (tono ? ` rep-kpi--${tono}` : "")}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {nota && <small>{nota}</small>}
      {ayuda && <p className="rep-ayuda">{ayuda}</p>}
    </article>
  );
}
export function Bloque({
  titulo,
  ayuda,
  children,
}: {
  titulo: string;
  ayuda?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rep-bloque">
      <h2>{titulo}</h2>
      {ayuda && <p className="rep-ayuda">{ayuda}</p>}
      {children}
    </section>
  );
}
// Introducción de cada pestaña: qué pregunta del negocio responde
export function Guia({
  pregunta,
  children,
}: {
  pregunta: string;
  children: ReactNode;
}) {
  return (
    <div className="rep-guia rep-ayuda">
      <strong>{pregunta}</strong>
      <div>{children}</div>
    </div>
  );
}
// Conclusiones en lenguaje simple calculadas a partir de los datos
export function Lectura({ hallazgos }: { hallazgos: Hallazgo[] }) {
  if (!hallazgos.length) return null;
  return (
    <section className="rep-lectura" aria-label="Lectura rápida">
      <h3>Lectura rápida</h3>
      <ul>
        {hallazgos.map((h, i) => (
          <li key={i} className={`rep-tono-${h.tono ?? "info"}`}>
            <span className="rep-marca" aria-hidden="true">
              {MARCAS[h.tono ?? "info"]}
            </span>
            <span>{h.texto}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
export function Tabla<T extends object>({
  titulo,
  filas,
  columnas,
}: {
  titulo: string;
  filas: T[];
  columnas: {
    clave: keyof T;
    nombre: string;
    formato?: "moneda" | "fecha" | "numero" | "porcentaje" | "servicio";
    ayuda?: string;
  }[];
}) {
  const mostrar = (v: unknown, f?: string) =>
    f === "moneda"
      ? moneda(v)
      : f === "fecha"
        ? fecha(v)
        : f === "numero"
          ? numero(v)
          : f === "porcentaje"
            ? v == null
              ? "—"
              : numero(v) + "%"
            : f === "servicio"
              ? nombreServicio(v)
              : Array.isArray(v)
                ? v.join(", ")
                : String(v ?? "—");
  const conAyuda = columnas.filter((c) => c.ayuda);
  const exportar = () => {
    const blob = new Blob(
        [
          csv(
            columnas.map((c) => c.nombre),
            filas.map((r) =>
              columnas.map((c) => mostrar(r[c.clave], c.formato)),
            ),
          ),
        ],
        { type: "text/csv;charset=utf-8;" },
      ),
      url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = titulo.replaceAll(" ", "_") + ".csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <div className="rep-tabla">
      <div className="rep-tabla-titulo">
        <h3>{titulo}</h3>
        <button type="button" onClick={exportar}>
          Exportar CSV
        </button>
      </div>
      <div
        className="overflow-x-auto"
        tabIndex={0}
        role="region"
        aria-label={titulo}
      >
        <table>
          <thead>
            <tr>
              {columnas.map((c) => (
                <th
                  key={String(c.clave)}
                  className="sticky top-0"
                  title={c.ayuda}
                >
                  {c.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filas.length ? (
              filas.map((r, i) => (
                <tr key={i}>
                  {columnas.map((c) => (
                    <td key={String(c.clave)} className="tabular-nums">
                      {mostrar(r[c.clave], c.formato)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columnas.length}>
                  Sin datos para el rango seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {conAyuda.length > 0 && (
        <details className="rep-ayuda rep-glosario">
          <summary>¿Qué significa cada columna?</summary>
          <dl>
            {conAyuda.map((c) => (
              <div key={String(c.clave)}>
                <dt>{c.nombre}</dt>
                <dd>{c.ayuda}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}
    </div>
  );
}
export function Grafica({
  datos,
  x,
  series,
  monetaria = false,
  equilibrio,
}: {
  datos: object[];
  x: string;
  series: {
    clave: string;
    nombre: string;
    linea?: boolean;
    derecha?: boolean;
    color?: string;
  }[];
  monetaria?: boolean;
  equilibrio?: { cruce: number | null; limite: number };
}) {
  if (!datos.length)
    return <p className="rep-vacio">Sin datos para graficar.</p>;
  return (
    <div className="rep-grafica">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={datos}
          margin={{ top: 15, right: 25, bottom: 15, left: 25 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={x}
            type={equilibrio ? "number" : "category"}
            domain={equilibrio ? [0, equilibrio.limite] : undefined}
            tickFormatter={(v) => fecha(v)}
            minTickGap={30}
          />
          <YAxis
            yAxisId="izq"
            width={monetaria ? 105 : 55}
            tickFormatter={(v) => (monetaria ? moneda(v) : numero(v))}
          />
          {series.some((s) => s.derecha) && (
            <YAxis
              yAxisId="der"
              orientation="right"
              domain={[0, 100]}
              unit="%"
            />
          )}
          {equilibrio && (
            <>
              <ReferenceArea
                yAxisId="izq"
                x1={0}
                x2={Math.min(
                  equilibrio.cruce ?? equilibrio.limite,
                  equilibrio.limite,
                )}
                fill="#fae9e7"
                fillOpacity={0.6}
              />
              {equilibrio.cruce !== null && (
                <>
                  <ReferenceArea
                    yAxisId="izq"
                    x1={equilibrio.cruce}
                    x2={equilibrio.limite}
                    fill="#d7efdd"
                    fillOpacity={0.6}
                  />
                  <ReferenceLine
                    yAxisId="izq"
                    x={equilibrio.cruce}
                    stroke="#222"
                    strokeDasharray="4 4"
                    label="Equilibrio"
                  />
                </>
              )}
            </>
          )}
          <Tooltip
            labelFormatter={(v) => fecha(v)}
            formatter={(v, n) => [
              monetaria && n !== "Acumulado %" ? moneda(v) : numero(v),
              n,
            ]}
          />
          <Legend />
          {series.map((s, i) =>
            s.linea ? (
              <Line
                key={s.clave}
                yAxisId={s.derecha ? "der" : "izq"}
                type="linear"
                dataKey={s.clave}
                name={s.nombre}
                stroke={s.color ?? ["#177560", "#e28b32", "#5c6bc0"][i % 3]}
                dot={datos.length < 35 ? { r: 3 } : false}
                isAnimationActive={false}
              />
            ) : (
              <Bar
                key={s.clave}
                yAxisId="izq"
                dataKey={s.clave}
                name={s.nombre}
                fill={s.color ?? ["#177560", "#e28b32", "#5c6bc0"][i % 3]}
                isAnimationActive={false}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
