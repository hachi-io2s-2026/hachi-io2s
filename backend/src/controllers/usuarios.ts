
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { idParams, textoRequerido } from "../utils/validacion.js";

const crearSchema = z.object({
  nombre: textoRequerido(100),
  correo: z.email().trim().toLowerCase().max(150),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").max(72),
  rol: z.enum(["ADMIN", "EMPLEADO"]).default("EMPLEADO"),
});

const actualizarSchema = z.object({
  activo: z.boolean(),
});

const COLUMNAS = "id_usuario, nombre, correo, rol, activo, fecha_creacion";

export async function listar(_req: Request, res: Response) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS} FROM usuarios ORDER BY nombre`
  );
  res.json({ success: true, data: rows });
}

export async function crear(req: Request, res: Response) {
  const datos = crearSchema.parse(req.body);
  const password_hash = await bcrypt.hash(datos.password, 10);

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol) VALUES (?, ?, ?, ?)`,
    [datos.nombre, datos.correo, password_hash, datos.rol]
  );
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS} FROM usuarios WHERE id_usuario = ?`,
    [resultado.insertId]
  );
  res.status(201).json({ success: true, data: rows[0] });
}

export async function actualizar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { activo } = actualizarSchema.parse(req.body);

  if (id === req.usuario?.id_usuario && !activo) {
    throw new HttpError(400, "No puede desactivar su propio usuario");
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE usuarios SET activo = ? WHERE id_usuario = ?`,
    [activo, id]
  );
  if (resultado.affectedRows === 0) throw noEncontrado("Usuario");

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT ${COLUMNAS} FROM usuarios WHERE id_usuario = ?`,
    [id]
  );
  res.json({ success: true, data: rows[0] });
}
