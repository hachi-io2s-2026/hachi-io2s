import { createContext, useContext } from 'react'

export type Rol = 'ADMIN' | 'EMPLEADO'

// Personal del hotel (lo que devuelven POST /api/auth/login y GET /api/auth/me)
export interface Usuario {
  id_usuario: number
  nombre: string
  correo: string
  rol: Rol
}

// Cliente del portal (POST /api/auth/login y /api/cliente/registro)
export interface Cliente {
  id_cuenta: number
  id_propietario: number
  nombre: string
  correo: string
}

export interface DatosRegistro {
  nombre: string
  apellido: string
  telefono: string
  correo: string
  password: string
  direccion: string
}

export interface Sesion {
  // Solo uno de los dos tiene valor a la vez
  usuario: Usuario | null
  cliente: Cliente | null
  // true mientras se valida el token guardado al abrir la app
  verificando: boolean
  // Sirve para personal y clientes; despues de entrar, la sesion indica a donde ir
  iniciarSesion: (correo: string, password: string) => Promise<void>
  registrarCliente: (datos: DatosRegistro) => Promise<void>
  cerrarSesion: () => void
}

export const SesionContexto = createContext<Sesion | null>(null)

// Pantalla de inicio segun quien entro: el personal (ADMIN o EMPLEADO) va al panel y el
// cliente a su cuenta. Si venia de una pagina protegida que le corresponde, vuelve a ella.
export function destinoSesion(usuario: Usuario | null, cliente: Cliente | null, desde?: string): string | null {
  if (usuario) return desde?.startsWith('/panel') ? desde : '/panel'
  if (cliente) return desde?.startsWith('/mi-cuenta') ? desde : '/mi-cuenta'
  return null
}

export function useSesion(): Sesion {
  const sesion = useContext(SesionContexto)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return sesion
}
