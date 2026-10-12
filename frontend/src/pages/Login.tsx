import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { mensajeError } from '../api/client'
import { useSesion } from '../auth/contexto'
import { IconoFlecha, IconoOjo, IconoOjoTachado } from '../components/Iconos'
import './Login.css'

export default function Login() {
  const { usuario, iniciarSesion } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  // Pagina a la que queria entrar antes de que se le pidiera iniciar sesion
  const destino = (ubicacion.state as { desde?: string } | null)?.desde ?? '/panel'

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Iniciar sesión · HACHI'
  }, [])

  if (usuario) return <Navigate to={destino} replace />

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await iniciarSesion(correo.trim(), password)
      navegar(destino, { replace: true })
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <div className="login-panel">
        <Link to="/" className="login-marca">
          <img src="/logo.svg" alt="" width="32" height="32" />
          HACHI
        </Link>

        <div className="login-contenido">
          <h1>Inicia sesión</h1>
          <p className="login-subtitulo">Accede al sistema de gestión del hotel y daycare.</p>

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
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="boton boton-verde login-boton"
              disabled={enviando || !correo.trim() || !password}
            >
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-ayuda">
            ¿No tienes una cuenta? Solicítala al administrador del sistema.
          </p>
        </div>

        <Link to="/" className="login-volver">
          <IconoFlecha width={16} height={16} className="flecha-atras" /> Volver al inicio
        </Link>
      </div>

      <aside className="login-imagen" aria-hidden="true">
        <div className="login-imagen-texto">
          <p>Cuidado para tu perro, de día y de noche.</p>
          <span>Hospedaje nocturno y daycare con cupos controlados.</span>
        </div>
      </aside>
    </div>
  )
}
