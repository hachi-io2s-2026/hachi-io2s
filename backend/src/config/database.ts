
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
