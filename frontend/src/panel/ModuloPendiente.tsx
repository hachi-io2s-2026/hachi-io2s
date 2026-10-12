import { useEffect } from 'react'
import { IconoCheck } from '../components/Iconos'
import type { Modulo } from './modulos'

// Pantalla temporal para los modulos que aun no se construyen en el frontend
export default function ModuloPendiente({ modulo }: { modulo: Modulo }) {
  useEffect(() => {
    document.title = `${modulo.titulo} · HACHI`
  }, [modulo.titulo])

  return (
    <div className="pagina">
      <header className="pagina-encabezado">
        <h1>{modulo.titulo}</h1>
        <p className="pagina-subtitulo">{modulo.descripcion}</p>
      </header>

      <section className="tarjeta-panel pendiente">
        <span className="pendiente-icono">{modulo.icono}</span>
        <h2>Módulo en construcción</h2>
        <p>El backend de este módulo ya está listo; su pantalla se construirá en el siguiente paso.</p>
        {modulo.incluye && (
          <ul className="pendiente-lista">
            {modulo.incluye.map((i) => (
              <li key={i}>
                <IconoCheck width={16} height={16} /> {i}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
