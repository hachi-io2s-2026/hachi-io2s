import type { ReactNode } from 'react'
import { Link } from 'react-router'
import BuscadorEstancia from '../components/BuscadorEstancia'
import Foto from '../components/Foto'
import { IconoCalendario, IconoFlecha } from '../components/Iconos'
import './Inicio.css'

// FOTOGRAFIAS (frontend/public/fotos/, licencia CC0; ver CREDITOS.md en esa carpeta)
// Para usar fotos propias, reemplaza los archivos o cambia aqui la ruta.
// Si una ruta queda vacia se muestra un espacio reservado con su descripcion.
const FOTOS = {
  principal: '/fotos/galeria-1.jpg',
  banner: '/fotos/control.webp',
  nosotros: '/fotos/principal.jpg',
  hospedaje: '/fotos/hospedaje.jpg',
  daycare: '/fotos/daycare.webp',
  portal: '/fotos/galeria-2.webp',
  cierre: '/fotos/galeria-3.webp',
}

type TipoServicio = 'HOSPEDAJE' | 'DAYCARE'

// ILUSTRACIONES de las tarjetas de servicios (trazo oscuro + color de acento)
const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

const IlustracionHotel = () => (
  <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true">
    <path d="M37 5.5a5.5 5.5 0 1 0 5.5 7.6A4.6 4.6 0 0 1 37 5.5z" fill="#f2b84b" />
    <path d="M7 22 24 9l17 13" {...trazo} />
    <path d="M11 19v21h26V19" {...trazo} />
    <path d="M19 40V31a5 5 0 0 1 10 0v9" {...trazo} />
    <circle cx="24" cy="23" r="3.2" fill="#f08c7a" />
    <circle cx="19.6" cy="19.4" r="1.3" fill="#f08c7a" />
    <circle cx="22.4" cy="17.8" r="1.3" fill="#f08c7a" />
    <circle cx="25.6" cy="17.8" r="1.3" fill="#f08c7a" />
    <circle cx="28.4" cy="19.4" r="1.3" fill="#f08c7a" />
  </svg>
)

const IlustracionDaycare = () => (
  <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true">
    <circle cx="18" cy="17" r="7" fill="#f2b84b" />
    <path d="M18 4v3M18 27v3M5 17h3M28 17h3M8.8 7.8l2.1 2.1M25.1 24.1l2.1 2.1M8.8 26.2l2.1-2.1M25.1 9.9l2.1-2.1" {...trazo} />
    <circle cx="33" cy="34" r="9" fill="#7cc7a6" />
    <circle cx="33" cy="34" r="9" {...trazo} />
    <path d="M24.5 31c4 1.5 13 1.5 17 0M26 39.5c4-2 10-2 14 0" {...trazo} />
  </svg>
)

const IlustracionControl = () => (
  <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true">
    <rect x="11" y="9" width="26" height="33" rx="4" fill="#dcefe7" />
    <rect x="11" y="9" width="26" height="33" rx="4" {...trazo} />
    <rect x="18" y="5" width="12" height="7" rx="2" {...trazo} fill="#fff" />
    <path d="m17 26 4.5 4.5L31 21" fill="none" stroke="#156352" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M17 36h14" {...trazo} />
  </svg>
)

const IlustracionPortal = () => (
  <svg viewBox="0 0 48 48" width="52" height="52" aria-hidden="true">
    <rect x="14" y="4" width="20" height="40" rx="5" fill="#e6ecfb" />
    <rect x="14" y="4" width="20" height="40" rx="5" {...trazo} />
    <path d="M21 9h6M22 39h4" {...trazo} />
    <ellipse cx="24" cy="26" rx="4.4" ry="3.6" fill="#6c86d8" />
    <ellipse cx="18.8" cy="20.6" rx="1.7" ry="2.2" fill="#6c86d8" />
    <ellipse cx="22.2" cy="18.4" rx="1.7" ry="2.2" fill="#6c86d8" />
    <ellipse cx="25.8" cy="18.4" rx="1.7" ry="2.2" fill="#6c86d8" />
    <ellipse cx="29.2" cy="20.6" rx="1.7" ry="2.2" fill="#6c86d8" />
  </svg>
)

// TEXTOS
// Basados en el plan del proyecto y en las reglas que valida el backend.

const TARJETAS: { titulo: string; texto: string; ilustracion: ReactNode; ancla: string }[] = [
  {
    titulo: 'Hospedaje',
    texto: 'Estadías de 1 a 30 noches, con su cupo verificado cada noche para que nunca falte espacio.',
    ilustracion: <IlustracionHotel />,
    ancla: '#hospedaje',
  },
  {
    titulo: 'Daycare',
    texto: 'Cuidado de día de 07:00 a 19:00 para que tu perro no pase solo la jornada.',
    ilustracion: <IlustracionDaycare />,
    ancla: '#daycare',
  },
  {
    titulo: 'Control diario',
    texto: 'Registramos cada entrada, salida y asistencia. Siempre sabes dónde y cómo está tu perro.',
    ilustracion: <IlustracionControl />,
    ancla: '#nosotros',
  },
  {
    titulo: 'Tu cuenta',
    texto: 'Registra a tus perros, envía solicitudes de reserva y consulta su estado y tu saldo en línea.',
    ilustracion: <IlustracionPortal />,
    ancla: '#portal',
  },
]

const RAZONES = [
  {
    titulo: 'Cupos siempre verificados',
    texto: 'El sistema revisa la capacidad de cada noche y cada día antes de aceptar una reserva: sin sobrecupos.',
    ancla: '#tarifas',
  },
  {
    titulo: 'Una ficha para cada perro',
    texto: 'Raza, peso, edad, dieta, alergias y medicinas a la vista del equipo durante toda la estancia.',
    ancla: '#portal',
  },
  {
    titulo: 'Cuentas claras',
    texto: 'El importe queda fijo al reservar y puedes pagar en uno o varios pagos, con el saldo siempre visible.',
    ancla: '#preguntas',
  },
]

const DETALLES: {
  id: string
  tipo?: TipoServicio
  unidad?: string
  titulo: string
  texto: string
  incluye: string
  foto: string
  descripcionFoto: string
}[] = [
  {
    id: 'hospedaje',
    tipo: 'HOSPEDAJE',
    unidad: 'noche',
    titulo: 'Hospedaje nocturno',
    texto:
      '¿Viajas o trabajas fuera? Tu perro se queda con nosotros de una a treinta noches, en un espacio tranquilo y con su cupo garantizado cada noche.',
    incluye:
      'cupo verificado cada noche, registro de entrada y salida, atención según su ficha (dieta, alergias y medicinas) y noches extra con la misma tarifa.',
    foto: FOTOS.hospedaje,
    descripcionFoto: 'Perro durmiendo en una cama',
  },
  {
    id: 'daycare',
    tipo: 'DAYCARE',
    unidad: 'día',
    titulo: 'Daycare para tu perro',
    texto:
      'Para dueños que trabajan o estudian: tu perro pasa el día acompañado, juega y descansa, y lo recoges por la tarde.',
    incluye: 'horario de 07:00 a 19:00, hasta 31 días seguidos por reserva, asistencia registrada cada día y supervisión del equipo.',
    foto: FOTOS.daycare,
    descripcionFoto: 'Perros jugando juntos en el césped',
  },
  {
    id: 'portal',
    titulo: 'Tu cuenta HACHI',
    texto:
      'Crea tu cuenta en minutos, registra a tus perros y envía tus solicitudes de reserva. El hotel las revisa y te responde en tu cuenta.',
    incluye:
      'ficha de cada perro, precio y cupo antes de enviar, estado y saldo de tus reservas, y el motivo si una solicitud no se puede aceptar.',
    foto: FOTOS.portal,
    descripcionFoto: 'Perro descansando sobre una manta',
  },
]

const PASOS = [
  ['Crea tu cuenta', 'Registra tus datos y la ficha de tu perro: raza, peso, edad y observaciones.'],
  ['Solicita tu reserva', 'Eliges servicio y fechas; ves el cupo y el importe antes de enviarla.'],
  ['Te confirmamos', 'El hotel acepta tu solicitud y registramos la llegada y la salida de tu perro.'],
]

const PREGUNTAS = [
  {
    pregunta: '¿Qué información necesitan de mi perro?',
    respuesta:
      'Su nombre, raza, sexo, fecha de nacimiento y peso, además de observaciones como alergias, dieta o cuidados especiales. Del dueño pedimos nombre, apellido y teléfono; el correo y la dirección son opcionales.',
  },
  {
    pregunta: '¿Cuántas noches puede quedarse en el hotel?',
    respuesta:
      'De 1 a 30 noches por reserva. La salida debe ser al menos un día después de la entrada y las reservas se hacen desde el día de hoy en adelante.',
  },
  {
    pregunta: '¿Cuál es el horario del daycare?',
    respuesta:
      'De 07:00 a 19:00. Puedes reservar hasta 31 días seguidos y la entrada se registra el mismo día de la asistencia.',
  },
  {
    pregunta: '¿Qué pasa después de enviar mi solicitud?',
    respuesta:
      'Queda pendiente hasta que el hotel la revise. Si la acepta, la verás como confirmada en tu cuenta; si no puede aceptarla, verás el motivo. Mientras esté pendiente puedes cancelarla.',
  },
  {
    pregunta: '¿Qué pasa si recojo a mi perro antes o después de lo reservado?',
    respuesta:
      'Si la salida del hotel se retrasa, las noches extra se cobran con la misma tarifa. Si sale antes, se mantiene el monto de la reserva. En daycare, las ausencias no reducen el monto.',
  },
  {
    pregunta: '¿Cómo puedo pagar?',
    respuesta:
      'En efectivo, con tarjeta o por transferencia, en uno o varios pagos. El sistema lleva el saldo y no permite pagar más de lo pendiente.',
  },
  {
    pregunta: '¿Qué es HACHI?',
    respuesta:
      'Un proyecto de la Feria EMI 2026 de la Facultad de Ingeniería de la USAC: una propuesta de hotel canino respaldada por un sistema administrativo y por herramientas de Ingeniería de Métodos. El sistema se presenta como prototipo.',
  },
]

interface Props {
  onIniciarSesion?: () => void
}

// Los precios no se muestran por ahora (secciones comentadas). Para volver a mostrarlos,
// recuperar de git la consulta a GET /api/servicios y la funcion precio().
export default function Inicio({ onIniciarSesion }: Props) {
  return (
    <main className="home">
      {/* Portada */}
      <section id="inicio" className="hero">
        <div className="contenedor hero-grid">
          <div className="hero-texto">
            <h1>
              Cuidamos a tu perro como en <span>CASA</span>
            </h1>
            <p className="hero-descripcion">
              Hospedaje nocturno, daycare y control de cada ingreso y salida. Tu perro bien cuidado, tú tranquilo.
            </p>
            <div className="hero-acciones">
              <button type="button" className="boton boton-verde boton-pastilla" onClick={onIniciarSesion}>
                Reservar ahora
              </button>
              <a href="#servicios" className="boton boton-contorno-verde boton-pastilla">
                Ver servicios
              </a>
            </div>
          </div>

          <div className="hero-visual">
            <span className="hero-mancha" aria-hidden="true" />
            <Foto src={FOTOS.principal} descripcion="Dos perros descansando juntos sobre una manta" className="hero-foto" />
           
          </div>
        </div>

        <div className="contenedor hero-buscador">
          <BuscadorEstancia onContinuar={onIniciarSesion} />
        </div>
      </section>

      {/* Servicios en tarjetas */}
      <section id="servicios" className="servicios-tarjetas">
        <div className="contenedor">
          <div className="tarjetas-grid">
            {TARJETAS.map((t) => (
              <a key={t.titulo} href={t.ancla} className="tarjeta-servicio">
                <span className="tarjeta-ilustracion">{t.ilustracion}</span>
                <h3>{t.titulo}</h3>
                <p>{t.texto}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Banner */}
      <section
        id="nosotros"
        className="banner"
        style={FOTOS.banner ? { backgroundImage: `url(${FOTOS.banner})` } : undefined}
      >
        <div className="contenedor banner-contenido">
          <div className="banner-texto">
            <h2>En HACHI queremos a tu perro, por eso lo consentimos</h2>
            <p>
              Cada estancia se planifica con cupos controlados y un registro de todo lo que pasa: cuándo llegó, cuándo se
              fue y qué cuidados necesita. Así tu perro se siente en casa y tú sabes que está en buenas manos.
            </p>
          </div>
        </div>
      </section>

      {/* Por que elegirnos */}
      <section className="seccion">
        <div className="contenedor razones">
          <Foto src={FOTOS.nosotros} descripcion="Perro durmiendo tranquilo en su canasta" className="razones-foto" />
          <div>
            <p className="sobretitulo">¿Por qué elegirnos?</p>
            <h2>HACHI, un lugar para el bienestar de tu perro</h2>
            <p className="razones-intro">
              Combinamos un equipo atento con un sistema que controla cupos, horarios y pagos, para ofrecerte una
              experiencia completa y confiable.
            </p>
            <ul className="razones-lista">
              {RAZONES.map((r) => (
                <li key={r.titulo}>
                  <a href={r.ancla}>
                    <span>
                      <strong>{r.titulo}</strong>
                      {r.texto}
                    </span>
                    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                      <path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Detalle de cada servicio, alternando foto y texto */}
      {DETALLES.map((s, i) => (
        <section key={s.id} id={s.id} className={`detalle ${i % 2 === 1 ? 'detalle-invertido' : ''}`}>
          <div className="contenedor detalle-grid">
            <Foto src={s.foto} descripcion={s.descripcionFoto} className="detalle-foto" />
            <div className="detalle-texto">
              <h2>{s.titulo}</h2>
              <p>{s.texto}</p>
              <p>
                <strong>Incluye:</strong> {s.incluye}
              </p>
              {/* {s.tipo && (
                <p className="detalle-precio">
                  {precio(s.tipo)} <span>/ {s.unidad}</span>
                </p>
              )} */}
              {s.tipo ? (
                <button type="button" className="boton boton-verde boton-pastilla boton-chico-home" onClick={onIniciarSesion}>
                  <IconoCalendario width={16} height={16} /> Reservar {s.tipo === 'HOSPEDAJE' ? 'hospedaje' : 'daycare'}
                </button>
              ) : (
                <Link to="/registro" className="boton boton-verde boton-pastilla boton-chico-home">
                  Crear mi cuenta <IconoFlecha width={16} height={16} />
                </Link>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Proceso */}
      <section id="proceso" className="seccion">
        <div className="contenedor">
          <div className="encabezado encabezado-centro">
            <p className="sobretitulo">Proceso</p>
            <h2>Tres pasos para su primera estancia</h2>
          </div>
          <ol className="pasos">
            {PASOS.map(([titulo, texto], i) => (
              <li key={titulo}>
                <span className="paso-numero">{i + 1}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Tarifas
      <section id="tarifas" className="seccion seccion-gris">
        <div className="contenedor">
          <div className="encabezado encabezado-centro">
            <p className="sobretitulo">Tarifas</p>
            <h2>Tarifas transparentes</h2>
          </div>

          <div className="tarifas">
            <article className="tarifa">
              <p className="tarifa-nombre">Daycare</p>
              <p className="tarifa-precio">
                {precio('DAYCARE')} <span>/ día</span>
              </p>
              <ul className="lista-check">
                <li>
                  <IconoCheck width={16} height={16} /> De 07:00 a 19:00
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> Hasta 31 días seguidos
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> Asistencia diaria registrada
                </li>
              </ul>
              <button type="button" className="boton boton-contorno-verde boton-pastilla tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>

            <article className="tarifa tarifa-destacada">
              <p className="tarifa-nombre">
                Hospedaje <span className="insignia">Servicio principal</span>
              </p>
              <p className="tarifa-precio">
                {precio('HOSPEDAJE')} <span>/ noche</span>
              </p>
              <ul className="lista-check">
                <li>
                  <IconoCheck width={16} height={16} /> De 1 a 30 noches
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> Check-in y check-out registrados
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> Noches extra con la misma tarifa
                </li>
              </ul>
              <button type="button" className="boton boton-blanco boton-pastilla tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>

            <article className="tarifa">
              <p className="tarifa-nombre">
                <IconoTarjeta width={18} height={18} /> Pagos
              </p>
              <p className="tarifa-precio tarifa-precio-texto">En uno o varios pagos</p>
              <ul className="lista-check">
                <li>
                  <IconoCheck width={16} height={16} /> Efectivo, tarjeta o transferencia
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> Saldo siempre a la vista
                </li>
                <li>
                  <IconoCheck width={16} height={16} /> El importe queda fijo al reservar
                </li>
              </ul>
              <button type="button" className="boton boton-contorno-verde boton-pastilla tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>
          </div>

          <p className="tarifas-nota">
            Tarifas vigentes configuradas en el sistema. El importe final se calcula al reservar, según las noches o los
            días de la estancia.
          </p>
        </div>
      </section> */}

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="seccion">
        <div className="contenedor preguntas-grid">
          <div>
            <p className="sobretitulo">Preguntas frecuentes</p>
            <h2>Lo que más nos preguntan</h2>
            <p className="preguntas-intro">Respuestas basadas en las reglas con las que trabaja el sistema de HACHI.</p>
          </div>

          <div className="preguntas">
            {PREGUNTAS.map((p, i) => (
              <details key={p.pregunta} className="pregunta" open={i === 0}>
                <summary>{p.pregunta}</summary>
                <p>{p.respuesta}</p>
              </details>
            ))}
          </div>
        </div>

        <div className="contenedor">
          <div className="cierre" style={FOTOS.cierre ? { backgroundImage: `url(${FOTOS.cierre})` } : undefined}>
            <div>
              <h2>¿Listo para su primera estancia?</h2>
              <p>Crea tu cuenta, registra a tu perro y envía tu solicitud. Te respondemos en tu cuenta.</p>
            </div>
            <div className="cierre-acciones">
              <Link to="/registro" className="boton boton-blanco boton-pastilla">
                Crear cuenta
              </Link>
              <button type="button" className="boton boton-contorno-claro boton-pastilla" onClick={onIniciarSesion}>
                Iniciar sesión
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="pie">
        <div className="contenedor">
          <div className="pie-grid">
            <div>
              <p className="pie-marca">
                <img src="/logo-completo.png" alt="hachi · hotel canino" width="134" height="56" />
              </p>
              <p>Hospedaje nocturno y daycare</p>
            </div>
            <div>
              <p className="pie-titulo">Servicios</p>
              <a href="#hospedaje">Hospedaje nocturno</a>
              <a href="#daycare">Daycare</a>
              <a href="#portal">Tu cuenta</a>
            </div>
            <div>
              <p className="pie-titulo">Información</p>
              <a href="#nosotros">Nosotros</a>
              <a href="#tarifas">Tarifas</a>
              <a href="#preguntas">Preguntas</a>
            </div>
            <div>
              <p className="pie-titulo">Proyecto</p>
              <p>Feria EMI 2026</p>
              <p>Facultad de Ingeniería, USAC</p>
            </div>
          </div>
          <div className="pie-legal">
            <span>© 2026 HACHI</span>
            <span>Prototipo académico · Fotografías con licencia libre (CC0)</span>
          </div>
        </div>
      </footer>

      {/* Acceso rapido para reservar desde cualquier parte de la pagina */}
      <button type="button" className="boton-flotante" onClick={onIniciarSesion} aria-label="Reservar ahora">
        <IconoCalendario width={22} height={22} />
        <span>Reservar</span>
      </button>
    </main>
  )
}
