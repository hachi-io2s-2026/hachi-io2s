
import type { Request, Response } from "express";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { ahora, hoy } from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { enTransaccion } from "../utils/transaccion.js";
import { dia, idParams, textoOpcional } from "../utils/validacion.js";

const filtrosSchema = z.object({
  fecha: dia.optional(),
  estado: z.enum(["PROGRAMADO", "PRESENTE", "FINALIZADO", "AUSENTE"]).optional(),
});

const observacionesSchema = z.object({
  observaciones: textoOpcional(2000),
});

const SELECT_ASISTENCIA = `
  SELECT a.*, r.estado AS estado_reservacion,
    DATE_FORMAT(r.fecha_inicio, '%H:%i') AS hora_programada_entrada,
    DATE_FORMAT(r.fecha_fin, '%H:%i') AS hora_programada_salida,
    r.id_mascota, m.nombre AS mascota, m.raza,
    CONCAT(p.nombre, ' ', p.apellido) AS propietario, p.telefono AS telefono_propietario
  FROM asistencias_daycare a
  JOIN reservaciones r ON r.id_reservacion = a.id_reservacion
  JOIN mascotas m ON m.id_mascota = r.id_mascota
  JOIN propietarios p ON p.id_propietario = m.id_propietario`;

async function buscarPorId(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_ASISTENCIA} WHERE a.id_asistencia = ?`,
    [id]
  );
  if (!rows[0]) throw noEncontrado("Asistencia");
  return rows[0];
}

async function bloquearAsistencia(conn: PoolConnection, id: number) {
  const [[fila]] = await conn.query<RowDataPacket[]>(
    `SELECT a.id_asistencia, a.id_reservacion, a.fecha, a.estado, r.estado AS estado_reservacion
     FROM asistencias_daycare a
     JOIN reservaciones r ON r.id_reservacion = a.id_reservacion
     WHERE a.id_asistencia = ?
     FOR UPDATE`,
    [id]
  );
  if (!fila) throw noEncontrado("Asistencia");
  if (["CANCELADA", "FINALIZADA"].includes(fila.estado_reservacion)) {
    throw new HttpError(409, `La reservacion esta ${fila.estado_reservacion}`);
  }
  return fila;
}

// La reservacion se finaliza cuando ya no quedan dias por atender
async function finalizarSiCompleta(conn: PoolConnection, idReservacion: number) {
  const [[{ pendientes }]] = await conn.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS pendientes FROM asistencias_daycare
     WHERE id_reservacion = ? AND estado IN ('PROGRAMADO', 'PRESENTE')`,
    [idReservacion]
  );
  if (pendientes === 0) {
    await conn.query(
      `UPDATE reservaciones SET estado = 'FINALIZADA' WHERE id_reservacion = ?`,
      [idReservacion]
    );
  }
}

// Asistencias de un dia
export async function listar(req: Request, res: Response) {
  const f = filtrosSchema.parse(req.query);
  const condiciones = ["r.estado <> 'CANCELADA'", "a.fecha = ?"];
  const params: unknown[] = [f.fecha ?? hoy()];

  if (f.estado) {
    condiciones.push("a.estado = ?");
    params.push(f.estado);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_ASISTENCIA} WHERE ${condiciones.join(" AND ")}
     ORDER BY hora_programada_entrada, m.nombre`,
    params
  );
  res.json({ success: true, data: rows });
}

export async function registrarEntrada(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { observaciones } = observacionesSchema.parse(req.body ?? {});

  await enTransaccion(async (conn) => {
    const a = await bloquearAsistencia(conn, id);
    if (a.estado !== "PROGRAMADO") {
      throw new HttpError(409, `La asistencia ya esta ${a.estado}`);
    }
    if (a.fecha !== hoy()) {
      throw new HttpError(409, `Solo se puede registrar la entrada el dia ${a.fecha}`);
    }

    await conn.query(
      `UPDATE asistencias_daycare
       SET estado = 'PRESENTE', hora_entrada = ?, observaciones = COALESCE(?, observaciones)
       WHERE id_asistencia = ?`,
      [ahora(), observaciones, id]
    );
    await conn.query(
      `UPDATE reservaciones SET estado = 'EN_CURSO'
       WHERE id_reservacion = ? AND estado IN ('PENDIENTE', 'CONFIRMADA')`,
      [a.id_reservacion]
    );
  });

  res.json({ success: true, data: await buscarPorId(id) });
}

export async function registrarSalida(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { observaciones } = observacionesSchema.parse(req.body ?? {});

  await enTransaccion(async (conn) => {
    const a = await bloquearAsistencia(conn, id);
    if (a.estado !== "PRESENTE") {
      throw new HttpError(409, "Solo se puede registrar la salida de un perro presente");
    }

    await conn.query(
      `UPDATE asistencias_daycare
       SET estado = 'FINALIZADO', hora_salida = ?, observaciones = COALESCE(?, observaciones)
       WHERE id_asistencia = ?`,
      [ahora(), observaciones, id]
    );
    await finalizarSiCompleta(conn, a.id_reservacion);
  });

  res.json({ success: true, data: await buscarPorId(id) });
}

export async function registrarAusencia(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { observaciones } = observacionesSchema.parse(req.body ?? {});

  await enTransaccion(async (conn) => {
    const a = await bloquearAsistencia(conn, id);
    if (a.estado !== "PROGRAMADO") {
      throw new HttpError(409, `La asistencia ya esta ${a.estado}`);
    }
    if (a.fecha > hoy()) {
      throw new HttpError(409, "No se puede marcar ausencia en un dia futuro");
    }

    await conn.query(
      `UPDATE asistencias_daycare
       SET estado = 'AUSENTE', observaciones = COALESCE(?, observaciones)
       WHERE id_asistencia = ?`,
      [observaciones, id]
    );
    await finalizarSiCompleta(conn, a.id_reservacion);
  });

  res.json({ success: true, data: await buscarPorId(id) });
}
