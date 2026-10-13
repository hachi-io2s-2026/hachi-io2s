
import type { Request, Response } from "express";
import type { PoolConnection, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { exigirSolicitudAceptada } from "../config/reglas.js";
import { redondear } from "../services/reservas.js";
import { ahora, diaDe, diferenciaDias, hoy } from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { enTransaccion } from "../utils/transaccion.js";
import { dia, idParams, textoOpcional } from "../utils/validacion.js";
import { buscarDetalle } from "./reservaciones.js";

const filtrosSchema = z.object({
  estado: z.enum(["PENDIENTE", "HOSPEDADO", "FINALIZADO"]).optional(),
  fecha: dia.optional(),
});

const observacionesSchema = z.object({
  observaciones: textoOpcional(2000),
});

const SELECT_HOSPEDAJE = `
  SELECT h.*, r.fecha_inicio, r.fecha_fin, r.estado AS estado_reservacion,
    r.origen AS origen_reservacion, r.monto_total,
    r.id_mascota, m.nombre AS mascota, m.raza,
    CONCAT(p.nombre, ' ', p.apellido) AS propietario, p.telefono AS telefono_propietario
  FROM hospedajes h
  JOIN reservaciones r ON r.id_reservacion = h.id_reservacion
  JOIN mascotas m ON m.id_mascota = r.id_mascota
  JOIN propietarios p ON p.id_propietario = m.id_propietario`;

export async function listar(req: Request, res: Response) {
  const f = filtrosSchema.parse(req.query);
  const condiciones = ["r.estado <> 'CANCELADA'"];
  const params: unknown[] = [];

  if (f.estado) {
    condiciones.push("h.estado = ?");
    params.push(f.estado);
  }
  if (f.fecha) {
    condiciones.push("DATE(r.fecha_inicio) <= ? AND DATE(r.fecha_fin) >= ?");
    params.push(f.fecha, f.fecha);
  }

  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_HOSPEDAJE} WHERE ${condiciones.join(" AND ")} ORDER BY r.fecha_inicio LIMIT 500`,
    params
  );
  res.json({ success: true, data: rows });
}

async function bloquearHospedaje(conn: PoolConnection, id: number) {
  const [[fila]] = await conn.query<RowDataPacket[]>(
    `SELECT h.id_hospedaje, h.id_reservacion, h.estado, r.estado AS estado_reservacion,
       r.origen, r.fecha_inicio, r.fecha_fin, r.monto_total, t.precio AS precio_unitario
     FROM hospedajes h
     JOIN reservaciones r ON r.id_reservacion = h.id_reservacion
     JOIN tarifas t ON t.id_tarifa = r.id_tarifa
     WHERE h.id_hospedaje = ?
     FOR UPDATE`,
    [id]
  );
  if (!fila) throw noEncontrado("Hospedaje");
  return fila;
}

// Check-in: el perro ingresa al hotel
export async function registrarEntrada(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { observaciones } = observacionesSchema.parse(req.body ?? {});

  const idReservacion = await enTransaccion(async (conn) => {
    const h = await bloquearHospedaje(conn, id);

    if (h.estado !== "PENDIENTE") {
      throw new HttpError(409, `El hospedaje ya esta ${h.estado}`);
    }
    if (!["PENDIENTE", "CONFIRMADA"].includes(h.estado_reservacion)) {
      throw new HttpError(409, `La reservacion esta ${h.estado_reservacion}`);
    }
    exigirSolicitudAceptada({ estado: h.estado_reservacion, origen: h.origen });
    const diaHoy = hoy();
    if (diaHoy < diaDe(h.fecha_inicio)) {
      throw new HttpError(409, `La reservacion inicia el ${diaDe(h.fecha_inicio)}`);
    }
    if (diaHoy >= diaDe(h.fecha_fin)) {
      throw new HttpError(409, "La fecha de salida de la reservacion ya paso");
    }

    await conn.query(
      `UPDATE hospedajes
       SET estado = 'HOSPEDADO', fecha_entrada = ?, observaciones = COALESCE(?, observaciones)
       WHERE id_hospedaje = ?`,
      [ahora(), observaciones, id]
    );
    await conn.query(
      `UPDATE reservaciones SET estado = 'EN_CURSO' WHERE id_reservacion = ?`,
      [h.id_reservacion]
    );
    return h.id_reservacion;
  });

  res.json({ success: true, data: await buscarDetalle(idReservacion) });
}

// Check-out: el perro sale del hotel.
// Si sale despues del dia reservado, se cobran las noches extra con la misma tarifa.
// Si sale antes, se mantiene el monto reservado.
export async function registrarSalida(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const { observaciones } = observacionesSchema.parse(req.body ?? {});

  const resultado = await enTransaccion(async (conn) => {
    const h = await bloquearHospedaje(conn, id);

    if (h.estado !== "HOSPEDADO") {
      throw new HttpError(409, "Solo se puede registrar la salida de un perro hospedado");
    }

    const salida = ahora();
    const nochesExtra = Math.max(0, diferenciaDias(diaDe(h.fecha_fin), hoy()));
    const cargoExtra = redondear(nochesExtra * h.precio_unitario);

    await conn.query(
      `UPDATE hospedajes
       SET estado = 'FINALIZADO', fecha_salida = ?, observaciones = COALESCE(?, observaciones)
       WHERE id_hospedaje = ?`,
      [salida, observaciones, id]
    );
    await conn.query(
      `UPDATE reservaciones
       SET estado = 'FINALIZADA',
           monto_total = monto_total + ?,
           fecha_fin = IF(? > 0, ?, fecha_fin)
       WHERE id_reservacion = ?`,
      [cargoExtra, nochesExtra, salida, h.id_reservacion]
    );

    return { idReservacion: h.id_reservacion, nochesExtra, cargoExtra };
  });

  const reserva = await buscarDetalle(resultado.idReservacion);
  res.json({
    success: true,
    data: {
      ...reserva,
      cobro_salida: {
        noches_extra: resultado.nochesExtra,
        cargo_extra: resultado.cargoExtra,
        monto_total: reserva.monto_total,
        total_pagado: reserva.total_pagado,
        saldo: reserva.saldo,
      },
    },
  });
}
