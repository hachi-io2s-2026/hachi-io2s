// Punto de entrada del backend en Vercel (funcion serverless).
// Vercel dirige aqui todas las peticiones /api/* (ver vercel.json) y la app de Express
// responde con sus rutas de siempre. backend/dist se genera en el build (npm run build).
module.exports = require("../backend/dist/app.js").default;
