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
import { csv, fecha, moneda, numero } from "./utilidades";
export function Tarjeta({
  titulo,
  valor,
  nota,
}: {
  titulo: string;
  valor: string;
  nota?: string;
}) {
  return (
    <article className="rep-kpi">
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {nota && <small>{nota}</small>}
    </article>
  );
}
export function Bloque({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <section className="rep-bloque">
      <h2>{titulo}</h2>
      {children}
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
    formato?: "moneda" | "fecha" | "numero" | "porcentaje";
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
            : Array.isArray(v)
              ? v.join(", ")
              : String(v ?? "—");
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
                <th key={String(c.clave)} className="sticky top-0">
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
