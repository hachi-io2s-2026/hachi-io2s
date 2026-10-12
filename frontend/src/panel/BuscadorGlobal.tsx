import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router'
import { api, query } from '../api/client'
import type { Mascota, Propietario } from '../api/tipos'
import { IconoBuscar } from '../components/Iconos'
import { Avatar } from './ui'
import { useRetrasado } from './useCarga'

interface Resultado {
  clave: string
  titulo: string
  detalle: string
  ruta: string
}

// Busca perros y duenos a la vez desde la barra superior del panel
export default function BuscadorGlobal() {
  const navegar = useNavigate()
  const [texto, setTexto] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(0)
  const q = useRetrasado(texto.trim(), 250)
  const [respuesta, setRespuesta] = useState<{ q: string; perros: Resultado[]; duenos: Resultado[] } | null>(null)
  const caja = useRef<HTMLDivElement>(null)
  const campo = useRef<HTMLInputElement>(null)

  // Atajo: la tecla "/" enfoca el buscador (si no se esta escribiendo en otro campo)
  useEffect(() => {
    const atajo = (e: globalThis.KeyboardEvent) => {
      const destino = e.target as HTMLElement
      if (e.key !== '/' || ['INPUT', 'TEXTAREA', 'SELECT'].includes(destino.tagName)) return
      e.preventDefault()
      campo.current?.focus()
    }
    document.addEventListener('keydown', atajo)
    return () => document.removeEventListener('keydown', atajo)
  }, [])

  useEffect(() => {
    if (q.length < 2) return
    let vigente = true
    Promise.all([api<Mascota[]>(`/mascotas${query({ q })}`), api<Propietario[]>(`/propietarios${query({ q })}`)])
      .then(([mascotas, propietarios]) => {
        if (!vigente) return
        setRespuesta({
          q,
          perros: mascotas.slice(0, 5).map((m) => ({
            clave: `m${m.id_mascota}`,
            titulo: m.nombre,
            detalle: `${m.raza ?? 'Perro'} · ${m.propietario}`,
            ruta: `/panel/propietarios/${m.id_propietario}`,
          })),
          duenos: propietarios.slice(0, 5).map((p) => ({
            clave: `p${p.id_propietario}`,
            titulo: `${p.nombre} ${p.apellido}`,
            detalle: `${p.telefono} · ${p.total_mascotas} ${p.total_mascotas === 1 ? 'perro' : 'perros'}`,
            ruta: `/panel/propietarios/${p.id_propietario}`,
          })),
        })
        setActivo(0)
      })
      .catch(() => vigente && setRespuesta({ q, perros: [], duenos: [] }))
    return () => {
      vigente = false
    }
  }, [q])

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const fuera = (e: MouseEvent) => caja.current && !caja.current.contains(e.target as Node) && setAbierto(false)
    document.addEventListener('mousedown', fuera)
    return () => document.removeEventListener('mousedown', fuera)
  }, [])

  const vigente = respuesta && respuesta.q === texto.trim() ? respuesta : null
  const todos = vigente ? [...vigente.perros, ...vigente.duenos] : []
  const mostrar = abierto && texto.trim().length >= 2

  const ir = (r: Resultado) => {
    navegar(r.ruta)
    setTexto('')
    setAbierto(false)
  }

  const teclado = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setAbierto(false)
      campo.current?.blur()
    }
    if (!todos.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActivo((a) => (a + 1) % todos.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((a) => (a - 1 + todos.length) % todos.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      ir(todos[activo])
    }
  }

  const grupo = (titulo: string, items: Resultado[], desplazamiento: number) =>
    items.length > 0 && (
      <div className="busqueda-grupo">
        <p>{titulo}</p>
        {items.map((r, i) => (
          <button
            key={r.clave}
            type="button"
            className={activo === desplazamiento + i ? 'activo' : ''}
            onMouseEnter={() => setActivo(desplazamiento + i)}
            onClick={() => ir(r)}
          >
            <Avatar nombre={r.titulo} chico />
            <span>
              <strong>{r.titulo}</strong>
              <small>{r.detalle}</small>
            </span>
          </button>
        ))}
      </div>
    )

  return (
    <div className="busqueda" ref={caja}>
      <IconoBuscar width={17} height={17} className="busqueda-icono" />
      <input
        ref={campo}
        type="search"
        placeholder="Buscar perro o dueño"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value)
          setAbierto(true)
        }}
        onFocus={() => setAbierto(true)}
        onKeyDown={teclado}
        aria-label="Buscar perro o dueño"
        aria-expanded={mostrar}
      />
      <kbd className="busqueda-atajo" title="Presiona / para buscar">/</kbd>
      {mostrar && (
        <div className="busqueda-resultados" role="listbox">
          {!vigente && <p className="busqueda-estado">Buscando…</p>}
          {vigente && todos.length === 0 && <p className="busqueda-estado">Sin resultados para “{texto.trim()}”.</p>}
          {vigente && grupo('Perros', vigente.perros, 0)}
          {vigente && grupo('Dueños', vigente.duenos, vigente.perros.length)}
        </div>
      )}
    </div>
  )
}
