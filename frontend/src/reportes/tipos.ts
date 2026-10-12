export type Fila = Record<string, string | number | null>;
export interface Filtros {
  desde: string;
  hasta: string;
  servicio: string;
  agrupacion: string;
  cv1: number;
  cv2: number;
  fijos: number;
  a1: number;
  a2: number;
  horas: number;
  pertServicio: string;
  pesos: number[];
}
export interface Punto {
  x: number;
  y: number;
  z: number;
}
export interface Actividad {
  id: string;
  nombre: string;
  predecesoras: string[];
  a: number;
  m: number;
  b: number;
  te: number;
  varianza: number;
  es: number;
  ef: number;
  ls: number;
  lf: number;
  holgura: number;
  critica: boolean;
}
export interface Datos {
  filtros: Filtros;
  finanzas: {
    facturado: number;
    cobrado: number;
    pendiente: number;
    sobrepago: number;
    tendencia: Fila[];
    canales: Fila[];
  };
  ocupacion: Fila[];
  utilizacion: Fila[];
  modelos: {
    tipo: string;
    precio: number | null;
    capacidad: number | null;
    equilibrio: {
      margen: number;
      unidades: number | null;
      unidadesEnteras: number | null;
    } | null;
  }[];
  mezcla: {
    vertices: Punto[];
    optimo: Punto;
    entero: Punto;
    holguras: { hospedaje: number; daycare: number; horas: number };
  } | null;
  pert: {
    duracion: number;
    filas: Actividad[];
    criticas: string[];
    rutasCriticas: string[][];
  } | null;
  historia: {
    muestras: number;
    minimo: number | null;
    media: number;
    maximo: number | null;
    servicio: string;
  };
  rendimiento: Fila[];
  estancias: Fila[];
  cancelaciones: {
    total: number;
    canceladas: number;
    porcentaje: number | null;
  };
  clientes: Fila[];
  segmentos: Fila[];
}
