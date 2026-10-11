
export type RolUsuario = "ADMIN" | "EMPLEADO";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  correo: string;
  password_hash: string;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: Date;
}

export interface CrearUsuario {
  nombre: string;
  correo: string;
  password: string;
  rol?: RolUsuario;
}

