import type { Request, Response } from "express";
import { z } from "zod";
import { dia } from "../utils/validacion.js";
import { generarReportes } from "../services/reportes.service.js";
const costo = z.number().finite().min(0).max(1e7);
export const filtrosReportes = z
  .object({
    desde: dia,
    hasta: dia,
    servicio: z.enum(["TODOS", "HOSPEDAJE", "DAYCARE"]).default("TODOS"),
    agrupacion: z.enum(["MES", "SEMANA"]).default("MES"),
    cv1: costo.default(50),
    cv2: costo.default(25),
    fijos: costo.default(10000),
    a1: z.number().min(0.01).max(24).default(2),
    a2: z.number().min(0.01).max(24).default(1),
    horas: z.number().min(0).max(10000).default(24),
    pertServicio: z.enum(["HOSPEDAJE", "DAYCARE"]).default("DAYCARE"),
    pesos: z
      .array(z.number().min(0.01).max(100))
      .length(6)
      .default([5, 5, 35, 35, 15, 5]),
  })
  .refine((f) => f.hasta >= f.desde, "El rango está invertido")
  .refine(
    (f) => (Date.parse(f.hasta) - Date.parse(f.desde)) / 86400000 <= 365,
    "Seleccione como máximo 366 días",
  );
export async function suite(req: Request, res: Response) {
  const f = filtrosReportes.parse(req.body);
  if (f.servicio !== "TODOS") f.pertServicio = f.servicio;
  res.json({ success: true, data: await generarReportes(f) });
}
