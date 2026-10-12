
export interface Capacidad {
  id_capacidad: number;
  id_servicio: number;
  capacidad_maxima: number;
  fecha_inicio_vigencia: Date;
  fecha_fin_vigencia: Date | null;
}

export interface CrearCapacidad {
  id_servicio: number;
  capacidad_maxima: number;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia?: string | null;
}
