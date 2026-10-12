import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api, mensajeError } from '../api/client'
import { useSesion } from '../auth/contexto'
import { IconoFlecha } from '../components/Iconos'
import { MODULOS, puedeVer } from './modulos'

interface ServicioApi {
  id_servicio: number
  nombre: string
  tipo: 'HOSPEDAJE' | 'DAYCARE'
  activo: boolean
  tarifa_vigente: { nombre: string; precio: number; unidad: 'NOCHE' | 'DIA' } | null
  capacidad_vigente: number | null
}

const moneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })
const fechaLarga = new Intl.DateTimeFormat('es-GT', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

export default function InicioPanel() {
  const { usuario } = useSesion()
  const [servicios, setServicios] = useState<ServicioApi[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // Fecha calculada una sola vez al abrir la pagina
  const [hoy] = useState(() => fechaLarga.format(new Date()))

  useEffect(() => {
    document.title = 'Panel · HACHI'
    let vigente = true
    api<ServicioApi[]>('/servicios').then(
      (d) => vigente && setServicios(d),
      (e) => vigente && setError(mensajeError(e)),
    )
    return () => {
      vigente = false
    }
  }, [])

  if (!usuario) return null
  const accesos = MODULOS.filter((m) => m.ruta !== '/panel' && puedeVer(m, usuario.rol))
  const nombre = usuario.nombre.split(' ')[0]

  return (
    <div className="pagina">
      <header className="pagina-encabezado">
        <p className="pagina-fecha">{hoy.charAt(0).toUpperCase() + hoy.slice(1)}</p>
        <h1>Hola, {nombre}</h1>
        <p className="pagina-subtitulo">Este es el sistema de gestión de HACHI.</p>
      </header>

      <section className="bloque">
        <h2 className="bloque-titulo">Servicios vigentes hoy</h2>
        {error && <p className="aviso aviso-error">{error}</p>}
        {!servicios && !error && <p className="texto-suave">Cargando servicios…</p>}
        {servicios && (
          <div className="servicios-panel">
            {servicios.map((s) => (
              <article key={s.id_servicio} className="tarjeta-panel">
                <div className="tarjeta-panel-encabezado">
                  <h3>{s.nombre}</h3>
                  <span className={`estado ${s.activo ? 'estado-ok' : 'estado-apagado'}`}>
                    {s.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <dl className="datos-panel">
                  <div>
                    <dt>Tarifa vigente</dt>
                    <dd>
                      {s.tarifa_vigente
                        ? `${moneda.format(s.tarifa_vigente.precio)} / ${s.tarifa_vigente.unidad === 'NOCHE' ? 'noche' : 'día'}`
                        : 'Sin tarifa'}
                    </dd>
                  </div>
                  <div>
                    <dt>Capacidad</dt>
                    <dd>
                      {s.capacidad_vigente !== null
                        ? `${s.capacidad_vigente} perros por ${s.tipo === 'HOSPEDAJE' ? 'noche' : 'día'}`
                        : 'Sin capacidad'}
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="bloque">
        <h2 className="bloque-titulo">Accesos rápidos</h2>
        <div className="accesos">
          {accesos.map((m) => (
            <Link key={m.ruta} to={m.ruta} className="acceso">
              <span className="acceso-icono">{m.icono}</span>
              <span className="acceso-texto">
                <strong>{m.titulo}</strong>
                <span>{m.descripcion}</span>
              </span>
              <IconoFlecha width={18} height={18} className="acceso-flecha" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
