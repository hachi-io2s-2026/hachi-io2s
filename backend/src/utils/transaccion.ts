
import type { PoolConnection } from "mysql2/promise";
import { pool } from "../config/database.js";

// Ejecuta fn dentro de una transaccion: commit si termina bien, rollback si falla
export async function enTransaccion<T>(
  fn: (conn: PoolConnection) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
