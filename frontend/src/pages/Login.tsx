import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router'
import { mensajeError } from '../api/client'
import { destinoSesion, useSesion } from '../auth/contexto'
import { IconoAlerta, IconoCalendario, IconoCheck, IconoFlecha, IconoHuella, IconoOjo, IconoOjoTachado } from '../components/Iconos'
import './Login.css'

const VENTAJAS = [
  { icono: <IconoCalendario width={18} height={18} />, texto: 'Solicita hospedaje o daycare en línea y sigue su estado.' },
  { icono: <IconoHuella width={18} height={18} />, texto: 'Ficha de tu perro con dieta, alergias y cuidados.' },
  { icono: <IconoCheck width={18} height={18} />, texto: 'Cupos verificados: sin sobreventa ni sorpresas.' },
]

// Inicio de sesion unico para clientes y personal del hotel.
// El backend responde el tipo de cuenta y aqui se redirige segun el rol.
export default function Login() {
  const { usuario, cliente, iniciarSesion } = useSesion()
  const ubicacion = useLocation()
  // Pagina a la que queria entrar antes de que se le pidiera iniciar sesion
  const desde = (ubicacion.state as { desde?: string } | null)?.desde

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [mayusculas, setMayusculas] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Iniciar sesión · HACHI'
  }, [])

  // Con la sesion iniciada (o recien iniciada) se va a la pantalla que corresponde al rol
  const destino = destinoSesion(usuario, cliente, desde)
  if (destino) return <Navigate to={destino} replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(correo.trim(), password)
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  const revisarMayusculas = (e: KeyboardEvent<HTMLInputElement>) => setMayusculas(e.getModifierState('CapsLock'))

  return (
    <div className="login">
      <div className="login-panel">
        <Link to="/" className="login-marca">
          <img src="/logo-completo.png" alt="hachi · hotel canino" width="120" height="50" />
        </Link>

        <div className="login-contenido">
         
          <h1>Te damos la bienvenida</h1>
          <p className="login-subtitulo">
            Ingresa con tu correo y contraseña. Te llevaremos a tu cuenta si eres cliente o al panel si eres parte del
            equipo.
          </p>

          <form className="login-form" onSubmit={enviar} noValidate>
            <label className="campo">
              <span>Correo electrónico</span>
              <input
                type="email"
                autoComplete="username"
                placeholder="nombre@correo.com"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                required
                autoFocus
              />
            </label>

            <label className="campo">
              <span>Contraseña</span>
              <div className="campo-password">
                <input
                  type={verPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={revisarMayusculas}
                  onKeyDown={revisarMayusculas}
                  required
                />
                <button
                  type="button"
                  className="campo-ojo"
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onClick={() => setVerPassword((v) => !v)}
                >
                  {verPassword ? <IconoOjoTachado width={18} height={18} /> : <IconoOjo width={18} height={18} />}
                </button>
              </div>
              {mayusculas && (
                <small className="campo-aviso">
                  <IconoAlerta width={14} height={14} /> Bloq Mayús está activado
                </small>
              )}
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="boton boton-verde login-boton" disabled={enviando || !correo.trim() || !password}>
              {enviando ? (
                <>
                  <span className="login-spinner" aria-hidden="true" /> Ingresando…
                </>
              ) : (
                <>
                  Iniciar sesión <IconoFlecha width={17} height={17} />
                </>
              )}
            </button>
          </form>

          <div className="login-separador">
            <span>¿Primera vez en HACHI?</span>
          </div>
          <Link to="/registro" className="boton boton-gris login-boton">
            Crear cuenta de cliente
          </Link>
          <p className="login-ayuda">
            ¿Eres parte del equipo y no tienes acceso? Solicítalo al administrador del sistema.
          </p>
        </div>

        <Link to="/" className="login-volver">
          <IconoFlecha width={16} height={16} className="flecha-atras" /> Volver al inicio
        </Link>
      </div>

      <aside className="login-imagen" aria-hidden="true">
        <div className="login-imagen-texto">
          <p>Cuidado para tu perro, de día y de noche.</p>
          <ul className="login-ventajas">
            {VENTAJAS.map((v) => (
              <li key={v.texto}>
                <span>{v.icono}</span>
                {v.texto}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  )
}
