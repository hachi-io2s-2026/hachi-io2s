
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { RolUsuario } from "../models/usuario.js";
import { HttpError } from "../utils/httpError.js";

export interface UsuarioToken {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

function secreto(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) throw new Error("Falta JWT_SECRET en el archivo .env");
  return valor;
}

export function firmarToken(usuario: UsuarioToken): string {
  return jwt.sign(usuario, secreto(), {
    expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
  });
}

export function requerirAuth(req: Request, _res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    throw new HttpError(401, "Debe iniciar sesion");
  }

  try {
    const datos = jwt.verify(token, secreto()) as UsuarioToken;
    req.usuario = {
      id_usuario: datos.id_usuario,
      nombre: datos.nombre,
      correo: datos.correo,
      rol: datos.rol,
    };
  } catch {
    throw new HttpError(401, "Sesion invalida o expirada");
  }
  next();
}

export function requerirRol(...roles: RolUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      throw new HttpError(403, "No tiene permisos para esta accion");
    }
    next();
  };
}
