import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { Reservacion, ReservacionDetalle } from '../../api/tipos'
import { Aviso, Campo, Modal } from '../ui'

// Motivos frecuentes para no tener que escribirlos cada vez (se pueden editar)
const SUGERENCIAS = [
  'No tenemos personal disponible para esas fechas.',
  'Necesitamos el carné de vacunación al día de tu perro.',
  'Tu perro necesita una evaluación previa antes de hospedarse.',
]

// Rechaza una solicitud hecha desde el portal. El motivo es obligatorio y el cliente lo ve en su cuenta.
export default function ModalRechazo({
  reserva,
  onCerrar,
  onRechazada,
}: {
  reserva: Pick<Reservacion, 'id_reservacion' | 'mascota' | 'propietario'> | null
  onCerrar: () => void
  onRechazada: (d: ReservacionDetalle) => void
}) {
  const [motivo, setMotivo] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const valido = motivo.trim().length >= 5

  const cerrar = () => {
    if (enviando) return
    setMotivo('')
    setError(null)
    onCerrar()
  }

  const rechazar = async (e: FormEvent) => {
    e.preventDefault()
    if (!reserva || !valido) return
    setEnviando(true)
    setError(null)
    try {
      const d = await api<ReservacionDetalle>(`/reservaciones/${reserva.id_reservacion}/estado`, {
        method: 'PATCH',
        body: { estado: 'CANCELADA', motivo: motivo.trim() },
      })
      setMotivo('')
      onRechazada(d)
      onCerrar()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo="Rechazar solicitud"
      abierto={reserva !== null}
      onCerrar={cerrar}
      ancho={500}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={cerrar} disabled={enviando}>
            Volver
          </button>
          <button type="submit" form="form-rechazo" className="boton boton-peligro" disabled={enviando || !valido}>
            {enviando ? 'Rechazando…' : 'Rechazar solicitud'}
          </button>
        </>
      }
    >
      <form id="form-rechazo" className="form-rechazo" onSubmit={rechazar}>
        <p className="confirmar-mensaje">
          La solicitud de <strong>{reserva?.mascota}</strong> ({reserva?.propietario}) se rechazará y su cupo quedará libre.{' '}
          <strong>{reserva?.propietario?.split(' ')[0]} verá este motivo en su cuenta.</strong>
        </p>
        <Campo etiqueta="Motivo del rechazo" ayuda="Escríbelo con amabilidad; mínimo 5 caracteres." ancho="completo">
          <textarea
            rows={4}
            maxLength={500}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ej.: Esas fechas ya tenemos el hotel lleno. ¿Te funciona la semana siguiente?"
            required
          />
        </Campo>
        <div className="sugerencias-motivo" aria-label="Motivos frecuentes">
          {SUGERENCIAS.map((s) => (
            <button key={s} type="button" className="chip-sugerencia" onClick={() => setMotivo(s)}>
              {s}
            </button>
          ))}
        </div>
        {error && <Aviso>{error}</Aviso>}
      </form>
    </Modal>
  )
}
