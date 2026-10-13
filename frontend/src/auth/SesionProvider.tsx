import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api, guardarToken, leerToken, registrarAlExpirarSesion } from '../api/client'
import { SesionContexto, type Cliente, type DatosRegistro, type Usuario } from './contexto'

// Lee el contenido del token sin validarlo (solo para saber si es de cliente o del personal).
// La validacion real la hace el backend en cada peticion.
function cargaDeToken(token: string): Record<string, unknown> {
  try {
    return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
  } catch {
    return {}
  }
}

export default function SesionProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [cliente, setCliente] = useState<Cliente | null>(null)
  // Si hay un token guardado, hay que validarlo antes de mostrar el panel o el portal
  const [verificando, setVerificando] = useState(() => leerToken() !== null)

  const cerrarSesion = useCallback(() => {
    guardarToken(null)
    setUsuario(null)
    setCliente(null)
  }, [])

  // Si el backend responde 401 (token vencido), se cierra la sesion
  useEffect(() => {
    registrarAlExpirarSesion(cerrarSesion)
  }, [cerrarSesion])

  // Al abrir la app, recuperar la sesion guardada
  useEffect(() => {
    const token = leerToken()
    if (!token) return
    let vigente = true
    const carga = cargaDeToken(token)
    const recuperar =
      carga.tipo === 'cliente'
        ? api<{ id_propietario: number; nombre: string; apellido: string; correo: string }>('/cliente/me').then(
            (p) =>
              vigente &&
              setCliente({
                id_cuenta: Number(carga.id_cuenta),
                id_propietario: p.id_propietario,
                nombre: `${p.nombre} ${p.apellido}`,
                correo: p.correo,
              }),
          )
        : api<Usuario>('/auth/me').then((u) => vigente && setUsuario(u))
    recuperar
      .catch(() => vigente && guardarToken(null))
      .finally(() => vigente && setVerificando(false))
    return () => {
      vigente = false
    }
  }, [])

  const entrarComoCliente = useCallback((datos: { token: string; cliente: Cliente }) => {
    guardarToken(datos.token)
    setUsuario(null)
    setCliente(datos.cliente)
  }, [])

  // Un solo inicio de sesion: el backend responde si la cuenta es del personal o de un cliente
  const iniciarSesion = useCallback(
    async (correo: string, password: string) => {
      const datos = await api<
        { tipo: 'personal'; token: string; usuario: Usuario } | { tipo: 'cliente'; token: string; cliente: Cliente }
      >('/auth/login', { method: 'POST', body: { correo, password } })
      if (datos.tipo === 'cliente') {
        entrarComoCliente(datos)
        return
      }
      guardarToken(datos.token)
      setCliente(null)
      setUsuario(datos.usuario)
    },
    [entrarComoCliente],
  )

  const registrarCliente = useCallback(
    async (d: DatosRegistro) => {
      entrarComoCliente(await api<{ token: string; cliente: Cliente }>('/cliente/registro', { method: 'POST', body: d }))
    },
    [entrarComoCliente],
  )

  const valor = useMemo(
    () => ({ usuario, cliente, verificando, iniciarSesion, registrarCliente, cerrarSesion }),
    [usuario, cliente, verificando, iniciarSesion, registrarCliente, cerrarSesion],
  )

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>
}
