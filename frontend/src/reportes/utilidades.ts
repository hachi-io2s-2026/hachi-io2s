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
