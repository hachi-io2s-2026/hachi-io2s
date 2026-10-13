import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { test } from "node:test";
import assert from "node:assert/strict";
import { Grafica, Lectura, Tabla, Tarjeta } from "../src/reportes/Componentes";
import {
  csv,
  fecha,
  listaFechas,
  moneda,
  nombreServicio,
} from "../src/reportes/utilidades";
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
test("Explicaciones: glosario de columnas, ayuda de tarjetas y lectura rápida", () => {
  const tabla = renderToStaticMarkup(
    <Tabla
      titulo="Prueba"
      filas={[{ tipo: "HOSPEDAJE", tasa: 50 }]}
      columnas={[
        { clave: "tipo", nombre: "Servicio", formato: "servicio" },
        { clave: "tasa", nombre: "Ocupación", ayuda: "Usados ÷ disponibles" },
      ]}
    />,
  );
  assert.match(tabla, />Hospedaje</);
  assert.match(tabla, /title="Usados ÷ disponibles"/);
  assert.match(tabla, /¿Qué significa cada columna\?/);
  assert.doesNotMatch(
    renderToStaticMarkup(
      <Tabla titulo="Sin" filas={[]} columnas={[{ clave: "id", nombre: "ID" }]} />,
    ),
    /Qué significa/,
  );
  assert.match(
    renderToStaticMarkup(
      <Tarjeta titulo="T" valor="1" ayuda="Explicación" tono="malo" />,
    ),
    /rep-kpi--malo.*Explicación/,
  );
  assert.match(
    renderToStaticMarkup(<Lectura hallazgos={[{ tono: "bueno", texto: "Bien" }]} />),
    /rep-tono-bueno.*✓.*Bien/,
  );
  assert.equal(renderToStaticMarkup(<Lectura hallazgos={[]} />), "");
});
test("Nombres de servicio y listas de fechas legibles", () => {
  assert.equal(nombreServicio("TODOS"), "Todos los servicios");
  assert.equal(nombreServicio("OTRO"), "OTRO");
  assert.equal(
    listaFechas("2026-01-05, 2026-01-06, 2026-01-07, 2026-01-08"),
    "05/01/2026, 06/01/2026, 07/01/2026 y 1 más",
  );
  assert.equal(listaFechas(""), "—");
});
test("CSV neutraliza fórmulas después de espacios iniciales", () => {
  assert.ok(csv(["Cliente"], [["  =1+1"]]).includes("'  =1+1"));
});
