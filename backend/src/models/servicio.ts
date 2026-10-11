
export type TipoServicio = "HOSPEDAJE" | "DAYCARE";

export interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  tipo: TipoServicio;
  activo: boolean;
  fecha_creacion: Date;
}

export interface CrearServicio {
  nombre: string;
  descripcion?: string | null;
  tipo: TipoServicio;
}
