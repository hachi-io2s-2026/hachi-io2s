import { Link, NavLink, Outlet } from 'react-router'
import { useSesion } from '../auth/contexto'
import { IconoMas, IconoSalir } from '../components/Iconos'
import { Avatar } from '../panel/ui'
import '../panel/Panel.css'
import '../panel/ui.css'
import './Portal.css'

const ENLACES = [
  { a: '/mi-cuenta', texto: 'Inicio', exacto: true },
  { a: '/mi-cuenta/perros', texto: 'Mis perros' },
  { a: '/mi-cuenta/reservas', texto: 'Mis reservas' },
]

// Marco del portal del cliente: barra superior sencilla (sin el menu del personal)
export default function PortalLayout() {
  const { cliente, cerrarSesion } = useSesion()
  if (!cliente) return null

  // Se recarga en la pagina de inicio para no dejar datos de la cuenta en memoria
  const salir = () => {
    cerrarSesion()
    window.location.replace('/')
  }

  return (
    <div className="portal">
      <header className="portal-barra">
        <div className="portal-barra-contenido">
          <Link to="/mi-cuenta" className="portal-marca">
            <img src="/logo.svg" alt="" width="32" height="32" />
            <span>
              HACHI
              <small>Mi cuenta</small>
            </span>
          </Link>

          <nav className="portal-nav" aria-label="Portal">
            {ENLACES.map((e) => (
              <NavLink key={e.a} to={e.a} end={e.exacto} className={({ isActive }) => (isActive ? 'activo' : '')}>
                {e.texto}
              </NavLink>
            ))}
          </nav>

          <div className="portal-acciones">
            <Link to="/mi-cuenta/reservar" className="boton boton-verde boton-chico portal-reservar">
              <IconoMas width={15} height={15} /> <span>Solicitar estancia</span>
            </Link>
            <div className="portal-usuario">
              <Avatar nombre={cliente.nombre} chico />
              <span className="portal-usuario-nombre">{cliente.nombre.split(' ')[0]}</span>
              <button type="button" className="panel-salir" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
                <IconoSalir width={18} height={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="portal-contenido">
        <Outlet />
      </main>
    </div>
  )
}
