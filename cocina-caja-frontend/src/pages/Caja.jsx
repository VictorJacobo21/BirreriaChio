import { useEffect, useState } from "react";
import {
  Card, Button, Typography, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import axios from "axios";

const API_URL = "http://192.168.100.134:3000";

export default function Caja() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("EFECTIVO");
  const [pedidoAImprimir, setPedidoAImprimir] = useState(null);

  useEffect(() => {
    if (pedidoAImprimir) {
      setTimeout(() => {
        window.print();
        setPedidoAImprimir(null);
      }, 300);
    }
  }, [pedidoAImprimir]);

  const cargarPedidos = async () => {
    const res = await axios.get(`${API_URL}/pedidos/listos`);
    setPedidos(res.data);
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const pagarPedido = async () => {
    await axios.patch(
      `${API_URL}/pedidos/${pedidoSeleccionado.id}/pagar`,
      { metodoPago }
    );
    setPedidoAImprimir(pedidoSeleccionado);
    setPedidoSeleccionado(null);
    cargarPedidos();
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
            {pedidos.map(pedido => (
              <Grid item xs={12} md={4} key={pedido.id}>
                <Card sx={{ p: 2 }}>
                  <Typography variant="h5">Mesa {pedido.mesaId}</Typography>

                  {pedido.items.map(item => (
                    <Typography key={item.id}>
                      {item.producto.nombre} x{item.cantidad} — $
                      {(item.producto.precio * item.cantidad).toFixed(2)}
                    </Typography>
                  ))}

                  <Typography variant="h6" sx={{ mt: 1 }}>
                    Total: ${calcularTotal(pedido).toFixed(2)}
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    color="success"
                    sx={{ mt: 2 }}
                    onClick={() => setPedidoSeleccionado(pedido)}
                  >
                    COBRAR
                  </Button>
                </Card>
              </Grid>
            ))}
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

      {/* TICKET */}
      {pedidoAImprimir && (
        <div id="ticket-print">
          <div className="ticket-header">
            <h2>🌮 Birriería Chio</h2>
            <p>Ciudad Victoria y Quintana Roo 300 #123</p>
            <p>Tel: 686-426-7716</p>
          </div>

          <hr />

          <p>Mesa: {pedidoAImprimir.mesaId}</p>
          <p>Fecha: {new Date().toLocaleString()}</p>

          <hr />

          {pedidoAImprimir.items.map(item => (
            <div key={item.id} className="ticket-item">
              <span>{item.producto.nombre} x{item.cantidad}</span>
              <span>${(item.producto.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}

          <hr />

          <div className="ticket-total">
            <strong>TOTAL</strong>
            <strong>${calcularTotal(pedidoAImprimir).toFixed(2)}</strong>
          </div>

          <p>Pago: {metodoPago}</p>

          <hr />

          <p className="ticket-footer">¡Gracias por su compra!</p>
        </div>
      )}
    </>
  );
}
