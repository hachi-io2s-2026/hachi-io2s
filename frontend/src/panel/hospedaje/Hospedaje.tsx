import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../../api/client'
import { esSolicitudSinResponder, type CobroSalida, type EstadoHospedaje, type HospedajeFila, type ReservacionDetalle } from '../../api/tipos'
import { diferenciaDias, fecha, fechaHora, hoy, moneda, unidadTexto } from '../../utils/formato'
import { Aviso, Avatar, Cargando, Confirmar, Encabezado, Paginacion, Vacio } from '../ui'
import { useCarga } from '../useCarga'
import { usePaginacion } from '../usePaginacion'

const PESTANAS: { estado: EstadoHospedaje; titulo: string; vacio: string }[] = [
  { estado: 'PENDIENTE', titulo: 'Por llegar', vacio: 'No hay perros pendientes de ingresar.' },
  { estado: 'HOSPEDADO', titulo: 'Hospedados', vacio: 'No hay perros hospedados en este momento.' },
  { estado: 'FINALIZADO', titulo: 'Finalizados', vacio: 'Todavía no hay hospedajes finalizados.' },
]

type Accion = { tipo: 'entrada' | 'salida'; fila: HospedajeFila }

export default function Hospedaje() {
  const [pestana, setPestana] = useState<EstadoHospedaje>('PENDIENTE')
  const [accion, setAccion] = useState<Accion | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [cobro, setCobro] = useState<{ fila: HospedajeFila; cobro: CobroSalida } | null>(null)
  const diaHoy = hoy()

  useEffect(() => {
    document.title = 'Hospedaje · HACHI'
  }, [])

  // Se cargan todos los hospedajes (sin cancelados) y se reparten por estado
  const { datos, error, cargando, recargar } = useCarga(() => api<HospedajeFila[]>('/hospedajes'), [])

  const porEstado = (estado: EstadoHospedaje) => {
    const filas = (datos ?? []).filter((h) => h.estado === estado)
    // Finalizados: los mas recientes primero
    return estado === 'FINALIZADO' ? [...filas].reverse() : filas
  }
  const filas = porEstado(pestana)
  const pag = usePaginacion(filas, pestana)

  const sinResponder = (h: HospedajeFila) => esSolicitudSinResponder(h.estado_reservacion, h.origen_reservacion)
  const puedeEntrar = (h: HospedajeFila) =>
    ['PENDIENTE', 'CONFIRMADA'].includes(h.estado_reservacion) &&
    !sinResponder(h) &&
    diaHoy >= h.fecha_inicio.slice(0, 10) &&
    diaHoy < h.fecha_fin.slice(0, 10)

  const ejecutar = async () => {
    if (!accion) return
    const { tipo, fila } = accion
    const d = await api<ReservacionDetalle>(`/hospedajes/${fila.id_hospedaje}/${tipo}`, { method: 'POST', body: {} })
    if (tipo === 'salida' && d.cobro_salida) setCobro({ fila, cobro: d.cobro_salida })
    setAviso(tipo === 'entrada' ? `Entrada de ${fila.mascota} registrada.` : `Salida de ${fila.mascota} registrada.`)
    recargar()
  }

  return (
    <div className="pagina">
      <Encabezado
        titulo="Hospedaje"
        subtitulo="Registra cuándo llega cada perro al hotel (entrada) y cuándo se va (salida). Al registrar la salida se calcula el cobro final, incluidas las noches extra."
        acciones={
          <Link to="/panel/reservaciones/nueva" className="boton boton-verde">
            Nueva reservación
          </Link>
        }
      />

      {aviso && (
        <Aviso tipo="ok" onCerrar={() => setAviso(null)}>
          {aviso}
        </Aviso>
      )}

      {cobro && (
        <Aviso tipo={cobro.cobro.saldo > 0 ? 'alerta' : 'ok'} onCerrar={() => setCobro(null)}>
          <strong>Cobro de salida de {cobro.fila.mascota}:</strong>{' '}
          {cobro.cobro.noches_extra > 0
            ? `${cobro.cobro.noches_extra} ${unidadTexto('NOCHE', cobro.cobro.noches_extra)} extra (${moneda(cobro.cobro.cargo_extra)}). `
            : ''}
          Total {moneda(cobro.cobro.monto_total)}.{' '}
          {cobro.cobro.saldo > 0 ? (
            <>
              Falta cobrar <strong>{moneda(cobro.cobro.saldo)}</strong>.{' '}
              <Link to={`/panel/reservaciones/${cobro.fila.id_reservacion}`}>Ir a registrar el pago</Link>
            </>
          ) : (
            'La reservación está pagada.'
          )}
        </Aviso>
      )}

      <div className="caja">
        <div className="pestanas" role="tablist">
          {PESTANAS.map((p) => (
            <button
              key={p.estado}
              type="button"
              role="tab"
              aria-selected={pestana === p.estado}
              className={`pestana ${pestana === p.estado ? 'activa' : ''}`}
              onClick={() => setPestana(p.estado)}
            >
              {p.titulo}
              {datos && <span className="contador">{porEstado(p.estado).length}</span>}
            </button>
          ))}
        </div>

        {error && (
          <div className="caja-cuerpo">
            <Aviso>{error}</Aviso>
          </div>
        )}
        {cargando && !datos && <Cargando />}
        {datos && filas.length === 0 && <Vacio titulo={PESTANAS.find((p) => p.estado === pestana)!.vacio} />}
        {datos && filas.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Perro y dueño</th>
                  <th>Teléfono</th>
                  <th>Entrada{pestana === 'PENDIENTE' ? ' prevista' : ''}</th>
                  <th>Salida{pestana === 'FINALIZADO' ? '' : ' prevista'}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {pag.visibles.map((h) => {
                  const diaFin = h.fecha_fin.slice(0, 10)
                  const vencida = h.estado === 'HOSPEDADO' && diaHoy > diaFin
                  const llegaHoy = h.estado === 'PENDIENTE' && h.fecha_inicio.slice(0, 10) === diaHoy
                  return (
                    <tr key={h.id_hospedaje}>
                      <td>
                        <div className="celda-avatar">
                          <Avatar nombre={h.mascota} chico />
                          <div className="celda-principal">
                            <strong>
                              <Link to={`/panel/reservaciones/${h.id_reservacion}`}>{h.mascota}</Link>
                            </strong>
                            <span>{h.propietario}</span>
                          </div>
                        </div>
                      </td>
                      <td>{h.telefono_propietario}</td>
                      <td>
                        {h.estado === 'PENDIENTE' ? fechaHora(h.fecha_inicio) : fechaHora(h.fecha_entrada)}
                        {llegaHoy && <span className="etiqueta-hoy">Hoy</span>}
                      </td>
                      <td>
                        {h.estado === 'FINALIZADO' ? fechaHora(h.fecha_salida) : fechaHora(h.fecha_fin)}
                        {vencida && (
                          <span className="etiqueta-hoy" title="Se cobrarán noches extra">
                            {diferenciaDias(diaFin, diaHoy)} {unidadTexto('NOCHE', diferenciaDias(diaFin, diaHoy))} de retraso
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="acciones-fila">
                          {h.estado === 'PENDIENTE' &&
                            (puedeEntrar(h) ? (
                              <button
                                type="button"
                                className="boton boton-verde boton-chico"
                                onClick={() => setAccion({ tipo: 'entrada', fila: h })}
                              >
                                Registrar entrada
                              </button>
                            ) : (
                              <span className="texto-suave texto-chico">
                                {sinResponder(h) ? (
                                  <Link to={`/panel/reservaciones/${h.id_reservacion}`}>Solicitud por aceptar</Link>
                                ) : diaHoy < h.fecha_inicio.slice(0, 10) ? (
                                  `Llega el ${fecha(h.fecha_inicio)}`
                                ) : (
                                  'Fuera de fecha'
                                )}
                              </span>
                            ))}
                          {h.estado === 'HOSPEDADO' && (
                            <button
                              type="button"
                              className="boton boton-negro boton-chico"
                              onClick={() => setAccion({ tipo: 'salida', fila: h })}
                            >
                              Registrar salida
                            </button>
                          )}
                          {h.estado === 'FINALIZADO' && (
                            <Link to={`/panel/reservaciones/${h.id_reservacion}`} className="boton boton-gris boton-chico">
                              Ver reservación
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion {...pag} />
      </div>

      <Confirmar
        abierto={accion !== null}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        titulo={accion?.tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
        textoConfirmar={accion?.tipo === 'entrada' ? 'Registrar entrada' : 'Registrar salida'}
        mensaje={
          accion?.tipo === 'entrada'
            ? `Se registrará que ${accion.fila.mascota} ingresó al hotel ahora.`
            : `Se registrará la salida de ${accion?.fila.mascota} ahora y se calculará el cobro final.`
        }
      />
    </div>
  )
}
