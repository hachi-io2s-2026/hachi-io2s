import { createContext, useContext } from 'react'

export type Rol = 'ADMIN' | 'EMPLEADO'

// Usuario de la sesion (lo que devuelven POST /api/auth/login y GET /api/auth/me)
export interface Usuario {
  id_usuario: number
  nombre: string
  correo: string
  rol: Rol
}

export interface Sesion {
  usuario: Usuario | null
  // true mientras se valida el token guardado al abrir la app
  verificando: boolean
  iniciarSesion: (correo: string, password: string) => Promise<void>
  cerrarSesion: () => void
}

export const SesionContexto = createContext<Sesion | null>(null)

export function useSesion(): Sesion {
  const sesion = useContext(SesionContexto)
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>')
  return sesion
}
