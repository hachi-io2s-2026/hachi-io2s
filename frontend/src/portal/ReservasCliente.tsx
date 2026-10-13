import { useEffect } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import type { Reservacion } from '../api/tipos'
import { IconoFlecha } from '../components/Iconos'
import { Aviso, Avatar, Cargando, Encabezado, Estado } from '../panel/ui'
import { useCarga } from '../panel/useCarga'
import { fecha, moneda, unidadTexto } from '../utils/formato'
import { estadoCliente, explicacionEstado } from './estados'

export default function ReservasCliente() {
  const { datos, error } = useCarga(() => api<Reservacion[]>('/cliente/reservaciones'), [])

  useEffect(() => {
    document.title = 'Mis reservas · HACHI'
  }, [])

  return (
    <div className="pagina">
      <Encabezado
        titulo="Mis reservas"
        subtitulo="Todas tus estancias en el hotel y su estado."
        acciones={
          <Link to="/mi-cuenta/reservar" className="boton boton-verde">
            Solicitar estancia
          </Link>
        }
      />

      {error && <Aviso>{error}</Aviso>}
      {!datos && !error && <Cargando />}

      {datos && (
        <section className="caja">
          {datos.length === 0 ? (
            <div className="vacio">
              <p className="vacio-titulo">Todavía no tienes reservas</p>
              <p className="vacio-texto">Cuando solicites una estancia aparecerá aquí con su estado.</p>
              <Link to="/mi-cuenta/reservar" className="boton boton-verde boton-chico">
                Solicitar estancia
              </Link>
            </div>
          ) : (
            <ul className="portal-lista">
              {datos.map((r) => (
                <li key={r.id_reservacion}>
                  <Link to={`/mi-cuenta/reservas/${r.id_reservacion}`}>
                    <Avatar nombre={r.mascota} />
                    <div className="portal-lista-texto">
                      <strong>
                        {r.mascota} · {r.servicio}
                      </strong>
                      <span>
                        {fecha(r.fecha_inicio)} → {fecha(r.fecha_fin)} · {r.unidades} {unidadTexto(r.unidad, r.unidades)} ·{' '}
                        {moneda(r.monto_total)}
                        {r.saldo > 0 && r.estado !== 'CANCELADA' && (
                          <>
                            {' '}
                            · <strong className="texto-negativo">Saldo {moneda(r.saldo)}</strong>
                          </>
                        )}
                      </span>
                      <span className="portal-lista-ayuda">{explicacionEstado(r)}</span>
                    </div>
                    <Estado valor={estadoCliente(r)} />
                    <IconoFlecha width={16} height={16} className="portal-lista-flecha" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
