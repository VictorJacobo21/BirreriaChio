import { createServer } from "http"
import app from "./server.js"

const server = createServer(app)

server.listen(3000, "0.0.0.0",() => {
  console.log("Backend corriendo en http://localhost:3000")
})
