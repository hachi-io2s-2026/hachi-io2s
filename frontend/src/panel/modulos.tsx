import type { ReactNode } from 'react'
import type { Rol } from '../auth/contexto'
import {
  IconoAjustes,
  IconoCalendario,
  IconoInicio,
  IconoLuna,
  IconoSol,
  IconoUsuarios,
} from '../components/Iconos'

export interface Modulo {
  ruta: string
  titulo: string
  descripcion: string
  icono: ReactNode
  roles?: Rol[]
}

// Modulos del panel. El orden es el del menu lateral.
export const MODULOS: Modulo[] = [
  {
    ruta: '/panel',
    titulo: 'Hoy',
    descripcion: 'Entradas, salidas y alertas del día.',
    icono: <IconoInicio width={19} height={19} />,
  },
  {
    ruta: '/panel/reservaciones',
    titulo: 'Reservaciones',
    descripcion: 'Crear, cotizar, confirmar y cancelar reservas.',
    icono: <IconoCalendario width={19} height={19} />,
  },
  {
    ruta: '/panel/hospedaje',
    titulo: 'Hospedaje',
    descripcion: 'Registrar ingresos (check-in) y salidas (check-out).',
    icono: <IconoLuna width={19} height={19} />,
  },
  {
    ruta: '/panel/daycare',
    titulo: 'Daycare',
    descripcion: 'Control de asistencia diaria.',
    icono: <IconoSol width={19} height={19} />,
  },
  {
    ruta: '/panel/propietarios',
    titulo: 'Dueños y perros',
    descripcion: 'Registro de dueños y fichas de sus perros.',
    icono: <IconoUsuarios width={19} height={19} />,
  },
  {
    ruta: '/panel/configuracion',
    titulo: 'Configuración',
    descripcion: 'Tarifas, capacidad y usuarios del sistema.',
    icono: <IconoAjustes width={19} height={19} />,
    roles: ['ADMIN'],
  },
]

export const puedeVer = (m: Modulo, rol: Rol) => !m.roles || m.roles.includes(rol)
