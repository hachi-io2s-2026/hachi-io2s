
export type MetodoPago =
  | "EFECTIVO"
  | "TARJETA"
  | "TRANSFERENCIA";

export type EstadoPago =
  | "PENDIENTE"
  | "PAGADO"
  | "ANULADO";

export interface Pago {
  id_pago: number;
  id_reservacion: number;
  monto: number;
  metodo_pago: MetodoPago | null;
  estado: EstadoPago;
  fecha_pago: string | null;
  observaciones: string | null;
  fecha_creacion: string;
}

export interface CrearPago {
  id_reservacion: number;
  monto: number;
  metodo_pago?: MetodoPago | null;
  observaciones?: string | null;
}

export interface ActualizarPago {
  metodo_pago?: MetodoPago | null;
  estado?: EstadoPago;
  fecha_pago?: string | null;
  observaciones?: string | null;
}
