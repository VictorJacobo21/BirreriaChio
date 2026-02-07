import { useEffect, useState, useRef } from "react";
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
  const [prevPendientes, setPrevPendientes] = useState(0);

   const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/sonido.mp3");
  }, []);
  const cargarPedidos = async () => {
  const data = await getPedidosActivos();

  const pendientes = data.filter(p => p.estado === "PENDIENTE").length;

  setPrevPendientes(prev => {
    if (audioEnable && pendientes > prev) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log("Audio bloqueado:", err);
      });
    }
    return pendientes;
  });

  setPedidos(data);
};



  useEffect(() => {
  cargarPedidos();
  const interval = setInterval(cargarPedidos, 5000);
  return () => clearInterval(interval);
}, [audioEnable]);


  const cola = pedidos.filter(p => p.estado === "PENDIENTE");
  const preparando = pedidos.filter(p => p.estado === "PREPARACION");
  const listos = pedidos.filter(p => p.estado === "LISTO");

 
  const iniciarPreparacion = async (id) => {
  try {
    await cambiarEstadoPedido(id, "PREPARACION");
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
    <Typography variant="h5">
  {pedido.tipo === "MESA"
    ? `📍 Mesa ${pedido.mesaId}`
    : `🥡 Para llevar: ${pedido.nombreCliente || "Sin nombre"}`
  }
</Typography>


    {/* ITEMS */}
    {pedido.items.map(item => (
      <Typography key={item.id}>
        {item.producto.nombre} x{item.cantidad}
      </Typography>
    ))}

    {/* NOTA DEL PEDIDO */}
    {pedido.nota && pedido.nota.trim() !== "" && (
  <Box
    sx={{
      mt: 1,
      p: 1,
      bgcolor: "#fff3cd",
      borderRadius: 1,
      border: "1px solid #ffeeba",
      maxWidth: "100%",
    }}
  >
    <Typography variant="subtitle2" color="error">
      📝 Nota:
    </Typography>

    <Typography
      variant="body2"
      sx={{
        whiteSpace: "pre-wrap",   // respeta saltos de línea
        wordBreak: "break-word",  // corta palabras largas
        maxHeight: "100px",
        maxWidth: "200px",
        overflowWrap: "break-word"
      }}
    >
      {pedido.nota}
    </Typography>
  </Box>
)}


    {!sinBoton && (
      <Button fullWidth variant="contained" sx={{ mt: 1 }} onClick={onClick}>
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
        >{!audioEnable && (
  <Button
  variant="contained"
  color="warning"
  onClick={() => {
    setAudioEnable(true);
    audioRef.current.play().catch(err => console.log("Bloqueado:", err));
  }}
  sx={{ mb: 2 }}
>
  🔊 Activar sonido
</Button>
)}
          {/* COLA */}
          <Grid item xs={12} md={4} display="flex" justifyContent="center">
            <Box sx={{  width: "100%", maxHeight: "80vh", overflowY: "auto"}}>
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
