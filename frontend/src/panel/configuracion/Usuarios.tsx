import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { UsuarioSistema } from '../../api/tipos'
import { useSesion } from '../../auth/contexto'
import { fecha } from '../../utils/formato'
import { Aviso, Campo, Cargando, Confirmar, Estado, Modal } from '../ui'
import { useCarga } from '../useCarga'

export default function Usuarios() {
  const { usuario: yo } = useSesion()
  const { datos, error, cargando, recargar } = useCarga(() => api<UsuarioSistema[]>('/usuarios'), [])
  const [nuevo, setNuevo] = useState(false)
  const [cambiar, setCambiar] = useState<UsuarioSistema | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  return (
    <>
      <div className="caja-encabezado">
        <p className="texto-suave texto-chico sin-margen">
          Los administradores además gestionan tarifas, capacidades, usuarios y anulación de pagos.
        </p>
        <button type="button" className="boton boton-verde boton-chico" onClick={() => setNuevo(true)}>
          Nuevo usuario
        </button>
      </div>
      {aviso && (
        <div className="caja-cuerpo sin-padding-inferior">
          <Aviso tipo="ok" onCerrar={() => setAviso(null)}>
            {aviso}
          </Aviso>
        </div>
      )}
      {error && (
        <div className="caja-cuerpo">
          <Aviso>{error}</Aviso>
        </div>
      )}
      {cargando && !datos && <Cargando />}
      {datos && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.map((u) => (
                <tr key={u.id_usuario}>
                  <td>
                    <div className="celda-principal">
                      <strong>
                        {u.nombre}
                        {u.id_usuario === yo?.id_usuario && <span className="etiqueta-vigente">Tú</span>}
                      </strong>
                      <span>{u.correo}</span>
                    </div>
                  </td>
                  <td>
                    <Estado valor={u.rol} />
                  </td>
                  <td>
                    <Estado valor={u.activo ? 'ACTIVO' : 'INACTIVO'} />
                  </td>
                  <td>{fecha(u.fecha_creacion)}</td>
                  <td>
                    {u.id_usuario !== yo?.id_usuario && (
                      <div className="acciones-fila">
                        <button
                          type="button"
                          className={`boton boton-chico ${u.activo ? 'boton-suave-peligro' : 'boton-gris'}`}
                          onClick={() => setCambiar(u)}
                        >
                          {u.activo ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {nuevo && (
        <FormUsuario
          onCerrar={() => setNuevo(false)}
          onGuardado={(u) => {
            setNuevo(false)
            setAviso(`Usuario ${u.correo} creado.`)
            recargar()
          }}
        />
      )}

      <Confirmar
        abierto={cambiar !== null}
        onCerrar={() => setCambiar(null)}
        titulo={cambiar?.activo ? 'Desactivar usuario' : 'Activar usuario'}
        textoConfirmar={cambiar?.activo ? 'Desactivar' : 'Activar'}
        peligro={cambiar?.activo}
        mensaje={
          cambiar?.activo
            ? `${cambiar.nombre} ya no podrá iniciar sesión hasta que se vuelva a activar.`
            : `${cambiar?.nombre} podrá volver a iniciar sesión.`
        }
        onConfirmar={async () => {
          await api(`/usuarios/${cambiar!.id_usuario}`, { method: 'PATCH', body: { activo: !cambiar!.activo } })
          setAviso(`${cambiar!.nombre} fue ${cambiar!.activo ? 'desactivado' : 'activado'}.`)
          recargar()
        }}
      />
    </>
  )
}

function FormUsuario({ onCerrar, onGuardado }: { onCerrar: () => void; onGuardado: (u: UsuarioSistema) => void }) {
  const [d, setD] = useState({ nombre: '', correo: '', password: '', rol: 'EMPLEADO' })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cambiar = (c: keyof typeof d) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [c]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      onGuardado(await api<UsuarioSistema>('/usuarios', { method: 'POST', body: d }))
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo="Nuevo usuario"
      abierto
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-usuario" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Creando…' : 'Crear usuario'}
          </button>
        </>
      }
    >
      <form id="form-usuario" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Nombre completo *" ancho="completo">
          <input value={d.nombre} onChange={cambiar('nombre')} required maxLength={100} />
        </Campo>
        <Campo etiqueta="Correo electrónico *" ancho="completo">
          <input type="email" value={d.correo} onChange={cambiar('correo')} required maxLength={150} autoComplete="off" />
        </Campo>
        <Campo etiqueta="Contraseña *" ayuda="Mínimo 8 caracteres">
          <input type="password" value={d.password} onChange={cambiar('password')} required minLength={8} maxLength={72} autoComplete="new-password" />
        </Campo>
        <Campo etiqueta="Rol *">
          <select value={d.rol} onChange={cambiar('rol')}>
            <option value="EMPLEADO">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </Campo>
      </form>
      {error && (
        <div style={{ marginTop: 14 }}>
          <Aviso>{error}</Aviso>
        </div>
      )}
    </Modal>
  )
}
