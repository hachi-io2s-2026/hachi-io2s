import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { api, mensajeError } from '../../api/client'
import type { PropietarioDetalle as Detalle, Reservacion } from '../../api/tipos'
import { edad, fecha, moneda } from '../../utils/formato'
import { Aviso, Cargando, Confirmar, Encabezado, Estado, Vacio } from '../ui'
import { useCarga } from '../useCarga'
import FormMascota from './FormMascota'
import FormPropietario from './FormPropietario'

type MascotaDetalle = Detalle['mascotas'][number]

export default function PropietarioDetalle() {
  const { id } = useParams()
  const navegar = useNavigate()
  const [editando, setEditando] = useState(false)
  const [mascotaForm, setMascotaForm] = useState<{ abierto: boolean; mascota: MascotaDetalle | null }>({
    abierto: false,
    mascota: null,
  })
  const [aBaja, setABaja] = useState<MascotaDetalle | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const exito = (texto: string) => setAviso({ tipo: 'ok', texto })

  const { datos, error, cargando, recargar } = useCarga(
    () =>
      Promise.all([
        api<Detalle>(`/propietarios/${id}`),
        api<Reservacion[]>(`/reservaciones?id_propietario=${id}`),
      ]),
    [id],
  )
  const [propietario, reservas] = datos ?? [null, null]

  useEffect(() => {
    if (propietario) document.title = `${propietario.nombre} ${propietario.apellido} · HACHI`
  }, [propietario])

  if (cargando && !datos) return <Cargando />
  if (error && !datos) {
    return (
      <div className="pagina">
        <Encabezado titulo="Dueño" volver={{ a: '/panel/propietarios', texto: 'Dueños y perros' }} />
        <Aviso>{error}</Aviso>
      </div>
    )
  }
  if (!propietario || !reservas) return null

  const reactivar = async (m: MascotaDetalle) => {
    await api(`/mascotas/${m.id_mascota}/reactivar`, { method: 'POST' })
    exito(`${m.nombre} está activo de nuevo.`)
    recargar()
  }

  return (
    <div className="pagina">
      <Encabezado
        volver={{ a: '/panel/propietarios', texto: 'Dueños y perros' }}
        titulo={`${propietario.nombre} ${propietario.apellido}`}
        subtitulo={`Registrado el ${fecha(propietario.fecha_registro)}`}
        acciones={
          <button type="button" className="boton boton-contorno" onClick={() => setEditando(true)}>
            Editar datos
          </button>
        }
      />

      {aviso && (
        <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      <section className="caja bloque">
        <div className="caja-cuerpo">
          <dl className="datos-lista">
            <div>
              <dt>Teléfono</dt>
              <dd>{propietario.telefono}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{propietario.correo ?? '—'}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{propietario.direccion ?? '—'}</dd>
            </div>
            <div>
              <dt>Perros activos</dt>
              <dd>{propietario.mascotas.filter((m) => m.activo).length}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="caja bloque">
        <div className="caja-encabezado">
          <h2>Perros</h2>
          <button
            type="button"
            className="boton boton-verde boton-chico"
            onClick={() => setMascotaForm({ abierto: true, mascota: null })}
          >
            Agregar perro
          </button>
        </div>
        {propietario.mascotas.length === 0 ? (
          <Vacio titulo="Sin perros registrados" texto="Agrega la ficha del primer perro de este dueño." />
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Perro</th>
                  <th>Sexo</th>
                  <th>Edad</th>
                  <th className="numero">Peso</th>
                  <th>Observaciones</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {propietario.mascotas.map((m) => (
                  <tr key={m.id_mascota}>
                    <td>
                      <div className="celda-principal">
                        <strong>{m.nombre}</strong>
                        <span>{m.raza ?? 'Raza sin indicar'}</span>
                      </div>
                    </td>
                    <td>{m.sexo === 'MACHO' ? 'Macho' : m.sexo === 'HEMBRA' ? 'Hembra' : '—'}</td>
                    <td>{edad(m.fecha_nacimiento)}</td>
                    <td className="numero">{m.peso_kg != null ? `${m.peso_kg} kg` : '—'}</td>
                    <td className="celda-observaciones">{m.observaciones ?? '—'}</td>
                    <td>
                      <Estado valor={m.activo ? 'ACTIVO' : 'INACTIVO'} />
                    </td>
                    <td>
                      <div className="acciones-fila">
                        {m.activo && (
                          <Link
                            to={`/panel/reservaciones/nueva?mascota=${m.id_mascota}`}
                            className="boton boton-verde boton-chico"
                          >
                            Reservar
                          </Link>
                        )}
                        <button
                          type="button"
                          className="boton boton-gris boton-chico"
                          onClick={() => setMascotaForm({ abierto: true, mascota: m })}
                        >
                          Editar
                        </button>
                        {m.activo ? (
                          <button
                            type="button"
                            className="boton boton-suave-peligro boton-chico"
                            onClick={() => setABaja(m)}
                          >
                            Dar de baja
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="boton boton-gris boton-chico"
                            onClick={() => reactivar(m).catch((e) => setAviso({ tipo: 'error', texto: mensajeError(e) }))}
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="caja bloque">
        <div className="caja-encabezado">
          <h2>Reservaciones</h2>
        </div>
        {reservas.length === 0 ? (
          <Vacio titulo="Sin reservaciones" texto="Las reservas de los perros de este dueño aparecerán aquí." />
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Perro</th>
                  <th>Servicio</th>
                  <th>Fechas</th>
                  <th className="numero">Total</th>
                  <th className="numero">Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((r) => (
                  <tr
                    key={r.id_reservacion}
                    className="fila-clic"
                    onClick={() => navegar(`/panel/reservaciones/${r.id_reservacion}`)}
                  >
                    <td>{r.id_reservacion}</td>
                    <td>{r.mascota}</td>
                    <td>{r.servicio}</td>
                    <td>
                      {fecha(r.fecha_inicio)} → {fecha(r.fecha_fin)}
                    </td>
                    <td className="numero">{moneda(r.monto_total)}</td>
                    <td className={`numero ${r.saldo > 0 && r.estado !== 'CANCELADA' ? 'texto-negativo' : 'texto-cero'}`}>
                      {moneda(r.saldo)}
                    </td>
                    <td>
                      <Estado valor={r.estado} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <FormPropietario
        abierto={editando}
        inicial={propietario}
        onCerrar={() => setEditando(false)}
        onGuardado={() => {
          setEditando(false)
          exito('Datos del dueño actualizados.')
          recargar()
        }}
      />

      <FormMascota
        abierto={mascotaForm.abierto}
        idPropietario={propietario.id_propietario}
        inicial={mascotaForm.mascota}
        onCerrar={() => setMascotaForm({ abierto: false, mascota: null })}
        onGuardado={() => {
          exito(mascotaForm.mascota ? 'Ficha del perro actualizada.' : 'Perro registrado.')
          setMascotaForm({ abierto: false, mascota: null })
          recargar()
        }}
      />

      <Confirmar
        abierto={aBaja !== null}
        titulo="Dar de baja"
        mensaje={
          <>
            <strong>{aBaja?.nombre}</strong> quedará inactivo y no se podrá reservar para él. Su
            historial se conserva y se puede reactivar después.
          </>
        }
        textoConfirmar="Dar de baja"
        peligro
        onCerrar={() => setABaja(null)}
        onConfirmar={async () => {
          await api(`/mascotas/${aBaja!.id_mascota}`, { method: 'DELETE' })
          exito(`${aBaja!.nombre} fue dado de baja.`)
          recargar()
        }}
      />
    </div>
  )
}
