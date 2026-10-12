
// Error con codigo HTTP que el manejador de errores convierte en respuesta JSON
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public detalles?: unknown
  ) {
    super(message);
  }
}

export const noEncontrado = (recurso: string) =>
  new HttpError(404, `${recurso} no encontrado(a)`);
