import { createContext, useContext } from 'react'

export type Rol = 'ADMIN' | 'EMPLEADO'

// Personal del hotel (lo que devuelven POST /api/auth/login y GET /api/auth/me)
export interface Usuario {
  id_usuario: number
  nombre: string
  correo: string
  rol: Rol
}

// Cliente del portal (POST /api/cliente/login y /api/cliente/registro)
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
  iniciarSesion: (correo: string, password: string) => Promise<void>
  iniciarSesionCliente: (correo: string, password: string) => Promise<void>
  registrarCliente: (datos: DatosRegistro) => Promise<void>
  cerrarSesion: () => void
}

export const SesionContexto = createContext<Sesion | null>(null)

export function useSesion(): Sesion {
  const sesion = useContext(SesionContexto)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return sesion
}
