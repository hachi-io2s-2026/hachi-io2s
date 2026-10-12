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
  // Funciones que tendra el modulo (se muestran mientras esta en construccion)
  incluye?: string[]
}

// Modulos del panel. El orden es el del menu lateral.
export const MODULOS: Modulo[] = [
  {
    ruta: '/panel',
    titulo: 'Inicio',
    descripcion: 'Resumen del día y accesos rápidos.',
    icono: <IconoInicio width={19} height={19} />,
  },
  {
    ruta: '/panel/reservaciones',
    titulo: 'Reservaciones',
    descripcion: 'Crear, cotizar, confirmar y cancelar reservas.',
    icono: <IconoCalendario width={19} height={19} />,
    incluye: [
      'Listado con filtros por estado, servicio, fechas y dueño',
      'Cotización con cupos por día antes de reservar',
      'Confirmar o cancelar reservaciones',
      'Detalle con hospedaje o asistencias y pagos',
    ],
  },
  {
    ruta: '/panel/hospedaje',
    titulo: 'Hospedaje',
    descripcion: 'Registrar ingresos (check-in) y salidas (check-out).',
    icono: <IconoLuna width={19} height={19} />,
    incluye: [
      'Llegadas pendientes del día',
      'Perros hospedados actualmente',
      'Check-out con cálculo de noches extra y saldo',
    ],
  },
  {
    ruta: '/panel/daycare',
    titulo: 'Daycare',
    descripcion: 'Control de asistencia diaria.',
    icono: <IconoSol width={19} height={19} />,
    incluye: [
      'Asistencias programadas por día',
      'Registrar entrada, salida o ausencia',
    ],
  },
  {
    ruta: '/panel/propietarios',
    titulo: 'Dueños y perros',
    descripcion: 'Registro de dueños y fichas de sus perros.',
    icono: <IconoUsuarios width={19} height={19} />,
    incluye: [
      'Buscar, registrar y editar dueños',
      'Fichas de los perros con observaciones',
      'Dar de baja o reactivar perros',
    ],
  },
  {
    ruta: '/panel/configuracion',
    titulo: 'Configuración',
    descripcion: 'Tarifas, capacidad y usuarios del sistema.',
    icono: <IconoAjustes width={19} height={19} />,
    roles: ['ADMIN'],
    incluye: [
      'Tarifas por noche y por día con vigencia',
      'Capacidad máxima por servicio',
      'Usuarios empleados y administradores',
    ],
  },
]

export const puedeVer = (m: Modulo, rol: Rol) => !m.roles || m.roles.includes(rol)
