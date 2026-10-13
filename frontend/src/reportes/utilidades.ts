export const numero = (v: unknown) =>
  v === null || v === undefined
    ? "—"
    : Number(v).toLocaleString("en-US", { maximumFractionDigits: 2 });
export const moneda = (v: unknown) =>
  v === null || v === undefined
    ? "—"
    : `Q ${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const fecha = (v: unknown) =>
  typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v)
    ? `${v.slice(8, 10)}/${v.slice(5, 7)}/${v.slice(0, 4)}${v.length > 10 ? " " + v.slice(11, 16) : ""}`
    : String(v ?? "—");
const SERVICIOS: Record<string, string> = {
  TODOS: "Todos los servicios",
  HOSPEDAJE: "Hospedaje",
  DAYCARE: "Daycare",
};
export const nombreServicio = (v: unknown) =>
  SERVICIOS[String(v)] ?? String(v ?? "—");
// "2026-01-05, 2026-01-06, …" → "05/01/2026, 06/01/2026 y 4 más"
export const listaFechas = (v: unknown, max = 3) => {
  const todas = String(v ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!todas.length) return "—";
  return (
    todas.slice(0, max).map(fecha).join(", ") +
    (todas.length > max ? ` y ${todas.length - max} más` : "")
  );
};
export function csv(cabeceras: string[], filas: unknown[][]) {
  const celda = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^(?:\s*[=+@-]|[\t\r\n])/, "'$&")
      .replaceAll('"', '""') +
    '"';
  return (
    "\uFEFF" +
    [cabeceras, ...filas].map((f) => f.map(celda).join(",")).join("\r\n")
  );
}
