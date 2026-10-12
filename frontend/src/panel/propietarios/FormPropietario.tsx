import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { Propietario } from '../../api/tipos'
import { Aviso, Campo, Modal } from '../ui'

interface Props {
  abierto: boolean
  // Si se pasa, el formulario edita a ese dueno; si no, registra uno nuevo
  inicial?: Propietario | null
  onCerrar: () => void
  onGuardado: (p: Propietario) => void
}

const vacio = { nombre: '', apellido: '', telefono: '', correo: '', direccion: '' }

export default function FormPropietario(props: Props) {
  // Se monta de nuevo cada vez que se abre, para empezar con los datos correctos
  if (!props.abierto) return null
  return <Formulario {...props} />
}

function Formulario({ abierto, inicial, onCerrar, onGuardado }: Props) {
  const [datos, setDatos] = useState(() =>
    inicial
      ? {
          nombre: inicial.nombre,
          apellido: inicial.apellido,
          telefono: inicial.telefono,
          correo: inicial.correo ?? '',
          direccion: inicial.direccion ?? '',
        }
      : vacio,
  )
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const cambiar = (campo: keyof typeof vacio) => (e: { target: { value: string } }) =>
    setDatos((d) => ({ ...d, [campo]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const guardado = await api<Propietario>(
        inicial ? `/propietarios/${inicial.id_propietario}` : '/propietarios',
        { method: inicial ? 'PUT' : 'POST', body: datos },
      )
      onGuardado(guardado)
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo={inicial ? 'Editar dueño' : 'Nuevo dueño'}
      abierto={abierto}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-propietario" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="form-propietario" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Nombre *">
          <input value={datos.nombre} onChange={cambiar('nombre')} required maxLength={100} />
        </Campo>
        <Campo etiqueta="Apellido *">
          <input value={datos.apellido} onChange={cambiar('apellido')} required maxLength={100} />
        </Campo>
        <Campo etiqueta="Teléfono *" ayuda="8 a 20 dígitos, por ejemplo 5555-1234">
          <input
            type="tel"
            value={datos.telefono}
            onChange={cambiar('telefono')}
            required
            maxLength={20}
          />
        </Campo>
        <Campo etiqueta="Correo electrónico">
          <input type="email" value={datos.correo} onChange={cambiar('correo')} maxLength={150} />
        </Campo>
        <Campo etiqueta="Dirección" ancho="completo">
          <input value={datos.direccion} onChange={cambiar('direccion')} maxLength={255} />
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
