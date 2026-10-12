// Cliente HTTP para la API de HACHI.
// Todas las respuestas del backend tienen la forma { success, data } o { success: false, message, errores }.

const TOKEN_KEY = 'hachi_token'

export interface ErrorCampo {
  campo: string
  mensaje: string
}

export class ApiError extends Error {
  status: number
  errores?: ErrorCampo[]

  constructor(status: number, message: string, errores?: ErrorCampo[]) {
    super(message)
    this.status = status
    this.errores = errores
  }
}

let alExpirarSesion: (() => void) | null = null

export function registrarAlExpirarSesion(fn: () => void) {
  alExpirarSesion = fn
}

export function leerToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function guardarToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Sin almacenamiento disponible: la sesion dura mientras la pestana este abierta
  }
}

export async function api<T>(
  ruta: string,
  opciones: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = leerToken()
  let res: Response

  try {
    res = await fetch(`/api${ruta}`, {
      method: opciones.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: opciones.body === undefined ? undefined : JSON.stringify(opciones.body),
    })
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. ¿Está encendido el backend?')
  }

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    if (res.status === 401 && token) alExpirarSesion?.()
    throw new ApiError(res.status, json?.message ?? `Error ${res.status}`, json?.errores)
  }
  return json.data as T
}

export async function verificarBackend(): Promise<string> {
  let res: Response
  try {
    res = await fetch('/api/health')
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor. ¿Está encendido el backend?')
  }
  const json = await res.json().catch(() => null)
  if (!res.ok || !json?.success) {
    throw new ApiError(res.status, 'El backend no respondió correctamente. ¿Está encendido en el puerto 3000?')
  }
  return json.message
}

export function mensajeError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errores?.length) {
      return `${error.message}: ${error.errores
        .map((e) => (e.campo ? `${e.campo}: ${e.mensaje}` : e.mensaje))
        .join(' · ')}`
    }
    return error.message
  }
  return 'Ocurrió un error inesperado'
}

// Construye "?a=1&b=2" omitiendo valores vacios
export function query(params: Record<string, string | number | undefined | null>) {
  const usp = new URLSearchParams()
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') usp.set(clave, String(valor))
  }
  const texto = usp.toString()
  return texto ? `?${texto}` : ''
}
