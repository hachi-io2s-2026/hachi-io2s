
const pad = (n: number) => String(n).padStart(2, "0");

export function esDiaValido(dia: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return false;
  const [y, m, d] = dia.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  return (
    fecha.getUTCFullYear() === y &&
    fecha.getUTCMonth() === m - 1 &&
    fecha.getUTCDate() === d
  );
}

// Acepta "YYYY-MM-DDTHH:mm", "YYYY-MM-DD HH:mm" o con segundos
export function normalizarFechaHora(valor: string): string | null {
  const match = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    valor.trim()
  );
  if (!match) return null;
  const [, dia, hh, mm, ss = "00"] = match;
  if (!esDiaValido(dia) || Number(hh) > 23 || Number(mm) > 59 || Number(ss) > 59) {
    return null;
  }
  return `${dia} ${hh}:${mm}:${ss}`;
}

export const diaDe = (fechaHora: string) => fechaHora.slice(0, 10);
export const horaDe = (fechaHora: string) => fechaHora.slice(11, 16);

const aUTC = (dia: string) => {
  const [y, m, d] = dia.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

// Dias calendario de "desde" a "hasta" (puede ser negativo)
export const diferenciaDias = (desde: string, hasta: string) =>
  Math.round((aUTC(hasta) - aUTC(desde)) / 86_400_000);

export function sumarDias(dia: string, n: number): string {
  const fecha = new Date(aUTC(dia) + n * 86_400_000);
  return `${fecha.getUTCFullYear()}-${pad(fecha.getUTCMonth() + 1)}-${pad(fecha.getUTCDate())}`;
}

// Lista de dias desde "desde" hasta "hasta", ambos incluidos
export function rangoDias(desde: string, hasta: string): string[] {
  const dias: string[] = [];
  for (let i = 0; i <= diferenciaDias(desde, hasta); i++) {
    dias.push(sumarDias(desde, i));
  }
  return dias;
}

export function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ahora(): string {
  const d = new Date();
  return `${hoy()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
