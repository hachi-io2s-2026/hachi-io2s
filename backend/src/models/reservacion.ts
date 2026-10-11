
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
  fecha_inicio: Date;
  fecha_fin: Date;
  estado: EstadoReservacion;
  observaciones: string | null;
  fecha_creacion: Date;
}

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
