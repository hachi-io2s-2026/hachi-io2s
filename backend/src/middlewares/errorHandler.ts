
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { HttpError } from "../utils/httpError.js";

// Errores de MySQL que se pueden explicar al usuario
const ERRORES_MYSQL: Record<string, [number, string]> = {
  ER_DUP_ENTRY: [409, "Ya existe un registro con esos datos"],
  ER_NO_REFERENCED_ROW_2: [400, "Uno de los registros relacionados no existe"],
  ER_ROW_IS_REFERENCED_2: [409, "No se puede eliminar: el registro esta en uso"],
  ER_CHECK_CONSTRAINT_VIOLATED: [400, "Los datos no cumplen las reglas de la base de datos"],
};

export function rutaNoEncontrada(req: Request, _res: Response) {
  throw new HttpError(404, `Ruta no encontrada: ${req.method} ${req.originalUrl}`);
}

export function manejarErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: "Datos invalidos",
      errores: error.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensaje: issue.message,
      })),
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      success: false,
      message: error.message,
      detalles: error.detalles,
    });
    return;
  }

  const codigo = (error as { code?: string })?.code;
  if (codigo && ERRORES_MYSQL[codigo]) {
    const [status, message] = ERRORES_MYSQL[codigo];
    res.status(status).json({ success: false, message });
    return;
  }

  // JSON mal formado en el cuerpo de la solicitud
  if ((error as { type?: string })?.type === "entity.parse.failed") {
    res.status(400).json({ success: false, message: "JSON invalido" });
    return;
  }

  console.error(error);
  res.status(500).json({ success: false, message: "Error interno del servidor" });
}
