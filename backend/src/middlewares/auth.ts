
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { RolUsuario } from "../models/usuario.js";
import { HttpError } from "../utils/httpError.js";

// Sesion del personal del hotel (panel)
export interface UsuarioToken {
  id_usuario: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

// Sesion de un cliente (portal)
export interface ClienteToken {
  id_cuenta: number;
  id_propietario: number;
  nombre: string;
  correo: string;
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
      cliente?: ClienteToken;
    }
  }
}

function secreto(): string {
  const valor = process.env.JWT_SECRET;
  if (!valor) throw new Error("Falta JWT_SECRET en el archivo .env");
  return valor;
}

const opciones = () => ({
  expiresIn: (process.env.JWT_EXPIRES_IN || "8h") as jwt.SignOptions["expiresIn"],
});

// El campo "tipo" distingue los tokens del personal y de los clientes
export function firmarToken(usuario: UsuarioToken): string {
  return jwt.sign({ ...usuario, tipo: "personal" }, secreto(), opciones());
}

export function firmarTokenCliente(cliente: ClienteToken): string {
  return jwt.sign({ ...cliente, tipo: "cliente" }, secreto(), opciones());
}

function leerToken(req: Request): Record<string, unknown> {
  const [tipo, token] = (req.headers.authorization || "").split(" ");
  if (tipo !== "Bearer" || !token) {
    throw new HttpError(401, "Debe iniciar sesion");
  }
  try {
    return jwt.verify(token, secreto()) as Record<string, unknown>;
  } catch {
    throw new HttpError(401, "Sesion invalida o expirada");
  }
}

// Exige una sesion del personal del hotel
export function requerirAuth(req: Request, _res: Response, next: NextFunction) {
  const datos = leerToken(req);
  if (datos.tipo === "cliente") {
    throw new HttpError(403, "Esta seccion es solo para el personal del hotel");
  }
  req.usuario = {
    id_usuario: datos.id_usuario as number,
    nombre: datos.nombre as string,
    correo: datos.correo as string,
    rol: datos.rol as RolUsuario,
  };
  next();
}

// Exige una sesion de cliente (portal)
export function requerirCliente(req: Request, _res: Response, next: NextFunction) {
  const datos = leerToken(req);
  if (datos.tipo !== "cliente") {
    throw new HttpError(403, "Inicia sesion con tu cuenta de cliente");
  }
  req.cliente = {
    id_cuenta: datos.id_cuenta as number,
    id_propietario: datos.id_propietario as number,
    nombre: datos.nombre as string,
    correo: datos.correo as string,
  };
  next();
}

// Exige que el usuario autenticado tenga alguno de los roles indicados
export function requerirRol(...roles: RolUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      throw new HttpError(403, "No tiene permisos para esta accion");
    }
    next();
  };
}
