import { useState, type FormEvent } from 'react'
import { IconoFlecha } from './Iconos'
import './BuscadorEstancia.css'

type Tipo = 'HOSPEDAJE' | 'DAYCARE'

const pad = (n: number) => String(n).padStart(2, '0')

function hoy() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// Dias calendario entre dos fechas "YYYY-MM-DD"
function diferenciaDias(desde: string, hasta: string) {
  const a = Date.UTC(+desde.slice(0, 4), +desde.slice(5, 7) - 1, +desde.slice(8, 10))
  const b = Date.UTC(+hasta.slice(0, 4), +hasta.slice(5, 7) - 1, +hasta.slice(8, 10))
  return Math.round((b - a) / 86_400_000)
}

// Mismas reglas que valida el backend (backend/src/config/reglas.ts)
function resumen(tipo: Tipo, entrada: string, salida: string) {
  if (!entrada || !salida) return null
  const dias = diferenciaDias(entrada, salida)

  if (tipo === 'HOSPEDAJE') {
    if (dias < 1) return { error: 'La salida debe ser al menos un día después de la entrada.' }
    if (dias > 30) return { error: 'El hospedaje puede ser de hasta 30 noches.' }
    return { texto: `${dias} ${dias === 1 ? 'noche' : 'noches'} de hospedaje` }
  }

  if (dias < 0) return { error: 'El último día no puede ser antes del primero.' }
  if (dias + 1 > 31) return { error: 'El daycare puede reservarse hasta 31 días seguidos.' }
  return { texto: `${dias + 1} ${dias === 0 ? 'día' : 'días'} de daycare` }
}

interface Props {
  onContinuar?: () => void
}

export default function BuscadorEstancia({ onContinuar }: Props) {
  const [tipo, setTipo] = useState<Tipo>('HOSPEDAJE')
  const [entrada, setEntrada] = useState('')
  const [salida, setSalida] = useState('')

  const minimo = hoy()
  const estado = resumen(tipo, entrada, salida)
  const esHotel = tipo === 'HOSPEDAJE'

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    onContinuar?.()
  }

  return (
    <form className="buscador" onSubmit={enviar} aria-label="Consultar estancia">
      <div className="buscador-tabs" role="radiogroup" aria-label="Servicio">
        {(
          [
            ['HOSPEDAJE', 'Hotel'],
            ['DAYCARE', 'Daycare'],
          ] as const
        ).map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            role="radio"
            aria-checked={tipo === valor}
            className={`buscador-tab ${tipo === valor ? 'activo' : ''}`}
            onClick={() => setTipo(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <div className="buscador-campos">
        <label>
          <span>{esHotel ? 'Entrada' : 'Primer día'}</span>
          <input
            type="date"
            min={minimo}
            value={entrada}
            onChange={(e) => setEntrada(e.target.value)}
          />
        </label>
        <label>
          <span>{esHotel ? 'Salida' : 'Último día'}</span>
          <input
            type="date"
            min={entrada || minimo}
            value={salida}
            onChange={(e) => setSalida(e.target.value)}
          />
        </label>
        <button type="submit" className="boton boton-negro buscador-boton">
          Consultar disponibilidad
          <IconoFlecha width={18} height={18} />
        </button>
      </div>

      <p className={`buscador-resumen ${estado?.error ? 'error' : ''}`} aria-live="polite">
        {estado?.error ??
          estado?.texto ??
          (esHotel
            ? 'Elige las fechas de entrada y salida de tu perro.'
            : 'Elige los días de daycare. Horario de 07:00 a 19:00.')}
        {estado?.texto && ' · La disponibilidad y el precio se confirman en el sistema.'}
      </p>
    </form>
  )
}
