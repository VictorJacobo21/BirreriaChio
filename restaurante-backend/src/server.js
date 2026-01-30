import express from "express"
import cors from "cors"
import pedidosRouter from "./routes/pedidos.js"

console.log("SERVER LOADED")
const app = express()

app.use(cors())
app.use(express.json())

app.get("/test", (req,res)=>{
  res.send("Servidor vivo")
})

app.use("/pedidos", pedidosRouter)

export default app
