
export type SexoMascota = "MACHO" | "HEMBRA";

export interface Mascota {
  id_mascota: number;
  id_propietario: number;
  nombre: string;
  raza: string | null;
  sexo: SexoMascota | null;
  fecha_nacimiento: string | null;
  peso_kg: number | null;
  observaciones: string | null;
  activo: boolean;
  fecha_registro: string;
}

export interface CrearMascota {
  id_propietario: number;
  nombre: string;
  raza?: string | null;
  sexo?: SexoMascota | null;
  fecha_nacimiento?: string | null;
  peso_kg?: number | null;
  observaciones?: string | null;
}

