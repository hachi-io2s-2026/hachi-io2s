import { HttpError } from "../utils/httpError.js";

// Reglas de operacion de HACHI.
// Son SUPUESTOS DEL PROTOTIPO: ajustarlos cuando el equipo confirme las reglas reales.

export const REGLAS = {
  hospedaje: {
    // Una reserva de hospedaje debe cubrir entre 1 y 30 noches
    minNoches: 1,
    maxNoches: 30,
  },
  daycare: {
    // Horario de atencion del daycare (formato HH:mm)
    apertura: "07:00",
    cierre: "19:00",
    // Una reserva de daycare puede cubrir hasta 31 dias seguidos
    maxDias: 31,
  },
} as const;

// Estados de reservacion que ocupan cupo
export const ESTADOS_ACTIVOS = ["PENDIENTE", "CONFIRMADA", "EN_CURSO"] as const;

// Una solicitud hecha por el cliente desde el portal queda PENDIENTE hasta que el hotel
// la acepta o la rechaza. Mientras tanto no se registran entradas, ausencias ni pagos.
export function exigirSolicitudAceptada(r: { estado: string; origen: string }) {
  if (r.origen === "CLIENTE" && r.estado === "PENDIENTE") {
    throw new HttpError(
      409,
      "Esta reserva es una solicitud del cliente que todavia no fue aceptada. Aceptala primero."
    );
  }
}
