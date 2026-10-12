
import type { Pool, PoolConnection, RowDataPacket } from "mysql2/promise";
import { ESTADOS_ACTIVOS, REGLAS } from "../config/reglas.js";
import type { TipoServicio } from "../models/servicio.js";
import type { UnidadTarifa } from "../models/tarifa.js";
import {
  diaDe,
  diferenciaDias,
  horaDe,
  rangoDias,
  sumarDias,
} from "../utils/fechas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";

type Db = Pool | PoolConnection;

interface ServicioRow extends RowDataPacket {
  id_servicio: number;
  nombre: string;
  tipo: TipoServicio;
  activo: boolean;
}

interface TarifaRow extends RowDataPacket {
  id_tarifa: number;
  nombre: string;
  precio: number;
  unidad: UnidadTarifa;
}

export interface DatosReserva {
  id_servicio: number;
  fecha_inicio: string; 
  fecha_fin: string;
}

export const redondear = (monto: number) => Math.round(monto * 100) / 100;

export const unidadDe = (tipo: TipoServicio): UnidadTarifa =>
  tipo === "HOSPEDAJE" ? "NOCHE" : "DIA";


export async function obtenerServicio(db: Db, id_servicio: number, bloquear = false) {
  const [rows] = await db.query<ServicioRow[]>(
    `SELECT id_servicio, nombre, tipo, activo FROM servicios WHERE id_servicio = ?
     ${bloquear ? "FOR UPDATE" : ""}`,
    [id_servicio]
  );
  if (!rows[0]) throw noEncontrado("Servicio");
  return rows[0];
}

// Dias que ocupa una reserva
export function diasOcupados(tipo: TipoServicio, fecha_inicio: string, fecha_fin: string) {
  const inicio = diaDe(fecha_inicio);
  const fin = diaDe(fecha_fin);
  if (tipo === "HOSPEDAJE") {
    return diferenciaDias(inicio, fin) > 0 ? rangoDias(inicio, sumarDias(fin, -1)) : [];
  }
  return rangoDias(inicio, fin);
}

export function validarFechas(tipo: TipoServicio, fecha_inicio: string, fecha_fin: string) {
  if (fecha_fin <= fecha_inicio) {
    throw new HttpError(400, "La fecha de fin debe ser posterior a la fecha de inicio");
  }

  const inicio = diaDe(fecha_inicio);
  const fin = diaDe(fecha_fin);

  if (tipo === "HOSPEDAJE") {
    const noches = diferenciaDias(inicio, fin);
    const { minNoches, maxNoches } = REGLAS.hospedaje;
    if (noches < minNoches) {
      throw new HttpError(
        400,
        "El hospedaje debe cubrir al menos una noche (la salida debe ser otro dia)"
      );
    }
    if (noches > maxNoches) {
      throw new HttpError(400, `El hospedaje no puede superar ${maxNoches} noches`);
    }
    return;
  }

  const { apertura, cierre, maxDias } = REGLAS.daycare;
  if (diferenciaDias(inicio, fin) + 1 > maxDias) {
    throw new HttpError(400, `El daycare no puede superar ${maxDias} dias seguidos`);
  }
  const horaEntrada = horaDe(fecha_inicio);
  const horaSalida = horaDe(fecha_fin);
  if (horaSalida <= horaEntrada) {
    throw new HttpError(400, "La hora de salida debe ser posterior a la hora de entrada");
  }
  if (horaEntrada < apertura || horaSalida > cierre) {
    throw new HttpError(400, `El horario del daycare es de ${apertura} a ${cierre}`);
  }
}

export async function tarifaVigente(
  db: Db,
  id_servicio: number,
  dia: string,
  unidad: UnidadTarifa
) {
  const [rows] = await db.query<TarifaRow[]>(
    `SELECT id_tarifa, nombre, precio, unidad
     FROM tarifas
     WHERE id_servicio = ? AND activo = TRUE AND unidad = ?
       AND fecha_inicio_vigencia <= ?
       AND (fecha_fin_vigencia IS NULL OR fecha_fin_vigencia >= ?)
     ORDER BY fecha_inicio_vigencia DESC, id_tarifa DESC
     LIMIT 1`,
    [id_servicio, unidad, dia, dia]
  );
  return rows[0] ?? null;
}

// Capacidad vigente para cada dia (null si no hay capacidad configurada)
export async function capacidadPorDia(db: Db, id_servicio: number, dias: string[]) {
  const resultado = new Map<string, number | null>();
  if (dias.length === 0) return resultado;

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT capacidad_maxima, fecha_inicio_vigencia, fecha_fin_vigencia
     FROM capacidades
     WHERE id_servicio = ? AND fecha_inicio_vigencia <= ?
       AND (fecha_fin_vigencia IS NULL OR fecha_fin_vigencia >= ?)
     ORDER BY fecha_inicio_vigencia DESC, id_capacidad DESC`,
    [id_servicio, dias[dias.length - 1], dias[0]]
  );

  for (const dia of dias) {
    const vigente = rows.find(
      (c) =>
        c.fecha_inicio_vigencia <= dia &&
        (c.fecha_fin_vigencia === null || c.fecha_fin_vigencia >= dia)
    );
    resultado.set(dia, vigente ? Number(vigente.capacidad_maxima) : null);
  }
  return resultado;
}

// Cantidad de reservas activas que ocupan cada dia
export async function ocupacionPorDia(
  db: Db,
  servicio: { id_servicio: number; tipo: TipoServicio },
  dias: string[],
  excluirReservacion?: number
) {
  const resultado = new Map<string, number>(dias.map((dia) => [dia, 0]));
  if (dias.length === 0) return resultado;

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT fecha_inicio, fecha_fin
     FROM reservaciones
     WHERE id_servicio = ? AND estado IN (?)
       AND DATE(fecha_inicio) <= ? AND DATE(fecha_fin) >= ?
       AND id_reservacion <> ?`,
    [
      servicio.id_servicio,
      ESTADOS_ACTIVOS,
      dias[dias.length - 1],
      dias[0],
      excluirReservacion ?? 0,
    ]
  );

  for (const reserva of rows) {
    for (const dia of diasOcupados(servicio.tipo, reserva.fecha_inicio, reserva.fecha_fin)) {
      if (resultado.has(dia)) resultado.set(dia, resultado.get(dia)! + 1);
    }
  }
  return resultado;
}

// Calcula importe y disponibilidad de una posible reserva
export async function cotizar(db: Db, datos: DatosReserva, bloquear = false) {
  const servicio = await obtenerServicio(db, datos.id_servicio, bloquear);
  if (!servicio.activo) {
    throw new HttpError(400, "El servicio no esta activo");
  }

  validarFechas(servicio.tipo, datos.fecha_inicio, datos.fecha_fin);

  const unidad = unidadDe(servicio.tipo);
  const tarifa = await tarifaVigente(db, servicio.id_servicio, diaDe(datos.fecha_inicio), unidad);
  if (!tarifa) {
    throw new HttpError(
      409,
      `No hay una tarifa vigente por ${unidad.toLowerCase()} para ${servicio.nombre}`
    );
  }

  const dias = diasOcupados(servicio.tipo, datos.fecha_inicio, datos.fecha_fin);
  const capacidades = await capacidadPorDia(db, servicio.id_servicio, dias);
  const ocupacion = await ocupacionPorDia(db, servicio, dias);

  const detalle = dias.map((dia) => {
    const capacidad = capacidades.get(dia) ?? null;
    const ocupados = ocupacion.get(dia) ?? 0;
    return {
      fecha: dia,
      capacidad,
      ocupados,
      disponibles: capacidad === null ? 0 : Math.max(0, capacidad - ocupados),
    };
  });

  return {
    servicio: { id_servicio: servicio.id_servicio, nombre: servicio.nombre, tipo: servicio.tipo },
    tarifa: {
      id_tarifa: tarifa.id_tarifa,
      nombre: tarifa.nombre,
      precio: tarifa.precio,
      unidad: tarifa.unidad,
    },
    unidades: dias.length,
    monto_total: redondear(dias.length * tarifa.precio),
    disponible: detalle.every((d) => d.disponibles > 0),
    dias: detalle,
  };
}

// Devuelve la reserva activa de la mascota que se cruza con el rango, si existe
export async function reservaQueSeCruza(
  db: Db,
  id_mascota: number,
  fecha_inicio: string,
  fecha_fin: string
) {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT r.id_reservacion, r.fecha_inicio, r.fecha_fin, s.nombre AS servicio
     FROM reservaciones r
     JOIN servicios s ON s.id_servicio = r.id_servicio
     WHERE r.id_mascota = ? AND r.estado IN (?)
       AND r.fecha_inicio < ? AND r.fecha_fin > ?
     LIMIT 1`,
    [id_mascota, ESTADOS_ACTIVOS, fecha_fin, fecha_inicio]
  );
  return rows[0] ?? null;
}
