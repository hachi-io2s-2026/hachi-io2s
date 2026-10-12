
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { noEncontrado } from "../utils/httpError.js";
import { idParams, textoOpcional, textoRequerido } from "../utils/validacion.js";

const propietarioSchema = z.object({
  nombre: textoRequerido(100),
  apellido: textoRequerido(100),
  telefono: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{8,20}$/, "Telefono invalido (8 a 20 digitos)"),
  correo: z
    .union([z.email().trim().toLowerCase().max(150), z.literal("")])
    .nullish()
    .transform((valor) => (valor ? valor : null)),
  direccion: textoOpcional(255),
});

const filtrosSchema = z.object({
  q: z.string().trim().optional(),
});

async function buscarPorId(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*,
       (SELECT COUNT(*) FROM mascotas m
        WHERE m.id_propietario = p.id_propietario AND m.activo = TRUE) AS total_mascotas
     FROM propietarios p WHERE p.id_propietario = ?`,
    [id]
  );
  if (!rows[0]) throw noEncontrado("Propietario");
  return rows[0];
}

export async function listar(req: Request, res: Response) {
  const { q } = filtrosSchema.parse(req.query);
  const params: unknown[] = [];
  let filtro = "";

  if (q) {
    const patron = `%${q}%`;
    filtro = `WHERE CONCAT(p.nombre, ' ', p.apellido) LIKE ? OR p.telefono LIKE ? OR p.correo LIKE ?`;
    params.push(patron, patron, patron);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.*,
       (SELECT COUNT(*) FROM mascotas m
        WHERE m.id_propietario = p.id_propietario AND m.activo = TRUE) AS total_mascotas
     FROM propietarios p
     ${filtro}
     ORDER BY p.apellido, p.nombre
     LIMIT 200`,
    params
  );
  res.json({ success: true, data: rows });
}

// Incluye las mascotas del propietario
export async function obtener(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const propietario = await buscarPorId(id);
  const [mascotas] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM mascotas WHERE id_propietario = ? ORDER BY activo DESC, nombre`,
    [id]
  );
  res.json({ success: true, data: { ...propietario, mascotas } });
}

export async function crear(req: Request, res: Response) {
  const datos = propietarioSchema.parse(req.body);
  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO propietarios (nombre, apellido, telefono, correo, direccion)
     VALUES (?, ?, ?, ?, ?)`,
    [datos.nombre, datos.apellido, datos.telefono, datos.correo, datos.direccion]
  );
  res.status(201).json({ success: true, data: await buscarPorId(resultado.insertId) });
}

export async function actualizar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const datos = propietarioSchema.parse(req.body);
  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE propietarios
     SET nombre = ?, apellido = ?, telefono = ?, correo = ?, direccion = ?
     WHERE id_propietario = ?`,
    [datos.nombre, datos.apellido, datos.telefono, datos.correo, datos.direccion, id]
  );
  if (resultado.affectedRows === 0) throw noEncontrado("Propietario");
  res.json({ success: true, data: await buscarPorId(id) });
}
