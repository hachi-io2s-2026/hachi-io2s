import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../config/database.js";
import { cpm, equilibrio, optimizar, pareto } from "./optimizacion.service.js";
export interface Filtros {
  desde: string;
  hasta: string;
  servicio: string;
  agrupacion: "MES" | "SEMANA";
  cv1: number;
  cv2: number;
  fijos: number;
  a1: number;
  a2: number;
  horas: number;
  pertServicio: "HOSPEDAJE" | "DAYCARE";
  pesos: number[];
}
export async function generarReportes(f: Filtros) {
  const conn = await pool.getConnection();
  try {
    await conn.query("SET TRANSACTION ISOLATION LEVEL REPEATABLE READ");
    await conn.beginTransaction();
    const q = async (sql: string, args: (string | number)[] = []) =>
      (await conn.execute<RowDataPacket[]>(sql, args))[0];
    const filtro = "(? = 'TODOS' OR s.tipo = ?)",
      args = [f.desde, f.hasta, f.servicio, f.servicio];
    const periodo =
      f.agrupacion === "MES"
        ? "DATE_FORMAT(r.fecha_inicio, '%Y-%m')"
        : "DATE_FORMAT(r.fecha_inicio, '%x-S%v')";
    const facturas = await q(
      `SELECT s.tipo, COALESCE(SUM(r.monto_total),0) facturado,
      COALESCE(SUM(GREATEST(0,r.monto_total-COALESCE(p.cobrado,0))),0) pendiente,
      COALESCE(SUM(GREATEST(0,COALESCE(p.cobrado,0)-r.monto_total)),0) sobrepago
      FROM reservaciones r JOIN servicios s USING(id_servicio)
      LEFT JOIN (SELECT id_reservacion,SUM(monto) cobrado FROM pagos WHERE estado='PAGADO' AND fecha_pago < DATE_ADD(?,INTERVAL 1 DAY) GROUP BY id_reservacion) p USING(id_reservacion)
      WHERE r.fecha_inicio>=? AND r.fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA' GROUP BY s.tipo`,
      [f.hasta, ...args],
    );
    const tendencia = await q(
      `SELECT ${periodo} periodo,s.tipo,SUM(r.monto_total) facturado FROM reservaciones r JOIN servicios s USING(id_servicio)
      WHERE r.fecha_inicio>=? AND r.fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA' GROUP BY periodo,s.tipo ORDER BY periodo`,
      args,
    );
    const canales = await q(
      `SELECT COALESCE(p.metodo_pago,'SIN MÉTODO') metodo, SUM(p.monto) cobrado FROM pagos p JOIN reservaciones r USING(id_reservacion) JOIN servicios s USING(id_servicio)
      WHERE p.fecha_pago>=? AND p.fecha_pago<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND p.estado='PAGADO' GROUP BY p.metodo_pago`,
      args,
    );
    const vigentes = await q(
      `SELECT s.tipo,
      (SELECT t.precio FROM tarifas t WHERE t.id_servicio=s.id_servicio AND t.activo=1 AND t.fecha_inicio_vigencia<=? AND (t.fecha_fin_vigencia IS NULL OR t.fecha_fin_vigencia>=?) ORDER BY t.fecha_inicio_vigencia DESC,t.id_tarifa DESC LIMIT 1) precio,
      (SELECT c.capacidad_maxima FROM capacidades c WHERE c.id_servicio=s.id_servicio AND c.fecha_inicio_vigencia<=? AND (c.fecha_fin_vigencia IS NULL OR c.fecha_fin_vigencia>=?) ORDER BY c.fecha_inicio_vigencia DESC,c.id_capacidad DESC LIMIT 1) capacidad
      FROM servicios s WHERE s.activo=1 ORDER BY s.tipo`,
      [f.hasta, f.hasta, f.hasta, f.hasta],
    );
    const ocupacion = await q(
      `WITH RECURSIVE dias AS (SELECT CAST(? AS DATE) fecha UNION ALL SELECT DATE_ADD(fecha,INTERVAL 1 DAY) FROM dias WHERE fecha<CAST(? AS DATE))
      SELECT DATE_FORMAT(d.fecha,'%Y-%m-%d') fecha,s.tipo,
      (SELECT c.capacidad_maxima FROM capacidades c WHERE c.id_servicio=s.id_servicio AND c.fecha_inicio_vigencia<=d.fecha AND (c.fecha_fin_vigencia IS NULL OR c.fecha_fin_vigencia>=d.fecha) ORDER BY c.fecha_inicio_vigencia DESC,c.id_capacidad DESC LIMIT 1) capacidad,
      CASE WHEN s.tipo='HOSPEDAJE' THEN
        (SELECT COUNT(*) FROM hospedajes h JOIN reservaciones r USING(id_reservacion) WHERE r.id_servicio=s.id_servicio AND r.estado<>'CANCELADA' AND h.fecha_entrada IS NOT NULL AND DATE(h.fecha_entrada)<=d.fecha AND (h.fecha_salida IS NULL OR DATE(h.fecha_salida)>d.fecha) AND d.fecha<=CURRENT_DATE())
      ELSE (SELECT COUNT(DISTINCT a.id_reservacion) FROM asistencias_daycare a JOIN reservaciones r USING(id_reservacion) WHERE r.id_servicio=s.id_servicio AND r.estado<>'CANCELADA' AND a.fecha=d.fecha AND a.hora_entrada IS NOT NULL AND a.estado IN ('PRESENTE','FINALIZADO')) END ocupados,
      (SELECT COUNT(*) FROM reservaciones r WHERE r.id_servicio=s.id_servicio AND r.estado<>'CANCELADA' AND DATE(r.fecha_inicio)<=d.fecha AND ((s.tipo='HOSPEDAJE' AND DATE(r.fecha_fin)>d.fecha) OR (s.tipo='DAYCARE' AND DATE(r.fecha_fin)>=d.fecha))) demanda
      FROM dias d CROSS JOIN servicios s WHERE ${filtro} ORDER BY d.fecha,s.tipo`,
      args,
    );
    const estancias = await q(
      `SELECT r.id_reservacion id,s.tipo,h.estado, h.fecha_entrada entrada,h.fecha_salida salida,
      TIMESTAMPDIFF(MINUTE,h.fecha_entrada,h.fecha_salida)/60 horas, DATEDIFF(h.fecha_salida,h.fecha_entrada) noches,
      TIMESTAMPDIFF(MINUTE,r.fecha_inicio,h.fecha_entrada) demoraEntrada, TIMESTAMPDIFF(MINUTE,r.fecha_fin,h.fecha_salida) demoraSalida
      FROM hospedajes h JOIN reservaciones r USING(id_reservacion) JOIN servicios s USING(id_servicio)
      WHERE h.fecha_entrada>=? AND h.fecha_entrada<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA'
      UNION ALL SELECT r.id_reservacion,s.tipo,a.estado,a.hora_entrada,a.hora_salida,
      TIME_TO_SEC(TIMEDIFF(a.hora_salida,a.hora_entrada))/3600,NULL,
      TIMESTAMPDIFF(MINUTE,TIMESTAMP(a.fecha,TIME(r.fecha_inicio)),a.hora_entrada),
      TIMESTAMPDIFF(MINUTE,TIMESTAMP(a.fecha,TIME(r.fecha_fin)),a.hora_salida)
      FROM asistencias_daycare a JOIN reservaciones r USING(id_reservacion) JOIN servicios s USING(id_servicio)
      WHERE a.fecha>=? AND a.fecha<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA' ORDER BY tipo,id`,
      [...args, ...args],
    );
    const cancelaciones = await q(
      `SELECT COUNT(*) total,COALESCE(SUM(r.estado='CANCELADA'),0) canceladas FROM reservaciones r JOIN servicios s USING(id_servicio)
      WHERE r.fecha_inicio>=? AND r.fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro}`,
      args,
    );
    const clientes = await q(
      `SELECT p.id_propietario id,CONCAT(p.nombre,' ',p.apellido) cliente,SUM(r.monto_total) total,COUNT(*) frecuencia
      FROM reservaciones r JOIN servicios s USING(id_servicio) JOIN mascotas m USING(id_mascota) JOIN propietarios p USING(id_propietario)
      WHERE r.fecha_inicio>=? AND r.fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA' GROUP BY p.id_propietario,p.nombre,p.apellido`,
      args,
    );
    const segmentos = await q(
      `SELECT COALESCE(m.raza,'Sin raza') raza,COALESCE(m.sexo,'Sin sexo') sexo,
      CASE WHEN m.peso_kg IS NULL THEN 'Sin peso' WHEN m.peso_kg<10 THEN 'Pequeña (<10 kg)' WHEN m.peso_kg<25 THEN 'Mediana (10–<25 kg)' ELSE 'Grande (≥25 kg)' END talla,
      SUM(r.monto_total) total,COUNT(*) frecuencia FROM reservaciones r JOIN servicios s USING(id_servicio) JOIN mascotas m USING(id_mascota)
      WHERE r.fecha_inicio>=? AND r.fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND ${filtro} AND r.estado<>'CANCELADA' GROUP BY raza,sexo,talla`,
      args,
    );
    await conn.commit();
    return construirReportes(f, {
      facturas,
      tendencia,
      canales,
      vigentes,
      ocupacion,
      estancias,
      cancelaciones,
      clientes,
      segmentos,
    });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}
// Transformaciones exportadas para validar colecciones vacías sin requerir MySQL.
export function construirReportes(
  f: Filtros,
  d: Record<string, RowDataPacket[]>,
) {
  const tipos =
    f.servicio === "TODOS" ? ["HOSPEDAJE", "DAYCARE"] : [f.servicio];
  const ratio = (a: number, b: number) => (b > 0 ? (a / b) * 100 : null);
  const utilizacion = tipos.map((tipo) => {
    const dias = d.ocupacion.filter((r) => r.tipo === tipo),
      conocidos = dias.filter((r) => r.capacidad !== null);
    const capacidad = conocidos.reduce((s, r) => s + Number(r.capacidad), 0),
      ocupados = conocidos.reduce((s, r) => s + Number(r.ocupados), 0);
    const factura = d.facturas.find((r) => r.tipo === tipo);
    return {
      tipo,
      cuposDisponibles: capacidad,
      ocupados,
      ocupacion: ratio(ocupados, capacidad),
      vacancia: capacidad
        ? Math.max(0, 100 - (ocupados / capacidad) * 100)
        : null,
      diasSinCapacidad: dias.length - conocidos.length,
      saturados: conocidos.filter((r) => r.ocupados >= r.capacidad).length,
      sobredemanda: conocidos.filter((r) => r.demanda > r.capacidad).length,
      pico: Math.max(0, ...dias.map((r) => Number(r.ocupados))),
      diasPico: dias
        .filter(
          (r) =>
            r.ocupados === Math.max(...dias.map((v) => Number(v.ocupados))),
        )
        .map((r) => r.fecha)
        .join(", "),
      bajaDemanda: conocidos.filter((r) => r.ocupados / r.capacidad < 0.5)
        .length,
      revpah:
        capacidad && conocidos.length === dias.length
          ? Number(factura?.facturado ?? 0) / capacidad
          : null,
    };
  });
  const modelos = d.vigentes.map((v) => ({
    ...v,
    equilibrio:
      v.precio === null
        ? null
        : equilibrio(v.precio, v.tipo === "HOSPEDAJE" ? f.cv1 : f.cv2, f.fijos),
  }));
  const h = d.vigentes.find((v) => v.tipo === "HOSPEDAJE"),
    dc = d.vigentes.find((v) => v.tipo === "DAYCARE");
  const disponible = tipos.every((t) =>
    d.vigentes.some(
      (v) => v.tipo === t && v.precio !== null && v.capacidad !== null,
    ),
  );
  const mezcla = disponible
    ? optimizar({
        p1: Number(h?.precio ?? 0),
        p2: Number(dc?.precio ?? 0),
        c1: tipos.includes("HOSPEDAJE") ? Number(h?.capacidad ?? 0) : 0,
        c2: tipos.includes("DAYCARE") ? Number(dc?.capacidad ?? 0) : 0,
        cv1: f.cv1,
        cv2: f.cv2,
        a1: f.a1,
        a2: f.a2,
        horas: f.horas,
      })
    : null;
  const completos = d.estancias.filter((r) => r.horas !== null && r.horas >= 0);
  const historia = completos
    .filter((r) => r.tipo === f.pertServicio)
    .map((r) => Number(r.horas))
    .sort((a, b) => a - b);
  const media = historia.length
    ? historia.reduce((a, b) => a + b, 0) / historia.length
    : 0;
  const nombres = [
    "Recepción y triaje",
    "Asignación de área",
    "Alimentación y medicación",
    "Recreación y ejercicio",
    "Higiene pre-salida",
    "Cobro y check-out",
  ];
  const pre = [[], ["A"], ["B"], ["B"], ["C", "D"], ["E"]];
  const suma = f.pesos.reduce((a, b) => a + b, 0);
  const pert = historia.length
    ? cpm(
        nombres.map((nombre, i) => ({
          id: String.fromCharCode(65 + i),
          nombre,
          predecesoras: pre[i],
          a: (historia[0] * f.pesos[i]) / suma,
          m: (media * f.pesos[i]) / suma,
          b: (historia[historia.length - 1] * f.pesos[i]) / suma,
        })),
      )
    : null;
  const rendimiento = tipos.map((tipo) => {
    const filas = d.estancias.filter((r) => r.tipo === tipo),
      cerrados = completos.filter((r) => r.tipo === tipo);
    const entradas = filas.filter((r) => r.demoraEntrada !== null),
      salidas = filas.filter((r) => r.demoraSalida !== null);
    return {
      tipo,
      muestras: cerrados.length,
      horasPromedio: cerrados.length
        ? cerrados.reduce((s, r) => s + Number(r.horas), 0) / cerrados.length
        : null,
      nochesPromedio:
        tipo === "HOSPEDAJE" && cerrados.length
          ? cerrados.reduce((s, r) => s + Number(r.noches), 0) / cerrados.length
          : null,
      puntualidadEntrada: ratio(
        entradas.filter((r) => r.demoraEntrada <= 0).length,
        entradas.length,
      ),
      puntualidadSalida: ratio(
        salidas.filter((r) => r.demoraSalida <= 0).length,
        salidas.length,
      ),
      retrasosSalida: salidas.filter((r) => r.demoraSalida > 0).length,
      ausencias: filas.filter((r) => r.estado === "AUSENTE").length,
      tasaAusencia:
        tipo === "DAYCARE"
          ? ratio(
              filas.filter((r) => r.estado === "AUSENTE").length,
              filas.length,
            )
          : null,
    };
  });
  return {
    filtros: f,
    finanzas: {
      facturado: d.facturas.reduce((s, r) => s + Number(r.facturado), 0),
      cobrado: d.canales.reduce((s, r) => s + Number(r.cobrado), 0),
      pendiente: d.facturas.reduce((s, r) => s + Number(r.pendiente), 0),
      sobrepago: d.facturas.reduce((s, r) => s + Number(r.sobrepago), 0),
      tendencia: d.tendencia,
      canales: d.canales,
    },
    ocupacion: d.ocupacion.map((r) => ({
      ...r,
      tasa: ratio(Number(r.ocupados), Number(r.capacidad)),
      vacancia: r.capacidad
        ? Math.max(0, 100 - (Number(r.ocupados) / Number(r.capacidad)) * 100)
        : null,
    })),
    utilizacion,
    modelos,
    mezcla,
    pert,
    historia: {
      muestras: historia.length,
      minimo: historia[0] ?? null,
      media,
      maximo: historia.at(-1) ?? null,
      servicio: f.pertServicio,
    },
    rendimiento,
    estancias: d.estancias,
    cancelaciones: {
      total: Number(d.cancelaciones[0]?.total ?? 0),
      canceladas: Number(d.cancelaciones[0]?.canceladas ?? 0),
      porcentaje: ratio(
        Number(d.cancelaciones[0]?.canceladas ?? 0),
        Number(d.cancelaciones[0]?.total ?? 0),
      ),
    },
    clientes: pareto(
      d.clientes as (RowDataPacket & { id: number; total: number })[],
    ),
    segmentos: d.segmentos,
  };
}
