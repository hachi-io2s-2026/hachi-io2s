// Formato de dinero y fechas para mostrar en pantalla.
// El backend envia fechas como texto local ("YYYY-MM-DD" o "YYYY-MM-DD HH:mm:ss"),
// por eso aqui se trabaja con texto y no se convierten zonas horarias.

const formatoMoneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']

const pad = (n: number) => String(n).padStart(2, '0')

export const moneda = (valor: number) => formatoMoneda.format(valor)

export function hoy(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function sumarDias(dia: string, n: number): string {
  const [y, m, d] = dia.split('-').map(Number)
  const f = new Date(Date.UTC(y, m - 1, d + n))
  return `${f.getUTCFullYear()}-${pad(f.getUTCMonth() + 1)}-${pad(f.getUTCDate())}`
}

export function diferenciaDias(desde: string, hasta: string): number {
  const a = desde.split('-').map(Number)
  const b = hasta.split('-').map(Number)
  return Math.round((Date.UTC(b[0], b[1] - 1, b[2]) - Date.UTC(a[0], a[1] - 1, a[2])) / 86_400_000)
}

// "2026-10-12" -> "12 oct 2026"
export function fecha(valor: string | null | undefined): string {
  if (!valor) return '—'
  const [y, m, d] = valor.slice(0, 10).split('-').map(Number)
  return `${d} ${MESES[m - 1]} ${y}`
}

// "2026-10-12" -> "lun 12 oct"
export function fechaCorta(valor: string): string {
  const [y, m, d] = valor.slice(0, 10).split('-').map(Number)
  const semana = DIAS_SEMANA[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
  return `${semana} ${d} ${MESES[m - 1]}`
}

// "2026-10-12 14:30:00" -> "14:30"
export const hora = (valor: string | null | undefined) => (valor ? valor.slice(11, 16) : '—')

// "2026-10-12 14:30:00" -> "12 oct 2026, 14:30"
export function fechaHora(valor: string | null | undefined): string {
  if (!valor) return '—'
  return `${fecha(valor)}, ${hora(valor)}`
}

// Edad aproximada a partir de la fecha de nacimiento
export function edad(nacimiento: string | null): string {
  if (!nacimiento) return '—'
  const meses = Math.floor(diferenciaDias(nacimiento, hoy()) / 30.44)
  if (meses < 12) return `${Math.max(meses, 0)} ${meses === 1 ? 'mes' : 'meses'}`
  const anios = Math.floor(meses / 12)
  return `${anios} ${anios === 1 ? 'año' : 'años'}`
}

export const unidadTexto = (unidad: 'NOCHE' | 'DIA', cantidad = 1) =>
  unidad === 'NOCHE' ? (cantidad === 1 ? 'noche' : 'noches') : cantidad === 1 ? 'día' : 'días'
