import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { api } from '../api/client'
import type { Mascota, Reservacion } from '../api/tipos'
import { useSesion } from '../auth/contexto'
import { IconoCalendario, IconoFlecha, IconoHuella, IconoTarjeta } from '../components/Iconos'
import { Aviso, Avatar, Cargando, Estado } from '../panel/ui'
import { useCarga } from '../panel/useCarga'
import { fecha, hora, moneda, unidadTexto } from '../utils/formato'
import { estadoCliente, explicacionEstado } from './estados'

const ACTIVAS = ['PENDIENTE', 'CONFIRMADA', 'EN_CURSO']

export default function InicioCliente() {
  const { cliente } = useSesion()
  const ubicacion = useLocation()
  const [bienvenida, setBienvenida] = useState(() => Boolean((ubicacion.state as { bienvenida?: boolean } | null)?.bienvenida))
  const { datos, error } = useCarga(
    () => Promise.all([api<{ mascotas: Mascota[] }>('/cliente/me'), api<Reservacion[]>('/cliente/reservaciones')]),
    [],
  )

  useEffect(() => {
    document.title = 'Mi cuenta · HACHI'
  }, [])

  if (error) return <Aviso>{error}</Aviso>
  if (!datos) return <Cargando />
  const [perfil, reservas] = datos
  const perros = perfil.mascotas.filter((m) => m.activo)
  const activas = reservas
    .filter((r) => ACTIVAS.includes(r.estado))
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
  const proxima = activas[0]
  const saldo = reservas.filter((r) => r.estado !== 'CANCELADA').reduce((t, r) => t + r.saldo, 0)

  return (
    <div className="pagina">
      <header className="pagina-encabezado">
        <h1>Hola, {cliente?.nombre.split(' ')[0]}</h1>
        <p className="pagina-subtitulo">Aquí ves a tus perros, tus reservas y lo que tienes pendiente con el hotel.</p>
      </header>

      {bienvenida && (
        <Aviso tipo="ok" onCerrar={() => setBienvenida(false)}>
          ¡Tu cuenta está lista! {perros.length === 0 ? 'Empieza registrando a tu perro.' : 'Ya puedes solicitar una estancia.'}
        </Aviso>
      )}

      <div className="portal-resumen">
        <div className="portal-tarjeta portal-tarjeta-destacada">
          <span className="portal-tarjeta-icono">
            <IconoCalendario width={20} height={20} />
          </span>
          <div>
            <p className="portal-tarjeta-titulo">Próxima estancia</p>
            {proxima ? (
              <>
                <strong>
                  {proxima.mascota} · {proxima.servicio}
                </strong>
                <span>
                  {fecha(proxima.fecha_inicio)}, {hora(proxima.fecha_inicio)}
                </span>
                <span className="portal-tarjeta-estado">
                  <Estado valor={estadoCliente(proxima)} />
                </span>
              </>
            ) : (
              <>
                <strong>Sin estancias programadas</strong>
                <Link to="/mi-cuenta/reservar">Solicitar una estancia</Link>
              </>
            )}
          </div>
        </div>

        <div className="portal-tarjeta">
          <span className="portal-tarjeta-icono icono-ambar">
            <IconoTarjeta width={20} height={20} />
          </span>
          <div>
            <p className="portal-tarjeta-titulo">Saldo pendiente</p>
            <strong className={saldo > 0 ? 'texto-negativo' : ''}>{moneda(saldo)}</strong>
            <span>{saldo > 0 ? 'Puedes pagarlo en recepción: efectivo, tarjeta o transferencia.' : 'Estás al día con tus pagos.'}</span>
          </div>
        </div>

        <div className="portal-tarjeta">
          <span className="portal-tarjeta-icono icono-azul">
            <IconoHuella width={20} height={20} />
          </span>
          <div>
            <p className="portal-tarjeta-titulo">Mis perros</p>
            <strong>{perros.length}</strong>
            <Link to="/mi-cuenta/perros">{perros.length === 0 ? 'Registrar a mi perro' : 'Ver mis perros'}</Link>
          </div>
        </div>
      </div>

      <div className="portal-columnas">
        <section className="caja">
          <div className="caja-encabezado">
            <h2>Reservas activas</h2>
            <Link to="/mi-cuenta/reservas" className="texto-chico">
              Ver todas
            </Link>
          </div>
          {activas.length === 0 ? (
            <div className="vacio">
              <p className="vacio-titulo">No tienes reservas activas</p>
              <p className="vacio-texto">Solicita una estancia y el hotel te la confirmará.</p>
              <Link to="/mi-cuenta/reservar" className="boton boton-verde boton-chico">
                Solicitar estancia
              </Link>
            </div>
          ) : (
            <ul className="portal-lista">
              {activas.map((r) => (
                <li key={r.id_reservacion}>
                  <Link to={`/mi-cuenta/reservas/${r.id_reservacion}`}>
                    <Avatar nombre={r.mascota} />
                    <div className="portal-lista-texto">
                      <strong>
                        {r.mascota} · {r.servicio}
                      </strong>
                      <span>
                        {fecha(r.fecha_inicio)} → {fecha(r.fecha_fin)} · {r.unidades} {unidadTexto(r.unidad, r.unidades)}
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

        <section className="caja portal-como">
          <div className="caja-encabezado">
            <h2>¿Cómo funciona?</h2>
          </div>
          <ol>
            <li>
              <strong>Registra a tu perro</strong>
              <span>Con sus datos y cuidados especiales (alergias, dieta, medicinas).</span>
            </li>
            <li>
              <strong>Solicita la estancia</strong>
              <span>Elige hospedaje o daycare y las fechas; verás el precio y si hay cupo.</span>
            </li>
            <li>
              <strong>El hotel la confirma</strong>
              <span>Mientras está pendiente puedes cancelarla desde «Mis reservas».</span>
            </li>
            <li>
              <strong>Lleva a tu perro</strong>
              <span>El día de la estancia registramos su llegada y su salida.</span>
            </li>
          </ol>
        </section>
      </div>
    </div>
  )
}
