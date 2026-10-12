
export type EstadoReservacion =
  | "PENDIENTE"
  | "CONFIRMADA"
  | "EN_CURSO"
  | "FINALIZADA"
  | "CANCELADA";

export interface Reservacion {
  id_reservacion: number;
  id_mascota: number;
  id_servicio: number;
  id_tarifa: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  monto_total: number;
  estado: EstadoReservacion;
  observaciones: string | null;
  fecha_creacion: Date;
}

// id_tarifa y monto_total los calcula el backend con la tarifa vigente;
// no se reciben del cliente.
export interface CrearReservacion {
  id_mascota: number;
  id_servicio: number;
  fecha_inicio: string;
  fecha_fin: string;
  observaciones?: string | null;
}

export interface ActualizarReservacion {
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: EstadoReservacion;
  observaciones?: string | null;
}
