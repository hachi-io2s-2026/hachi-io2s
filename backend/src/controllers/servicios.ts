
import type { Request, Response } from "express";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database.js";
import { REGLAS } from "../config/reglas.js";
import { capacidadPorDia, tarifaVigente, unidadDe } from "../services/reservas.js";
import { hoy } from "../utils/fechas.js";

// Servicios con su tarifa y capacidad vigentes hoy
export async function listar(_req: Request, res: Response) {
  const [servicios] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM servicios ORDER BY id_servicio`
  );
  const dia = hoy();

  const data = await Promise.all(
    servicios.map(async (s) => ({
      ...s,
      tarifa_vigente: await tarifaVigente(pool, s.id_servicio, dia, unidadDe(s.tipo)),
      capacidad_vigente: (await capacidadPorDia(pool, s.id_servicio, [dia])).get(dia) ?? null,
    }))
  );
  res.json({ success: true, data, reglas: REGLAS });
}
