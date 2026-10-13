
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
  fecha_inicio: string;
  fecha_fin: string;
  monto_total: number;
  estado: EstadoReservacion;
  // PERSONAL: la creo recepcion; CLIENTE: la solicito el dueno desde el portal
  origen: "PERSONAL" | "CLIENTE";
  observaciones: string | null;
  // Razon por la que el hotel rechazo una solicitud del portal (la ve el cliente)
  motivo_rechazo: string | null;
  fecha_creacion: string;
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
