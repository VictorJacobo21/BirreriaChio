import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Typography,
  Grid,
  Box,
  Chip,
  Stack
} from "@mui/material";
import {
  getPedidosActivos,
  cambiarEstadoPedido
} from "../api/pedidosApi";

export default function Cocina() {
  const [pedidos, setPedidos] = useState([]);
  const [prevCount, setPrevCount] = useState(0);
  const [audioEnable, setAudioEnable] = useState(false)
  const audio = new Audio("/sonido.mp3");

  const cargarPedidos = async () => {
    const data = await getPedidosActivos();
    if(data.length > prevCount){
      //audio.play();
    }
    console.log(data);
    setPedidos(data);
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const cola = pedidos.filter(p => p.estado === "PENDIENTE");
  const preparando = pedidos.filter(p => p.estado === "PREPARACION");
  const listos = pedidos.filter(p => p.estado === "LISTO");

 
  const iniciarPreparacion = async (id) => {
  try {
    await cambiarEstadoPedido(id, "PREPARACION");
    console.log("Preparando pedido", id);
    cargarPedidos(); // refresca columnas
  } catch (error) {
    alert(error.response?.data?.error || "No se puede preparar más pedidos");
  }
};

const terminarPedido = async (id) => {
  try {
    await cambiarEstadoPedido(id, "LISTO");
    cargarPedidos();
  } catch (error) {
    console.error("Error al terminar pedido", error);
  }
};


  const PedidoCard = ({ pedido, botonTexto, onClick, sinBoton }) => (
  <Card sx={{ p: 2, mb: 2 }}>
    <Typography variant="h5">Mesa {pedido.mesaId}</Typography>

    {pedido.items.map(item => (
      <Typography key={item.id}>
        {item.producto.nombre} x{item.cantidad}
      </Typography>
    ))}

    {!sinBoton && (
      <Button fullWidth variant="contained" onClick={onClick}>
        {botonTexto}
      </Button>
    )}
  </Card>
);


  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        bgcolor: "#272525"
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1600px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          p: 2
        }}
      >
        <Typography variant="h3" align="center" mb={2}>
          🍳 Cocina
        </Typography>

        <Grid
          container
          spacing={3}
          justifyContent="center"
          alignItems="stretch"
        >
          {/* COLA */}
          <Grid item xs={12} md={4} display="flex" justifyContent="center">
            <Box sx={{ width: "100%" }}>
              <Typography variant="h4" align="center">🕒 En cola</Typography>
              {cola.map(pedido => (
              <PedidoCard
                pedido={pedido}
                botonTexto="PREPARAR"
                onClick={() => iniciarPreparacion(pedido.id)}
              />
            ))}

            </Box>
          </Grid>

          {/* PREPARANDO */}
          <Grid item xs={12} md={4} display="flex" justifyContent="center">
            <Box sx={{ width: "100%" }}>
              <Typography variant="h4" align="center">🔥 Preparando</Typography>
              {preparando.map(pedido => (
          <PedidoCard
            pedido={pedido}
            botonTexto="TERMINADO"
            onClick={() => terminarPedido(pedido.id)}
          />
        ))}

            </Box>
          </Grid>

          {/* LISTOS */}
          <Grid item xs={12} md={4} display="flex" justifyContent="center">
            <Box sx={{ width: "100%" }}>
              <Typography variant="h4" align="center">✅ Listos</Typography>
              {listos.map(pedido => (
                <PedidoCard pedido={pedido} sinBoton />
              ))}

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
