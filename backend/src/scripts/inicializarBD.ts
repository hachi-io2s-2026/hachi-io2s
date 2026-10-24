// Crea las tablas y carga los datos iniciales ejecutando los scripts de database/.
// Sirve para preparar una base nueva, por ejemplo la de la nube (TiDB Cloud):
//   npm run inicializar-bd                  -> tablas + datos de prueba (02_seed.sql)
//   npm run inicializar-bd -- --reportes    -> ademas, el historial de ejemplo para los reportes
//   npm run inicializar-bd -- --solo-esquema -> solo tablas/columnas que falten, sin datos
// Usa las variables DB_* del archivo .env. Se puede ejecutar varias veces sin duplicar datos.
import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import mysql from "mysql2/promise";

const CARPETA = path.join(__dirname, "..", "..", "..", "database");

async function main() {
  const archivos = ["01_create_database.sql"];
  if (!process.argv.includes("--solo-esquema")) {
    archivos.push("02_seed.sql");
    if (process.argv.includes("--reportes")) archivos.push("03_seed_reportes.sql");
  }

  const conexion = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === "true" ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
    // Los scripts traen varias sentencias seguidas
    multipleStatements: true,
  });

  try {
    await conexion.query(`SET time_zone = '${process.env.DB_ZONA_HORARIA || "-06:00"}'`);
    for (const archivo of archivos) {
      // Los scripts usan "hachi_db"; si la base se llama distinto, se reemplaza el nombre
      const sql = readFileSync(path.join(CARPETA, archivo), "utf8").replaceAll(
        "hachi_db",
        process.env.DB_NAME || "hachi_db"
      );
      process.stdout.write(`Ejecutando ${archivo}... `);
      await conexion.query(sql);
      console.log("listo");
    }
    console.log(`\nBase "${process.env.DB_NAME || "hachi_db"}" lista. Ahora crea el administrador con:`);
    console.log('  npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com "ContrasenaSegura"');
  } finally {
    await conexion.end();
  }
}

main().catch((error) => {
  console.error("\nNo se pudo inicializar la base:", error.message);
  process.exit(1);
});
