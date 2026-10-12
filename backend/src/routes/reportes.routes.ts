import { Router } from "express";
import { suite } from "../controllers/reportes.controller.js";
// Se monta después de requerirAuth en el router principal. POST sólo consulta/simula.
const router = Router();
router.post("/suite", suite);
export default router;
