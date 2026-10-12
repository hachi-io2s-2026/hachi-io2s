import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api/client'
import type { Mascota } from '../api/tipos'
import FormMascota from '../panel/propietarios/FormMascota'
import { Aviso, Avatar, Cargando, Encabezado } from '../panel/ui'
import { useCarga } from '../panel/useCarga'
import { edad } from '../utils/formato'

export default function PerrosCliente() {
  const { datos, error, recargar } = useCarga(() => api<{ mascotas: Mascota[] }>('/cliente/me'), [])
  const [form, setForm] = useState<{ abierto: boolean; mascota: Mascota | null }>({ abierto: false, mascota: null })
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Mis perros · HACHI'
  }, [])

  const perros = datos?.mascotas.filter((m) => m.activo) ?? []

  return (
    <div className="pagina">
      <Encabezado
        titulo="Mis perros"
        subtitulo="Mantén al día la ficha de cada perro: así el equipo sabe cómo cuidarlo."
        acciones={
          <button type="button" className="boton boton-verde" onClick={() => setForm({ abierto: true, mascota: null })}>
            Agregar perro
          </button>
        }
      />

      {aviso && (
        <Aviso tipo="ok" onCerrar={() => setAviso(null)}>
          {aviso}
        </Aviso>
      )}
      {error && <Aviso>{error}</Aviso>}
      {!datos && !error && <Cargando />}

      {datos && perros.length === 0 && (
        <div className="caja">
          <div className="vacio">
            <p className="vacio-titulo">Todavía no registras a tu perro</p>
            <p className="vacio-texto">Agrega su ficha para poder solicitar una estancia.</p>
            <button type="button" className="boton boton-verde boton-chico" onClick={() => setForm({ abierto: true, mascota: null })}>
              Agregar perro
            </button>
          </div>
        </div>
      )}

      <div className="portal-perros">
        {perros.map((m) => (
          <article key={m.id_mascota} className="caja portal-perro">
            <div className="portal-perro-cabecera">
              <Avatar nombre={m.nombre} />
              <div>
                <h2>{m.nombre}</h2>
                <span>{m.raza ?? 'Raza sin indicar'}</span>
              </div>
            </div>
            <dl className="portal-perro-datos">
              <div>
                <dt>Sexo</dt>
                <dd>{m.sexo === 'MACHO' ? 'Macho' : m.sexo === 'HEMBRA' ? 'Hembra' : '—'}</dd>
              </div>
              <div>
                <dt>Edad</dt>
                <dd>{edad(m.fecha_nacimiento)}</dd>
              </div>
              <div>
                <dt>Peso</dt>
                <dd>{m.peso_kg != null ? `${m.peso_kg} kg` : '—'}</dd>
              </div>
            </dl>
            <p className="portal-perro-notas">
              <strong>Cuidados especiales:</strong> {m.observaciones ?? 'Sin indicaciones.'}
            </p>
            <div className="portal-perro-acciones">
              <button type="button" className="boton boton-gris boton-chico" onClick={() => setForm({ abierto: true, mascota: m })}>
                Editar ficha
              </button>
              <Link to={`/mi-cuenta/reservar?mascota=${m.id_mascota}`} className="boton boton-verde boton-chico">
                Solicitar estancia
              </Link>
            </div>
          </article>
        ))}
      </div>

      <FormMascota
        abierto={form.abierto}
        rutaBase="/cliente/mascotas"
        inicial={form.mascota}
        onCerrar={() => setForm({ abierto: false, mascota: null })}
        onGuardado={() => {
          setAviso(form.mascota ? 'Ficha actualizada.' : 'Perro registrado. Ya puedes solicitar una estancia para él.')
          setForm({ abierto: false, mascota: null })
          recargar()
        }}
      />
    </div>
  )
}
