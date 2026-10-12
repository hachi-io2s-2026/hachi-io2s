import { useState, type FormEvent } from 'react'
import { api, mensajeError } from '../../api/client'
import type { Servicio, Tarifa } from '../../api/tipos'
import { fecha, hoy, moneda, unidadTexto } from '../../utils/formato'
import { Aviso, Campo, Cargando, Estado, Modal, Vacio } from '../ui'
import { useCarga } from '../useCarga'

export default function Tarifas({ servicios, onCambio }: { servicios: Servicio[]; onCambio: () => void }) {
  const { datos, error, cargando, recargar } = useCarga(() => api<Tarifa[]>('/tarifas'), [])
  const [nueva, setNueva] = useState(false)
  const [editar, setEditar] = useState<Tarifa | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const vigentes = new Set(servicios.map((s) => s.tarifa_vigente?.id_tarifa))
  const guardado = (texto: string) => {
    setNueva(false)
    setEditar(null)
    setAviso(texto)
    recargar()
    onCambio()
  }

  return (
    <>
      <div className="caja-encabezado">
        <p className="texto-suave texto-chico sin-margen">
          Se aplica la tarifa activa más reciente cuya vigencia incluye el día de inicio de la reserva. Las
          reservas ya creadas conservan su importe.
        </p>
        <button type="button" className="boton boton-verde boton-chico" onClick={() => setNueva(true)}>
          Nueva tarifa
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
      {datos && datos.length === 0 && <Vacio titulo="Sin tarifas registradas" />}
      {datos && datos.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Nombre</th>
                <th className="numero">Precio</th>
                <th>Vigencia</th>
                <th>Estado</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {datos.map((t) => (
                <tr key={t.id_tarifa}>
                  <td>{t.servicio}</td>
                  <td>
                    {t.nombre}
                    {vigentes.has(t.id_tarifa) && <span className="etiqueta-vigente">Vigente hoy</span>}
                  </td>
                  <td className="numero">
                    {moneda(t.precio)} / {unidadTexto(t.unidad)}
                  </td>
                  <td>
                    {fecha(t.fecha_inicio_vigencia)} → {t.fecha_fin_vigencia ? fecha(t.fecha_fin_vigencia) : 'sin fin'}
                  </td>
                  <td>
                    <Estado valor={t.activo ? 'ACTIVO' : 'INACTIVO'} />
                  </td>
                  <td>
                    <div className="acciones-fila">
                      <button type="button" className="boton boton-gris boton-chico" onClick={() => setEditar(t)}>
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

      {nueva && (
        <FormNueva servicios={servicios} onCerrar={() => setNueva(false)} onGuardado={() => guardado('Tarifa creada.')} />
      )}
      {editar && (
        <FormEditar tarifa={editar} onCerrar={() => setEditar(null)} onGuardado={() => guardado('Tarifa actualizada.')} />
      )}
    </>
  )
}

function FormNueva({
  servicios,
  onCerrar,
  onGuardado,
}: {
  servicios: Servicio[]
  onCerrar: () => void
  onGuardado: () => void
}) {
  const [d, setD] = useState({
    id_servicio: String(servicios[0]?.id_servicio ?? ''),
    nombre: '',
    precio: '',
    fecha_inicio_vigencia: hoy(),
    fecha_fin_vigencia: '',
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const servicio = servicios.find((s) => String(s.id_servicio) === d.id_servicio)
  const cambiar = (c: keyof typeof d) => (e: { target: { value: string } }) => setD((x) => ({ ...x, [c]: e.target.value }))

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await api('/tarifas', {
        method: 'POST',
        body: { ...d, fecha_fin_vigencia: d.fecha_fin_vigencia || null },
      })
      onGuardado()
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo="Nueva tarifa"
      abierto
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-tarifa" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Crear tarifa'}
          </button>
        </>
      }
    >
      <form id="form-tarifa" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Servicio *">
          <select value={d.id_servicio} onChange={cambiar('id_servicio')} required>
            {servicios.map((s) => (
              <option key={s.id_servicio} value={s.id_servicio}>
                {s.nombre}
              </option>
            ))}
          </select>
        </Campo>
        <Campo etiqueta={`Precio por ${servicio?.tipo === 'DAYCARE' ? 'día' : 'noche'} (Q) *`}>
          <input type="number" min="0" step="0.01" value={d.precio} onChange={cambiar('precio')} required />
        </Campo>
        <Campo etiqueta="Nombre *" ancho="completo">
          <input value={d.nombre} onChange={cambiar('nombre')} required maxLength={100} placeholder="Ej. Temporada alta" />
        </Campo>
        <Campo etiqueta="Vigente desde *">
          <input type="date" value={d.fecha_inicio_vigencia} onChange={cambiar('fecha_inicio_vigencia')} required />
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

function FormEditar({ tarifa, onCerrar, onGuardado }: { tarifa: Tarifa; onCerrar: () => void; onGuardado: () => void }) {
  const [d, setD] = useState({
    nombre: tarifa.nombre,
    precio: String(tarifa.precio),
    fecha_fin_vigencia: tarifa.fecha_fin_vigencia ?? '',
    activo: tarifa.activo,
  })
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      await api(`/tarifas/${tarifa.id_tarifa}`, {
        method: 'PATCH',
        body: { ...d, fecha_fin_vigencia: d.fecha_fin_vigencia || null },
      })
      onGuardado()
    } catch (err) {
      setError(mensajeError(err))
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo={`Editar tarifa · ${tarifa.servicio}`}
      abierto
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={onCerrar}>
            Cancelar
          </button>
          <button type="submit" form="form-editar-tarifa" className="boton boton-verde" disabled={enviando}>
            {enviando ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </>
      }
    >
      <form id="form-editar-tarifa" className="form-grid" onSubmit={enviar}>
        <Campo etiqueta="Nombre *" ancho="completo">
          <input value={d.nombre} onChange={(e) => setD({ ...d, nombre: e.target.value })} required maxLength={100} />
        </Campo>
        <Campo etiqueta={`Precio por ${unidadTexto(tarifa.unidad)} (Q) *`}>
          <input type="number" min="0" step="0.01" value={d.precio} onChange={(e) => setD({ ...d, precio: e.target.value })} required />
        </Campo>
        <Campo etiqueta="Vigente hasta" ayuda={`Desde el ${fecha(tarifa.fecha_inicio_vigencia)}`}>
          <input
            type="date"
            min={tarifa.fecha_inicio_vigencia}
            value={d.fecha_fin_vigencia}
            onChange={(e) => setD({ ...d, fecha_fin_vigencia: e.target.value })}
          />
        </Campo>
        <label className="casilla campo-completo">
          <input type="checkbox" checked={d.activo} onChange={(e) => setD({ ...d, activo: e.target.checked })} />
          Tarifa activa
        </label>
      </form>
      <p className="texto-suave texto-chico">Cambiar la tarifa no modifica el importe de las reservas ya creadas.</p>
      {error && <Aviso>{error}</Aviso>}
    </Modal>
  )
}
