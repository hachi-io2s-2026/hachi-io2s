
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { obtenerServicio, unidadDe } from "../services/reservas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { dia, id, idParams, textoRequerido } from "../utils/validacion.js";

const crearSchema = z.object({
  id_servicio: id,
  nombre: textoRequerido(100),
  precio: z.coerce.number().min(0).max(99_999_999),
  fecha_inicio_vigencia: dia,
  fecha_fin_vigencia: dia.nullish().transform((v) => v ?? null),
});

const actualizarSchema = z.object({
  nombre: textoRequerido(100).optional(),
  precio: z.coerce.number().min(0).max(99_999_999).optional(),
  fecha_fin_vigencia: dia.nullish(),
  activo: z.boolean().optional(),
});

const filtrosSchema = z.object({ id_servicio: id.optional() });

const SELECT_TARIFA = `
  SELECT t.*, s.nombre AS servicio, s.tipo
  FROM tarifas t JOIN servicios s ON s.id_servicio = t.id_servicio`;

async function buscarPorId(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(`${SELECT_TARIFA} WHERE t.id_tarifa = ?`, [id]);
  if (!rows[0]) throw noEncontrado("Tarifa");
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
    `${SELECT_TARIFA} ${id_servicio ? "WHERE t.id_servicio = ?" : ""}
     ORDER BY t.id_servicio, t.fecha_inicio_vigencia DESC`,
    id_servicio ? [id_servicio] : []
  );
  res.json({ success: true, data: rows });
}

export async function crear(req: Request, res: Response) {
  const d = crearSchema.parse(req.body);
  validarVigencia(d.fecha_inicio_vigencia, d.fecha_fin_vigencia);
  const servicio = await obtenerServicio(pool, d.id_servicio);

  const [resultado] = await pool.query<ResultSetHeader>(
    `INSERT INTO tarifas (id_servicio, nombre, precio, unidad, fecha_inicio_vigencia, fecha_fin_vigencia)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [d.id_servicio, d.nombre, d.precio, unidadDe(servicio.tipo), d.fecha_inicio_vigencia, d.fecha_fin_vigencia]
  );
  res.status(201).json({ success: true, data: await buscarPorId(resultado.insertId) });
}


export async function actualizar(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const d = actualizarSchema.parse(req.body);
  const actual = await buscarPorId(id);

  const cambios = {
    nombre: d.nombre ?? actual.nombre,
    precio: d.precio ?? actual.precio,
    fecha_fin_vigencia:
      d.fecha_fin_vigencia === undefined ? actual.fecha_fin_vigencia : d.fecha_fin_vigencia,
    activo: d.activo ?? actual.activo,
  };
  validarVigencia(actual.fecha_inicio_vigencia, cambios.fecha_fin_vigencia);

  await pool.query(
    `UPDATE tarifas SET nombre = ?, precio = ?, fecha_fin_vigencia = ?, activo = ? WHERE id_tarifa = ?`,
    [cambios.nombre, cambios.precio, cambios.fecha_fin_vigencia, cambios.activo, id]
  );
  res.json({ success: true, data: await buscarPorId(id) });
}
