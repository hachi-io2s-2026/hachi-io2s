
import mysql from "mysql2/promise";

// Configuración de la conexion a la base de datos MySQL
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  // Devolver DECIMAL como number (por defecto mysql2 los devuelve como string)
  decimalNumbers: true,
  // Devolver DATE/DATETIME como texto ("2026-10-12 14:00:00") para evitar
  // corrimientos de zona horaria entre MySQL, Node y el navegador
  dateStrings: true,
  // Devolver BOOLEAN (TINYINT(1)) como true/false en lugar de 1/0
  typeCast: (field, next) => {
    if (field.type === "TINY" && field.length === 1) {
      const valor = field.string();
      return valor === null ? null : valor === "1";
    }
    return next();
  },
});

// para probar la conexion a la base de datos
export async function testConnection() {
  const connection = await pool.getConnection();

  try {
    await connection.ping();
    console.log("MySQL conectado correctamente");
  } finally {
    connection.release();
  }
}

// Columnas agregadas despues de crear la base. Si a una base existente le falta alguna,
// se agrega al iniciar (mismo cambio que hace database/01_create_database.sql al final).
const COLUMNAS_NUEVAS = [
  {
    tabla: "reservaciones",
    columna: "motivo_rechazo",
    definicion: "VARCHAR(500) NULL AFTER observaciones",
  },
];

export async function actualizarEsquema() {
  for (const { tabla, columna, definicion } of COLUMNAS_NUEVAS) {
    const [[{ existe }]] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) AS existe FROM information_schema.columns
       WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?`,
      [tabla, columna]
    );
    if (Number(existe) === 0) {
      await pool.query(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
      console.log(`Base actualizada: se agrego ${tabla}.${columna}`);
    }
  }
}
