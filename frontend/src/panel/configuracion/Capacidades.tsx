import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { Capacidad, Servicio } from '../../api/tipos'
import { fecha, hoy } from '../../utils/formato'
import { Aviso, Campo, Cargando, Modal, Vacio } from '../ui'
import { useCarga } from '../useCarga'

// Capacidad que aplica hoy para cada servicio (la de inicio de vigencia mas reciente)
function vigentesHoy(capacidades: Capacidad[]): Set<number> {
  const dia = hoy()
  const porServicio = new Map<number, Capacidad>()
  for (const c of capacidades) {
    const aplica = c.fecha_inicio_vigencia <= dia && (!c.fecha_fin_vigencia || c.fecha_fin_vigencia >= dia)
    const actual = porServicio.get(c.id_servicio)
    if (aplica && (!actual || c.fecha_inicio_vigencia > actual.fecha_inicio_vigencia || (c.fecha_inicio_vigencia === actual.fecha_inicio_vigencia && c.id_capacidad > actual.id_capacidad))) {
      porServicio.set(c.id_servicio, c)
    }
  }
  return new Set([...porServicio.values()].map((c) => c.id_capacidad))
}

export default function Capacidades({ servicios, onCambio }: { servicios: Servicio[]; onCambio: () => void }) {
  const { datos, error, cargando, recargar } = useCarga(() => api<Capacidad[]>('/capacidades'), [])
  const [form, setForm] = useState<{ capacidad: Capacidad | null } | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const vigentes = vigentesHoy(datos ?? [])

  return (
    <>
      <div className="caja-encabezado">
        <p className="texto-suave texto-chico sin-margen">
          Cantidad máxima de perros por noche (hospedaje) o por día (daycare). Si se reduce, las reservas
          existentes se respetan.
        </p>
        <button type="button" className="boton boton-verde boton-chico" onClick={() => setForm({ capacidad: null })}>
          Nueva capacidad
        </button>
      </div>
      {aviso && (
        <div className="caja-cuerpo sin-padding-inferior">
          <Aviso tipo="ok" onCerrar={() => setAviso(null)}>
            {aviso}
          </Aviso>
        </div>
      )}
      {error && (
        <div className="caja-cuerpo">
          <Aviso>{error}</Aviso>
        </div>
      )}
      {cargando && !datos && <Cargando />}
      {datos && datos.length === 0 && <Vacio titulo="Sin capacidades registradas" />}
      {datos && datos.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th className="numero">Capacidad</th>
                <th>Vigencia</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.map((c) => (
                <tr key={c.id_capacidad}>
                  <td>
                    {c.servicio}
                    {vigentes.has(c.id_capacidad) && <span className="etiqueta-vigente">Vigente hoy</span>}
                  </td>
                  <td className="numero">
                    {c.capacidad_maxima} perros por {c.tipo === 'HOSPEDAJE' ? 'noche' : 'día'}
                  </td>
                  <td>
                    {fecha(c.fecha_inicio_vigencia)} → {c.fecha_fin_vigencia ? fecha(c.fecha_fin_vigencia) : 'sin fin'}
                  </td>
                  <td>
                    <div className="acciones-fila">
                      <button type="button" className="boton boton-gris boton-chico" onClick={() => setForm({ capacidad: c })}>
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {form && (
        <FormCapacidad
          servicios={servicios}
          capacidad={form.capacidad}
          onCerrar={() => setForm(null)}
          onGuardado={() => {
            setAviso(form.capacidad ? 'Capacidad actualizada.' : 'Capacidad creada.')
            setForm(null)
            recargar()
            onCambio()
          }}
        />
      )}
    </>
  )
}

function FormCapacidad({
  servicios,
  capacidad,
  onCerrar,
  onGuardado,
}: {
  servicios: Servicio[]
  capacidad: Capacidad | null
  onCerrar: () => void
  onGuardado: () => void
}) {
  const [d, setD] = useState({
    id_servicio: String(capacidad?.id_servicio ?? servicios[0]?.id_servicio ?? ''),
    capacidad_maxima: String(capacidad?.capacidad_maxima ?? ''),
    fecha_inicio_vigencia: capacidad?.fecha_inicio_vigencia ?? hoy(),
    fecha_fin_vigencia: capacidad?.fecha_fin_vigencia ?? '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cambiar = (c: keyof typeof d) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [c]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      if (capacidad) {
        await api(`/capacidades/${capacidad.id_capacidad}`, {
          method: 'PATCH',
          body: { capacidad_maxima: d.capacidad_maxima, fecha_fin_vigencia: d.fecha_fin_vigencia || null },
        })
      } else {
        await api('/capacidades', { method: 'POST', body: { ...d, fecha_fin_vigencia: d.fecha_fin_vigencia || null } })
      }
      onGuardado()
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo={capacidad ? `Editar capacidad · ${capacidad.servicio}` : 'Nueva capacidad'}
      abierto
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-capacidad" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <form id="form-capacidad" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Servicio *">
          <select value={d.id_servicio} onChange={cambiar('id_servicio')} disabled={Boolean(capacidad)}>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta="Capacidad máxima *">
          <input type="number" min="1" max="1000" step="1" value={d.capacidad_maxima} onChange={cambiar('capacidad_maxima')} required />
        </Campo>
        <Campo etiqueta="Vigente desde *">
          <input
            type="date"
            value={d.fecha_inicio_vigencia}
            onChange={cambiar('fecha_inicio_vigencia')}
            required
            disabled={Boolean(capacidad)}
          />
        </Campo>
        <Campo etiqueta="Vigente hasta" ayuda="Vacío = sin fecha de fin">
          <input type="date" min={d.fecha_inicio_vigencia} value={d.fecha_fin_vigencia} onChange={cambiar('fecha_fin_vigencia')} />
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
