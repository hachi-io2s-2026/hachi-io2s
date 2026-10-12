
//   npm run crear-admin -- "Nombre Apellido" correo@ejemplo.com "ContrasenaSegura"
import "dotenv/config";
import bcrypt from "bcryptjs";
import { pool } from "../config/database.js";

async function main() {
  const [nombre, correo, password] = process.argv.slice(2);

  if (!nombre || !correo || !password) {
    console.error('Uso: npm run crear-admin -- "Nombre" correo@ejemplo.com "Contrasena"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("La contrasena debe tener al menos 8 caracteres");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, correo, password_hash, rol)
     VALUES (?, ?, ?, 'ADMIN')
     ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), password_hash = VALUES(password_hash),
       rol = 'ADMIN', activo = TRUE`,
    [nombre, correo.trim().toLowerCase(), hash]
  );
  console.log(`Usuario ADMIN listo: ${correo}`);
  await pool.end();
}

main().catch(async (error) => {
  console.error("No se pudo crear el administrador:", error);
  await pool.end();
  process.exit(1);
});
