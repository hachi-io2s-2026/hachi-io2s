import { useEffect, useState, type ReactNode } from 'react'
import { api } from '../api/client'
import BuscadorEstancia from '../components/BuscadorEstancia'
import Foto from '../components/Foto'
import { IconoCheck, IconoFlecha, IconoLuna, IconoSol, IconoTarjeta } from '../components/Iconos'
import './Inicio.css'

// FOTOGRAFIAS (frontend/public/fotos/, licencia CC0; ver CREDITOS.md en esa carpeta)
// Para usar fotos propias, reemplaza los archivos o cambia aqui la ruta.
// Si una ruta queda vacia se muestra un espacio reservado con su descripcion.
const FOTOS = {
  principal: '/fotos/principal.jpg',
  hospedaje: '/fotos/hospedaje.jpg',
  daycare: '/fotos/daycare.webp',
  control: '/fotos/control.webp',
  cierre: '/fotos/galeria-3.webp',
}

const GALERIA = [
  { src: '/fotos/galeria-1.jpg', titulo: 'Descanso en compañía' },
  { src: '/fotos/galeria-2.webp', titulo: 'Juego supervisado' },
  { src: '/fotos/galeria-3.webp', titulo: 'Tiempo al aire libre' },
  { src: '/fotos/galeria-4.jpg', titulo: 'La siesta de la tarde' },
]

// Respuesta de GET /api/servicios (ruta publica del backend)
type TipoServicio = 'HOSPEDAJE' | 'DAYCARE'
interface ServicioApi {
  tipo: TipoServicio
  tarifa_vigente: { precio: number } | null
}

const moneda = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' })

// TEXTOS
// Basados en el plan del proyecto y en las reglas que valida el backend.

const SERVICIOS: {
  tipo: TipoServicio
  icono: ReactNode
  etiqueta: string
  titulo: string
  texto: string
  unidad: string
  foto: string
  descripcionFoto: string
}[] = [
  {
    tipo: 'HOSPEDAJE',
    icono: <IconoLuna width={18} height={18} />,
    etiqueta: 'Servicio principal',
    titulo: 'Hospedaje nocturno',
    texto:
      'Estadías de una o varias noches, con fecha de entrada y salida y cupo verificado cada noche.',
    unidad: 'noche',
    foto: FOTOS.hospedaje,
    descripcionFoto: 'Perro durmiendo en una cama',
  },
  {
    tipo: 'DAYCARE',
    icono: <IconoSol width={18} height={18} />,
    etiqueta: 'Servicio complementario',
    titulo: 'Daycare',
    texto:
      'Cuidado de día para dueños que trabajan o estudian, de 07:00 a 19:00 y con control de asistencia diaria.',
    unidad: 'día',
    foto: FOTOS.daycare,
    descripcionFoto: 'Perros jugando juntos en el césped',
  },
]

const PASOS = [
  ['Registro', 'Registramos tus datos y la ficha de tu perro: raza, peso, edad y observaciones.'],
  ['Reserva', 'Eliges servicio y fechas; el sistema verifica el cupo y calcula el importe.'],
  ['Ingreso y salida', 'Registramos su llegada y su salida, y liquidas el saldo en uno o varios pagos.'],
]

const CONTROLES = [
  'Cupo verificado cada noche y cada día, sin sobrecupos',
  'Una sola reserva activa por perro en las mismas fechas',
  'Registro de ingreso y salida de cada perro',
  'Ficha con alergias, dieta y cuidados especiales',
  'Asistencia diaria registrada en el daycare',
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
    pregunta: '¿Qué pasa si recojo a mi perro antes o después de lo reservado?',
    respuesta:
      'Si la salida del hotel se retrasa, las noches extra se cobran con la misma tarifa. Si sale antes, se mantiene el monto de la reserva. En daycare, las ausencias no reducen el monto.',
  },
  {
    pregunta: '¿Puedo cancelar una reserva?',
    respuesta:
      'Sí, mientras esté pendiente o confirmada y tu perro aún no haya ingresado. Al cancelarla se libera su cupo.',
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

export default function Inicio({ onIniciarSesion }: Props) {
  // null = cargando; [] = no se pudo consultar el backend
  const [servicios, setServicios] = useState<ServicioApi[] | null>(null)

  useEffect(() => {
    let vigente = true
    api<ServicioApi[]>('/servicios').then(
      (datos) => vigente && setServicios(datos),
      () => vigente && setServicios([]),
    )
    return () => {
      vigente = false
    }
  }, [])

  const precio = (tipo: TipoServicio) => {
    if (servicios === null) return '…'
    const valor = servicios.find((s) => s.tipo === tipo)?.tarifa_vigente?.precio
    return valor === undefined ? 'Por confirmar' : moneda.format(valor)
  }

  return (
    <main>
      {/* Portada */}
      <section id="inicio" className="hero">
        <div className="contenedor">
          <div className="hero-grid">
            <div className="hero-texto">
              <h1>Cuidado para tu perro, de día y de noche.</h1>
              <p className="hero-descripcion">
                Hotel y daycare canino con cupos controlados y registro de cada ingreso y salida.
                Tu perro bien cuidado, tú tranquilo.
              </p>
              <div className="hero-acciones">
                <button type="button" className="boton boton-verde" onClick={onIniciarSesion}>
                  Reservar ahora
                </button>
                <a href="#servicios" className="boton boton-gris">
                  Ver servicios
                </a>
              </div>
            </div>

            <Foto
              src={FOTOS.principal}
              descripcion="Perro durmiendo tranquilo en su canasta"
              className="hero-foto"
            />
          </div>

          <div className="hero-buscador">
            <BuscadorEstancia onContinuar={onIniciarSesion} />
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section id="servicios" className="seccion seccion-gris">
        <div className="contenedor">
          <div className="encabezado encabezado-fila">
            <div>
              <p className="sobretitulo">Servicios</p>
              <h2>Todo lo que tu perro necesita, en un solo lugar</h2>
            </div>
            <a href="#tarifas" className="enlace">
              Ver tarifas <IconoFlecha width={16} height={16} />
            </a>
          </div>

          <div className="servicios">
            {SERVICIOS.map((s) => (
              <article key={s.tipo} className="tarjeta servicio">
                <Foto src={s.foto} descripcion={s.descripcionFoto} className="servicio-foto" />
                <div className="servicio-cuerpo">
                  <p className="servicio-etiqueta">
                    <span className="icono-caja">{s.icono}</span>
                    {s.etiqueta}
                  </p>
                  <h3>{s.titulo}</h3>
                  <p>{s.texto}</p>
                  <div className="servicio-pie">
                    <p className="servicio-precio">
                      {precio(s.tipo)} <span>/ {s.unidad}</span>
                    </p>
                    <button type="button" className="enlace enlace-boton" onClick={onIniciarSesion}>
                      Reservar <IconoFlecha width={16} height={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section id="proceso" className="seccion">
        <div className="contenedor">
          <div className="encabezado">
            <p className="sobretitulo">Proceso</p>
            <h2>Tres pasos para su primera estancia</h2>
          </div>

          <ol className="pasos">
            {PASOS.map(([titulo, texto], i) => (
              <li key={titulo}>
                <span className="paso-numero">{String(i + 1).padStart(2, '0')}</span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>

          <div className="control">
            <Foto
              src={FOTOS.control}
              descripcion="Perros corriendo en el césped"
              className="control-foto"
            />
            <div>
              <p className="sobretitulo">Control</p>
              <h2>Estándares claros en cada estancia</h2>
              <ul className="lista-check">
                {CONTROLES.map((c) => (
                  <li key={c}>
                    <IconoCheck width={18} height={18} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Galeria */}
      <section id="galeria" className="seccion seccion-galeria">
        <div className="contenedor">
          <div className="encabezado encabezado-fila">
            <div>
              <p className="sobretitulo">Galería</p>
              <h2>Momentos en HACHI</h2>
            </div>
            <p className="encabezado-texto">
              Descanso, juego y compañía: así queremos que se sientan los perros con nosotros.
            </p>
          </div>

          <div className="galeria">
            {GALERIA.map((g, i) => (
              <figure key={g.src} className={`galeria-item galeria-${i + 1}`}>
                <Foto src={g.src} descripcion={g.titulo} />
                <figcaption>{g.titulo}</figcaption>
              </figure>
            ))}
          </div>
          <p className="galeria-nota">Fotografías de referencia con licencia libre (CC0).</p>
        </div>
      </section>

      {/* Tarifas */}
      <section id="tarifas" className="seccion seccion-gris">
        <div className="contenedor">
          <div className="encabezado">
            <p className="sobretitulo">Tarifas</p>
            <h2>Tarifas transparentes</h2>
          </div>

          <div className="tarifas">
            <article className="tarjeta tarifa">
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
              <button type="button" className="boton boton-gris tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>

            <article className="tarjeta tarifa tarifa-destacada">
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
              <button type="button" className="boton boton-verde tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>

            <article className="tarjeta tarifa">
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
              <button type="button" className="boton boton-gris tarifa-boton" onClick={onIniciarSesion}>
                Reservar
              </button>
            </article>
          </div>

          <p className="tarifas-nota">
            Tarifas vigentes configuradas en el sistema. El importe final se calcula al reservar,
            según las noches o los días de la estancia.
          </p>
        </div>
      </section>

      {/* Preguntas frecuentes */}
      <section id="preguntas" className="seccion">
        <div className="contenedor preguntas-grid">
          <div>
            <p className="sobretitulo">Preguntas frecuentes</p>
            <h2>Lo que más nos preguntan</h2>
            <p className="preguntas-intro">
              Respuestas basadas en las reglas con las que trabaja el sistema de HACHI.
            </p>
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
          <div
            className="cierre"
            style={FOTOS.cierre ? { backgroundImage: `url(${FOTOS.cierre})` } : undefined}
          >
            <div>
              <h2>¿Listo para reservar?</h2>
              <p>Consulta la disponibilidad y el importe de la estancia de tu perro en el sistema.</p>
            </div>
            <div className="cierre-acciones">
              <button type="button" className="boton boton-blanco" onClick={onIniciarSesion}>
                Iniciar sesión
              </button>
              <a href="#tarifas" className="boton boton-contorno-claro">
                Ver tarifas
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="pie">
        <div className="contenedor">
          <div className="pie-grid">
            <div>
              <p className="pie-marca">
                <img src="/logo.svg" alt="" width="28" height="28" />
                HACHI
              </p>
              <p>Hotel y daycare canino</p>
            </div>
            <div>
              <p className="pie-titulo">Servicios</p>
              <a href="#servicios">Hospedaje nocturno</a>
              <a href="#servicios">Daycare</a>
            </div>
            <div>
              <p className="pie-titulo">Información</p>
              <a href="#proceso">Proceso</a>
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
            <span>Prototipo académico</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
