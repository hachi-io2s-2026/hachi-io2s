import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Grafica, Tabla } from "../src/reportes/Componentes";
import { csv, moneda, fecha } from "../src/reportes/utilidades";
test("Gráfica y tabla vacías se renderizan con estado explícito", () => {
  assert.match(
    renderToStaticMarkup(<Grafica datos={[]} x="fecha" series={[]} />),
    /Sin datos para graficar/,
  );
  assert.match(
    renderToStaticMarkup(
      <Tabla
        titulo="Prueba"
        filas={[]}
        columnas={[{ clave: "id", nombre: "ID" }]}
      />,
    ),
    /Sin datos para el rango/,
  );
});
test("Formatos Guatemala y CSV con comillas, saltos y fórmulas", () => {
  assert.equal(moneda(1234.5), "Q 1,234.50");
  assert.equal(moneda(null), "—");
  assert.equal(fecha("2026-10-12 14:30:00"), "12/10/2026 14:30");
  assert.equal(
    csv(["Nombre"], [["=1+1"], ['a"b'], ["a\nb"]]),
    '\uFEFF"Nombre"\r\n"\'=1+1"\r\n"a""b"\r\n"a\nb"',
  );
});
test("CSV neutraliza fórmulas después de espacios iniciales", () => {
  assert.ok(csv(["Cliente"], [["  =1+1"]]).includes("'  =1+1"));
});
