import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, query } from '../../api/client'
import type { AsistenciaFila, EstadoAsistencia } from '../../api/tipos'
import { IconoFlecha } from '../../components/Iconos'
import { fecha, fechaCorta, hora, hoy, sumarDias } from '../../utils/formato'
import { Aviso, Avatar, Cargando, Confirmar, Encabezado, Estado, Vacio } from '../ui'
import { useCarga } from '../useCarga'
import './Daycare.css'

type Accion = { tipo: 'entrada' | 'salida' | 'ausente'; fila: AsistenciaFila }

const RESUMEN: { estado: EstadoAsistencia; titulo: string }[] = [
  { estado: 'PROGRAMADO', titulo: 'Programados' },
  { estado: 'PRESENTE', titulo: 'Presentes' },
  { estado: 'FINALIZADO', titulo: 'Finalizados' },
  { estado: 'AUSENTE', titulo: 'Ausentes' },
]

const TEXTOS = {
  entrada: ['Registrar entrada', 'Se registrará la llegada de {p} al daycare ahora.'],
  salida: ['Registrar salida', 'Se registrará la salida de {p} del daycare ahora.'],
  ausente: ['Marcar ausencia', '{p} quedará como ausente este día. El monto de la reserva no cambia.'],
} as const

export default function Daycare() {
  const diaHoy = hoy()
  const [dia, setDia] = useState(diaHoy)
  const [accion, setAccion] = useState<Accion | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Daycare · HACHI'
  }, [])

  const { datos, error, cargando, recargar } = useCarga(
    () => api<AsistenciaFila[]>(`/daycare/asistencias${query({ fecha: dia })}`),
    [dia],
  )

  const cuenta = (estado: EstadoAsistencia) => (datos ?? []).filter((a) => a.estado === estado).length
  const activa = (a: AsistenciaFila) => !['CANCELADA', 'FINALIZADA'].includes(a.estado_reservacion)

  const ejecutar = async () => {
    if (!accion) return
    await api(`/daycare/asistencias/${accion.fila.id_asistencia}/${accion.tipo}`, { method: 'POST', body: {} })
    const textos = { entrada: 'Entrada', salida: 'Salida', ausente: 'Ausencia' }
    setAviso(`${textos[accion.tipo]} de ${accion.fila.mascota} registrada.`)
    recargar()
  }

  const [tituloAccion, mensajeAccion] = accion ? TEXTOS[accion.tipo] : ['', '']

  return (
    <div className="pagina">
      <Encabezado
        titulo="Daycare"
        subtitulo="Cada reserva de daycare crea una asistencia por día. Marca la entrada cuando llegue el perro, la salida cuando se vaya, o «Ausente» si no vino."
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

      <div className="selector-dia">
        <button type="button" className="boton boton-contorno boton-chico" onClick={() => setDia(sumarDias(dia, -1))} aria-label="Día anterior">
          <IconoFlecha width={16} height={16} className="flecha-atras" />
        </button>
        <div className="selector-dia-texto">
          <strong>{fechaCorta(dia)}</strong>
          <span>{dia === diaHoy ? 'Hoy' : fecha(dia)}</span>
        </div>
        <button type="button" className="boton boton-contorno boton-chico" onClick={() => setDia(sumarDias(dia, 1))} aria-label="Día siguiente">
          <IconoFlecha width={16} height={16} />
        </button>
        <input type="date" className="selector-dia-fecha" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} aria-label="Elegir día" />
        {dia !== diaHoy && (
          <button type="button" className="boton boton-gris boton-chico" onClick={() => setDia(diaHoy)}>
            Volver a hoy
          </button>
        )}
      </div>

      <div className="resumen-dia">
        {RESUMEN.map((r) => (
          <div key={r.estado} className="resumen-dia-item">
            <span>{r.titulo}</span>
            <strong>{datos ? cuenta(r.estado) : '—'}</strong>
          </div>
        ))}
      </div>

      <div className="caja">
        {error && (
          <div className="caja-cuerpo">
            <Aviso>{error}</Aviso>
          </div>
        )}
        {cargando && !datos && <Cargando />}
        {datos && datos.length === 0 && (
          <Vacio titulo="Sin asistencias este día" texto="Las reservas de daycare crean una asistencia por cada día reservado." />
        )}
        {datos && datos.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Perro y dueño</th>
                  <th>Teléfono</th>
                  <th>Horario</th>
                  <th>Estado</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {datos.map((a) => (
                  <tr key={a.id_asistencia}>
                    <td>
                      <div className="celda-avatar">
                        <Avatar nombre={a.mascota} chico />
                        <div className="celda-principal">
                          <strong>
                            <Link to={`/panel/reservaciones/${a.id_reservacion}`}>{a.mascota}</Link>
                          </strong>
                          <span>{a.propietario}</span>
                        </div>
                      </div>
                    </td>
                    <td>{a.telefono_propietario}</td>
                    <td>
                      {a.hora_programada_entrada} – {a.hora_programada_salida}
                    </td>
                    <td>
                      <Estado valor={a.estado} />
                    </td>
                    <td>{hora(a.hora_entrada)}</td>
                    <td>{hora(a.hora_salida)}</td>
                    <td>
                      {activa(a) && (
                        <div className="acciones-fila">
                          {a.estado === 'PROGRAMADO' && dia === diaHoy && (
                            <button type="button" className="boton boton-verde boton-chico" onClick={() => setAccion({ tipo: 'entrada', fila: a })}>
                              Entrada
                            </button>
                          )}
                          {a.estado === 'PRESENTE' && (
                            <button type="button" className="boton boton-negro boton-chico" onClick={() => setAccion({ tipo: 'salida', fila: a })}>
                              Salida
                            </button>
                          )}
                          {a.estado === 'PROGRAMADO' && dia <= diaHoy && (
                            <button type="button" className="boton boton-gris boton-chico" onClick={() => setAccion({ tipo: 'ausente', fila: a })}>
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
        )}
      </div>
      {dia > diaHoy && datos && datos.length > 0 && (
        <p className="texto-suave texto-chico nota-dia">La entrada se registra el mismo día de la asistencia.</p>
      )}

      <Confirmar
        abierto={accion !== null}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        titulo={tituloAccion}
        textoConfirmar={tituloAccion}
        mensaje={mensajeAccion.replace('{p}', accion?.fila.mascota ?? '')}
      />
    </div>
  )
}
