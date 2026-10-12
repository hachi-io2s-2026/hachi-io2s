
export type EstadoDaycare =
  | "PROGRAMADO"
  | "PRESENTE"
  | "FINALIZADO"
  | "AUSENTE";

export interface AsistenciaDaycare {
  id_asistencia: number;
  id_reservacion: number;
  fecha: string;
  hora_entrada: string | null;
  hora_salida: string | null;
  estado: EstadoDaycare;
  observaciones: string | null;
}

export interface RegistrarAsistenciaDaycare {
  id_reservacion: number;
  fecha: string;
  hora_entrada?: string | null;
  observaciones?: string | null;
}

export interface RegistrarSalidaDaycare {
  hora_salida: string;
  observaciones?: string | null;
}
