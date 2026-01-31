import express from "express";
import cors from "cors";
import pedidosRouter from "./routes/pedidos.js";
import impresoraRouter from "./impresora.js"; // <-- Importar el nuevo router

console.log("SERVER LOADED");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/test", (req, res) => {
  res.send("Servidor vivo");
});

// Tus rutas existentes
app.use("/pedidos", pedidosRouter);

// Nueva ruta para impresión
app.use("/impresora", impresoraRouter); // <-- Agregar esta línea

// Exportar la app (si usas server.js como módulo)
export default app;