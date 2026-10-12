
import express from "express";
import cors from "cors";
import { manejarErrores, rutaNoEncontrada } from "./middlewares/errorHandler.js";
import router from "./routes/index.js";

const app = express();

// Permitir solicitudes del frontend local
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  })
);

// Leer solicitudes con formato JSON
app.use(express.json());

// Ruta para comprobar el estado del backend
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "API de HACHI funcionando correctamente",
  });
});

app.use("/api", router);

// Rutas inexistentes y manejo de errores
app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
