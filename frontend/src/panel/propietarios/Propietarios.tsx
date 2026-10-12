import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { api, query } from '../../api/client'
import type { Propietario } from '../../api/tipos'
import { fecha } from '../../utils/formato'
import { Aviso, Avatar, Cargando, Encabezado, Paginacion, Vacio } from '../ui'
import { useCarga, useRetrasado } from '../useCarga'
import { usePaginacion } from '../usePaginacion'
import FormPropietario from './FormPropietario'

export default function Propietarios() {
  const navegar = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const q = useRetrasado(busqueda.trim())
  const [formAbierto, setFormAbierto] = useState(false)

  useEffect(() => {
    document.title = 'Dueños y perros · HACHI'
  }, [])

  const { datos, error, cargando } = useCarga(
    () => api<Propietario[]>(`/propietarios${query({ q })}`),
    [q],
  )

  const pag = usePaginacion(datos, q)

  return (
    <div className="pagina">
      <Encabezado
        titulo="Dueños y perros"
        subtitulo="Datos de los dueños y la ficha de cada perro. Las observaciones (alergias, dieta, medicinas) aparecen como alertas en «Hoy» durante su estancia."
        acciones={
          <button type="button" className="boton boton-verde" onClick={() => setFormAbierto(true)}>
            Nuevo dueño
          </button>
        }
      />

      <div className="caja">
        <div className="filtros">
          <label className="campo-form filtro-busqueda">
            <span className="campo-etiqueta">Buscar</span>
            <input
              type="search"
              placeholder="Nombre, teléfono o correo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <div className="caja-cuerpo">
            <Aviso>{error}</Aviso>
          </div>
        )}
        {cargando && !datos && <Cargando />}
        {datos && datos.length === 0 && (
          <Vacio
            titulo={q ? 'Sin resultados' : 'Todavía no hay dueños registrados'}
            texto={q ? `No hay dueños que coincidan con “${q}”.` : 'Registra al primer dueño para crear su ficha y la de su perro.'}
          />
        )}
        {datos && datos.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Dueño</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th className="numero">Perros</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                {pag.visibles.map((p) => (
                  <tr
                    key={p.id_propietario}
                    className="fila-clic"
                    onClick={() => navegar(`/panel/propietarios/${p.id_propietario}`)}
                  >
                    <td>
                      <div className="celda-avatar">
                        <Avatar nombre={`${p.nombre} ${p.apellido}`} chico />
                        <div className="celda-principal">
                          <strong>
                            {p.nombre} {p.apellido}
                          </strong>
                          {p.direccion && <span>{p.direccion}</span>}
                        </div>
                      </div>
                    </td>
                    <td>{p.telefono}</td>
                    <td>{p.correo ?? '—'}</td>
                    <td className="numero">{p.total_mascotas}</td>
                    <td>{fecha(p.fecha_registro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Paginacion {...pag} />
      </div>

      <FormPropietario
        abierto={formAbierto}
        onCerrar={() => setFormAbierto(false)}
        onGuardado={(p) => navegar(`/panel/propietarios/${p.id_propietario}`)}
      />
    </div>
  )
}
