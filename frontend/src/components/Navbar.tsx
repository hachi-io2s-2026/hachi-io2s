import { useState } from 'react'
import { IconoCerrar, IconoMenu } from './Iconos'
import './Navbar.css'

const ENLACES = [
  { href: '#servicios', texto: 'Servicios' },
  { href: '#proceso', texto: 'Proceso' },
  { href: '#galeria', texto: 'Galería' },
  { href: '#tarifas', texto: 'Tarifas' },
  { href: '#preguntas', texto: 'Preguntas' },
]

interface Props {
  // Se conectara a la pantalla de login en el siguiente paso
  onIniciarSesion?: () => void
}

export default function Navbar({ onIniciarSesion }: Props) {
  const [abierto, setAbierto] = useState(false)
  const cerrar = () => setAbierto(false)

  return (
    <header className="navbar">
      <div className="navbar-contenido">
        <a href="#inicio" className="marca" onClick={cerrar}>
          <img src="/logo.svg" alt="" width="32" height="32" />
          <span>HACHI</span>
        </a>

        <button
          type="button"
          className="navbar-toggle"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="navbar-menu"
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? <IconoCerrar /> : <IconoMenu />}
        </button>

        <nav id="navbar-menu" className={`navbar-menu ${abierto ? 'abierto' : ''}`}>
          <ul>
            {ENLACES.map((e) => (
              <li key={e.href}>
                <a href={e.href} onClick={cerrar}>
                  {e.texto}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="boton boton-negro navbar-login"
            onClick={() => {
              cerrar()
              onIniciarSesion?.()
            }}
          >
            Iniciar sesión
          </button>
        </nav>
      </div>
    </header>
  )
}
