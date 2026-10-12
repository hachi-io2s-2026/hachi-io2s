import type { EstadoReservacion, Reservacion } from '../api/tipos'
import { fecha, hora } from '../utils/formato'

// Explicacion del estado de una reserva, escrita para el cliente
export function explicacionEstado(r: Pick<Reservacion, 'estado' | 'fecha_inicio' | 'tipo'>): string {
  const textos: Record<EstadoReservacion, string> = {
    PENDIENTE: 'Recibimos tu solicitud. El hotel la revisará y te la confirmará pronto.',
    CONFIRMADA: `¡Reserva confirmada! Te esperamos el ${fecha(r.fecha_inicio)} a las ${hora(r.fecha_inicio)}.`,
    EN_CURSO: r.tipo === 'HOSPEDAJE' ? 'Tu perro está hospedado con nosotros.' : 'Tu perro tiene daycare en curso.',
    FINALIZADA: 'Estancia finalizada. ¡Gracias por confiar en HACHI!',
    CANCELADA: 'Esta reserva fue cancelada.',
  }
  return textos[r.estado]
}
