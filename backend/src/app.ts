
import express from "express";
import cors from "cors";

const app = express();

// Permitir solicitudes del frontend local
app.use(
  cors({
    origin: "http://localhost:5173",
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

export default app;
