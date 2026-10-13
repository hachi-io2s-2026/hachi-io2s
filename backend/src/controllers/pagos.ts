
import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { exigirSolicitudAceptada } from "../config/reglas.js";
import { redondear } from "../services/reservas.js";
import { ahora } from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { enTransaccion } from "../utils/transaccion.js";
import { id, idParams, textoOpcional } from "../utils/validacion.js";
import { buscarDetalle } from "./reservaciones.js";

const crearSchema = z.object({
  id_reservacion: id,
  monto: z.coerce.number().positive().max(99_999_999),
  metodo_pago: z.enum(["EFECTIVO", "TARJETA", "TRANSFERENCIA"]),
  observaciones: textoOpcional(2000),
});

const filtrosSchema = z.object({ id_reservacion: id.optional() });

export async function listar(req: Request, res: Response) {
  const { id_reservacion } = filtrosSchema.parse(req.query);
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM pagos ${id_reservacion ? "WHERE id_reservacion = ?" : ""}
     ORDER BY fecha_creacion DESC LIMIT 500`,
    id_reservacion ? [id_reservacion] : []
  );
  res.json({ success: true, data: rows });
}

// Registra un pago recibido. No se permite pagar mas que el saldo pendiente.
export async function crear(req: Request, res: Response) {
  const d = crearSchema.parse(req.body);

  await enTransaccion(async (conn) => {
    const [[reserva]] = await conn.query<RowDataPacket[]>(
      `SELECT estado, origen, monto_total FROM reservaciones WHERE id_reservacion = ? FOR UPDATE`,
      [d.id_reservacion]
    );
    if (!reserva) throw noEncontrado("Reservacion");
    if (reserva.estado === "CANCELADA") {
      throw new HttpError(409, "No se pueden registrar pagos en una reservacion cancelada");
    }
    exigirSolicitudAceptada(reserva as { estado: string; origen: string });

    const [[{ pagado }]] = await conn.query<RowDataPacket[]>(
      `SELECT COALESCE(SUM(monto), 0) AS pagado FROM pagos
       WHERE id_reservacion = ? AND estado = 'PAGADO'`,
      [d.id_reservacion]
    );
    const saldo = redondear(reserva.monto_total - Number(pagado));
    if (d.monto > saldo) {
      throw new HttpError(409, `El monto supera el saldo pendiente (Q${saldo.toFixed(2)})`);
    }

    await conn.query(
      `INSERT INTO pagos (id_reservacion, monto, metodo_pago, estado, fecha_pago, observaciones)
       VALUES (?, ?, ?, 'PAGADO', ?, ?)`,
      [d.id_reservacion, redondear(d.monto), d.metodo_pago, ahora(), d.observaciones]
    );
  });

  res.status(201).json({ success: true, data: await buscarDetalle(d.id_reservacion) });
}

export async function anular(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);

  const idReservacion = await enTransaccion(async (conn) => {
    const [[pago]] = await conn.query<RowDataPacket[]>(
      `SELECT id_reservacion, estado FROM pagos WHERE id_pago = ? FOR UPDATE`,
      [id]
    );
    if (!pago) throw noEncontrado("Pago");
    if (pago.estado === "ANULADO") throw new HttpError(409, "El pago ya esta anulado");

    await conn.query(`UPDATE pagos SET estado = 'ANULADO' WHERE id_pago = ?`, [id]);
    return pago.id_reservacion as number;
  });

  res.json({ success: true, data: await buscarDetalle(idReservacion) });
}
