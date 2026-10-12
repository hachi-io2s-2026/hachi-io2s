import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { api, mensajeError, query } from '../../api/client'
import type { Cotizacion, Mascota, ReservacionDetalle, Servicio, TipoServicio } from '../../api/tipos'
import { IconoLuna, IconoSol } from '../../components/Iconos'
import { fecha, fechaCorta, hoy, moneda, sumarDias, unidadTexto } from '../../utils/formato'
import { Aviso, Avatar, Campo, Cargando, Encabezado } from '../ui'
import { useCarga, useRetrasado } from '../useCarga'
import './Reservaciones.css'

// Horarios sugeridos al cambiar de servicio
const HORAS_SUGERIDAS: Record<TipoServicio, { entrada: string; salida: string }> = {
  HOSPEDAJE: { entrada: '14:00', salida: '12:00' },
  DAYCARE: { entrada: '08:00', salida: '17:00' },
}

// modo "personal": la usa recepcion desde el panel (busca cualquier perro).
// modo "cliente": la usa el dueno desde su portal (elige entre sus perros y envia una solicitud).
export default function NuevaReservacion({ modo = 'personal' }: { modo?: 'personal' | 'cliente' }) {
  const esCliente = modo === 'cliente'
  const base = esCliente ? '/cliente' : ''
  const navegar = useNavigate()
  const [params] = useSearchParams()
  const idMascotaInicial = params.get('mascota')

  const [elegida, setMascota] = useState<Mascota | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const q = useRetrasado(busqueda.trim())

  const [tipo, setTipo] = useState<TipoServicio>('HOSPEDAJE')
  const [diaInicio, setDiaInicio] = useState(hoy())
  const [diaFin, setDiaFin] = useState(sumarDias(hoy(), 1))
  const [horaInicio, setHoraInicio] = useState(HORAS_SUGERIDAS.HOSPEDAJE.entrada)
  const [horaFin, setHoraFin] = useState(HORAS_SUGERIDAS.HOSPEDAJE.salida)
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null)

  useEffect(() => {
    document.title = esCliente ? 'Solicitar estancia · HACHI' : 'Nueva reservación · HACHI'
  }, [esCliente])

  // Perro elegido desde la ficha del dueno (?mascota=ID)
  useEffect(() => {
    if (!idMascotaInicial || esCliente) return
    let vigente = true
    api<Mascota>(`/mascotas/${idMascotaInicial}`)
      .then((m) => vigente && m.activo && setMascota(m))
      .catch(() => undefined)
    return () => {
      vigente = false
    }
  }, [idMascotaInicial, esCliente])

  // Portal: perros activos del cliente
  const propios = useCarga(
    () =>
      esCliente
        ? api<{ mascotas: Mascota[] }>('/cliente/me').then((p) => p.mascotas.filter((m) => m.activo))
        : Promise.resolve([] as Mascota[]),
    [esCliente],
  )
  // Seleccion automatica en el portal: el perro de ?mascota=ID o el unico perro del cliente
  const automatica = esCliente
    ? (propios.datos?.find((m) => String(m.id_mascota) === idMascotaInicial) ??
      (propios.datos?.length === 1 ? propios.datos[0] : null))
    : null
  const mascota = elegida ?? automatica

  const servicios = useCarga(() => api<Servicio[]>('/servicios'), [])
  const servicio = servicios.datos?.find((s) => s.tipo === tipo) ?? null

  const resultados = useCarga(
    () => (q && !esCliente ? api<Mascota[]>(`/mascotas${query({ q })}`) : Promise.resolve([] as Mascota[])),
    [q],
  )

  const cambiarTipo = (nuevo: TipoServicio) => {
    setTipo(nuevo)
    setHoraInicio(HORAS_SUGERIDAS[nuevo].entrada)
    setHoraFin(HORAS_SUGERIDAS[nuevo].salida)
    // En daycare lo normal es empezar con un solo dia
    if (nuevo === 'DAYCARE') setDiaFin(diaInicio)
    else if (diaFin <= diaInicio) setDiaFin(sumarDias(diaInicio, 1))
  }

  const cambiarInicio = (valor: string) => {
    setDiaInicio(valor)
    if (tipo === 'HOSPEDAJE' && diaFin <= valor) setDiaFin(sumarDias(valor, 1))
    if (tipo === 'DAYCARE' && diaFin < valor) setDiaFin(valor)
  }

  const fechaInicio = `${diaInicio}T${horaInicio}`
  const fechaFin = `${diaFin}T${horaFin}`
  const completo = Boolean(servicio && diaInicio && diaFin && horaInicio && horaFin)

  // Cotizacion en vivo: se pide al backend cuando cambian servicio, fechas o perro
  const clave = completo ? JSON.stringify([servicio!.id_servicio, fechaInicio, fechaFin, mascota?.id_mascota]) : ''
  const claveRetrasada = useRetrasado(clave, 350)
  const [cotizacion, setCotizacion] = useState<{ clave: string; datos?: Cotizacion; error?: string } | null>(null)

  useEffect(() => {
    if (!claveRetrasada) return
    const [id_servicio, fecha_inicio, fecha_fin, id_mascota] = JSON.parse(claveRetrasada)
    let vigente = true
    api<Cotizacion>(`${base}/reservaciones/cotizacion`, {
      method: 'POST',
      body: { id_servicio, fecha_inicio, fecha_fin, id_mascota: id_mascota ?? undefined },
    }).then(
      (datos) => vigente && setCotizacion({ clave: claveRetrasada, datos }),
      (e) => vigente && setCotizacion({ clave: claveRetrasada, error: mensajeError(e) }),
    )
    return () => {
      vigente = false
    }
  }, [claveRetrasada, base])

  // Solo se muestra la cotizacion que corresponde a los datos actuales
  const cot = cotizacion && cotizacion.clave === clave ? cotizacion : null
  const calculando = completo && !cot
  const puedeCrear = Boolean(mascota && cot?.datos?.disponible && !cot.datos.cruce && !enviando)

  const crear = async (e: FormEvent) => {
    e.preventDefault()
    if (!mascota || !servicio) return
    setEnviando(true)
    setErrorEnvio(null)
    try {
      const r = await api<ReservacionDetalle>(`${base}/reservaciones`, {
        method: 'POST',
        body: {
          id_mascota: mascota.id_mascota,
          id_servicio: servicio.id_servicio,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          observaciones,
        },
      })
      if (esCliente) {
        navegar(`/mi-cuenta/reservas/${r.id_reservacion}`, {
          state: { aviso: `Solicitud enviada para ${r.mascota}. El hotel la revisará y te confirmará la reserva.` },
        })
      } else {
        navegar(`/panel/reservaciones/${r.id_reservacion}`, {
          state: { aviso: `Reservación #${r.id_reservacion} creada para ${r.mascota}.` },
        })
      }
    } catch (err) {
      setErrorEnvio(mensajeError(err))
      setEnviando(false)
    }
  }

  const esHotel = tipo === 'HOSPEDAJE'

  return (
    <div className="pagina">
      <Encabezado
        volver={esCliente ? { a: '/mi-cuenta/reservas', texto: 'Mis reservas' } : { a: '/panel/reservaciones', texto: 'Reservaciones' }}
        titulo={esCliente ? 'Solicitar una estancia' : 'Nueva reservación'}
        subtitulo={
          esCliente
            ? 'Elige a tu perro, el servicio y las fechas. Verás el precio y si hay cupo antes de enviar la solicitud.'
            : 'Elige el perro, el servicio y las fechas. El sistema verifica el cupo y calcula el importe.'
        }
      />

      <form className="reserva-grid" onSubmit={crear}>
        <div className="reserva-pasos">
          {/* 1. Perro */}
          <section className="caja">
            <div className="caja-encabezado">
              <h2>
                <span className="paso-num">1</span> Perro
              </h2>
            </div>
            <div className="caja-cuerpo">
              {esCliente ? (
                <>
                  {propios.cargando && !propios.datos && <Cargando texto="Cargando tus perros…" />}
                  {propios.datos && propios.datos.length === 0 && (
                    <p className="texto-suave resultado-vacio">
                      Todavía no registras a tu perro. <Link to="/mi-cuenta/perros">Agrégalo aquí</Link> y vuelve para
                      solicitar la estancia.
                    </p>
                  )}
                  {propios.datos && propios.datos.length > 0 && (
                    <div className="opciones-perro" role="radiogroup" aria-label="Perro">
                      {propios.datos.map((m) => (
                        <button
                          key={m.id_mascota}
                          type="button"
                          role="radio"
                          aria-checked={mascota?.id_mascota === m.id_mascota}
                          className={`opcion-servicio ${mascota?.id_mascota === m.id_mascota ? 'activa' : ''}`}
                          onClick={() => setMascota(m)}
                        >
                          <Avatar nombre={m.nombre} />
                          <span className="celda-principal">
                            <strong>{m.nombre}</strong>
                            <span>{m.raza ?? 'Raza sin indicar'}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : mascota ? (
                <div className="seleccion">
                  <div className="celda-principal">
                    <strong>{mascota.nombre}</strong>
                    <span>
                      {mascota.raza ?? 'Raza sin indicar'} · Dueño: {mascota.propietario} · {mascota.telefono_propietario}
                    </span>
                    {mascota.observaciones && <span className="seleccion-nota">{mascota.observaciones}</span>}
                  </div>
                  <button type="button" className="boton boton-gris boton-chico" onClick={() => setMascota(null)}>
                    Cambiar
                  </button>
                </div>
              ) : (
                <>
                  <Campo etiqueta="Buscar perro" ayuda="Por nombre del perro, raza o nombre del dueño">
                    <input
                      type="search"
                      placeholder="Ej. Max, Labrador, Ana López"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      autoFocus
                    />
                  </Campo>
                  {q && resultados.cargando && !resultados.datos && <Cargando texto="Buscando…" />}
                  {q && resultados.datos && resultados.datos.length === 0 && (
                    <p className="texto-suave resultado-vacio">
                      No hay perros activos que coincidan. ¿Es nuevo?{' '}
                      <Link to="/panel/propietarios">Regístralo en Dueños y perros</Link>.
                    </p>
                  )}
                  {resultados.datos && resultados.datos.length > 0 && (
                    <ul className="resultados">
                      {resultados.datos.map((m) => (
                        <li key={m.id_mascota}>
                          <button type="button" onClick={() => setMascota(m)}>
                            <strong>{m.nombre}</strong>
                            <span>
                              {m.raza ?? 'Raza sin indicar'} · {m.propietario}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </section>

          {/* 2. Servicio */}
          <section className="caja">
            <div className="caja-encabezado">
              <h2>
                <span className="paso-num">2</span> Servicio
              </h2>
            </div>
            <div className="caja-cuerpo">
              {servicios.error && <Aviso>{servicios.error}</Aviso>}
              <div className="opciones-servicio" role="radiogroup" aria-label="Servicio">
                {(['HOSPEDAJE', 'DAYCARE'] as const).map((t) => {
                  const s = servicios.datos?.find((x) => x.tipo === t)
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={tipo === t}
                      className={`opcion-servicio ${tipo === t ? 'activa' : ''}`}
                      onClick={() => cambiarTipo(t)}
                      disabled={s ? !s.activo : false}
                    >
                      <span className="opcion-icono">
                        {t === 'HOSPEDAJE' ? <IconoLuna width={18} height={18} /> : <IconoSol width={18} height={18} />}
                      </span>
                      <span className="celda-principal">
                        <strong>{s?.nombre ?? (t === 'HOSPEDAJE' ? 'Hospedaje nocturno' : 'Daycare')}</strong>
                        <span>
                          {s?.tarifa_vigente
                            ? `${moneda(s.tarifa_vigente.precio)} / ${unidadTexto(s.tarifa_vigente.unidad)}`
                            : 'Sin tarifa vigente'}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </section>

          {/* 3. Fechas */}
          <section className="caja">
            <div className="caja-encabezado">
              <h2>
                <span className="paso-num">3</span> Fechas
              </h2>
              <span className="texto-suave texto-chico">
                {esHotel ? 'De 1 a 30 noches' : 'Horario de 07:00 a 19:00 · hasta 31 días'}
              </span>
            </div>
            <div className="caja-cuerpo form-grid">
              <Campo etiqueta={esHotel ? 'Fecha de entrada' : 'Primer día'}>
                <input type="date" min={hoy()} value={diaInicio} onChange={(e) => cambiarInicio(e.target.value)} required />
              </Campo>
              <Campo etiqueta={esHotel ? 'Hora de entrada' : 'Hora de entrada (cada día)'}>
                <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} required />
              </Campo>
              <Campo etiqueta={esHotel ? 'Fecha de salida' : 'Último día'}>
                <input
                  type="date"
                  min={esHotel ? sumarDias(diaInicio, 1) : diaInicio}
                  value={diaFin}
                  onChange={(e) => setDiaFin(e.target.value)}
                  required
                />
              </Campo>
              <Campo etiqueta={esHotel ? 'Hora de salida' : 'Hora de salida (cada día)'}>
                <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} required />
              </Campo>
              <Campo etiqueta="Observaciones de la reserva" ancho="completo">
                <textarea
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  maxLength={2000}
                  placeholder="Indicaciones para esta estancia (opcional)"
                />
              </Campo>
            </div>
          </section>
        </div>

        {/* Resumen */}
        <aside className="caja reserva-resumen">
          <div className="caja-encabezado">
            <h2>Resumen</h2>
          </div>
          <div className="caja-cuerpo">
            {!completo && <p className="texto-suave">Completa el servicio y las fechas para cotizar.</p>}
            {calculando && <Cargando texto="Calculando…" />}
            {cot?.error && <Aviso>{cot.error}</Aviso>}
            {cot?.datos && (
              <>
                <dl className="resumen-lineas">
                  <div>
                    <dt>Servicio</dt>
                    <dd>{cot.datos.servicio.nombre}</dd>
                  </div>
                  <div>
                    <dt>Del</dt>
                    <dd>{fecha(diaInicio)}, {horaInicio}</dd>
                  </div>
                  <div>
                    <dt>Al</dt>
                    <dd>{fecha(diaFin)}, {horaFin}</dd>
                  </div>
                  <div>
                    <dt>Tarifa</dt>
                    <dd>
                      {moneda(cot.datos.tarifa.precio)} / {unidadTexto(cot.datos.tarifa.unidad)}
                    </dd>
                  </div>
                  <div>
                    <dt>Cantidad</dt>
                    <dd>
                      {cot.datos.unidades} {unidadTexto(cot.datos.tarifa.unidad, cot.datos.unidades)}
                    </dd>
                  </div>
                </dl>
                <div className="resumen-total">
                  <span>Total</span>
                  <strong>{moneda(cot.datos.monto_total)}</strong>
                </div>

                {cot.datos.cruce && (
                  <Aviso tipo="alerta">
                    {mascota?.nombre} ya tiene la reservación #{cot.datos.cruce.id_reservacion} (
                    {cot.datos.cruce.servicio}) en esas fechas.
                  </Aviso>
                )}
                {cot.datos.disponible ? (
                  <Aviso tipo="ok">Hay cupo disponible en todas las fechas.</Aviso>
                ) : (
                  <Aviso>No hay cupo en algunas fechas. Elige otras fechas para continuar.</Aviso>
                )}

                <p className="cupos-titulo">Cupos por {esHotel ? 'noche' : 'día'}</p>
                <ul className="cupos">
                  {cot.datos.dias.map((d) => (
                    <li key={d.fecha} className={d.disponibles > 0 ? '' : 'sin-cupo'}>
                      <span>{fechaCorta(d.fecha)}</span>
                      <span>
                        {d.capacidad === null ? 'Sin capacidad' : `${d.disponibles} de ${d.capacidad} libres`}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {!mascota && completo && <p className="texto-suave texto-chico">Elige un perro para poder reservar.</p>}
            {esCliente && (
              <p className="texto-suave texto-chico nota-solicitud">
                Tu solicitud queda <strong>pendiente</strong> hasta que el hotel la confirme. Mientras tanto puedes
                cancelarla desde «Mis reservas».
              </p>
            )}
            {errorEnvio && <Aviso>{errorEnvio}</Aviso>}

            <button type="submit" className="boton boton-verde resumen-boton" disabled={!puedeCrear}>
              {enviando ? (esCliente ? 'Enviando…' : 'Creando…') : esCliente ? 'Enviar solicitud' : 'Crear reservación'}
            </button>
          </div>
        </aside>
      </form>
    </div>
  )
}
