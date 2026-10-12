import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { mensajeError } from '../api/client'
import { useSesion } from '../auth/contexto'
import { IconoFlecha, IconoOjo, IconoOjoTachado } from '../components/Iconos'
import './Login.css'

type Tipo = 'cliente' | 'personal'

export default function Login() {
  const { usuario, cliente, iniciarSesion, iniciarSesionCliente } = useSesion()
  const navegar = useNavigate()
  const ubicacion = useLocation()
  const [params, setParams] = useSearchParams()
  const tipo: Tipo = params.get('tipo') === 'personal' ? 'personal' : 'cliente'
  // Pagina a la que queria entrar antes de que se le pidiera iniciar sesion
  const desde = (ubicacion.state as { desde?: string } | null)?.desde

  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Iniciar sesión · HACHI'
  }, [])

  if (usuario) return <Navigate to={desde?.startsWith('/panel') ? desde : '/panel'} replace />
  if (cliente) return <Navigate to={desde?.startsWith('/mi-cuenta') ? desde : '/mi-cuenta'} replace />

  const cambiarTipo = (nuevo: Tipo) => {
    setError(null)
    setParams(nuevo === 'personal' ? { tipo: 'personal' } : {}, { replace: true, state: ubicacion.state })
  }

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      if (tipo === 'personal') {
        await iniciarSesion(correo.trim(), password)
        navegar(desde?.startsWith('/panel') ? desde : '/panel', { replace: true })
      } else {
        await iniciarSesionCliente(correo.trim(), password)
        navegar(desde?.startsWith('/mi-cuenta') ? desde : '/mi-cuenta', { replace: true })
      }
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
          <div className="login-tipos" role="tablist" aria-label="Tipo de cuenta">
            <button type="button" role="tab" aria-selected={tipo === 'cliente'} className={tipo === 'cliente' ? 'activo' : ''} onClick={() => cambiarTipo('cliente')}>
              Soy cliente
            </button>
            <button type="button" role="tab" aria-selected={tipo === 'personal'} className={tipo === 'personal' ? 'activo' : ''} onClick={() => cambiarTipo('personal')}>
              Personal del hotel
            </button>
          </div>

          <h1>{tipo === 'cliente' ? 'Bienvenido de vuelta' : 'Acceso del personal'}</h1>
          <p className="login-subtitulo">
            {tipo === 'cliente'
              ? 'Entra para ver a tus perros, tus reservas y solicitar una estancia.'
              : 'Entra al panel de recepción para gestionar reservas, hospedaje y daycare.'}
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

            <button type="submit" className="boton boton-verde login-boton" disabled={enviando || !correo.trim() || !password}>
              {enviando ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-ayuda">
            {tipo === 'cliente' ? (
              <>
                ¿Todavía no tienes cuenta? <Link to="/registro">Crea tu cuenta</Link>
              </>
            ) : (
              '¿No tienes acceso? Solicítalo al administrador del sistema.'
            )}
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
