import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'
import { useSesion } from '../auth/contexto'
import { IconoCerrar, IconoMas, IconoMenu, IconoSalir } from '../components/Iconos'
import BuscadorGlobal from './BuscadorGlobal'
import { MODULOS, puedeVer } from './modulos'
import { cargarResumenHoy, pendientes } from './resumenHoy'
import { Avatar } from './ui'
import './Panel.css'
import './ui.css'

const fechaCorta = new Intl.DateTimeFormat('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })

export default function PanelLayout() {
  const { usuario, cerrarSesion } = useSesion()
  const ubicacion = useLocation()
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [porHacer, setPorHacer] = useState<number | null>(null)
  const [hoy] = useState(() => {
    const t = fechaCorta.format(new Date())
    return t.charAt(0).toUpperCase() + t.slice(1)
  })

  // Contador de entradas y salidas pendientes del dia (se actualiza al cambiar de pantalla)
  useEffect(() => {
    let vigente = true
    cargarResumenHoy()
      .then((r) => vigente && setPorHacer(pendientes(r)))
      .catch(() => undefined)
    return () => {
      vigente = false
    }
  }, [ubicacion.pathname])

  if (!usuario) return null
  const modulos = MODULOS.filter((m) => puedeVer(m, usuario.rol))

  // Se recarga en la pagina de inicio: asi no queda ningun dato del panel en memoria
  // y la ruta protegida no alcanza a redirigir al login mientras se sale.
  const salir = () => {
    cerrarSesion()
    window.location.replace('/')
  }

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <div className="panel">
      <aside className={`panel-lateral ${menuAbierto ? 'abierto' : ''}`}>
        <Link to="/panel" className="panel-marca" onClick={cerrarMenu}>
          <img src="/logo.svg" alt="" width="34" height="34" />
          <span>
            hachi
            <small>Panel de recepción</small>
          </span>
        </Link>

        <p className="panel-seccion">Menú</p>
        <nav className="panel-nav" aria-label="Módulos">
          {modulos.map((m) => (
            <NavLink
              key={m.ruta}
              to={m.ruta}
              end={m.ruta === '/panel'}
              className={({ isActive }) => `panel-enlace ${isActive ? 'activo' : ''}`}
              onClick={cerrarMenu}
            >
              {m.icono}
              <span className="panel-enlace-texto">{m.titulo}</span>
              {m.ruta === '/panel' && porHacer !== null && porHacer > 0 && (
                <span className="panel-contador" title="Entradas y salidas pendientes hoy">
                  {porHacer}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="panel-usuario">
          <Avatar nombre={usuario.nombre} />
          <div className="panel-usuario-datos">
            <strong>{usuario.nombre}</strong>
            <span>{usuario.rol === 'ADMIN' ? 'Administrador' : 'Empleado'}</span>
          </div>
          <button type="button" className="panel-salir" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <IconoSalir width={18} height={18} />
          </button>
        </div>
      </aside>

      {menuAbierto && <div className="panel-fondo" onClick={cerrarMenu} />}

      <div className="panel-derecha">
        <header className="panel-superior">
          <button
            type="button"
            className="panel-toggle"
            aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuAbierto}
            onClick={() => setMenuAbierto((v) => !v)}
          >
            {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
          </button>
          <BuscadorGlobal />
          <span className="panel-fecha">{hoy}</span>
          <Link to="/panel/reservaciones/nueva" className="boton boton-verde panel-superior-boton">
            <IconoMas width={16} height={16} /> <span>Nueva reserva</span>
          </Link>
        </header>

        <main className="panel-contenido">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
