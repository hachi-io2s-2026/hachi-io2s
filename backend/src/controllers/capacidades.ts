
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { obtenerServicio } from "../services/reservas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { dia, id, idParams } from "../utils/validacion.js";

const crearSchema = z.object({
  id_servicio: id,
  capacidad_maxima: z.coerce.number().int().positive().max(1000),
  fecha_inicio_vigencia: dia,
  fecha_fin_vigencia: dia.nullish().transform((v) => v ?? null),
});

const actualizarSchema = z.object({
  capacidad_maxima: z.coerce.number().int().positive().max(1000).optional(),
  fecha_fin_vigencia: dia.nullish(),
});

const filtrosSchema = z.object({ id_servicio: id.optional() });

const SELECT_CAPACIDAD = `
  SELECT c.*, s.nombre AS servicio, s.tipo
  FROM capacidades c JOIN servicios s ON s.id_servicio = c.id_servicio`;

async function buscarPorId(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_CAPACIDAD} WHERE c.id_capacidad = ?`,
    [id]
  );
  if (!rows[0]) throw noEncontrado("Capacidad");
  return rows[0];
}

function validarVigencia(inicio: string, fin: string | null) {
  if (fin !== null && fin < inicio) {
    throw new HttpError(400, "El fin de vigencia no puede ser anterior al inicio");
  }
}

export async function listar(req: Request, res: Response) {
  const { id_servicio } = filtrosSchema.parse(req.query);
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_CAPACIDAD} ${id_servicio ? "WHERE c.id_servicio = ?" : ""}
     ORDER BY c.id_servicio, c.fecha_inicio_vigencia DESC`,
    id_servicio ? [id_servicio] : []
  );
  res.json({ success: true, data: rows });
}

// Si la nueva capacidad reduce cupos, las reservas existentes se respetan;
// solo las reservas nuevas se validan contra la nueva capacidad.
export async function crear(req: Request, res: Response) {
  const d = crearSchema.parse(req.body);
  validarVigencia(d.fecha_inicio_vigencia, d.fecha_fin_vigencia);
  await obtenerServicio(pool, d.id_servicio);

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO capacidades (id_servicio, capacidad_maxima, fecha_inicio_vigencia, fecha_fin_vigencia)
     VALUES (?, ?, ?, ?)`,
    [d.id_servicio, d.capacidad_maxima, d.fecha_inicio_vigencia, d.fecha_fin_vigencia]
  );
  res.status(201).json({ success: true, data: await buscarPorId(resultado.insertId) });
}

export async function actualizar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const d = actualizarSchema.parse(req.body);
  const actual = await buscarPorId(id);

  const capacidad_maxima = d.capacidad_maxima ?? actual.capacidad_maxima;
  const fecha_fin_vigencia =
    d.fecha_fin_vigencia === undefined ? actual.fecha_fin_vigencia : d.fecha_fin_vigencia;
  validarVigencia(actual.fecha_inicio_vigencia, fecha_fin_vigencia);

  await pool.query(
    `UPDATE capacidades SET capacidad_maxima = ?, fecha_fin_vigencia = ? WHERE id_capacidad = ?`,
    [capacidad_maxima, fecha_fin_vigencia, id]
  );
  res.json({ success: true, data: await buscarPorId(id) });
}
