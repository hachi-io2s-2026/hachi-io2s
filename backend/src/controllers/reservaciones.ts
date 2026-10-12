
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import type { EstadoReservacion } from "../models/reservacion.js";
import {
  cotizar,
  diasOcupados,
  redondear,
  reservaQueSeCruza,
} from "../services/reservas.js";
import { diaDe, hoy } from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { enTransaccion } from "../utils/transaccion.js";
import { dia, fechaHora, id, idParams, textoOpcional } from "../utils/validacion.js";

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "EN_CURSO", "FINALIZADA", "CANCELADA"] as const;

const cotizacionSchema = z.object({
  id_servicio: id,
  fecha_inicio: fechaHora,
  fecha_fin: fechaHora,
  id_mascota: id.optional(),
});

const crearSchema = z.object({
  id_mascota: id,
  id_servicio: id,
  fecha_inicio: fechaHora,
  fecha_fin: fechaHora,
  observaciones: textoOpcional(2000),
});

const filtrosSchema = z.object({
  estado: z.enum(ESTADOS).optional(),
  id_servicio: id.optional(),
  id_mascota: id.optional(),
  id_propietario: id.optional(),
  desde: dia.optional(),
  hasta: dia.optional(),
  q: z.string().trim().optional(),
});

const estadoSchema = z.object({
  estado: z.enum(["CONFIRMADA", "CANCELADA"]),
});

const TRANSICIONES: Record<"CONFIRMADA" | "CANCELADA", EstadoReservacion[]> = {
  CONFIRMADA: ["PENDIENTE"],
  CANCELADA: ["PENDIENTE", "CONFIRMADA"],
};

export const SELECT_RESERVACION = `
  SELECT r.*,
    m.nombre AS mascota, m.raza,
    p.id_propietario, CONCAT(p.nombre, ' ', p.apellido) AS propietario,
    p.telefono AS telefono_propietario,
    s.nombre AS servicio, s.tipo,
    t.nombre AS tarifa, t.precio AS precio_unitario, t.unidad,
    COALESCE((SELECT SUM(pg.monto) FROM pagos pg
              WHERE pg.id_reservacion = r.id_reservacion AND pg.estado = 'PAGADO'), 0)
      AS total_pagado
  FROM reservaciones r
  JOIN mascotas m ON m.id_mascota = r.id_mascota
  JOIN propietarios p ON p.id_propietario = m.id_propietario
  JOIN servicios s ON s.id_servicio = r.id_servicio
  JOIN tarifas t ON t.id_tarifa = r.id_tarifa`;

export function conResumen(fila: RowDataPacket): RowDataPacket & {
  monto_total: number;
  total_pagado: number;
  saldo: number;
  unidades: number;
} {
  const total_pagado = Number(fila.total_pagado);
  return {
    ...fila,
    monto_total: Number(fila.monto_total),
    total_pagado,
    saldo: redondear(fila.monto_total - total_pagado),
    unidades: diasOcupados(fila.tipo, fila.fecha_inicio, fila.fecha_fin).length,
  };
}

export async function buscarDetalle(id: number) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_RESERVACION} WHERE r.id_reservacion = ?`,
    [id]
  );
  if (!rows[0]) throw noEncontrado("Reservacion");
  const reserva = conResumen(rows[0]);

  const [[hospedaje]] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM hospedajes WHERE id_reservacion = ?`,
    [id]
  );
  const [asistencias] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM asistencias_daycare WHERE id_reservacion = ? ORDER BY fecha`,
    [id]
  );
  const [pagos] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM pagos WHERE id_reservacion = ? ORDER BY fecha_creacion`,
    [id]
  );

  return { ...reserva, hospedaje: hospedaje ?? null, asistencias, pagos };
}

export async function listar(req: Request, res: Response) {
  const f = filtrosSchema.parse(req.query);
  const condiciones: string[] = [];
  const params: unknown[] = [];

  if (f.estado) {
    condiciones.push("r.estado = ?");
    params.push(f.estado);
  }
  if (f.id_servicio) {
    condiciones.push("r.id_servicio = ?");
    params.push(f.id_servicio);
  }
  if (f.id_mascota) {
    condiciones.push("r.id_mascota = ?");
    params.push(f.id_mascota);
  }
  if (f.id_propietario) {
    condiciones.push("p.id_propietario = ?");
    params.push(f.id_propietario);
  }
  // Reservas que se cruzan con el rango [desde, hasta]
  if (f.desde) {
    condiciones.push("DATE(r.fecha_fin) >= ?");
    params.push(f.desde);
  }
  if (f.hasta) {
    condiciones.push("DATE(r.fecha_inicio) <= ?");
    params.push(f.hasta);
  }
  if (f.q) {
    condiciones.push("(m.nombre LIKE ? OR CONCAT(p.nombre, ' ', p.apellido) LIKE ?)");
    params.push(`%${f.q}%`, `%${f.q}%`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(" AND ")}` : "";
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_RESERVACION} ${where} ORDER BY r.fecha_inicio DESC LIMIT 500`,
    params
  );
  res.json({ success: true, data: rows.map(conResumen) });
}

export async function obtener(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ success: true, data: await buscarDetalle(id) });
}

export async function cotizacion(req: Request, res: Response) {
  const d = cotizacionSchema.parse(req.body);
  const resultado = await cotizar(pool, d);
  const cruce = d.id_mascota
    ? await reservaQueSeCruza(pool, d.id_mascota, d.fecha_inicio, d.fecha_fin)
    : null;

  res.json({ success: true, data: { ...resultado, cruce } });
}

export async function crear(req: Request, res: Response) {
  const d = crearSchema.parse(req.body);

  if (diaDe(d.fecha_inicio) < hoy()) {
    throw new HttpError(400, "No se pueden crear reservaciones en fechas pasadas");
  }

  const idReservacion = await enTransaccion(async (conn) => {
    const cot = await cotizar(conn, d, true);

    const [[mascota]] = await conn.query<RowDataPacket[]>(
      `SELECT id_mascota, activo FROM mascotas WHERE id_mascota = ? FOR UPDATE`,
      [d.id_mascota]
    );
    if (!mascota) throw noEncontrado("Mascota");
    if (!mascota.activo) throw new HttpError(400, "La mascota esta inactiva");

    const cruce = await reservaQueSeCruza(conn, d.id_mascota, d.fecha_inicio, d.fecha_fin);
    if (cruce) {
      throw new HttpError(
        409,
        `La mascota ya tiene la reservacion #${cruce.id_reservacion} (${cruce.servicio}) en esas fechas`,
        { cruce }
      );
    }

    if (!cot.disponible) {
      const sinCupo = cot.dias.filter((x) => x.disponibles <= 0).map((x) => x.fecha);
      throw new HttpError(409, `No hay cupo disponible para: ${sinCupo.join(", ")}`, {
        dias: cot.dias,
      });
    }

    const [resultado] = await conn.query<ResultSetHeader>(
      `INSERT INTO reservaciones
         (id_mascota, id_servicio, id_tarifa, fecha_inicio, fecha_fin, monto_total, observaciones)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        d.id_mascota,
        d.id_servicio,
        cot.tarifa.id_tarifa,
        d.fecha_inicio,
        d.fecha_fin,
        cot.monto_total,
        d.observaciones,
      ]
    );
    const nuevaId = resultado.insertId;

    if (cot.servicio.tipo === "HOSPEDAJE") {
      await conn.query(`INSERT INTO hospedajes (id_reservacion) VALUES (?)`, [nuevaId]);
    } else {
      await conn.query(`INSERT INTO asistencias_daycare (id_reservacion, fecha) VALUES ?`, [
        cot.dias.map((x) => [nuevaId, x.fecha]),
      ]);
    }

    return nuevaId;
  });

  res.status(201).json({ success: true, data: await buscarDetalle(idReservacion) });
}

export async function cambiarEstado(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { estado } = estadoSchema.parse(req.body);

  await enTransaccion(async (conn) => {
    const [[reserva]] = await conn.query<RowDataPacket[]>(
      `SELECT estado FROM reservaciones WHERE id_reservacion = ? FOR UPDATE`,
      [id]
    );
    if (!reserva) throw noEncontrado("Reservacion");

    if (!TRANSICIONES[estado].includes(reserva.estado)) {
      throw new HttpError(
        409,
        `No se puede cambiar una reservacion ${reserva.estado} a ${estado}`
      );
    }

    await conn.query(`UPDATE reservaciones SET estado = ? WHERE id_reservacion = ?`, [estado, id]);
  });

  res.json({ success: true, data: await buscarDetalle(id) });
}
