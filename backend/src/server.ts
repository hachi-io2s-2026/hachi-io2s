
import "dotenv/config";
import app from "./app.js";
import { testConnection } from "./config/database.js";

const PORT = Number(process.env.PORT) || 3000;

// Iniciar el servidor y probar la conexion a la base de datos
async function startServer() {
  try {
    await testConnection();

    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor HACHI en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar HACHI:", error); 
    process.exit(1);
  }
}

startServer();
