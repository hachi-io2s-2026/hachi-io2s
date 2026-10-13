
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import {
  firmarToken,
  firmarTokenCliente,
  type ClienteToken,
  type UsuarioToken,
} from "../middlewares/auth.js";
import { HttpError } from "../utils/httpError.js";

const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

async function buscarPersonal(correo: string, password: string): Promise<UsuarioToken | null> {
  const [[u]] = await pool.query<RowDataPacket[]>(
    `SELECT id_usuario, nombre, correo, password_hash, rol, activo
     FROM usuarios WHERE correo = ?`,
    [correo]
  );
  if (!u || !u.activo || !(await bcrypt.compare(password, u.password_hash))) return null;
  return { id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo, rol: u.rol };
}

async function buscarCliente(correo: string, password: string): Promise<ClienteToken | null> {
  const [[c]] = await pool.query<RowDataPacket[]>(
    `SELECT c.id_cuenta, c.id_propietario, c.correo, c.password_hash, c.activo, p.nombre, p.apellido
     FROM cuentas_cliente c JOIN propietarios p ON p.id_propietario = c.id_propietario
     WHERE c.correo = ?`,
    [correo]
  );
  if (!c || !c.activo || !(await bcrypt.compare(password, c.password_hash))) return null;
  return {
    id_cuenta: c.id_cuenta,
    id_propietario: c.id_propietario,
    nombre: `${c.nombre} ${c.apellido}`,
    correo: c.correo,
  };
}

// Inicio de sesion unico: primero busca en el personal del hotel y luego en las cuentas
// de clientes. El campo "tipo" le indica al frontend a que pantalla debe ir.
export async function login(req: Request, res: Response) {
  const { correo, password } = loginSchema.parse(req.body);

  const usuario = await buscarPersonal(correo, password);
  if (usuario) {
    res.json({
      success: true,
      data: { tipo: "personal", token: firmarToken(usuario), usuario },
    });
    return;
  }

  const cliente = await buscarCliente(correo, password);
  if (cliente) {
    res.json({
      success: true,
      data: { tipo: "cliente", token: firmarTokenCliente(cliente), cliente },
    });
    return;
  }

  // Mismo mensaje para correo inexistente y contrasena incorrecta
  throw new HttpError(401, "Correo o contrasena incorrectos");
}

export async function perfil(req: Request, res: Response) {
  res.json({ success: true, data: req.usuario });
}
