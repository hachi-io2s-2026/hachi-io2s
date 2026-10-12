import { Navigate, Outlet, useLocation } from 'react-router'
import { useSesion, type Rol } from './contexto'

interface Props {
  // Si se indica, solo esos roles pueden entrar
  roles?: Rol[]
}

// Deja pasar solo a usuarios con sesion iniciada; al resto lo manda al login
export default function RutaProtegida({ roles }: Props) {
  const { usuario, verificando } = useSesion()
  const ubicacion = useLocation()

  if (verificando) {
    return (
      <div className="pantalla-carga" role="status">
        <img src="/logo.svg" alt="" width="44" height="44" />
        <p>Cargando…</p>
      </div>
    )
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: ubicacion.pathname }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/panel" replace />
  }

  return <Outlet />
}
