
import { z } from "zod";
import { esDiaValido, normalizarFechaHora } from "./fechas.js";

// Mensajes de validacion en espanol
z.config(z.locales.es());

export const id = z.coerce.number().int().positive();

export const idParams = z.object({ id });

export const dia = z
  .string()
  .trim()
  .refine(esDiaValido, "Fecha invalida, use el formato YYYY-MM-DD");

export const fechaHora = z
  .string()
  .transform((valor, ctx) => {
    const normalizada = normalizarFechaHora(valor);
    if (!normalizada) {
      ctx.addIssue({
        code: "custom",
        message: "Fecha y hora invalidas, use el formato YYYY-MM-DDTHH:mm",
      });
      return z.NEVER;
    }
    return normalizada;
  });

// Texto opcional: "" o null se guardan como NULL
export const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((valor) => (valor ? valor : null));

export const textoRequerido = (max: number) => z.string().trim().min(1).max(max);
