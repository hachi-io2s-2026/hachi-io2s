import type { EstadoReservacion, Reservacion } from '../api/tipos'
import { fecha, hora } from '../utils/formato'

type Datos = Pick<Reservacion, 'estado' | 'fecha_inicio' | 'tipo' | 'motivo_rechazo'>

// Estado que ve el cliente: una solicitud cancelada por el hotel con motivo se muestra como rechazada
export const estadoCliente = (r: Pick<Reservacion, 'estado' | 'motivo_rechazo'>) =>
  r.estado === 'CANCELADA' && r.motivo_rechazo ? 'RECHAZADA' : r.estado

// Explicacion del estado de una reserva, escrita para el cliente
export function explicacionEstado(r: Datos): string {
  if (r.estado === 'CANCELADA' && r.motivo_rechazo) {
    return `El hotel no pudo aceptar tu solicitud. Motivo: ${r.motivo_rechazo}`
  }
  const textos: Record<EstadoReservacion, string> = {
    PENDIENTE: 'Recibimos tu solicitud. El hotel la revisará y te la confirmará pronto.',
    CONFIRMADA: `¡Reserva confirmada! Te esperamos el ${fecha(r.fecha_inicio)} a las ${hora(r.fecha_inicio)}.`,
    EN_CURSO: r.tipo === 'HOSPEDAJE' ? 'Tu perro está hospedado con nosotros.' : 'Tu perro tiene daycare en curso.',
    FINALIZADA: 'Estancia finalizada. ¡Gracias por confiar en HACHI!',
    CANCELADA: 'Esta reserva fue cancelada.',
  }
  return textos[r.estado]
}
