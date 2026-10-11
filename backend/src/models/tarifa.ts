
export type UnidadTarifa = "NOCHE" | "DIA";

export interface Tarifa {
  id_tarifa: number;
  id_servicio: number;
  nombre: string;
  precio: number;
  unidad: UnidadTarifa;
  fecha_inicio_vigencia: Date;
  fecha_fin_vigencia: Date | null;
  activo: boolean;
}

export interface CrearTarifa {
  id_servicio: number;
  nombre: string;
  precio: number;
  unidad: UnidadTarifa;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia?: string | null;
}

