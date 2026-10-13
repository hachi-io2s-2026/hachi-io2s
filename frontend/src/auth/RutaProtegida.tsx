import { Navigate, Outlet, useLocation } from 'react-router'
import { useSesion, type Rol } from './contexto'

function Cargando() {
  return (
    <div className="pantalla-carga" role="status">
      <img src="/logo.svg" alt="" width="44" height="44" />
      <p>Cargando…</p>
    </div>
  )
}

interface Props {
  // Si se indica, solo esos roles del personal pueden entrar
  roles?: Rol[]
}

// Deja pasar solo al personal del hotel; a los clientes los manda a su portal
export default function RutaProtegida({ roles }: Props) {
  const { usuario, cliente, verificando } = useSesion()
  const ubicacion = useLocation()

  if (verificando) return <Cargando />
  if (cliente) return <Navigate to="/mi-cuenta" replace />
  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }
  if (roles && !roles.includes(usuario.rol)) return <Navigate to="/panel" replace />
  return <Outlet />
}

// Deja pasar solo a clientes con sesion; al personal lo manda a su panel
export function RutaCliente() {
  const { usuario, cliente, verificando } = useSesion()
  const ubicacion = useLocation()

  if (verificando) return <Cargando />
  if (usuario) return <Navigate to="/panel" replace />
  if (!cliente) return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  return <Outlet />
}
