import { useEffect, useState } from "react";
import { useRef } from "react";
import {
  Card, Button, Typography, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import axios from "axios";
import "./Caja.css"; // Archivo CSS separado para estilos de impresión

const API_URL = "http://192.168.100.134:3000";

export default function Caja() {
  const ticketRef = useRef();
  const [pedidos, setPedidos] = useState([]);
  const [tickets, setTickets] = useState([]); 
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [pedidoAImprimir, setPedidoAImprimir] = useState(null);

  useEffect(() => {
    if (pedidoAImprimir) {
      // Esperar un momento para que el DOM se actualice
      setTimeout(() => {
        window.print();
        // Restaurar después de imprimir
        setTimeout(() => {
          setPedidoAImprimir(null);
        }, 100);
      }, 300);
    }
  }, [pedidoAImprimir]);

const TIEMPO_MAX = 10 * 60; // 10 min en segundos

const tiempoRestante = (ticket) => {
  const finishedAt = new Date(ticket.finishedAt);
  const ahora = new Date();
  const diff = Math.floor((ahora - finishedAt) / 1000);
  const restante = TIEMPO_MAX - diff;

  if (restante <= 0) return "00:00";

  const min = Math.floor(restante / 60);
  const sec = restante % 60;

  return `${min.toString().padStart(2,"0")}:${sec.toString().padStart(2,"0")}`;
};

const descartarTicket = async (id) => {
  if (!confirm("¿Descartar este ticket?")) return;

  await axios.patch(`${API_URL}/pedidos/tickets/${id}/descartar`);
  cargarTickets();
};

  const cargarPedidos = async () => {
  const res = await axios.get(`${API_URL}/pedidos/listos`);
  setPedidos(res.data);
};

const cargarTickets = async () => {
  const res = await axios.get(`${API_URL}/pedidos/tickets/pendientes`);
  setTickets(res.data);
};

useEffect(() => {
  cargarPedidos();
  cargarTickets();
  const interval = setInterval(() => {
    cargarPedidos();
    cargarTickets();
  }, 5000);
  return () => clearInterval(interval);
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    setTickets(prev => [...prev]); // fuerza re-render
  }, 3000);
  return () => clearInterval(interval);
}, []);

  const imprimirTicket = async (pedido) => {
  try {
    // Mostrar ticket para imprimir
    setPedidoAImprimir(pedido);

    // Marcar como impreso en backend
    await axios.patch(`${API_URL}/pedidos/${pedido.id}/imprimir`);

    cargarTickets();
  } catch (e) {
    console.error("Error al imprimir:", e);
    alert("Error al imprimir, revisa consola");
  }
};

  const pagarPedido = async () => {
    try {
      await axios.patch(
        `${API_URL}/pedidos/${pedidoSeleccionado.id}/pagar`,
        { metodoPago }
      );
      
      
      setPedidoSeleccionado(null);
      cargarPedidos();
    } catch (error) {
      console.error("Error pagando pedido:", error);
    }
  };

  const calcularTotal = (pedido) =>
    pedido.items.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);

  return (
    <>
      {/* UI NORMAL */}
      <div className="no-print">
        <Box p={3}>
          <Typography variant="h3" align="center" mb={3}>
            💵 Caja
          </Typography>

          <Grid container spacing={3}>

{/* COLUMNA COBRAR */}
<Grid item xs={12} md={6}>
  <Typography variant="h4">💵 Para cobrar</Typography>

  {pedidos.map(pedido => (
    <Card key={pedido.id} sx={{ p:2, mb:2 }}>
      <Typography variant="h5">
        {pedido.tipo === "LLEVAR"
          ? `Para llevar: ${pedido.nombreCliente}`
          : `Mesa ${pedido.mesaId}`}
      </Typography>

      <Typography>Total: ${calcularTotal(pedido).toFixed(2)}</Typography>

      <Button
        fullWidth
        color="success"
        variant="contained"
        onClick={() => setPedidoSeleccionado(pedido)}
      >
        COBRAR
      </Button>
    </Card>
  ))}
</Grid>


{/* COLUMNA IMPRIMIR */}
<Grid item xs={12} md={6}>
  <Typography variant="h4">🖨️ Tickets pendientes</Typography>

 {tickets.map(pedido => (
  <Card key={pedido.id} sx={{ p:2, mb:2 }}>
    <Typography variant="h6">
      {pedido.tipo === "LLEVAR"
        ? `Para llevar: ${pedido.nombreCliente || "Sin nombre"}`
        : `Mesa ${pedido.mesa?.numero || pedido.mesaId}`}
    </Typography>

    <Typography>
      Folio #{pedido.id}
    </Typography>

   <Button
  fullWidth
  variant="contained"
  onClick={() => imprimirTicket(ticket)}
>
  🖨️ IMPRIMIR
</Button>

<Button
  fullWidth
  color="error"
  variant="outlined"
  sx={{ mt: 1 }}
  onClick={() => descartarTicket(pedido.id)}
>
  🗑️ DESCARTAR
</Button>

<Typography variant="body2" sx={{ mt: 1 }}>
  ⏳ Expira en: {tiempoRestante(pedido)}
</Typography>

  </Card>
))}
 
</Grid>

</Grid>

          <Dialog open={!!pedidoSeleccionado} onClose={() => setPedidoSeleccionado(null)}>
            <DialogTitle>Confirmar pago</DialogTitle>

            <DialogContent>
              <Typography>Mesa {pedidoSeleccionado?.mesaId}</Typography>

              {pedidoSeleccionado?.items.map(item => (
                <Typography key={item.id}>
                  {item.producto.nombre} x{item.cantidad} — $
                  {(item.producto.precio * item.cantidad).toFixed(2)}
                </Typography>
              ))}

              <Typography variant="h6" sx={{ mt: 2 }}>
                Total: ${pedidoSeleccionado ? calcularTotal(pedidoSeleccionado).toFixed(2) : "0.00"}
              </Typography>

              <RadioGroup value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                <FormControlLabel value="EFECTIVO" control={<Radio />} label="Efectivo 💵" />
                <FormControlLabel value="TARJETA" control={<Radio />} label="Tarjeta 💳" />
                <FormControlLabel value="TRANSFERENCIA" control={<Radio />} label="Transferencia 📱" />
              </RadioGroup>
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setPedidoSeleccionado(null)}>Cancelar</Button>
              <Button variant="contained" color="success" onClick={pagarPedido}>
                Confirmar pago
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </div>

      {/* TICKET - SOLO VISIBLE AL IMPRIMIR */}
      {pedidoAImprimir && (
        <div className="ticket-container" ref={ticketRef}>
          <div className="ticket-content">
            <div className="ticket-header">
              <h1>🌮 Birriería Chio</h1>
              <p>Ciudad Victoria y Quintana Roo 300 #123</p>
              <p>Tel: 686-426-7716</p>
              <p>--------------------------------</p>
            </div>

            <div className="ticket-info">
              <p><strong>Mesa:</strong> {pedidoAImprimir.mesaId}</p>
              <p><strong>Fecha:</strong> {new Date().toLocaleString('es-MX')}</p>
              <p><strong>Folio:</strong> #{pedidoAImprimir.id.toString().padStart(4, '0')}</p>
              <p>--------------------------------</p>
            </div>

            <div className="ticket-items">
              <table>
                <thead>
                  <tr>
                    <th style={{textAlign: 'left'}}>Cant.</th>
                    <th style={{textAlign: 'left', paddingLeft: '10px'}}>Descripción</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pedidoAImprimir.items.map(item => (
                    <tr key={item.id}>
                      <td>x{item.cantidad}</td>
                      <td style={{paddingLeft: '10px'}}>{item.producto.nombre}</td>
                      <td style={{textAlign: 'right'}}>
                        ${(item.producto.precio * item.cantidad).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p>--------------------------------</p>
            </div>

            <div className="ticket-total">
              <div className="total-row">
                <span>SUBTOTAL:</span>
                <span>${calcularTotal(pedidoAImprimir).toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>TOTAL:</span>
                <span className="grand-total">${calcularTotal(pedidoAImprimir).toFixed(2)}</span>
              </div>
              <p>--------------------------------</p>
            </div>

            <div className="ticket-payment">
              <p><strong>Método de pago:</strong> {metodoPago}</p>
              <p>--------------------------------</p>
            </div>

            <div className="ticket-footer">
              <p>¡Gracias por su preferencia!</p>
              <p>Vuelva pronto</p>
              <br/>
              <p>*** Ticket generado automáticamente ***</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}