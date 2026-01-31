import { useEffect, useState } from "react";
import { useRef } from "react";
import {
  Card, Button, Typography, Grid, Box,
  Dialog, DialogTitle, DialogContent, DialogActions,
  RadioGroup, FormControlLabel, Radio
} from "@mui/material";
import axios from "axios";
import "./Caja.css"; // Archivo CSS separado para estilos de impresión

const API_URL = "http://192.168.100.166:3000";

export default function Caja() {
  const ticketRef = useRef();
  const [pedidos, setPedidos] = useState([]);
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

  const cargarPedidos = async () => {
    try {
      const res = await axios.get(`${API_URL}/pedidos/listos`);
      setPedidos(res.data);
    } catch (error) {
      console.error("Error cargando pedidos:", error);
    }
  };

  useEffect(() => {
    cargarPedidos();
    const interval = setInterval(cargarPedidos, 5000);
    return () => clearInterval(interval);
  }, []);

  const pagarPedido = async () => {
    try {
      await axios.patch(
        `${API_URL}/pedidos/${pedidoSeleccionado.id}/pagar`,
        { metodoPago }
      );
      
      setPedidoAImprimir(pedidoSeleccionado);
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