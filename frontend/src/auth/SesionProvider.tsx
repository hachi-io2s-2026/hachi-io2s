import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, guardarToken, leerToken, registrarAlExpirarSesion } from '../api/client'
import { SesionContexto, type Usuario } from './contexto'

export default function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  // Si hay un token guardado, hay que validarlo antes de mostrar el panel
  const [verificando, setVerificando] = useState(() => leerToken() !== null)

  const cerrarSesion = useCallback(() => {
    guardarToken(null)
    setUsuario(null)
  }, [])

  // Si el backend responde 401 (token vencido), se cierra la sesion
  useEffect(() => {
    registrarAlExpirarSesion(cerrarSesion)
  }, [cerrarSesion])

  // Al abrir la app, recuperar la sesion guardada
  useEffect(() => {
    if (!leerToken()) return
    let vigente = true
    api<Usuario>('/auth/me')
      .then((u) => vigente && setUsuario(u))
      .catch(() => vigente && guardarToken(null))
      .finally(() => vigente && setVerificando(false))
    return () => {
      vigente = false
    }
  }, [])

  const iniciarSesion = useCallback(async (correo: string, password: string) => {
    const datos = await api<{ token: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: { correo, password },
    })
    guardarToken(datos.token)
    setUsuario(datos.usuario)
  }, [])

  const valor = useMemo(
    () => ({ usuario, verificando, iniciarSesion, cerrarSesion }),
    [usuario, verificando, iniciarSesion, cerrarSesion],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
