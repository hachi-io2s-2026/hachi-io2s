import "dotenv/config";
import { test, after } from "node:test";
import assert from "node:assert/strict";
import type { RowDataPacket } from "mysql2/promise";
import { pool } from "../src/config/database.js";
import { generarReportes } from "../src/services/reportes.service.js";
import { filtrosReportes } from "../src/controllers/reportes.controller.js";
const habilitado = process.env.REPORTES_DB_TEST === "1";
after(async () => {
  if (habilitado) await pool.end();
});
test(
  "MySQL: suite completa reconcilia facturación, cobros, ABC y filtros",
  { skip: !habilitado },
  async () => {
    const [fechas] = await pool.query<RowDataPacket[]>(
      "SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE(),INTERVAL 250 DAY),'%Y-%m-%d') desde,DATE_FORMAT(CURRENT_DATE(),'%Y-%m-%d') hasta",
    );
    const f = filtrosReportes.parse(fechas[0]),
      r = await generarReportes(f);
    const [totales] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(monto_total),0) total FROM reservaciones WHERE fecha_inicio>=? AND fecha_inicio<DATE_ADD(?,INTERVAL 1 DAY) AND estado<>'CANCELADA'",
      [f.desde, f.hasta],
    );
    const [pagos] = await pool.execute<RowDataPacket[]>(
      "SELECT COALESCE(SUM(monto),0) total FROM pagos WHERE fecha_pago>=? AND fecha_pago<DATE_ADD(?,INTERVAL 1 DAY) AND estado='PAGADO'",
      [f.desde, f.hasta],
    );
    assert.ok(Math.abs(r.finanzas.facturado - Number(totales[0].total)) < 0.01);
    assert.ok(Math.abs(r.finanzas.cobrado - Number(pagos[0].total)) < 0.01);
    assert.ok(
      Math.abs(
        r.clientes.reduce((s, c) => s + Number(c.total), 0) -
          r.finanzas.facturado,
      ) < 0.01,
    );
    assert.ok(r.ocupacion.length > 0);
    const h = await generarReportes({
      ...f,
      servicio: "HOSPEDAJE",
      pertServicio: "HOSPEDAJE",
    });
    assert.ok(h.ocupacion.every((v) => v.tipo === "HOSPEDAJE"));
    assert.ok(h.estancias.every((v) => v.tipo === "HOSPEDAJE"));
    if (h.mezcla) assert.equal(h.mezcla.optimo.y, 0);
  },
);
