import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { Mascota, Sexo } from '../../api/tipos'
import { hoy } from '../../utils/formato'
import { Aviso, Campo, Modal } from '../ui'

type MascotaEditable = Pick<
  Mascota,
  'id_mascota' | 'nombre' | 'raza' | 'sexo' | 'fecha_nacimiento' | 'peso_kg' | 'observaciones'
>

interface Props {
  abierto: boolean
  // En el portal del cliente no hace falta: el backend usa el dueno de la sesion
  idPropietario?: number
  // "/mascotas" en el panel; "/cliente/mascotas" en el portal
  rutaBase?: string
  inicial?: MascotaEditable | null
  onCerrar: () => void
  onGuardado: () => void
}

export default function FormMascota(props: Props) {
  if (!props.abierto) return null
  return <Formulario {...props} />
}

function Formulario({ abierto, idPropietario, rutaBase = '/mascotas', inicial, onCerrar, onGuardado }: Props) {
  const [datos, setDatos] = useState({
    nombre: inicial?.nombre ?? '',
    raza: inicial?.raza ?? '',
    sexo: (inicial?.sexo ?? '') as Sexo | '',
    fecha_nacimiento: inicial?.fecha_nacimiento ?? '',
    peso_kg: inicial?.peso_kg != null ? String(inicial.peso_kg) : '',
    observaciones: inicial?.observaciones ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiar = (campo: keyof typeof datos) => (e: { target: { value: string } }) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await api(inicial ? `${rutaBase}/${inicial.id_mascota}` : rutaBase, {
        method: inicial ? 'PUT' : 'POST',
        body: {
          id_propietario: idPropietario,
          nombre: datos.nombre,
          raza: datos.raza,
          sexo: datos.sexo || null,
          fecha_nacimiento: datos.fecha_nacimiento || null,
          peso_kg: datos.peso_kg === '' ? null : datos.peso_kg,
          observaciones: datos.observaciones,
        },
      })
      onGuardado()
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo={inicial ? `Editar a ${inicial.nombre}` : 'Nuevo perro'}
      abierto={abierto}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-mascota" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="form-mascota" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Nombre *">
          <input value={datos.nombre} onChange={cambiar('nombre')} required maxLength={100} />
        </Campo>
        <Campo etiqueta="Raza">
          <input value={datos.raza} onChange={cambiar('raza')} maxLength={100} placeholder="Mestizo" />
        </Campo>
        <Campo etiqueta="Sexo">
          <select value={datos.sexo} onChange={cambiar('sexo')}>
            <option value="">Sin indicar</option>
            <option value="MACHO">Macho</option>
            <option value="HEMBRA">Hembra</option>
          </select>
        </Campo>
        <Campo etiqueta="Fecha de nacimiento">
          <input
            type="date"
            max={hoy()}
            value={datos.fecha_nacimiento}
            onChange={cambiar('fecha_nacimiento')}
          />
        </Campo>
        <Campo etiqueta="Peso (kg)">
          <input
            type="number"
            min="0.1"
            max="150"
            step="0.1"
            value={datos.peso_kg}
            onChange={cambiar('peso_kg')}
          />
        </Campo>
        <Campo
          etiqueta="Observaciones"
          ayuda="Alergias, dieta, medicinas o cuidados especiales"
          ancho="completo"
        >
          <textarea value={datos.observaciones} onChange={cambiar('observaciones')} maxLength={2000} />
        </Campo>
      </form>
      {error && (
        <div style={{ marginTop: 14 }}>
          <Aviso>{error}</Aviso>
        </div>
      )}
    </Modal>
  )
}
