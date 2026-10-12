// Fixture visual aislado: Vite no lo incluye en el build de producción.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Finanzas,
  Capacidad,
  Mezcla,
  Pert,
  Rendimiento,
  Clientes,
} from "../src/reportes/Reportes";
import type { Datos } from "../src/reportes/tipos";
import "../src/index.css";
const d: Datos = {
  filtros: {
    desde: "2026-09-01",
    hasta: "2026-09-30",
    servicio: "TODOS",
    agrupacion: "MES",
    cv1: 50,
    cv2: 25,
    fijos: 10000,
    a1: 2,
    a2: 1,
    horas: 24,
    pertServicio: "DAYCARE",
    pesos: [5, 5, 35, 35, 15, 5],
  },
  finanzas: {
    facturado: 10000,
    cobrado: 8500,
    pendiente: 1500,
    sobrepago: 0,
    tendencia: [
      { periodo: "2026-09", tipo: "HOSPEDAJE", facturado: 7500 },
      { periodo: "2026-09", tipo: "DAYCARE", facturado: 2500 },
    ],
    canales: [
      { metodo: "EFECTIVO", cobrado: 5000 },
      { metodo: "TARJETA", cobrado: 3500 },
    ],
  },
  ocupacion: Array.from({ length: 30 }, (_, i) => ({
    fecha: `2026-09-${String(i + 1).padStart(2, "0")}`,
    tipo: "HOSPEDAJE",
    capacidad: 10,
    ocupados: i % 11,
    demanda: i % 13,
    tasa: (i % 11) * 10,
    vacancia: 100 - (i % 11) * 10,
  })),
  utilizacion: [
    {
      tipo: "HOSPEDAJE",
      cuposDisponibles: 300,
      ocupados: 150,
      ocupacion: 50,
      vacancia: 50,
      diasSinCapacidad: 0,
      saturados: 2,
      sobredemanda: 4,
      pico: 10,
      diasPico: "11/09/2026, 22/09/2026",
      bajaDemanda: 15,
      revpah: 25,
    },
  ],
  modelos: [
    {
      tipo: "HOSPEDAJE",
      precio: 150,
      capacidad: 10,
      equilibrio: { margen: 100, unidades: 100, unidadesEnteras: 100 },
    },
    {
      tipo: "DAYCARE",
      precio: 90,
      capacidad: 15,
      equilibrio: { margen: 65, unidades: 10000 / 65, unidadesEnteras: 154 },
    },
  ],
  mezcla: {
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 10, y: 0, z: 1000 },
      { x: 10, y: 4, z: 1260 },
      { x: 4.5, y: 15, z: 1425 },
      { x: 0, y: 15, z: 975 },
    ],
    optimo: { x: 4.5, y: 15, z: 1425 },
    entero: { x: 5, y: 14, z: 1410 },
    holguras: { hospedaje: 5.5, daycare: 0, horas: 0 },
  },
  pert: {
    duracion: 5,
    criticas: ["A", "B", "C", "D", "E", "F"],
    rutasCriticas: [
      ["A", "B", "C", "E", "F"],
      ["A", "B", "D", "E", "F"],
    ],
    filas: [
      "Recepción y triaje",
      "Asignación de área",
      "Alimentación y medicación",
      "Recreación y ejercicio",
      "Higiene pre-salida",
      "Cobro y check-out",
    ].map((nombre, i) => ({
      id: String.fromCharCode(65 + i),
      nombre,
      predecesoras: [[], ["A"], ["B"], ["B"], ["C", "D"], ["E"]][i],
      a: 1,
      m: 1,
      b: 1,
      te: 1,
      varianza: 0,
      es: [0, 1, 2, 2, 3, 4][i],
      ef: [1, 2, 3, 3, 4, 5][i],
      ls: [0, 1, 2, 2, 3, 4][i],
      lf: [1, 2, 3, 3, 4, 5][i],
      holgura: 0,
      critica: true,
    })),
  },
  historia: {
    muestras: 2,
    minimo: 6,
    media: 6,
    maximo: 6,
    servicio: "DAYCARE",
  },
  rendimiento: [
    {
      tipo: "HOSPEDAJE",
      muestras: 1,
      horasPromedio: 48,
      nochesPromedio: 2,
      puntualidadEntrada: 100,
      puntualidadSalida: 0,
      retrasosSalida: 1,
      ausencias: 0,
      tasaAusencia: null,
    },
  ],
  estancias: [
    {
      id: 1,
      tipo: "HOSPEDAJE",
      estado: "FINALIZADO",
      entrada: "2026-09-01 14:00:00",
      salida: "2026-09-03 14:30:00",
      horas: 48.5,
      noches: 2,
      demoraEntrada: 0,
      demoraSalida: 30,
    },
  ],
  cancelaciones: { total: 10, canceladas: 1, porcentaje: 10 },
  clientes: [
    {
      id: 1,
      cliente: "Ana López",
      total: 8000,
      frecuencia: 20,
      porcentaje: 80,
      acumulado: 80,
      categoria: "A",
    },
    {
      id: 2,
      cliente: "Carlos Pérez",
      total: 1500,
      frecuencia: 4,
      porcentaje: 15,
      acumulado: 95,
      categoria: "B",
    },
    {
      id: 3,
      cliente: "María Gómez",
      total: 500,
      frecuencia: 2,
      porcentaje: 5,
      acumulado: 100,
      categoria: "C",
    },
  ],
  segmentos: [
    {
      raza: "Labrador",
      sexo: "MACHO",
      talla: "Grande (≥25 kg)",
      frecuencia: 20,
      total: 8000,
    },
    {
      raza: "Chihuahua",
      sexo: "HEMBRA",
      talla: "Pequeña (<10 kg)",
      frecuencia: 6,
      total: 2000,
    },
  ],
};
export function Preview() {
  const [tab, setTab] = useState(0);
  const Component = [Finanzas, Capacidad, Mezcla, Pert, Rendimiento, Clientes][
    tab
  ];
  return (
    <main className="reportes" style={{ margin: "auto", padding: 20 }}>
      <h1>HACHI · Fixture visual sintético</h1>
      <nav className="rep-tabs">
        {["Finanzas", "Capacidad", "PL", "PERT", "Cumplimiento", "ABC"].map(
          (n, i) => (
            <button key={n} onClick={() => setTab(i)}>
              {n}
            </button>
          ),
        )}
      </nav>
      <Component d={d} />
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Preview />);
