import { useEffect, useState, type FormEvent } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { api, mensajeError } from '../../api/client'
import {
  esSolicitudSinResponder,
  estadoVisible,
  type Asistencia,
  type CobroSalida,
  type MetodoPago,
  type ReservacionDetalle as Detalle,
} from '../../api/tipos'
import { useSesion } from '../../auth/contexto'
import { diferenciaDias, fecha, fechaCorta, fechaHora, hora, hoy, moneda, unidadTexto } from '../../utils/formato'
import { Aviso, Campo, Cargando, Confirmar, Encabezado, Estado } from '../ui'
import { useCarga } from '../useCarga'
import ModalRechazo from './ModalRechazo'
import './Reservaciones.css'

type AccionPendiente =
  | { tipo: 'confirmar' }
  | { tipo: 'cancelar' }
  | { tipo: 'entrada' }
  | { tipo: 'salida' }
  | { tipo: 'anular'; idPago: number; monto: number }
  | { tipo: 'asistencia'; asistencia: Asistencia; accion: 'entrada' | 'salida' | 'ausente' }

const METODOS: [MetodoPago, string][] = [
  ['EFECTIVO', 'Efectivo'],
  ['TARJETA', 'Tarjeta'],
  ['TRANSFERENCIA', 'Transferencia'],
]

export default function ReservacionDetalle() {
  const { id } = useParams()
  const ubicacion = useLocation()
  const { usuario } = useSesion()
  const { datos: r, error, cargando, recargar, setDatos } = useCarga(
    () => api<Detalle>(`/reservaciones/${id}`),
    [id],
  )
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(
    () => {
      const texto = (ubicacion.state as { aviso?: string } | null)?.aviso
      return texto ? { tipo: 'ok', texto } : null
    },
  )
  const [accion, setAccion] = useState<AccionPendiente | null>(null)
  const [cobro, setCobro] = useState<CobroSalida | null>(null)
  const [rechazando, setRechazando] = useState(false)

  useEffect(() => {
    document.title = `Reservación #${id} · HACHI`
  }, [id])

  if (cargando && !r) return <Cargando />
  if (error && !r) {
    return (
      <div className="pagina">
        <Encabezado titulo={`Reservación #${id}`} volver={{ a: '/panel/reservaciones', texto: 'Reservaciones' }} />
        <Aviso>{error}</Aviso>
      </div>
    )
  }
  if (!r) return null

  const esHotel = r.tipo === 'HOSPEDAJE'
  const activa = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO'].includes(r.estado)
  // Solicitud del portal sin responder: solo se puede aceptar o rechazar
  const solicitud = esSolicitudSinResponder(r.estado, r.origen)
  const diaHoy = hoy()
  const h = r.hospedaje
  const puedeEntrar =
    esHotel &&
    !solicitud &&
    h?.estado === 'PENDIENTE' &&
    ['PENDIENTE', 'CONFIRMADA'].includes(r.estado) &&
    diaHoy >= r.fecha_inicio.slice(0, 10) &&
    diaHoy < r.fecha_fin.slice(0, 10)
  const salidaVencida = esHotel && h?.estado === 'HOSPEDADO' && diaHoy > r.fecha_fin.slice(0, 10)

  // Ejecuta la accion confirmada y actualiza la pantalla
  const ejecutar = async () => {
    if (!accion) return
    switch (accion.tipo) {
      case 'confirmar':
      case 'cancelar': {
        const estado = accion.tipo === 'confirmar' ? 'CONFIRMADA' : 'CANCELADA'
        setDatos(await api<Detalle>(`/reservaciones/${r.id_reservacion}/estado`, { method: 'PATCH', body: { estado } }))
        setAviso({
          tipo: 'ok',
          texto:
            accion.tipo === 'cancelar'
              ? 'Reservación cancelada; su cupo quedó libre.'
              : solicitud
                ? 'Solicitud aceptada. El cliente ya la ve como confirmada y puedes registrar entradas y pagos.'
                : 'Reservación confirmada.',
        })
        break
      }
      case 'entrada': {
        setDatos(await api<Detalle>(`/hospedajes/${h!.id_hospedaje}/entrada`, { method: 'POST', body: {} }))
        setAviso({ tipo: 'ok', texto: `Entrada de ${r.mascota} registrada.` })
        break
      }
      case 'salida': {
        const d = await api<Detalle>(`/hospedajes/${h!.id_hospedaje}/salida`, { method: 'POST', body: {} })
        setDatos(d)
        if (d.cobro_salida) setCobro(d.cobro_salida)
        setAviso({ tipo: 'ok', texto: `Salida de ${r.mascota} registrada.` })
        break
      }
      case 'anular': {
        setDatos(await api<Detalle>(`/pagos/${accion.idPago}/anular`, { method: 'POST' }))
        setAviso({ tipo: 'ok', texto: `Pago de ${moneda(accion.monto)} anulado.` })
        break
      }
      case 'asistencia': {
        await api(`/daycare/asistencias/${accion.asistencia.id_asistencia}/${accion.accion}`, { method: 'POST', body: {} })
        const textos = { entrada: 'Entrada registrada.', salida: 'Salida registrada.', ausente: 'Ausencia registrada.' }
        setAviso({ tipo: 'ok', texto: `${fechaCorta(accion.asistencia.fecha)}: ${textos[accion.accion]}` })
        recargar()
        break
      }
    }
  }

  return (
    <div className="pagina">
      <Encabezado
        volver={{ a: '/panel/reservaciones', texto: 'Reservaciones' }}
        titulo={
          <span className="titulo-con-estado">
            Reservación #{r.id_reservacion} <Estado valor={estadoVisible(r)} />
          </span>
        }
        subtitulo={`${r.servicio} · ${r.origen === 'CLIENTE' ? 'solicitada por el cliente desde el portal' : 'creada en recepción'} el ${fecha(r.fecha_creacion)}`}
        acciones={
          solicitud ? undefined : (
            <>
              {r.estado === 'PENDIENTE' && (
                <button type="button" className="boton boton-verde" onClick={() => setAccion({ tipo: 'confirmar' })}>
                  Confirmar
                </button>
              )}
              {['PENDIENTE', 'CONFIRMADA'].includes(r.estado) && (
                <button type="button" className="boton boton-suave-peligro" onClick={() => setAccion({ tipo: 'cancelar' })}>
                  Cancelar reservación
                </button>
              )}
            </>
          )
        }
      />

      {aviso && (
        <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
          {aviso.texto}
        </Aviso>
      )}

      {solicitud && (
        <section className="solicitud-pendiente" aria-label="Solicitud por responder">
          <div>
            <h2>Solicitud del cliente por responder</h2>
            <p>
              <strong>{r.propietario}</strong> pidió {r.servicio.toLowerCase()} para <strong>{r.mascota}</strong> del{' '}
              {fechaHora(r.fecha_inicio)} al {fechaHora(r.fecha_fin)} ({moneda(r.monto_total)}). Revisa los datos y decide si
              la aceptas. Mientras no la respondas no se pueden registrar entradas, asistencias ni pagos.
            </p>
          </div>
          <div className="solicitud-acciones">
            <button type="button" className="boton boton-verde" onClick={() => setAccion({ tipo: 'confirmar' })}>
              Aceptar solicitud
            </button>
            <button type="button" className="boton boton-suave-peligro" onClick={() => setRechazando(true)}>
              Rechazar
            </button>
          </div>
        </section>
      )}

      {r.motivo_rechazo && r.estado === 'CANCELADA' && (
        <Aviso tipo="alerta">
          <strong>Solicitud rechazada.</strong> Motivo que ve el cliente: «{r.motivo_rechazo}»
        </Aviso>
      )}

      {cobro && (
        <Aviso tipo={cobro.saldo > 0 ? 'alerta' : 'ok'} onCerrar={() => setCobro(null)}>
          <strong>Cobro de salida:</strong>{' '}
          {cobro.noches_extra > 0
            ? `${cobro.noches_extra} ${unidadTexto('NOCHE', cobro.noches_extra)} extra (${moneda(cobro.cargo_extra)}). `
            : 'Sin noches extra. '}
          Total {moneda(cobro.monto_total)}, pagado {moneda(cobro.total_pagado)}.{' '}
          {cobro.saldo > 0 ? `Falta cobrar ${moneda(cobro.saldo)}.` : 'La reservación está pagada.'}
        </Aviso>
      )}

      <div className="detalle-grid">
        <div className="detalle-principal">
          <section className="caja">
            <div className="caja-encabezado">
              <h2>Datos de la reservación</h2>
            </div>
            <div className="caja-cuerpo">
              <dl className="datos-lista">
                <div>
                  <dt>Perro</dt>
                  <dd>
                    {r.mascota}
                    {r.raza && <span className="texto-suave"> · {r.raza}</span>}
                  </dd>
                </div>
                <div>
                  <dt>Dueño</dt>
                  <dd>
                    <Link to={`/panel/propietarios/${r.id_propietario}`}>{r.propietario}</Link>
                  </dd>
                </div>
                <div>
                  <dt>Teléfono</dt>
                  <dd>{r.telefono_propietario}</dd>
                </div>
                <div>
                  <dt>{esHotel ? 'Entrada prevista' : 'Primer día'}</dt>
                  <dd>{fechaHora(r.fecha_inicio)}</dd>
                </div>
                <div>
                  <dt>{esHotel ? 'Salida prevista' : 'Último día'}</dt>
                  <dd>{fechaHora(r.fecha_fin)}</dd>
                </div>
                <div>
                  <dt>Tarifa</dt>
                  <dd>
                    {moneda(r.precio_unitario)} / {unidadTexto(r.unidad)} · {r.unidades} {unidadTexto(r.unidad, r.unidades)}
                  </dd>
                </div>
              </dl>
              {r.observaciones && (
                <p className="detalle-observaciones">
                  <strong>Observaciones:</strong> {r.observaciones}
                </p>
              )}
            </div>
          </section>

          {esHotel && h && (
            <section className="caja">
              <div className="caja-encabezado">
                <h2>Hospedaje</h2>
                <Estado valor={h.estado} />
              </div>
              <div className="caja-cuerpo">
                <dl className="datos-lista">
                  <div>
                    <dt>Entrada registrada</dt>
                    <dd>{fechaHora(h.fecha_entrada)}</dd>
                  </div>
                  <div>
                    <dt>Salida registrada</dt>
                    <dd>{fechaHora(h.fecha_salida)}</dd>
                  </div>
                </dl>
                {salidaVencida && (
                  <Aviso tipo="alerta">
                    La salida estaba prevista para el {fecha(r.fecha_fin)}. Al registrarla se cobrarán{' '}
                    {diferenciaDias(r.fecha_fin.slice(0, 10), diaHoy)} {unidadTexto('NOCHE', diferenciaDias(r.fecha_fin.slice(0, 10), diaHoy))} extra.
                  </Aviso>
                )}
                {h.estado === 'PENDIENTE' && activa && !puedeEntrar && (
                  <p className="texto-suave texto-chico">
                    {solicitud
                      ? 'Acepta la solicitud para poder registrar la entrada.'
                      : `La entrada se puede registrar desde el ${fecha(r.fecha_inicio)} y antes del día de salida.`}
                  </p>
                )}
                <div className="acciones-bloque">
                  {puedeEntrar && (
                    <button type="button" className="boton boton-verde" onClick={() => setAccion({ tipo: 'entrada' })}>
                      Registrar entrada
                    </button>
                  )}
                  {h.estado === 'HOSPEDADO' && (
                    <button type="button" className="boton boton-negro" onClick={() => setAccion({ tipo: 'salida' })}>
                      Registrar salida
                    </button>
                  )}
                </div>
              </div>
            </section>
          )}

          {!esHotel && (
            <section className="caja">
              <div className="caja-encabezado">
                <h2>Asistencia</h2>
                <span className="texto-suave texto-chico">
                  {r.asistencias.filter((a) => a.estado === 'FINALIZADO').length} de {r.asistencias.length} días atendidos
                </span>
              </div>
              <div className="tabla-contenedor">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Día</th>
                      <th>Estado</th>
                      <th>Entrada</th>
                      <th>Salida</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {r.asistencias.map((a) => (
                      <tr key={a.id_asistencia}>
                        <td>
                          {fechaCorta(a.fecha)}
                          {a.fecha === diaHoy && <span className="etiqueta-hoy">Hoy</span>}
                        </td>
                        <td>
                          <Estado valor={a.estado} />
                        </td>
                        <td>{hora(a.hora_entrada)}</td>
                        <td>{hora(a.hora_salida)}</td>
                        <td>
                          {activa && !solicitud && (
                            <div className="acciones-fila">
                              {a.estado === 'PROGRAMADO' && a.fecha === diaHoy && (
                                <button
                                  type="button"
                                  className="boton boton-verde boton-chico"
                                  onClick={() => setAccion({ tipo: 'asistencia', asistencia: a, accion: 'entrada' })}
                                >
                                  Entrada
                                </button>
                              )}
                              {a.estado === 'PRESENTE' && (
                                <button
                                  type="button"
                                  className="boton boton-negro boton-chico"
                                  onClick={() => setAccion({ tipo: 'asistencia', asistencia: a, accion: 'salida' })}
                                >
                                  Salida
                                </button>
                              )}
                              {a.estado === 'PROGRAMADO' && a.fecha <= diaHoy && (
                                <button
                                  type="button"
                                  className="boton boton-gris boton-chico"
                                  onClick={() => setAccion({ tipo: 'asistencia', asistencia: a, accion: 'ausente' })}
                                >
                                  Ausente
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>

        <Pagos
          r={r}
          bloqueado={solicitud}
          esAdmin={usuario?.rol === 'ADMIN'}
          onPagado={(d, monto) => {
            setDatos(d)
            setAviso({ tipo: 'ok', texto: `Pago de ${moneda(monto)} registrado.` })
          }}
          onAnular={(idPago, monto) => setAccion({ tipo: 'anular', idPago, monto })}
        />
      </div>

      <Confirmar
        abierto={accion !== null}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        peligro={accion?.tipo === 'cancelar' || accion?.tipo === 'anular'}
        {...textosConfirmacion(accion, r, solicitud)}
      />

      <ModalRechazo
        reserva={rechazando ? r : null}
        onCerrar={() => setRechazando(false)}
        onRechazada={(d) => {
          setDatos(d)
          setAviso({ tipo: 'ok', texto: 'Solicitud rechazada. El cliente verá el motivo en su cuenta y el cupo quedó libre.' })
        }}
      />
    </div>
  )
}

function textosConfirmacion(accion: AccionPendiente | null, r: Detalle, solicitud: boolean) {
  switch (accion?.tipo) {
    case 'confirmar':
      return solicitud
        ? {
            titulo: 'Aceptar solicitud',
            mensaje: `Se aceptará la solicitud de ${r.mascota}. ${r.propietario} la verá como confirmada en su cuenta.`,
            textoConfirmar: 'Aceptar solicitud',
          }
        : { titulo: 'Confirmar reservación', mensaje: `Se confirmará la reservación de ${r.mascota}.`, textoConfirmar: 'Confirmar' }
    case 'cancelar':
      return {
        titulo: 'Cancelar reservación',
        mensaje: `La reservación de ${r.mascota} se cancelará y su cupo quedará libre. Esta acción no se puede deshacer.`,
        textoConfirmar: 'Cancelar reservación',
      }
    case 'entrada':
      return { titulo: 'Registrar entrada', mensaje: `Se registrará que ${r.mascota} ingresó al hotel ahora.`, textoConfirmar: 'Registrar entrada' }
    case 'salida':
      return {
        titulo: 'Registrar salida',
        mensaje: `Se registrará la salida de ${r.mascota} ahora y se calculará el cobro final.`,
        textoConfirmar: 'Registrar salida',
      }
    case 'anular':
      return {
        titulo: 'Anular pago',
        mensaje: `El pago de ${moneda(accion.monto)} quedará anulado y el saldo volverá a subir.`,
        textoConfirmar: 'Anular pago',
      }
    case 'asistencia': {
      const textos = {
        entrada: ['Registrar entrada', `Se registrará la llegada de ${r.mascota} al daycare ahora.`],
        salida: ['Registrar salida', `Se registrará la salida de ${r.mascota} del daycare ahora.`],
        ausente: ['Marcar ausencia', `${r.mascota} quedará como ausente el ${fechaCorta(accion.asistencia.fecha)}. El monto no cambia.`],
      }[accion.accion]
      return { titulo: textos[0], mensaje: textos[1], textoConfirmar: textos[0] }
    }
    default:
      return { titulo: '', mensaje: '' }
  }
}

function Pagos({
  r,
  bloqueado,
  esAdmin,
  onPagado,
  onAnular,
}: {
  r: Detalle
  // Solicitud del portal sin aceptar: todavia no se cobra
  bloqueado: boolean
  esAdmin: boolean
  onPagado: (d: Detalle, monto: number) => void
  onAnular: (idPago: number, monto: number) => void
}) {
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState<MetodoPago>('EFECTIVO')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const puedeCobrar = !bloqueado && r.estado !== 'CANCELADA' && r.saldo > 0

  const pagar = async (e: FormEvent) => {
    e.preventDefault()
    const valor = Number(monto || r.saldo)
    setEnviando(true)
    setError(null)
    try {
      const d = await api<Detalle>('/pagos', {
        method: 'POST',
        body: { id_reservacion: r.id_reservacion, monto: valor, metodo_pago: metodo },
      })
      setMonto('')
      onPagado(d, valor)
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <aside className="caja detalle-pagos">
      <div className="caja-encabezado">
        <h2>Pagos</h2>
      </div>
      <div className="caja-cuerpo">
        <dl className="resumen-lineas">
          <div>
            <dt>Total</dt>
            <dd>{moneda(r.monto_total)}</dd>
          </div>
          <div>
            <dt>Pagado</dt>
            <dd>{moneda(r.total_pagado)}</dd>
          </div>
        </dl>
        <div className={`resumen-total ${r.saldo > 0 && r.estado !== 'CANCELADA' ? 'pendiente' : ''}`}>
          <span>Saldo</span>
          <strong>{moneda(r.saldo)}</strong>
        </div>

        {bloqueado && (
          <p className="texto-suave texto-chico">Podrás registrar pagos cuando aceptes la solicitud.</p>
        )}

        {puedeCobrar && (
          <form className="form-pago" onSubmit={pagar}>
            <Campo etiqueta="Monto" ayuda={`Máximo ${moneda(r.saldo)}`}>
              <input
                type="number"
                min="0.01"
                max={r.saldo}
                step="0.01"
                placeholder={r.saldo.toFixed(2)}
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </Campo>
            <Campo etiqueta="Método">
              <select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoPago)}>
                {METODOS.map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </Campo>
            {error && <Aviso>{error}</Aviso>}
            <button type="submit" className="boton boton-verde" disabled={enviando}>
              {enviando ? 'Registrando…' : `Registrar pago${monto ? '' : ' del saldo'}`}
            </button>
          </form>
        )}

        {r.pagos.length > 0 && (
          <ul className="lista-pagos">
            {r.pagos.map((p) => (
              <li key={p.id_pago} className={p.estado === 'ANULADO' ? 'anulado' : ''}>
                <div className="celda-principal">
                  <strong>{moneda(p.monto)}</strong>
                  <span>
                    {METODOS.find(([v]) => v === p.metodo_pago)?.[1] ?? '—'} · {fechaHora(p.fecha_pago ?? p.fecha_creacion)}
                  </span>
                </div>
                {p.estado === 'ANULADO' ? (
                  <Estado valor="ANULADO" />
                ) : (
                  esAdmin && (
                    <button type="button" className="boton boton-gris boton-chico" onClick={() => onAnular(p.id_pago, p.monto)}>
                      Anular
                    </button>
                  )
                )}
              </li>
            ))}
          </ul>
        )}
        {r.pagos.length === 0 && <p className="texto-suave texto-chico">Todavía no hay pagos registrados.</p>}
      </div>
    </aside>
  )
}
