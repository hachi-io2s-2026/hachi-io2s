import { useState } from 'react'
import { NavLink, Outlet } from 'react-router'
import { useSesion } from '../auth/contexto'
import { IconoCerrar, IconoMenu, IconoSalir } from '../components/Iconos'
import { MODULOS, puedeVer } from './modulos'
import './Panel.css'

const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('')

export default function PanelLayout() {
  const { usuario, cerrarSesion } = useSesion()
  const [menuAbierto, setMenuAbierto] = useState(false)

  if (!usuario) return null
  const modulos = MODULOS.filter((m) => puedeVer(m, usuario.rol))

  // Se recarga en la pagina de inicio: asi no queda ningun dato del panel en memoria
  // y la ruta protegida no alcanza a redirigir al login mientras se sale.
  const salir = () => {
    cerrarSesion()
    window.location.replace('/')
  }

  return (
    <div className="panel">
      {/* Barra superior (solo telefono / tablet) */}
      <header className="panel-barra">
        <span className="panel-marca">
          <img src="/logo.svg" alt="" width="28" height="28" />
          HACHI
        </span>
        <button
          type="button"
          className="panel-toggle"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((v) => !v)}
        >
          {menuAbierto ? <IconoCerrar /> : <IconoMenu />}
        </button>
      </header>

      <aside className={`panel-lateral ${menuAbierto ? 'abierto' : ''}`}>
        <span className="panel-marca panel-marca-lateral">
          <img src="/logo.svg" alt="" width="30" height="30" />
          HACHI
        </span>

        <nav className="panel-nav" aria-label="Módulos">
          {modulos.map((m) => (
            <NavLink
              key={m.ruta}
              to={m.ruta}
              end={m.ruta === '/panel'}
              className={({ isActive }) => `panel-enlace ${isActive ? 'activo' : ''}`}
              onClick={() => setMenuAbierto(false)}
            >
              {m.icono}
              {m.titulo}
            </NavLink>
          ))}
        </nav>

        <div className="panel-usuario">
          <span className="panel-avatar" aria-hidden="true">
            {iniciales(usuario.nombre)}
          </span>
          <div className="panel-usuario-datos">
            <strong>{usuario.nombre}</strong>
            <span>{usuario.rol === 'ADMIN' ? 'Administrador' : 'Empleado'}</span>
          </div>
          <button type="button" className="panel-salir" onClick={salir} aria-label="Cerrar sesión" title="Cerrar sesión">
            <IconoSalir width={18} height={18} />
          </button>
        </div>
      </aside>

      {menuAbierto && <div className="panel-fondo" onClick={() => setMenuAbierto(false)} />}

      <main className="panel-contenido">
        <Outlet />
      </main>
    </div>
  )
}
