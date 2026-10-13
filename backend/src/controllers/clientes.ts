
// Portal del cliente: registro, inicio de sesion, perros propios y solicitudes de reserva.
// Todas las consultas se limitan al dueno de la sesion (req.cliente.id_propietario).
import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { z } from "zod";
import { pool } from "../config/database.js";
import { firmarTokenCliente, type ClienteToken } from "../middlewares/auth.js";
import { cotizar, reservaQueSeCruza } from "../services/reservas.js";
import { HttpError, noEncontrado } from "../utils/httpError.js";
import { enTransaccion } from "../utils/transaccion.js";
import { idParams, textoOpcional, textoRequerido } from "../utils/validacion.js";
import { mascotaSchema } from "./mascotas.js";
import {
  SELECT_RESERVACION,
  buscarDetalle,
  conResumen,
  cotizacionSchema,
  crearSchema,
  registrarReservacion,
} from "./reservaciones.js";

const telefono = z
  .string()
  .trim()
  .regex(/^[0-9+\-\s()]{8,20}$/, "Telefono invalido (8 a 20 digitos)");

const registroSchema = z.object({
  nombre: textoRequerido(100),
  apellido: textoRequerido(100),
  telefono,
  correo: z.email().trim().toLowerCase().max(150),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres").max(72),
  direccion: textoOpcional(255),
});

const perfilSchema = z.object({
  nombre: textoRequerido(100),
  apellido: textoRequerido(100),
  telefono,
  direccion: textoOpcional(255),
});

// El cliente no elige el dueno: siempre es el de su sesion
const mascotaClienteSchema = mascotaSchema.omit({ id_propietario: true });

const soloDigitos = (t: string) => t.replace(/\D/g, "");

function respuestaSesion(datos: ClienteToken) {
  return { token: firmarTokenCliente(datos), cliente: datos };
}

// ---------- Cuenta ----------

// Crea la cuenta. Si el hotel ya tenia registrado al dueno con ese correo, la cuenta se
// vincula a ese registro solo si el telefono tambien coincide (evita que alguien tome
// los datos de otra persona conociendo solo su correo).
export async function registro(req: Request, res: Response) {
  const d = registroSchema.parse(req.body);

  const datos = await enTransaccion(async (conn) => {
    const [[cuenta]] = await conn.query<RowDataPacket[]>(
      `SELECT id_cuenta FROM cuentas_cliente WHERE correo = ?`,
      [d.correo]
    );
    if (cuenta) throw new HttpError(409, "Ya existe una cuenta con ese correo. Inicia sesion.");

    const [[existente]] = await conn.query<RowDataPacket[]>(
      `SELECT p.id_propietario, p.nombre, p.apellido, p.telefono,
         (SELECT COUNT(*) FROM cuentas_cliente c WHERE c.id_propietario = p.id_propietario) AS con_cuenta
       FROM propietarios p WHERE p.correo = ? LIMIT 1 FOR UPDATE`,
      [d.correo]
    );

    let idPropietario: number;
    let nombre = `${d.nombre} ${d.apellido}`;
    if (existente) {
      if (existente.con_cuenta > 0) {
        throw new HttpError(409, "Ese registro ya tiene una cuenta. Inicia sesion.");
      }
      if (soloDigitos(existente.telefono) !== soloDigitos(d.telefono)) {
        throw new HttpError(
          409,
          "Ese correo ya esta registrado en el hotel con otro telefono. Comunicate con recepcion para activar tu cuenta."
        );
      }
      idPropietario = existente.id_propietario;
      nombre = `${existente.nombre} ${existente.apellido}`;
    } else {
      const [nuevo] = await conn.query<ResultSetHeader>(
        `INSERT INTO propietarios (nombre, apellido, telefono, correo, direccion) VALUES (?, ?, ?, ?, ?)`,
        [d.nombre, d.apellido, d.telefono, d.correo, d.direccion]
      );
      idPropietario = nuevo.insertId;
    }

    const hash = await bcrypt.hash(d.password, 10);
    const [c] = await conn.query<ResultSetHeader>(
      `INSERT INTO cuentas_cliente (id_propietario, correo, password_hash) VALUES (?, ?, ?)`,
      [idPropietario, d.correo, hash]
    );

    return { id_cuenta: c.insertId, id_propietario: idPropietario, nombre, correo: d.correo };
  });

  res.status(201).json({ success: true, data: respuestaSesion(datos) });
}

// Datos del dueno y sus perros
export async function perfil(req: Request, res: Response) {
  const id = req.cliente!.id_propietario;
  const [[p]] = await pool.query<RowDataPacket[]>(
    `SELECT id_propietario, nombre, apellido, telefono, correo, direccion, fecha_registro
     FROM propietarios WHERE id_propietario = ?`,
    [id]
  );
  if (!p) throw noEncontrado("Propietario");
  const [mascotas] = await pool.query<RowDataPacket[]>(
    `SELECT * FROM mascotas WHERE id_propietario = ? ORDER BY activo DESC, nombre`,
    [id]
  );
  res.json({ success: true, data: { ...p, mascotas } });
}

export async function actualizarPerfil(req: Request, res: Response) {
  const d = perfilSchema.parse(req.body);
  await pool.query(
    `UPDATE propietarios SET nombre = ?, apellido = ?, telefono = ?, direccion = ? WHERE id_propietario = ?`,
    [d.nombre, d.apellido, d.telefono, d.direccion, req.cliente!.id_propietario]
  );
  return perfil(req, res);
}

// ---------- Perros ----------

async function mascotaPropia(idMascota: number, idPropietario: number) {
  const [[m]] = await pool.query<RowDataPacket[]>(
    `SELECT id_mascota, activo FROM mascotas WHERE id_mascota = ? AND id_propietario = ?`,
    [idMascota, idPropietario]
  );
  // Mismo mensaje si no existe o si es de otro dueno: no revelar datos ajenos
  if (!m) throw noEncontrado("Mascota");
  return m;
}

export async function crearMascota(req: Request, res: Response) {
  const d = mascotaClienteSchema.parse(req.body);
  await pool.query<ResultSetHeader>(
    `INSERT INTO mascotas (id_propietario, nombre, raza, sexo, fecha_nacimiento, peso_kg, observaciones)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.cliente!.id_propietario, d.nombre, d.raza, d.sexo, d.fecha_nacimiento, d.peso_kg, d.observaciones]
  );
  res.status(201);
  return perfil(req, res);
}

export async function actualizarMascota(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  const d = mascotaClienteSchema.parse(req.body);
  await mascotaPropia(id, req.cliente!.id_propietario);
  await pool.query(
    `UPDATE mascotas SET nombre = ?, raza = ?, sexo = ?, fecha_nacimiento = ?, peso_kg = ?, observaciones = ?
     WHERE id_mascota = ?`,
    [d.nombre, d.raza, d.sexo, d.fecha_nacimiento, d.peso_kg, d.observaciones, id]
  );
  return perfil(req, res);
}

// ---------- Reservas ----------

export async function listarReservaciones(req: Request, res: Response) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `${SELECT_RESERVACION} WHERE p.id_propietario = ? ORDER BY r.fecha_inicio DESC LIMIT 200`,
    [req.cliente!.id_propietario]
  );
  res.json({ success: true, data: rows.map(conResumen) });
}

async function reservacionPropia(id: number, idPropietario: number) {
  const detalle = await buscarDetalle(id).catch(() => null);
  if (!detalle || Number((detalle as RowDataPacket).id_propietario) !== idPropietario) {
    throw noEncontrado("Reservacion");
  }
  return detalle;
}

export async function obtenerReservacion(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  res.json({ success: true, data: await reservacionPropia(id, req.cliente!.id_propietario) });
}

export async function cotizacion(req: Request, res: Response) {
  const d = cotizacionSchema.parse(req.body);
  if (d.id_mascota) await mascotaPropia(d.id_mascota, req.cliente!.id_propietario);
  const resultado = await cotizar(pool, d);
  const cruce = d.id_mascota ? await reservaQueSeCruza(pool, d.id_mascota, d.fecha_inicio, d.fecha_fin) : null;
  res.json({ success: true, data: { ...resultado, cruce } });
}

// La solicitud queda PENDIENTE hasta que el hotel la confirma
export async function solicitarReservacion(req: Request, res: Response) {
  const d = crearSchema.parse(req.body);
  await mascotaPropia(d.id_mascota, req.cliente!.id_propietario);
  const id = await registrarReservacion(d, "CLIENTE");
  res.status(201).json({ success: true, data: await buscarDetalle(id) });
}

// El cliente solo puede cancelar mientras el hotel no la haya confirmado
export async function cancelarReservacion(req: Request, res: Response) {
  const { id } = idParams.parse(req.params);
  await reservacionPropia(id, req.cliente!.id_propietario);

  await enTransaccion(async (conn) => {
    const [[r]] = await conn.query<RowDataPacket[]>(
      `SELECT estado FROM reservaciones WHERE id_reservacion = ? FOR UPDATE`,
      [id]
    );
    if (r.estado !== "PENDIENTE") {
      throw new HttpError(
        409,
        "Solo puedes cancelar solicitudes pendientes. Para una reserva confirmada, comunicate con el hotel."
      );
    }
    await conn.query(`UPDATE reservaciones SET estado = 'CANCELADA' WHERE id_reservacion = ?`, [id]);
  });

  res.json({ success: true, data: await buscarDetalle(id) });
}
