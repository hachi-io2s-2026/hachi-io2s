
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { firmarToken, type UsuarioToken } from "../middlewares/auth.js";
import { HttpError } from "../utils/httpError.js";

const loginSchema = z.object({
  correo: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response) {
  const { correo, password } = loginSchema.parse(req.body);

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT id_usuario, nombre, correo, password_hash, rol, activo
     FROM usuarios WHERE correo = ?`,
    [correo]
  );
  const usuario = rows[0];

  // Mismo mensaje para correo inexistente y contrasena incorrecta
  const valido =
    usuario && usuario.activo && (await bcrypt.compare(password, usuario.password_hash));
  if (!valido) {
    throw new HttpError(401, "Correo o contrasena incorrectos");
  }

  const datos: UsuarioToken = {
    id_usuario: usuario.id_usuario,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };
  res.json({ success: true, data: { token: firmarToken(datos), usuario: datos } });
}

export async function perfil(req: Request, res: Response) {
  res.json({ success: true, data: req.usuario });
}
