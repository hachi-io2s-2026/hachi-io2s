
import { Router } from "express";
import * as auth from "../controllers/auth.js";
import * as capacidades from "../controllers/capacidades.js";
import * as clientes from "../controllers/clientes.js";
import * as daycare from "../controllers/daycare.js";
import * as hospedajes from "../controllers/hospedajes.js";
import * as mascotas from "../controllers/mascotas.js";
import * as pagos from "../controllers/pagos.js";
import * as propietarios from "../controllers/propietarios.js";
import * as reservaciones from "../controllers/reservaciones.js";
import * as servicios from "../controllers/servicios.js";
import * as tarifas from "../controllers/tarifas.js";
import * as usuarios from "../controllers/usuarios.js";
import { requerirAuth, requerirCliente, requerirRol } from "../middlewares/auth.js";

import reportes from "./reportes.routes.js";

const router = Router();
const soloAdmin = requerirRol("ADMIN");

// Publica. Un solo inicio de sesion para personal y clientes (responde el tipo de cuenta)
router.post("/auth/login", auth.login);
// Servicios con tarifa y capacidad vigentes (sin datos personales); la usa la pagina informativa
router.get("/servicios", servicios.listar);

// ---------- Portal del cliente (cada cliente solo ve sus propios datos) ----------
const portal = Router();
portal.post("/registro", clientes.registro);
portal.use(requerirCliente);
portal.get("/me", clientes.perfil);
portal.put("/me", clientes.actualizarPerfil);
portal.post("/mascotas", clientes.crearMascota);
portal.put("/mascotas/:id", clientes.actualizarMascota);
portal.get("/reservaciones", clientes.listarReservaciones);
portal.post("/reservaciones/cotizacion", clientes.cotizacion);
portal.get("/reservaciones/:id", clientes.obtenerReservacion);
portal.post("/reservaciones", clientes.solicitarReservacion);
portal.post("/reservaciones/:id/cancelar", clientes.cancelarReservacion);
router.use("/cliente", portal);

// Todo lo siguiente requiere sesion iniciada
router.use(requerirAuth);
router.use("/reportes", reportes);

router.get("/auth/me", auth.perfil);

router.get("/usuarios", soloAdmin, usuarios.listar);
router.post("/usuarios", soloAdmin, usuarios.crear);
router.patch("/usuarios/:id", soloAdmin, usuarios.actualizar);

router.get("/propietarios", propietarios.listar);
router.get("/propietarios/:id", propietarios.obtener);
router.post("/propietarios", propietarios.crear);
router.put("/propietarios/:id", propietarios.actualizar);

router.get("/mascotas", mascotas.listar);
router.get("/mascotas/:id", mascotas.obtener);
router.post("/mascotas", mascotas.crear);
router.put("/mascotas/:id", mascotas.actualizar);
router.delete("/mascotas/:id", mascotas.desactivar);
router.post("/mascotas/:id/reactivar", mascotas.reactivar);

router.get("/tarifas", tarifas.listar);
router.post("/tarifas", soloAdmin, tarifas.crear);
router.patch("/tarifas/:id", soloAdmin, tarifas.actualizar);

router.get("/capacidades", capacidades.listar);
router.post("/capacidades", soloAdmin, capacidades.crear);
router.patch("/capacidades/:id", soloAdmin, capacidades.actualizar);

router.get("/reservaciones", reservaciones.listar);
router.post("/reservaciones/cotizacion", reservaciones.cotizacion);
router.get("/reservaciones/:id", reservaciones.obtener);
router.post("/reservaciones", reservaciones.crear);
router.patch("/reservaciones/:id/estado", reservaciones.cambiarEstado);

router.get("/hospedajes", hospedajes.listar);
router.post("/hospedajes/:id/entrada", hospedajes.registrarEntrada);
router.post("/hospedajes/:id/salida", hospedajes.registrarSalida);

router.get("/daycare/asistencias", daycare.listar);
router.post("/daycare/asistencias/:id/entrada", daycare.registrarEntrada);
router.post("/daycare/asistencias/:id/salida", daycare.registrarSalida);
router.post("/daycare/asistencias/:id/ausente", daycare.registrarAusencia);

router.get("/pagos", pagos.listar);
router.post("/pagos", pagos.crear);
router.post("/pagos/:id/anular", soloAdmin, pagos.anular);

export default router;
