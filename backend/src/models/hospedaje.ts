
export type EstadoHospedaje =
  | "PENDIENTE"
  | "HOSPEDADO"
  | "FINALIZADO";

export interface Hospedaje {
  id_hospedaje: number;
  id_reservacion: number;
  fecha_entrada: Date | null;
  fecha_salida: Date | null;
  estado: EstadoHospedaje;
  observaciones: string | null;
}

export interface RegistrarEntradaHospedaje {
  id_reservacion: number;
  fecha_entrada: string;
  observaciones?: string | null;
}

export interface RegistrarSalidaHospedaje {
  fecha_salida: string;
  observaciones?: string | null;
}
