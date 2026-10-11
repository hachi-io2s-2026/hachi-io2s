export interface Propietario {
  id_propietario: number;
  nombre: string;
  apellido: string;
  telefono: string;
  correo: string | null;
  direccion: string | null;
  fecha_registro: Date;
}

export interface CrearPropietario {
  nombre: string;
  apellido: string;
  telefono: string;
  correo?: string | null;
  direccion?: string | null;
}
