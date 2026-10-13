import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import type { Reservacion, ReservacionDetalle } from '../api/tipos'
import { IconoActualizar, IconoAlerta, IconoEntrar, IconoHuella, IconoInfo, IconoSalir } from '../components/Iconos'
import { fecha, fechaCorta, hoy, moneda, sumarDias, unidadTexto } from '../utils/formato'
import { cargarResumenHoy, type Llegada, type Movimiento } from './resumenHoy'
import { Aviso, Avatar, Confirmar } from './ui'
import ModalRechazo from './reservaciones/ModalRechazo'
import { useCarga } from './useCarga'
import './Hoy.css'

const fechaLarga = new Intl.DateTimeFormat('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
const horaCorta = new Intl.DateTimeFormat('es-GT', { hour: '2-digit', minute: '2-digit' })

// Cada cuanto se vuelve a consultar el dia (las entradas y salidas cambian durante la jornada)
const REFRESCO_MS = 60_000

// Accion que se confirma en la ventana: registrar entrada/salida o confirmar una reserva
type Accion = { tipo: 'movimiento'; m: Movimiento } | { tipo: 'confirmar'; r: Reservacion }

export default function Hoy() {
  const [hoyTexto] = useState(() => {
    const t = fechaLarga.format(new Date())
    return t.charAt(0).toUpperCase() + t.slice(1)
  })
  const { datos: carga, error, cargando, recargar } = useCarga(
    async () => ({ resumen: await cargarResumenHoy(), hora: new Date() }),
    [],
  )
  const [accion, setAccion] = useState<Accion | null>(null)
  const [rechazo, setRechazo] = useState<Reservacion | null>(null)
  const [aviso, setAviso] = useState<{ tipo: 'ok' | 'alerta'; texto: string; id?: number } | null>(null)

  useEffect(() => {
    document.title = 'Hoy · HACHI'
    const t = setInterval(recargar, REFRESCO_MS)
    return () => clearInterval(t)
  }, [recargar])

  const datos = carga?.resumen

  const ejecutar = async () => {
    if (!accion) return
    if (accion.tipo === 'confirmar') {
      await api(`/reservaciones/${accion.r.id_reservacion}/estado`, { method: 'PATCH', body: { estado: 'CONFIRMADA' } })
      setAviso({
        tipo: 'ok',
        texto:
          accion.r.origen === 'CLIENTE'
            ? `Solicitud de ${accion.r.mascota} aceptada; el cliente ya la ve confirmada.`
            : `Reserva de ${accion.r.mascota} confirmada.`,
      })
      recargar()
      return
    }
    const m = accion.m
    if (!m.accion) return
    const respuesta = await api<ReservacionDetalle | null>(m.accion.ruta, { method: 'POST', body: {} })
    const cobro = respuesta?.cobro_salida
    if (cobro && cobro.saldo > 0) {
      setAviso({
        tipo: 'alerta',
        texto: `Salida de ${m.mascota} registrada. Falta cobrar ${moneda(cobro.saldo)}${cobro.noches_extra > 0 ? ` (incluye ${cobro.noches_extra} noche(s) extra)` : ''}.`,
        id: m.id_reservacion,
      })
    } else {
      setAviso({ tipo: 'ok', texto: `${m.accion.tipo === 'entrada' ? 'Entrada' : 'Salida'} de ${m.mascota} registrada.` })
    }
    recargar()
  }

  const entradasPendientes = datos?.entradas.filter((m) => m.accion).length ?? 0
  const salidasPendientes = datos?.salidas.filter((m) => m.accion).length ?? 0
  const ocupacion = datos?.capacidadHotel ? Math.round((datos.enHotel / datos.capacidadHotel) * 100) : null

  return (
    <div className="pagina hoy">
      <header className="hoy-encabezado">
        <div>
          <h1>Hoy</h1>
          <p className="pagina-subtitulo">{hoyTexto}</p>
        </div>
        <button type="button" className="hoy-actualizar" onClick={recargar} disabled={cargando && !carga} title="Volver a cargar los datos del día">
          <IconoActualizar width={14} height={14} />
          {carga ? `Actualizado a las ${horaCorta.format(carga.hora)}` : 'Actualizando…'}
        </button>
      </header>

      {aviso && (
        <Aviso tipo={aviso.tipo} onCerrar={() => setAviso(null)}>
          {aviso.texto} {aviso.id && <Link to={`/panel/reservaciones/${aviso.id}`}>Registrar el pago</Link>}
        </Aviso>
      )}
      {error && <Aviso>{error}</Aviso>}

      {!datos ? (
        <Esqueleto />
      ) : (
        <>
          <div className="indicadores">
            <Indicador
              tono="verde"
              icono={<IconoHuella width={20} height={20} />}
              titulo="Perros en casa"
              valor={datos.perrosEnCasa}
              detalle={`${datos.enHotel} en hotel · ${datos.enDaycare} en daycare`}
              ayuda="Perros que están ahora mismo en el hotel o en el daycare."
              a="/panel/hospedaje"
            />
            <Indicador
              tono="ambar"
              icono={<IconoEntrar width={20} height={20} />}
              titulo="Entradas por registrar"
              valor={entradasPendientes}
              detalle={`${datos.entradas.length - entradasPendientes} ya registradas hoy`}
              ayuda="Perros que llegan hoy y todavía no se marcó su llegada."
            />
            <Indicador
              tono="azul"
              icono={<IconoSalir width={20} height={20} />}
              titulo="Salidas por registrar"
              valor={salidasPendientes}
              detalle={`${datos.salidas.length - salidasPendientes} ya registradas hoy`}
              ayuda="Perros que se van hoy y todavía no se marcó su salida."
            />
            <Link
              to="/panel/hospedaje"
              className="indicador indicador-enlace indicador-ocupacion"
              title="Porcentaje de cupos del hotel ocupados en este momento."
            >
              <div>
                <span className="indicador-titulo">Ocupación del hotel</span>
                <strong>{ocupacion !== null ? `${ocupacion}%` : '—'}</strong>
                <small>
                  {datos.capacidadHotel !== null
                    ? `${datos.enHotel} de ${datos.capacidadHotel} cupos`
                    : 'Sin capacidad configurada'}
                </small>
              </div>
              <Anillo porcentaje={ocupacion ?? 0} />
            </Link>
          </div>

          <div className="hoy-grid">
            <Agenda
              area="entradas"
              titulo="Entradas de hoy"
              ayuda="Perros que llegan hoy. Cuando llegue, pulsa «Registrar entrada»."
              pendientes={entradasPendientes}
              movimientos={datos.entradas}
              vacio="No hay llegadas programadas para hoy."
              onAccion={(m) => setAccion({ tipo: 'movimiento', m })}
            />
            <Agenda
              area="salidas"
              titulo="Salidas de hoy"
              ayuda="Perros que se van hoy. Al registrar la salida del hotel se calcula el cobro final."
              pendientes={salidasPendientes}
              movimientos={datos.salidas}
              vacio="No hay salidas programadas para hoy."
              onAccion={(m) => setAccion({ tipo: 'movimiento', m })}
            />

            <div className="hoy-lateral">
              <PorConfirmar
                reservas={datos.porConfirmar}
                onConfirmar={(r) => setAccion({ tipo: 'confirmar', r })}
                onRechazar={setRechazo}
              />

              <section className="caja">
                <div className="caja-encabezado caja-encabezado-ayuda">
                  <div>
                    <h2>Alertas</h2>
                    <p className="caja-ayuda">Retrasos, reservas sin confirmar y cuidados especiales.</p>
                  </div>
                  {datos.alertas.length > 0 && <span className="contador">{datos.alertas.length}</span>}
                </div>
                <div className="caja-cuerpo">
                  {datos.alertas.length === 0 ? (
                    <p className="texto-suave texto-chico sin-margen">Sin alertas por ahora.</p>
                  ) : (
                    <ul className="alertas">
                      {datos.alertas.map((a, i) => (
                        <li key={i} className={`alerta alerta-${a.tipo}`}>
                          {a.tipo === 'alerta' ? <IconoAlerta width={16} height={16} /> : <IconoInfo width={16} height={16} />}
                          <span>
                            <Link to={`/panel/reservaciones/${a.id_reservacion}`}>{a.mascota}</Link>: {a.texto}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>

              <Proximas llegadas={datos.proximas} />
            </div>
          </div>
        </>
      )}

      <Confirmar
        abierto={accion !== null}
        onCerrar={() => setAccion(null)}
        onConfirmar={ejecutar}
        {...textosConfirmacion(accion)}
      />

      <ModalRechazo
        reserva={rechazo}
        onCerrar={() => setRechazo(null)}
        onRechazada={(d) => {
          setAviso({ tipo: 'ok', texto: `Solicitud de ${d.mascota} rechazada; el cliente verá el motivo.` })
          recargar()
        }}
      />
    </div>
  )
}

function textosConfirmacion(accion: Accion | null) {
  if (!accion) return { titulo: '', mensaje: '' }
  if (accion.tipo === 'confirmar') {
    const r = accion.r
    return {
      titulo: r.origen === 'CLIENTE' ? 'Aceptar solicitud' : 'Confirmar reserva',
      textoConfirmar: r.origen === 'CLIENTE' ? 'Aceptar solicitud' : 'Confirmar reserva',
      mensaje: `${r.mascota} (${r.propietario}) · ${r.servicio}, del ${fecha(r.fecha_inicio)} al ${fecha(r.fecha_fin)}. ${r.origen === 'CLIENTE' ? 'El cliente verá la reserva como confirmada en su portal.' : ''}`,
    }
  }
  const m = accion.m
  const entrada = m.accion?.tipo === 'entrada'
  return {
    titulo: entrada ? 'Registrar entrada' : 'Registrar salida',
    textoConfirmar: entrada ? 'Registrar entrada' : 'Registrar salida',
    mensaje: entrada
      ? `Se registrará que ${m.mascota} llegó (${m.servicio.toLowerCase()}) ahora.`
      : `Se registrará que ${m.mascota} se fue (${m.servicio.toLowerCase()}) ahora${m.servicio === 'Hotel' ? ' y se calculará el cobro final' : ''}.`,
  }
}

function Indicador({
  tono,
  icono,
  titulo,
  valor,
  detalle,
  ayuda,
  a,
}: {
  tono: 'verde' | 'ambar' | 'azul'
  icono: ReactNode
  titulo: string
  valor: ReactNode
  detalle: string
  ayuda: string
  a?: string
}) {
  const contenido = (
    <>
      <span className={`indicador-icono indicador-${tono}`}>{icono}</span>
      <div>
        <span className="indicador-titulo">{titulo}</span>
        <strong>{valor}</strong>
        <small>{detalle}</small>
      </div>
    </>
  )
  return a ? (
    <Link to={a} className="indicador indicador-enlace" title={ayuda}>
      {contenido}
    </Link>
  ) : (
    <div className="indicador" title={ayuda}>
      {contenido}
    </div>
  )
}

// Anillo de porcentaje (SVG)
function Anillo({ porcentaje }: { porcentaje: number }) {
  const r = 26
  const circunferencia = 2 * Math.PI * r
  const valor = Math.min(Math.max(porcentaje, 0), 100)
  return (
    <svg className={`anillo ${valor >= 90 ? 'anillo-lleno' : ''}`} width="68" height="68" viewBox="0 0 68 68" aria-hidden="true">
      <circle cx="34" cy="34" r={r} className="anillo-fondo" />
      <circle
        cx="34"
        cy="34"
        r={r}
        className="anillo-valor"
        strokeDasharray={circunferencia}
        strokeDashoffset={circunferencia * (1 - valor / 100)}
      />
    </svg>
  )
}

function Agenda({
  area,
  titulo,
  ayuda,
  pendientes,
  movimientos,
  vacio,
  onAccion,
}: {
  area: string
  titulo: string
  ayuda: string
  pendientes: number
  movimientos: Movimiento[]
  vacio: string
  onAccion: (m: Movimiento) => void
}) {
  // Lo ya registrado se agrupa detras de un boton para que lo pendiente quede a la vista
  const [verHechos, setVerHechos] = useState(false)
  const porHacer = movimientos.filter((m) => m.accion)
  const hechos = movimientos.filter((m) => !m.accion)
  const visibles = verHechos ? [...porHacer, ...hechos] : porHacer

  return (
    <section className={`caja hoy-${area}`}>
      <div className="caja-encabezado caja-encabezado-ayuda">
        <div>
          <h2>{titulo}</h2>
          <p className="caja-ayuda">{ayuda}</p>
        </div>
        <span className={`estado-lista ${pendientes > 0 ? 'con-pendientes' : ''}`}>
          {pendientes > 0 ? `${pendientes} por registrar` : 'Todo al día'}
        </span>
      </div>
      {movimientos.length === 0 ? (
        <div className="lista-vacia">
          <IconoHuella width={28} height={28} />
          <p>{vacio}</p>
        </div>
      ) : (
        <>
          {porHacer.length === 0 && !verHechos && (
            <div className="lista-vacia lista-al-dia">
              <IconoHuella width={26} height={26} />
              <p>Todo registrado por ahora.</p>
            </div>
          )}
          {visibles.length > 0 && (
            <ul className="movimientos">
              {visibles.map((m) => (
                <li key={m.clave} className={m.accion ? 'pendiente' : 'hecho'}>
                  <span className="movimiento-hora" title={m.accion ? 'Hora prevista' : 'Hora registrada'}>
                    {m.hora || '—'}
                  </span>
                  <Avatar nombre={m.mascota} />
                  <div className="movimiento-texto">
                    <p>
                      <Link to={`/panel/reservaciones/${m.id_reservacion}`}>{m.mascota}</Link>
                      <span className={`chip-servicio chip-${m.servicio === 'Hotel' ? 'hotel' : 'daycare'}`}>{m.servicio}</span>
                    </p>
                    <span>
                      {m.raza ? `${m.raza} · ` : ''}
                      {m.propietario}
                      {m.saldo !== undefined && m.saldo > 0 && (
                        <>
                          {' '}
                          · <strong className="texto-negativo">Debe {moneda(m.saldo)}</strong>
                        </>
                      )}
                      {m.atrasado && (
                        <>
                          {' '}
                          · <strong className="texto-pendiente">Salida atrasada</strong>
                        </>
                      )}
                    </span>
                  </div>
                  {m.accion ? (
                    <button
                      type="button"
                      className={`boton boton-chico ${m.accion.tipo === 'entrada' ? 'boton-verde' : 'boton-contorno'}`}
                      onClick={() => onAccion(m)}
                    >
                      Registrar {m.accion.tipo}
                    </button>
                  ) : m.etiqueta === 'Solicitud por aceptar' ? (
                    <Link to={`/panel/reservaciones/${m.id_reservacion}`} className="insignia-estado insignia-ambar">
                      {m.etiqueta}
                    </Link>
                  ) : (
                    <span className={`insignia-estado ${m.etiqueta === 'En casa' ? 'insignia-verde' : 'insignia-gris'}`}>{m.etiqueta}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          {hechos.length > 0 && (
            <button type="button" className="ver-hechos" onClick={() => setVerHechos((v) => !v)} aria-expanded={verHechos}>
              {verHechos
                ? 'Ocultar las ya registradas'
                : `Ver ${hechos.length} ${hechos.length === 1 ? 'ya registrada' : 'ya registradas'}`}
            </button>
          )}
        </>
      )}
    </section>
  )
}

function PorConfirmar({
  reservas,
  onConfirmar,
  onRechazar,
}: {
  reservas: Reservacion[]
  onConfirmar: (r: Reservacion) => void
  onRechazar: (r: Reservacion) => void
}) {
  return (
    <section className="caja">
      <div className="caja-encabezado caja-encabezado-ayuda">
        <div>
          <h2>Por confirmar</h2>
          <p className="caja-ayuda">Reservas que esperan tu confirmación, incluidas las que piden los clientes desde el portal.</p>
        </div>
        {reservas.length > 0 && <span className="estado-lista con-pendientes">{reservas.length}</span>}
      </div>
      {reservas.length === 0 ? (
        <p className="texto-suave texto-chico lista-vacia-simple">No hay reservas pendientes de confirmar.</p>
      ) : (
        <ul className="confirmar-lista">
          {reservas.slice(0, 6).map((r) => (
            <li key={r.id_reservacion}>
              <Avatar nombre={r.mascota} chico />
              <Link to={`/panel/reservaciones/${r.id_reservacion}`} className="confirmar-texto">
                <strong>
                  {r.mascota}
                  {r.origen === 'CLIENTE' && <span className="chip-origen">Portal</span>}
                </strong>
                <span>
                  {r.servicio} · {fechaCorta(r.fecha_inicio)} · {r.unidades} {unidadTexto(r.unidad, r.unidades)}
                </span>
              </Link>
              {r.origen === 'CLIENTE' ? (
                <div className="acciones-fila">
                  <button type="button" className="boton boton-verde boton-chico" onClick={() => onConfirmar(r)}>
                    Aceptar
                  </button>
                  <button type="button" className="boton boton-suave-peligro boton-chico" onClick={() => onRechazar(r)}>
                    Rechazar
                  </button>
                </div>
              ) : (
                <button type="button" className="boton boton-verde boton-chico" onClick={() => onConfirmar(r)}>
                  Confirmar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {reservas.length > 6 && (
        <Link to="/panel/reservaciones" className="ver-hechos ver-todas">
          Ver las {reservas.length} pendientes
        </Link>
      )}
    </section>
  )
}

function Proximas({ llegadas }: { llegadas: Llegada[] }) {
  const manana = sumarDias(hoy(), 1)
  // Agrupar por dia
  const dias = new Map<string, Llegada[]>()
  for (const l of llegadas) dias.set(l.dia, [...(dias.get(l.dia) ?? []), l])

  return (
    <section className="caja">
      <div className="caja-encabezado caja-encabezado-ayuda">
        <div>
          <h2>Próximas llegadas al hotel</h2>
          <p className="caja-ayuda">Los perros que llegan en los próximos 7 días, para preparar los espacios.</p>
        </div>
      </div>
      {llegadas.length === 0 ? (
        <p className="texto-suave texto-chico lista-vacia-simple">Sin llegadas en los próximos 7 días.</p>
      ) : (
        <div className="proximas">
          {[...dias.entries()].map(([dia, items]) => (
            <div key={dia} className="proximas-dia">
              <p className="proximas-fecha">{dia === manana ? 'Mañana' : fechaCorta(dia)}</p>
              <ul>
                {items.map((l) => (
                  <li key={l.id_reservacion}>
                    <Avatar nombre={l.mascota} chico />
                    <Link to={`/panel/reservaciones/${l.id_reservacion}`} className="proximas-texto">
                      <strong>{l.mascota}</strong>
                      <span>
                        {l.propietario} · {l.hora}
                      </span>
                    </Link>
                    {!l.confirmada && <span className="insignia-estado insignia-ambar">Sin confirmar</span>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// Siluetas mientras carga por primera vez
function Esqueleto() {
  return (
    <div aria-hidden="true">
      <div className="indicadores">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="indicador esqueleto-caja">
            <span className="esqueleto esqueleto-avatar" />
            <div style={{ flex: 1 }}>
              <span className="esqueleto esqueleto-linea" />
              <span className="esqueleto esqueleto-numero" />
            </div>
          </div>
        ))}
      </div>
      <div className="hoy-grid">
        {['entradas', 'salidas', 'lateral'].map((a) => (
          <div key={a} className={`caja esqueleto-caja hoy-${a}`}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto-fila">
                <span className="esqueleto esqueleto-avatar" />
                <span className="esqueleto esqueleto-linea" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
