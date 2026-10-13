// Tipos de las respuestas de la API (reflejan backend/src/models y los JOIN de cada controlador).
// Las fechas llegan como texto: DATETIME "YYYY-MM-DD HH:mm:ss" y DATE "YYYY-MM-DD".

export type TipoServicio = 'HOSPEDAJE' | 'DAYCARE'
export type EstadoReservacion = 'PENDIENTE' | 'CONFIRMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA'
export type EstadoHospedaje = 'PENDIENTE' | 'HOSPEDADO' | 'FINALIZADO'
export type EstadoAsistencia = 'PROGRAMADO' | 'PRESENTE' | 'FINALIZADO' | 'AUSENTE'
export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA'
export type EstadoPago = 'PENDIENTE' | 'PAGADO' | 'ANULADO'
export type Sexo = 'MACHO' | 'HEMBRA'
export type Unidad = 'NOCHE' | 'DIA'

export interface Propietario {
  id_propietario: number
  nombre: string
  apellido: string
  telefono: string
  correo: string | null
  direccion: string | null
  fecha_registro: string
  total_mascotas: number
}

export interface Mascota {
  id_mascota: number
  id_propietario: number
  nombre: string
  raza: string | null
  sexo: Sexo | null
  fecha_nacimiento: string | null
  peso_kg: number | null
  observaciones: string | null
  activo: boolean
  fecha_registro: string
  propietario: string
  telefono_propietario: string
}

export interface PropietarioDetalle extends Propietario {
  mascotas: Omit<Mascota, 'propietario' | 'telefono_propietario'>[]
}

export interface Servicio {
  id_servicio: number
  nombre: string
  descripcion: string | null
  tipo: TipoServicio
  activo: boolean
  tarifa_vigente: { id_tarifa: number; nombre: string; precio: number; unidad: Unidad } | null
  capacidad_vigente: number | null
}

export interface Tarifa {
  id_tarifa: number
  id_servicio: number
  nombre: string
  precio: number
  unidad: Unidad
  fecha_inicio_vigencia: string
  fecha_fin_vigencia: string | null
  activo: boolean
  servicio: string
  tipo: TipoServicio
}

export interface Capacidad {
  id_capacidad: number
  id_servicio: number
  capacidad_maxima: number
  fecha_inicio_vigencia: string
  fecha_fin_vigencia: string | null
  servicio: string
  tipo: TipoServicio
}

export interface UsuarioSistema {
  id_usuario: number
  nombre: string
  correo: string
  rol: 'ADMIN' | 'EMPLEADO'
  activo: boolean
  fecha_creacion: string
}

export interface Hospedaje {
  id_hospedaje: number
  id_reservacion: number
  fecha_entrada: string | null
  fecha_salida: string | null
  estado: EstadoHospedaje
  observaciones: string | null
}

export type OrigenReservacion = 'PERSONAL' | 'CLIENTE'

// Solicitud hecha desde el portal que el hotel todavia no acepta ni rechaza.
// Mientras este asi no se registran entradas, ausencias ni pagos (el backend tambien lo valida).
export const esSolicitudSinResponder = (estado: EstadoReservacion, origen: OrigenReservacion | undefined) =>
  origen === 'CLIENTE' && estado === 'PENDIENTE'

// Estado para mostrar: distingue las solicitudes sin responder y las rechazadas por el hotel
export const estadoVisible = (r: Pick<Reservacion, 'estado' | 'origen' | 'motivo_rechazo'>) =>
  esSolicitudSinResponder(r.estado, r.origen)
    ? 'SOLICITUD'
    : r.estado === 'CANCELADA' && r.motivo_rechazo
      ? 'RECHAZADA'
      : r.estado

export interface HospedajeFila extends Hospedaje {
  fecha_inicio: string
  fecha_fin: string
  estado_reservacion: EstadoReservacion
  origen_reservacion: OrigenReservacion
  monto_total: number
  id_mascota: number
  mascota: string
  raza: string | null
  propietario: string
  telefono_propietario: string
}

export interface Asistencia {
  id_asistencia: number
  id_reservacion: number
  fecha: string
  hora_entrada: string | null
  hora_salida: string | null
  estado: EstadoAsistencia
  observaciones: string | null
}

export interface AsistenciaFila extends Asistencia {
  estado_reservacion: EstadoReservacion
  origen_reservacion: OrigenReservacion
  hora_programada_entrada: string
  hora_programada_salida: string
  id_mascota: number
  mascota: string
  raza: string | null
  propietario: string
  telefono_propietario: string
}

export interface Pago {
  id_pago: number
  id_reservacion: number
  monto: number
  metodo_pago: MetodoPago | null
  estado: EstadoPago
  fecha_pago: string | null
  observaciones: string | null
  fecha_creacion: string
}

export interface Reservacion {
  id_reservacion: number
  id_mascota: number
  id_servicio: number
  id_tarifa: number
  fecha_inicio: string
  fecha_fin: string
  monto_total: number
  estado: EstadoReservacion
  // PERSONAL: la creo recepcion; CLIENTE: la solicito el dueno desde el portal
  origen: OrigenReservacion
  observaciones: string | null
  // Razon por la que el hotel rechazo la solicitud (la ve el cliente en su portal)
  motivo_rechazo: string | null
  fecha_creacion: string
  mascota: string
  raza: string | null
  id_propietario: number
  propietario: string
  telefono_propietario: string
  servicio: string
  tipo: TipoServicio
  tarifa: string
  precio_unitario: number
  unidad: Unidad
  total_pagado: number
  saldo: number
  unidades: number
}

export interface CobroSalida {
  noches_extra: number
  cargo_extra: number
  monto_total: number
  total_pagado: number
  saldo: number
}

export interface ReservacionDetalle extends Reservacion {
  hospedaje: Hospedaje | null
  asistencias: Asistencia[]
  pagos: Pago[]
  cobro_salida?: CobroSalida
}

export interface DiaCupo {
  fecha: string
  capacidad: number | null
  ocupados: number
  disponibles: number
}

export interface Cotizacion {
  servicio: { id_servicio: number; nombre: string; tipo: TipoServicio }
  tarifa: { id_tarifa: number; nombre: string; precio: number; unidad: Unidad }
  unidades: number
  monto_total: number
  disponible: boolean
  dias: DiaCupo[]
  cruce: { id_reservacion: number; fecha_inicio: string; fecha_fin: string; servicio: string } | null
}
