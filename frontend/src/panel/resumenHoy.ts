// Datos operativos del dia, armados con los endpoints que ya existen.
// Los usa la pagina "Hoy" y el contador de pendientes del menu lateral.
import { api } from '../api/client'
import type { AsistenciaFila, HospedajeFila, Mascota, Reservacion, Servicio } from '../api/tipos'
import { fecha, hoy, sumarDias } from '../utils/formato'

export interface Movimiento {
  clave: string
  servicio: 'Hotel' | 'Daycare'
  id_reservacion: number
  id_mascota: number
  mascota: string
  raza: string | null
  propietario: string
  hora: string // HH:mm previsto
  // Accion pendiente; null si ya se registro
  accion: { tipo: 'entrada' | 'salida'; ruta: string } | null
  etiqueta: string // donde esta el perro cuando ya no hay accion: "En casa" o "Salió"
  saldo?: number
  atrasado?: boolean
  diaPrevisto?: string
}

export interface Alerta {
  tipo: 'alerta' | 'info'
  mascota: string
  texto: string
  id_reservacion: number
}

export interface Llegada {
  id_reservacion: number
  mascota: string
  raza: string | null
  propietario: string
  dia: string
  hora: string
  confirmada: boolean
}

export interface ResumenHoy {
  // Reservas pendientes de confirmar (de hoy en adelante), las del portal incluidas
  porConfirmar: Reservacion[]
  entradas: Movimiento[]
  // Llegadas al hotel de los proximos 7 dias (sin contar hoy)
  proximas: Llegada[]
  salidas: Movimiento[]
  alertas: Alerta[]
  perrosEnCasa: number
  enHotel: number
  enDaycare: number
  capacidadHotel: number | null
}

const dia = (fh: string | null) => (fh ? fh.slice(0, 10) : '')
const horaDe = (fh: string | null) => (fh ? fh.slice(11, 16) : '')

export async function cargarResumenHoy(): Promise<ResumenHoy> {
  const diaHoy = hoy()
  const [hospedajes, asistencias, enCurso, mascotas, servicios, pendientesConfirmar] = await Promise.all([
    api<HospedajeFila[]>('/hospedajes'),
    api<AsistenciaFila[]>(`/daycare/asistencias?fecha=${diaHoy}`),
    api<Reservacion[]>('/reservaciones?estado=EN_CURSO'),
    api<Mascota[]>('/mascotas'),
    api<Servicio[]>('/servicios'),
    api<Reservacion[]>('/reservaciones?estado=PENDIENTE'),
  ])

  const saldoDe = new Map(enCurso.map((r) => [r.id_reservacion, r.saldo]))
  const observacionesDe = new Map(mascotas.map((m) => [m.id_mascota, m.observaciones]))

  const base = (h: HospedajeFila | AsistenciaFila) => ({
    id_reservacion: h.id_reservacion,
    id_mascota: h.id_mascota,
    mascota: h.mascota,
    raza: h.raza,
    propietario: h.propietario,
  })

  const entradas: Movimiento[] = []
  const salidas: Movimiento[] = []

  for (const h of hospedajes) {
    const llegaHoy = dia(h.fecha_inicio) === diaHoy
    if (h.estado === 'PENDIENTE' && llegaHoy && ['PENDIENTE', 'CONFIRMADA'].includes(h.estado_reservacion)) {
      entradas.push({
        ...base(h),
        clave: `h-e-${h.id_hospedaje}`,
        servicio: 'Hotel',
        hora: horaDe(h.fecha_inicio),
        accion: { tipo: 'entrada', ruta: `/hospedajes/${h.id_hospedaje}/entrada` },
        etiqueta: '',
      })
    } else if (h.estado !== 'PENDIENTE' && dia(h.fecha_entrada) === diaHoy) {
      entradas.push({
        ...base(h),
        clave: `h-e-${h.id_hospedaje}`,
        servicio: 'Hotel',
        hora: horaDe(h.fecha_entrada),
        accion: null,
        etiqueta: h.estado === 'HOSPEDADO' ? 'En casa' : 'Salió',
      })
    }

    if (h.estado === 'HOSPEDADO' && dia(h.fecha_fin) <= diaHoy) {
      salidas.push({
        ...base(h),
        clave: `h-s-${h.id_hospedaje}`,
        servicio: 'Hotel',
        hora: horaDe(h.fecha_fin),
        accion: { tipo: 'salida', ruta: `/hospedajes/${h.id_hospedaje}/salida` },
        etiqueta: '',
        saldo: saldoDe.get(h.id_reservacion),
        atrasado: dia(h.fecha_fin) < diaHoy,
        diaPrevisto: dia(h.fecha_fin),
      })
    } else if (h.estado === 'FINALIZADO' && dia(h.fecha_salida) === diaHoy) {
      salidas.push({ ...base(h), clave: `h-s-${h.id_hospedaje}`, servicio: 'Hotel', hora: horaDe(h.fecha_salida), accion: null, etiqueta: 'Salió' })
    }
  }

  for (const a of asistencias) {
    if (['CANCELADA', 'FINALIZADA'].includes(a.estado_reservacion) && a.estado === 'PROGRAMADO') continue
    const comun = { ...base(a), servicio: 'Daycare' as const }
    if (a.estado === 'PROGRAMADO') {
      entradas.push({
        ...comun,
        clave: `d-e-${a.id_asistencia}`,
        hora: a.hora_programada_entrada,
        accion: { tipo: 'entrada', ruta: `/daycare/asistencias/${a.id_asistencia}/entrada` },
        etiqueta: '',
      })
    } else if (a.estado === 'PRESENTE' || a.estado === 'FINALIZADO') {
      entradas.push({
        ...comun,
        clave: `d-e-${a.id_asistencia}`,
        hora: horaDe(a.hora_entrada),
        accion: null,
        etiqueta: a.estado === 'PRESENTE' ? 'En casa' : 'Salió',
      })
    }

    if (a.estado === 'PRESENTE') {
      salidas.push({
        ...comun,
        clave: `d-s-${a.id_asistencia}`,
        hora: a.hora_programada_salida,
        accion: { tipo: 'salida', ruta: `/daycare/asistencias/${a.id_asistencia}/salida` },
        etiqueta: '',
        saldo: saldoDe.get(a.id_reservacion),
      })
    } else if (a.estado === 'FINALIZADO') {
      salidas.push({ ...comun, clave: `d-s-${a.id_asistencia}`, hora: horaDe(a.hora_salida), accion: null, etiqueta: 'Salió' })
    }
  }

  // Pendientes primero, luego por hora
  const orden = (x: Movimiento, y: Movimiento) =>
    Number(!x.accion) - Number(!y.accion) || x.hora.localeCompare(y.hora)
  entradas.sort(orden)
  salidas.sort(orden)

  // Alertas
  const alertas: Alerta[] = []
  for (const s of salidas) {
    if (s.atrasado) {
      alertas.push({
        tipo: 'alerta',
        mascota: s.mascota,
        texto: `su salida estaba prevista el ${fecha(s.diaPrevisto)}; al registrarla se cobrarán noches extra.`,
        id_reservacion: s.id_reservacion,
      })
    }
  }
  for (const h of hospedajes) {
    if (h.estado === 'PENDIENTE' && h.estado_reservacion === 'PENDIENTE' && dia(h.fecha_inicio) === diaHoy) {
      alertas.push({ tipo: 'alerta', mascota: h.mascota, texto: 'llega hoy y su reserva sigue sin confirmar.', id_reservacion: h.id_reservacion })
    }
  }
  // Observaciones (alergias, medicinas...) de los perros que estan o llegan hoy
  const vistos = new Set<number>()
  for (const m of [...entradas, ...salidas]) {
    const obs = observacionesDe.get(m.id_mascota)
    if (obs && !vistos.has(m.id_mascota)) {
      vistos.add(m.id_mascota)
      alertas.push({ tipo: 'info', mascota: m.mascota, texto: obs, id_reservacion: m.id_reservacion })
    }
  }
  for (const h of hospedajes) {
    const obs = observacionesDe.get(h.id_mascota)
    if (h.estado === 'HOSPEDADO' && obs && !vistos.has(h.id_mascota)) {
      vistos.add(h.id_mascota)
      alertas.push({ tipo: 'info', mascota: h.mascota, texto: obs, id_reservacion: h.id_reservacion })
    }
  }

  const limite = sumarDias(diaHoy, 7)
  const proximas: Llegada[] = hospedajes
    .filter(
      (h) =>
        h.estado === 'PENDIENTE' &&
        ['PENDIENTE', 'CONFIRMADA'].includes(h.estado_reservacion) &&
        dia(h.fecha_inicio) > diaHoy &&
        dia(h.fecha_inicio) <= limite,
    )
    .map((h) => ({
      id_reservacion: h.id_reservacion,
      mascota: h.mascota,
      raza: h.raza,
      propietario: h.propietario,
      dia: dia(h.fecha_inicio),
      hora: horaDe(h.fecha_inicio),
      confirmada: h.estado_reservacion === 'CONFIRMADA',
    }))
    .sort((a, b) => (a.dia + a.hora).localeCompare(b.dia + b.hora))

  const enHotel = hospedajes.filter((h) => h.estado === 'HOSPEDADO').length
  const enDaycare = asistencias.filter((a) => a.estado === 'PRESENTE').length

  const porConfirmar = pendientesConfirmar
    .filter((r) => dia(r.fecha_fin) >= diaHoy)
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))

  return {
    porConfirmar,
    entradas,
    proximas,
    salidas,
    alertas,
    perrosEnCasa: enHotel + enDaycare,
    enHotel,
    enDaycare,
    capacidadHotel: servicios.find((s) => s.tipo === 'HOSPEDAJE')?.capacidad_vigente ?? null,
  }
}

export const pendientes = (r: ResumenHoy) =>
  r.entradas.filter((m) => m.accion).length + r.salidas.filter((m) => m.accion).length
