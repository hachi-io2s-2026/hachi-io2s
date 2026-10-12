
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { ESTADOS_ACTIVOS } from "../config/reglas.js";
import { hoy } from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { dia, id, idParams, textoOpcional, textoRequerido } from "../utils/validacion.js";

export const mascotaSchema = z.object({
  id_propietario: id,
  nombre: textoRequerido(100),
  raza: textoOpcional(100),
  sexo: z.enum(["MACHO", "HEMBRA"]).nullish().transform((v) => v ?? null),
  fecha_nacimiento: z
    .union([dia, z.literal("")])
    .nullish()
    .transform((v) => (v ? v : null))
    .refine((v) => v === null || v <= hoy(), "La fecha de nacimiento no puede ser futura"),
  peso_kg: z.coerce
    .number()
    .positive()
    .max(150)
    .nullish()
    .transform((v) => v ?? null),
  observaciones: textoOpcional(2000),
});

const filtrosSchema = z.object({
  id_propietario: id.optional(),
  q: z.string().trim().optional(),
  incluir_inactivas: z.enum(["true", "false"]).optional(),
});

const SELECT_MASCOTA = `
  SELECT m.*, CONCAT(p.nombre, ' ', p.apellido) AS propietario, p.telefono AS telefono_propietario
  FROM mascotas m
  JOIN propietarios p ON p.id_propietario = m.id_propietario`;

async function buscarPorId(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_MASCOTA} WHERE m.id_mascota = ?`,
    [id]
  );
  if (!rows[0]) throw noEncontrado("Mascota");
  return rows[0];
}

export async function listar(req: Request, res: Response) {
  const filtros = filtrosSchema.parse(req.query);
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (filtros.incluir_inactivas !== "true") condiciones.push("m.activo = TRUE");
  if (filtros.id_propietario) {
    condiciones.push("m.id_propietario = ?");
    params.push(filtros.id_propietario);
  }
  if (filtros.q) {
    condiciones.push("(m.nombre LIKE ? OR m.raza LIKE ? OR CONCAT(p.nombre, ' ', p.apellido) LIKE ?)");
    const patron = `%${filtros.q}%`;
    params.push(patron, patron, patron);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_MASCOTA} ${where} ORDER BY m.nombre LIMIT 200`,
    params
  );
  res.json({ success: true, data: rows });
}

export async function obtener(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ success: true, data: await buscarPorId(id) });
}

export async function crear(req: Request, res: Response) {
  const d = mascotaSchema.parse(req.body);
  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO mascotas
       (id_propietario, nombre, raza, sexo, fecha_nacimiento, peso_kg, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [d.id_propietario, d.nombre, d.raza, d.sexo, d.fecha_nacimiento, d.peso_kg, d.observaciones]
  );
  res.status(201).json({ success: true, data: await buscarPorId(resultado.insertId) });
}

export async function actualizar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const d = mascotaSchema.parse(req.body);
  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE mascotas
     SET id_propietario = ?, nombre = ?, raza = ?, sexo = ?, fecha_nacimiento = ?,
         peso_kg = ?, observaciones = ?
     WHERE id_mascota = ?`,
    [d.id_propietario, d.nombre, d.raza, d.sexo, d.fecha_nacimiento, d.peso_kg, d.observaciones, id]
  );
  if (resultado.affectedRows === 0) throw noEncontrado("Mascota");
  res.json({ success: true, data: await buscarPorId(id) });
}

export async function desactivar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);

  const [activas] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM reservaciones WHERE id_mascota = ? AND estado IN (?)`,
    [id, ESTADOS_ACTIVOS]
  );
  if (activas[0].total > 0) {
    throw new HttpError(409, "La mascota tiene reservaciones activas; cancelelas o finalicelas primero");
  }

  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE mascotas SET activo = FALSE WHERE id_mascota = ?`,
    [id]
  );
  if (resultado.affectedRows === 0) throw noEncontrado("Mascota");
  res.json({ success: true, data: await buscarPorId(id) });
}

export async function reactivar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const [resultado] = await pool.query<ResultSetHeader>(
    `UPDATE mascotas SET activo = TRUE WHERE id_mascota = ?`,
    [id]
  );
  if (resultado.affectedRows === 0) throw noEncontrado("Mascota");
  res.json({ success: true, data: await buscarPorId(id) });
}
