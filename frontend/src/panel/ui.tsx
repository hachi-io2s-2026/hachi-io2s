// Componentes de interfaz compartidos por los modulos del panel
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { mensajeError } from '../api/client'
import { IconoCerrar, IconoFlecha } from '../components/Iconos'
import './ui.css'

export function Encabezado({
  titulo,
  subtitulo,
  acciones,
  volver,
}: {
  titulo: ReactNode
  subtitulo?: ReactNode
  acciones?: ReactNode
  volver?: { a: string; texto: string }
}) {
  return (
    <header className="pagina-encabezado encabezado-modulo">
      <div>
        {volver && (
          <Link to={volver.a} className="volver">
            <IconoFlecha width={15} height={15} className="flecha-atras" /> {volver.texto}
          </Link>
        )}
        <h1>{titulo}</h1>
        {subtitulo && <p className="pagina-subtitulo">{subtitulo}</p>}
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </header>
  )
}

export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div className="cargando" role="status">
      <span className="spinner" aria-hidden="true" />
      {texto}
    </div>
  )
}

export function Vacio({ titulo, texto, accion }: { titulo: string; texto?: string; accion?: ReactNode }) {
  return (
    <div className="vacio">
      <img src="/logo.svg" alt="" width="40" height="40" />
      <p className="vacio-titulo">{titulo}</p>
      {texto && <p className="vacio-texto">{texto}</p>}
      {accion}
    </div>
  )
}

export function Aviso({
  tipo = 'error',
  children,
  onCerrar,
}: {
  tipo?: 'error' | 'ok' | 'info' | 'alerta'
  children: ReactNode
  onCerrar?: () => void
}) {
  return (
    <div className={`aviso aviso-${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <div className="aviso-texto">{children}</div>
      {onCerrar && (
        <button type="button" className="aviso-cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
          <IconoCerrar width={16} height={16} />
        </button>
      )}
    </div>
  )
}

const ESTADOS: Record<string, [string, string]> = {
  PENDIENTE: ['Pendiente', 'ambar'],
  CONFIRMADA: ['Confirmada', 'azul'],
  EN_CURSO: ['En curso', 'verde'],
  FINALIZADA: ['Finalizada', 'gris'],
  CANCELADA: ['Cancelada', 'rojo'],
  // Estados derivados de las solicitudes del portal (no existen en la base de datos)
  SOLICITUD: ['Solicitud por responder', 'ambar'],
  RECHAZADA: ['Rechazada', 'rojo'],
  HOSPEDADO: ['Hospedado', 'verde'],
  FINALIZADO: ['Finalizado', 'gris'],
  PROGRAMADO: ['Programado', 'azul'],
  PRESENTE: ['Presente', 'verde'],
  AUSENTE: ['Ausente', 'rojo'],
  PAGADO: ['Pagado', 'verde'],
  ANULADO: ['Anulado', 'rojo'],
  ACTIVO: ['Activo', 'verde'],
  INACTIVO: ['Inactivo', 'gris'],
  ADMIN: ['Administrador', 'azul'],
  EMPLEADO: ['Empleado', 'gris'],
}

export function Estado({ valor }: { valor: string }) {
  const [texto, color] = ESTADOS[valor] ?? [valor, 'gris']
  return <span className={`insignia-estado insignia-${color}`}>{texto}</span>
}

export function Modal({
  titulo,
  abierto,
  onCerrar,
  children,
  pie,
  ancho = 520,
}: {
  titulo: string
  abierto: boolean
  onCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: number
}) {
  const caja = useRef<HTMLDivElement>(null)
  // Se guarda en una referencia para no reenfocar el modal en cada render
  const cerrarRef = useRef(onCerrar)
  useEffect(() => {
    cerrarRef.current = onCerrar
  })

  useEffect(() => {
    if (!abierto) return
    const alPresionar = (e: KeyboardEvent) => e.key === 'Escape' && cerrarRef.current()
    document.addEventListener('keydown', alPresionar)
    // Enfocar el primer campo del modal al abrirlo
    caja.current?.querySelector<HTMLElement>('input, select, textarea, button.boton')?.focus()
    return () => document.removeEventListener('keydown', alPresionar)
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="modal-fondo" onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}>
      <div
        ref={caja}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        style={{ maxWidth: ancho }}
      >
        <div className="modal-encabezado">
          <h2>{titulo}</h2>
          <button type="button" className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <IconoCerrar width={18} height={18} />
          </button>
        </div>
        <div className="modal-cuerpo">{children}</div>
        {pie && <div className="modal-pie">{pie}</div>}
      </div>
    </div>
  )
}

// Ventana de confirmacion para acciones importantes (cancelar, anular, dar de baja...)
export function Confirmar({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = 'Confirmar',
  peligro = false,
  onConfirmar,
  onCerrar,
}: {
  abierto: boolean
  titulo: string
  mensaje: ReactNode
  textoConfirmar?: string
  peligro?: boolean
  onConfirmar: () => Promise<void>
  onCerrar: () => void
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const confirmar = async () => {
    setEnviando(true)
    setError(null)
    try {
      await onConfirmar()
      onCerrar()
    } catch (e) {
      setError(mensajeError(e))
    } finally {
      setEnviando(false)
    }
  }

  const cerrar = () => {
    if (enviando) return
    setError(null)
    onCerrar()
  }

  return (
    <Modal
      titulo={titulo}
      abierto={abierto}
      onCerrar={cerrar}
      ancho={440}
      pie={
        <>
          <button type="button" className="boton boton-gris" onClick={cerrar} disabled={enviando}>
            Volver
          </button>
          <button
            type="button"
            className={`boton ${peligro ? 'boton-peligro' : 'boton-verde'}`}
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? 'Procesando…' : textoConfirmar}
          </button>
        </>
      }
    >
      <div className="confirmar-mensaje">{mensaje}</div>
      {error && <Aviso>{error}</Aviso>}
    </Modal>
  )
}

// Circulo con las iniciales; el color sale del nombre para que cada perro tenga siempre el mismo
const TONOS = ['verde', 'azul', 'ambar', 'rosa', 'morado', 'gris']

export function Avatar({ nombre, chico = false }: { nombre: string; chico?: boolean }) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean)
  const iniciales = (partes.length > 1 ? partes[0][0] + partes[1][0] : nombre.slice(0, 2)).toUpperCase()
  let h = 0
  for (const c of nombre) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return (
    <span className={`avatar avatar-${TONOS[h % TONOS.length]} ${chico ? 'avatar-chico' : ''}`} aria-hidden="true">
      {iniciales}
    </span>
  )
}

// Pie de tabla: "Mostrando 1–10 de 54" y botones de pagina
export function Paginacion({
  pagina,
  paginas,
  total,
  desde,
  hasta,
  irA,
}: {
  pagina: number
  paginas: number
  total: number
  desde: number
  hasta: number
  irA: (p: number) => void
}) {
  if (total === 0) return null
  // Hasta 5 numeros alrededor de la pagina actual
  const primero = Math.max(1, Math.min(pagina - 2, paginas - 4))
  const numeros = Array.from({ length: Math.min(5, paginas) }, (_, i) => primero + i)

  return (
    <div className="paginacion">
      <span className="paginacion-texto">
        Mostrando {desde}–{hasta} de {total}
      </span>
      {paginas > 1 && (
        <div className="paginacion-botones">
          <button type="button" onClick={() => irA(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior">
            <IconoFlecha width={14} height={14} className="flecha-atras" />
          </button>
          {numeros.map((n) => (
            <button
              key={n}
              type="button"
              className={n === pagina ? 'activa' : ''}
              onClick={() => irA(n)}
              aria-current={n === pagina ? 'page' : undefined}
            >
              {n}
            </button>
          ))}
          <button type="button" onClick={() => irA(pagina + 1)} disabled={pagina === paginas} aria-label="Página siguiente">
            <IconoFlecha width={14} height={14} />
          </button>
        </div>
      )}
    </div>
  )
}

// Envoltorio de etiqueta + control de formulario
export function Campo({
  etiqueta,
  ayuda,
  children,
  ancho,
}: {
  etiqueta: string
  ayuda?: string
  children: ReactNode
  ancho?: 'completo'
}) {
  return (
    <label className={`campo-form ${ancho === 'completo' ? 'campo-completo' : ''}`}>
      <span className="campo-etiqueta">{etiqueta}</span>
      {children}
      {ayuda && <span className="campo-ayuda">{ayuda}</span>}
    </label>
  )
}
