import type { RowDataPacket } from "mysql2/promise";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  cpm,
  equilibrio,
  optimizar,
  pareto,
} from "../src/services/optimizacion.service.js";
import { construirReportes } from "../src/services/reportes.service.js";
import { filtrosReportes } from "../src/controllers/reportes.controller.js";
const cerca = (a: number, b: number) =>
  assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
test("PL: intersección de capacidad y supervisión, holguras y entero", () => {
  const r = optimizar({
    p1: 150,
    p2: 90,
    cv1: 50,
    cv2: 25,
    c1: 10,
    c2: 15,
    a1: 2,
    a2: 1,
    horas: 24,
  });
  cerca(r.optimo.x, 4.5);
  cerca(r.optimo.y, 15);
  cerca(r.optimo.z, 1425);
  cerca(r.holguras.horas, 0);
  assert.deepEqual(r.entero, { x: 5, y: 14, z: 1410 });
});
test("PL: recursos cero, márgenes negativos y coeficiente inválido", () => {
  const d = {
    p1: 1,
    p2: 1,
    cv1: 2,
    cv2: 2,
    c1: 10,
    c2: 10,
    a1: 1,
    a2: 1,
    horas: 10,
  };
  assert.deepEqual(optimizar(d).optimo, { x: 0, y: 0, z: 0 });
  assert.deepEqual(optimizar({ ...d, horas: 0 }).entero, { x: 0, y: 0, z: 0 });
  assert.throws(() => optimizar({ ...d, a1: 0 }));
});
test("PL entero coincide con enumeración exhaustiva en 50 escenarios", () => {
  for (let i = 0; i < 50; i++) {
    const d = {
      p1: 4 + (i % 5),
      p2: 6,
      cv1: 2,
      cv2: i % 9,
      c1: 8,
      c2: 9,
      a1: 0.5 + (i % 3),
      a2: 1.5,
      horas: i % 20,
    };
    let mejor = 0;
    for (let x = 0; x <= 8; x++)
      for (let y = 0; y <= 9; y++)
        if (d.a1 * x + d.a2 * y <= d.horas)
          mejor = Math.max(mejor, (d.p1 - d.cv1) * x + (d.p2 - d.cv2) * y);
    cerca(optimizar(d).entero.z, mejor);
  }
});
test("CPM: ramificación, paso hacia atrás y holgura", () => {
  const r = cpm([
    { id: "D", nombre: "D", predecesoras: ["B", "C"], a: 1, m: 1, b: 1 },
    { id: "A", nombre: "A", predecesoras: [], a: 2, m: 2, b: 2 },
    { id: "B", nombre: "B", predecesoras: ["A"], a: 4, m: 4, b: 4 },
    { id: "C", nombre: "C", predecesoras: ["A"], a: 1, m: 1, b: 1 },
  ]);
  cerca(r.duracion, 7);
  assert.deepEqual(r.criticas, ["A", "B", "D"]);
  assert.deepEqual(r.rutasCriticas, [["A", "B", "D"]]);
  const c = r.filas.find((a) => a.id === "C")!;
  cerca(c.es, 2);
  cerca(c.ef, 3);
  cerca(c.ls, 5);
  cerca(c.lf, 6);
  cerca(c.holgura, 3);
});
test("PERT: tiempo esperado, varianza, ciclos y datos vacíos", () => {
  const a = { id: "A", nombre: "A", predecesoras: [], a: 1, m: 2, b: 7 };
  const r = cpm([a]);
  cerca(r.duracion, 16 / 6);
  cerca(r.filas[0].varianza, 1);
  assert.equal(cpm([]).duracion, 0);
  assert.throws(() => cpm([{ ...a, predecesoras: ["A"] }]));
  assert.throws(() => cpm([{ ...a, a: 3 }]));
});
test("ABC: 80/15/5, cruce de umbral, empates y facturación cero", () => {
  assert.deepEqual(
    pareto([
      { id: 1, total: 80 },
      { id: 2, total: 15 },
      { id: 3, total: 5 },
    ]).map((r) => r.categoria),
    ["A", "B", "C"],
  );
  assert.deepEqual(
    pareto([
      { id: 1, total: 79 },
      { id: 2, total: 10 },
      { id: 3, total: 7 },
      { id: 4, total: 4 },
    ]).map((r) => r.categoria),
    ["A", "A", "B", "C"],
  );
  assert.deepEqual(pareto([]), []);
  assert.equal(pareto([{ id: 1, total: 0 }])[0].categoria, "C");
  assert.deepEqual(
    pareto([
      { id: 2, total: 1 },
      { id: 1, total: 1 },
    ]).map((r) => r.id),
    [1, 2],
  );
});
test("Equilibrio sin margen y valores inválidos", () => {
  assert.equal(equilibrio(50, 50, 100).unidades, null);
  assert.equal(equilibrio(150, 50, 10000).unidades, 100);
  assert.throws(() => equilibrio(NaN, 1, 2));
});
test("Rangos, costos y fechas imposibles se rechazan", () => {
  for (const p of [
    { desde: "2026-02-30", hasta: "2026-03-01" },
    { desde: "2026-10-01", hasta: "2026-01-01" },
    { desde: "2020-01-01", hasta: "2026-01-01" },
    { desde: "2026-01-01", hasta: "2026-01-02", cv1: -1 },
  ])
    assert.equal(filtrosReportes.safeParse(p).success, false);
});
test("Suite vacía: contratos estables, sin NaN/Infinity ni falsas capacidades", () => {
  const d = Object.fromEntries(
    [
      "facturas",
      "canales",
      "tendencia",
      "vigentes",
      "ocupacion",
      "estancias",
      "cancelaciones",
      "clientes",
      "segmentos",
    ].map((k) => [k, []]),
  );
  const r = construirReportes(
    filtrosReportes.parse({ desde: "2026-01-01", hasta: "2026-01-02" }),
    d,
  );
  assert.equal(r.finanzas.facturado, 0);
  assert.equal(r.mezcla, null);
  assert.equal(r.pert, null);
  assert.deepEqual(r.clientes, []);
  assert.equal(r.utilizacion[0].ocupacion, null);
  assert.ok(!JSON.stringify(r).match(/NaN|Infinity/));
});
test("Capacidad desconocida no crea RevPAH; ocupación y días pico respetan el denominador", () => {
  const d = Object.fromEntries(
    [
      "facturas",
      "canales",
      "tendencia",
      "vigentes",
      "ocupacion",
      "estancias",
      "cancelaciones",
      "clientes",
      "segmentos",
    ].map((k) => [k, []]),
  ) as Record<string, RowDataPacket[]>;
  d.facturas = [
    { tipo: "HOSPEDAJE", facturado: 300, pendiente: 100, sobrepago: 0 },
  ];
  d.ocupacion = [
    {
      tipo: "HOSPEDAJE",
      fecha: "2026-01-01",
      capacidad: 10,
      ocupados: 5,
      demanda: 12,
    },
    {
      tipo: "HOSPEDAJE",
      fecha: "2026-01-02",
      capacidad: null,
      ocupados: 3,
      demanda: 3,
    },
  ];
  const r = construirReportes(
    filtrosReportes.parse({ desde: "2026-01-01", hasta: "2026-01-02" }),
    d,
  );
  assert.equal(r.utilizacion[0].revpah, null);
  assert.equal(r.utilizacion[0].ocupacion, 50);
  assert.equal(r.utilizacion[0].sobredemanda, 1);
  assert.equal(r.ocupacion[1].tasa, null);
});
