import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import type { Servicio } from '../../api/tipos'
import { Aviso, Cargando, Encabezado } from '../ui'
import { useCarga } from '../useCarga'
import Capacidades from './Capacidades'
import Tarifas from './Tarifas'
import Usuarios from './Usuarios'

const PESTANAS = [
  { id: 'tarifas', titulo: 'Tarifas' },
  { id: 'capacidades', titulo: 'Capacidad' },
  { id: 'usuarios', titulo: 'Usuarios' },
] as const

type Pestana = (typeof PESTANAS)[number]['id']

export default function Configuracion() {
  const [pestana, setPestana] = useState<Pestana>('tarifas')
  const servicios = useCarga(() => api<Servicio[]>('/servicios'), [])

  useEffect(() => {
    document.title = 'Configuración · HACHI'
  }, [])

  return (
    <div className="pagina">
      <Encabezado titulo="Configuración" subtitulo="Precios, cupos y cuentas del personal. Un cambio de precio solo afecta a las reservas nuevas." />

      <div className="caja">
        <div className="pestanas" role="tablist">
          {PESTANAS.map((p) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={pestana === p.id}
              className={`pestana ${pestana === p.id ? 'activa' : ''}`}
              onClick={() => setPestana(p.id)}
            >
              {p.titulo}
            </button>
          ))}
        </div>

        {pestana === 'usuarios' ? (
          <Usuarios />
        ) : servicios.error ? (
          <div className="caja-cuerpo">
            <Aviso>{servicios.error}</Aviso>
          </div>
        ) : !servicios.datos ? (
          <Cargando />
        ) : pestana === 'tarifas' ? (
          <Tarifas servicios={servicios.datos} onCambio={servicios.recargar} />
        ) : (
          <Capacidades servicios={servicios.datos} onCambio={servicios.recargar} />
        )}
      </div>
    </div>
  )
}
