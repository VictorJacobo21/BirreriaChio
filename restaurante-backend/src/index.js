import { createServer } from "http"
import app from "./server.js"
import 'dotenv/config';  // ESM: lee tu .env automáticamente

const server = createServer(app)

server.listen(3000, "0.0.0.0",() => {
  console.log(process.env.DATABASE_URL);
  console.log("Backend corriendo en http://localhost:3000")
})
