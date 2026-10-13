import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router'
import { api } from '../api/client'
import type { ReservacionDetalle } from '../api/tipos'
import { Aviso, Cargando, Confirmar, Encabezado, Estado } from '../panel/ui'
import { useCarga } from '../panel/useCarga'
import { fechaCorta, fechaHora, hora, moneda, unidadTexto } from '../utils/formato'
import { estadoCliente, explicacionEstado } from './estados'
import '../panel/reservaciones/Reservaciones.css'

const METODOS: Record<string, string> = { EFECTIVO: 'Efectivo', TARJETA: 'Tarjeta', TRANSFERENCIA: 'Transferencia' }

export default function ReservaClienteDetalle() {
  const { id } = useParams()
  const ubicacion = useLocation()
  const { datos: r, error, setDatos } = useCarga(() => api<ReservacionDetalle>(`/cliente/reservaciones/${id}`), [id])
  const [aviso, setAviso] = useState<string | null>(() => (ubicacion.state as { aviso?: string } | null)?.aviso ?? null)
  const [cancelando, setCancelando] = useState(false)

  useEffect(() => {
    document.title = 'Mi reserva · HACHI'
  }, [])

  if (error && !r) {
    return (
      <div className="pagina">
        <Encabezado titulo="Reserva" volver={{ a: '/mi-cuenta/reservas', texto: 'Mis reservas' }} />
        <Aviso>{error}</Aviso>
      </div>
    )
  }
  if (!r) return <Cargando />

  const esHotel = r.tipo === 'HOSPEDAJE'
  const pagos = r.pagos.filter((p) => p.estado === 'PAGADO')

  return (
    <div className="pagina portal-detalle">
      <Encabezado
        volver={{ a: '/mi-cuenta/reservas', texto: 'Mis reservas' }}
        titulo={
          <span className="titulo-con-estado">
            {r.mascota} · {r.servicio} <Estado valor={estadoCliente(r)} />
          </span>
        }
        subtitulo={`Reserva #${r.id_reservacion}`}
        acciones={
          r.estado === 'PENDIENTE' && (
            <button type="button" className="boton boton-suave-peligro" onClick={() => setCancelando(true)}>
              Cancelar solicitud
            </button>
          )
        }
      />

      {aviso && (
        <Aviso tipo="ok" onCerrar={() => setAviso(null)}>
          {aviso}
        </Aviso>
      )}

      <div className={`portal-estado portal-estado-${estadoCliente(r).toLowerCase()}`}>{explicacionEstado(r)}</div>

      <div className="portal-columnas">
        <section className="caja">
          <div className="caja-encabezado">
            <h2>Detalle de la estancia</h2>
          </div>
          <div className="caja-cuerpo">
            <dl className="datos-lista">
              <div>
                <dt>{esHotel ? 'Entrada' : 'Primer día'}</dt>
                <dd>{fechaHora(r.fecha_inicio)}</dd>
              </div>
              <div>
                <dt>{esHotel ? 'Salida' : 'Último día'}</dt>
                <dd>{fechaHora(r.fecha_fin)}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>
                  {r.unidades} {unidadTexto(r.unidad, r.unidades)}
                </dd>
              </div>
              <div>
                <dt>Tarifa</dt>
                <dd>
                  {moneda(r.precio_unitario)} / {unidadTexto(r.unidad)}
                </dd>
              </div>
            </dl>
            {r.observaciones && (
              <p className="detalle-observaciones">
                <strong>Tus indicaciones:</strong> {r.observaciones}
              </p>
            )}

            {esHotel && r.hospedaje && (r.hospedaje.fecha_entrada || r.hospedaje.fecha_salida) && (
              <dl className="datos-lista portal-registro">
                <div>
                  <dt>Llegó al hotel</dt>
                  <dd>{fechaHora(r.hospedaje.fecha_entrada)}</dd>
                </div>
                <div>
                  <dt>Salió del hotel</dt>
                  <dd>{fechaHora(r.hospedaje.fecha_salida)}</dd>
                </div>
              </dl>
            )}

            {!esHotel && r.asistencias.length > 0 && (
              <>
                <p className="portal-subtitulo">Días de daycare</p>
                <ul className="portal-dias">
                  {r.asistencias.map((a) => (
                    <li key={a.id_asistencia}>
                      <span>{fechaCorta(a.fecha)}</span>
                      <span className="texto-suave">
                        {a.hora_entrada ? `${hora(a.hora_entrada)}${a.hora_salida ? ` – ${hora(a.hora_salida)}` : ''}` : ''}
                      </span>
                      <Estado valor={a.estado} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </section>

        <aside className="caja">
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
              <strong>{moneda(r.estado === 'CANCELADA' ? 0 : r.saldo)}</strong>
            </div>
            {r.saldo > 0 && r.estado !== 'CANCELADA' && (
              <p className="texto-suave texto-chico">Puedes pagar en recepción con efectivo, tarjeta o transferencia.</p>
            )}
            {pagos.length > 0 && (
              <ul className="lista-pagos">
                {pagos.map((p) => (
                  <li key={p.id_pago}>
                    <div className="celda-principal">
                      <strong>{moneda(p.monto)}</strong>
                      <span>
                        {METODOS[p.metodo_pago ?? ''] ?? '—'} · {fechaHora(p.fecha_pago)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <Confirmar
        abierto={cancelando}
        titulo="Cancelar solicitud"
        mensaje={`La solicitud de ${r.mascota} se cancelará y su cupo quedará libre.`}
        textoConfirmar="Cancelar solicitud"
        peligro
        onCerrar={() => setCancelando(false)}
        onConfirmar={async () => {
          setDatos(await api<ReservacionDetalle>(`/cliente/reservaciones/${r.id_reservacion}/cancelar`, { method: 'POST' }))
          setAviso('Tu solicitud fue cancelada.')
        }}
      />
    </div>
  )
}
