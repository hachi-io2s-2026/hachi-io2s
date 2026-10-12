import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { api, query } from '../../api/client'
import type { EstadoReservacion, Reservacion, Servicio } from '../../api/tipos'
import { fecha, hora, moneda, unidadTexto } from '../../utils/formato'
import { Aviso, Avatar, Cargando, Encabezado, Estado, Paginacion, Vacio } from '../ui'
import { useCarga, useRetrasado } from '../useCarga'
import { usePaginacion } from '../usePaginacion'

const ESTADOS: [EstadoReservacion, string][] = [
  ['PENDIENTE', 'Pendiente'],
  ['CONFIRMADA', 'Confirmada'],
  ['EN_CURSO', 'En curso'],
  ['FINALIZADA', 'Finalizada'],
  ['CANCELADA', 'Cancelada'],
]

export default function Reservaciones() {
  const navegar = useNavigate()
  const [filtros, setFiltros] = useState({ estado: '', id_servicio: '', desde: '', hasta: '' })
  const [busqueda, setBusqueda] = useState('')
  const q = useRetrasado(busqueda.trim())

  useEffect(() => {
    document.title = 'Reservaciones · HACHI'
  }, [])

  const servicios = useCarga(() => api<Servicio[]>('/servicios'), [])
  const { datos, error, cargando } = useCarga(
    () => api<Reservacion[]>(`/reservaciones${query({ ...filtros, q })}`),
    [filtros, q],
  )

  const pag = usePaginacion(datos, JSON.stringify([filtros, q]))

  const cambiar = (campo: keyof typeof filtros) => (e: { target: { value: string } }) =>
    setFiltros((f) => ({ ...f, [campo]: e.target.value }))
  const hayFiltros = Object.values(filtros).some(Boolean) || q !== ''

  return (
    <div className="pagina">
      <Encabezado
        titulo="Reservaciones"
        subtitulo="Todas las reservas de hospedaje y daycare. Abre una para confirmarla, cancelarla, registrar la entrada o salida y cobrar."
        acciones={
          <Link to="/panel/reservaciones/nueva" className="boton boton-verde">
            Nueva reservación
          </Link>
        }
      />

      <div className="caja">
        <div className="filtros">
          <label className="campo-form filtro-busqueda">
            <span className="campo-etiqueta">Buscar</span>
            <input
              type="search"
              placeholder="Perro o dueño"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
          <label className="campo-form">
            <span className="campo-etiqueta">Estado</span>
            <select value={filtros.estado} onChange={cambiar('estado')}>
              <option value="">Todos</option>
              {ESTADOS.map(([v, t]) => (
                <option key={v} value={v}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="campo-form">
            <span className="campo-etiqueta">Servicio</span>
            <select value={filtros.id_servicio} onChange={cambiar('id_servicio')}>
              <option value="">Todos</option>
              {servicios.datos?.map((s) => (
                <option key={s.id_servicio} value={s.id_servicio}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="campo-form">
            <span className="campo-etiqueta">Desde</span>
            <input type="date" value={filtros.desde} onChange={cambiar('desde')} />
          </label>
          <label className="campo-form">
            <span className="campo-etiqueta">Hasta</span>
            <input type="date" value={filtros.hasta} min={filtros.desde} onChange={cambiar('hasta')} />
          </label>
          {hayFiltros && (
            <button
              type="button"
              className="boton boton-gris"
              onClick={() => {
                setFiltros({ estado: '', id_servicio: '', desde: '', hasta: '' })
                setBusqueda('')
              }}
            >
              Limpiar
            </button>
          )}
        </div>

        {error && (
          <div className="caja-cuerpo">
            <Aviso>{error}</Aviso>
          </div>
        )}
        {cargando && !datos && <Cargando />}
        {datos && datos.length === 0 && (
          <Vacio
            titulo={hayFiltros ? 'Sin resultados' : 'Todavía no hay reservaciones'}
            texto={hayFiltros ? 'Prueba con otros filtros.' : 'Crea la primera reservación para un perro registrado.'}
          />
        )}
        {datos && datos.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Perro y dueño</th>
                  <th>Servicio</th>
                  <th>Inicio</th>
                  <th>Fin</th>
                  <th className="numero">Total</th>
                  <th className="numero">Saldo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pag.visibles.map((r) => (
                  <tr
                    key={r.id_reservacion}
                    className="fila-clic"
                    onClick={() => navegar(`/panel/reservaciones/${r.id_reservacion}`)}
                  >
                    <td>{r.id_reservacion}</td>
                    <td>
                      <div className="celda-avatar">
                        <Avatar nombre={r.mascota} chico />
                        <div className="celda-principal">
                          <strong>{r.mascota}</strong>
                          <span>{r.propietario}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="celda-principal">
                        <strong>{r.servicio}</strong>
                        <span>
                          {r.unidades} {unidadTexto(r.unidad, r.unidades)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="celda-principal">
                        <strong>{fecha(r.fecha_inicio)}</strong>
                        <span>{hora(r.fecha_inicio)}</span>
                      </div>
                    </td>
                    <td>
                      <div className="celda-principal">
                        <strong>{fecha(r.fecha_fin)}</strong>
                        <span>{hora(r.fecha_fin)}</span>
                      </div>
                    </td>
                    <td className="numero">{moneda(r.monto_total)}</td>
                    <td
                      className={`numero ${r.saldo > 0 && r.estado !== 'CANCELADA' ? 'texto-negativo' : 'texto-cero'}`}
                    >
                      {moneda(r.saldo)}
                    </td>
                    <td>
                      <div className="celda-estado">
                        <Estado valor={r.estado} />
                        {r.origen === 'CLIENTE' && (
                          <span className="chip-origen" title="El cliente la solicitó desde su portal">
                            Portal
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion {...pag} />
      </div>
    </div>
  )
}
