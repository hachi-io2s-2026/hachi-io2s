import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router'
import { mensajeError } from '../api/client'
import { useSesion, type DatosRegistro } from '../auth/contexto'
import { IconoFlecha } from '../components/Iconos'
import './Login.css'

const vacio: DatosRegistro & { confirmar: string } = {
  nombre: '',
  apellido: '',
  telefono: '',
  correo: '',
  direccion: '',
  password: '',
  confirmar: '',
}

export default function Registro() {
  const { usuario, cliente, registrarCliente } = useSesion()
  const [d, setD] = useState(vacio)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Crear cuenta · HACHI'
  }, [])

  if (usuario) return <Navigate to="/panel" replace />
  // Al crearse la cuenta la sesion se activa y esta redireccion ocurre de inmediato;
  // si fue por el registro (enviando), se pasa el aviso de bienvenida al portal.
  if (cliente) return <Navigate to="/mi-cuenta" replace state={enviando ? { bienvenida: true } : undefined} />

  const cambiar = (campo: keyof typeof vacio) => (e: { target: { value: string } }) =>
    setD((x) => ({ ...x, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (d.password !== d.confirmar) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setEnviando(true)
    try {
      const { confirmar: _, ...datos } = d
      await registrarCliente(datos)
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <div className="login">
      <div className="login-panel">
        <Link to="/" className="login-marca">
          <img src="/logo-completo.png" alt="hachi · hotel canino" width="120" height="50" />
        </Link>

        <div className="login-contenido registro-contenido">
          <h1>Crea tu cuenta</h1>
          <p className="login-subtitulo">
            Con tu cuenta registras a tus perros, solicitas estancias y ves el estado de tus reservas.
          </p>

          <form className="login-form" onSubmit={enviar}>
            <div className="campos-dobles">
              <label className="campo">
                <span>Nombre</span>
                <input value={d.nombre} onChange={cambiar('nombre')} required maxLength={100} autoComplete="given-name" autoFocus />
              </label>
              <label className="campo">
                <span>Apellido</span>
                <input value={d.apellido} onChange={cambiar('apellido')} required maxLength={100} autoComplete="family-name" />
              </label>
            </div>
            <div className="campos-dobles">
              <label className="campo">
                <span>Teléfono</span>
                <input type="tel" value={d.telefono} onChange={cambiar('telefono')} required maxLength={20} placeholder="5555-1234" autoComplete="tel" />
              </label>
              <label className="campo">
                <span>Correo electrónico</span>
                <input type="email" value={d.correo} onChange={cambiar('correo')} required maxLength={150} autoComplete="email" />
              </label>
            </div>
            <label className="campo">
              <span>Dirección (opcional)</span>
              <input value={d.direccion} onChange={cambiar('direccion')} maxLength={255} autoComplete="street-address" />
            </label>
            <div className="campos-dobles">
              <label className="campo">
                <span>Contraseña</span>
                <input type="password" value={d.password} onChange={cambiar('password')} required minLength={8} maxLength={72} autoComplete="new-password" />
              </label>
              <label className="campo">
                <span>Repite la contraseña</span>
                <input type="password" value={d.confirmar} onChange={cambiar('confirmar')} required minLength={8} maxLength={72} autoComplete="new-password" />
              </label>
            </div>

            <p className="registro-nota">
              ¿Ya has traído a tu perro al hotel? Usa el <strong>mismo correo y teléfono</strong> que diste en
              recepción y verás a tus perros registrados.
            </p>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="boton boton-verde login-boton" disabled={enviando}>
              {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
            </button>
          </form>

          <p className="login-ayuda">
            ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
          </p>
        </div>

        <Link to="/" className="login-volver">
          <IconoFlecha width={16} height={16} className="flecha-atras" /> Volver al inicio
        </Link>
      </div>

      <aside className="login-imagen login-imagen-registro" aria-hidden="true">
        <div className="login-imagen-texto">
          <p>Reserva en minutos, sin llamar.</p>
          <span>Solicita la estancia de tu perro y el hotel te la confirma.</span>
        </div>
      </aside>
    </div>
  )
}
