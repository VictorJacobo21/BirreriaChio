import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField
} from "@mui/material";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { getPedidosPagados } from "../api/pedidosApi"; // ✅ asegurate de que la ruta sea correcta

export default function VentasDiarias() {
  const [fecha, setFecha] = useState(new Date());
  const [ventas, setVentas] = useState([]);
  const [resumen, setResumen] = useState({
    total: 0,
    pedidos: 0,
    porMetodo: {}
  });

  useEffect(() => {
    async function fetchVentas() {
      try {
        const data = await getPedidosPagados(); // Trae todos los pedidos PAGADOS
        const fechaSeleccionada = fecha.toISOString().split("T")[0];

        // Filtrar solo los pedidos pagados en la fecha seleccionada
        const pedidosDelDia = data.filter((p) =>
          p.pagadoEn?.startsWith(fechaSeleccionada)
        );

        // Calcular total general
        const total = pedidosDelDia.reduce((acc, p) => {
          const t = p.items.reduce(
            (s, i) => s + i.cantidad * i.producto.precio,
            0
          );
          return acc + t;
        }, 0);

        // Calcular totales por método de pago
        const porMetodo = {};
        pedidosDelDia.forEach((p) => {
          const metodo = p.metodoPago || "Desconocido";
          const t = p.items.reduce(
            (s, i) => s + i.cantidad * i.producto.precio,
            0
          );
          porMetodo[metodo] = (porMetodo[metodo] || 0) + t;
        });

        setVentas(pedidosDelDia);
        setResumen({ total, pedidos: pedidosDelDia.length, porMetodo });
      } catch (error) {
        console.error("Error obteniendo ventas:", error);
      }
    }

    fetchVentas();
  }, [fecha]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Ventas Diarias
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
  <DatePicker
    label="Seleccionar fecha"
    value={fecha}
    onChange={(newValue) => setFecha(newValue)}
    renderInput={(params) => (
      <TextField
        {...params}
        sx={{
          mb: 2,
          // Estilo principal del input
          "& .MuiOutlinedInput-root": {
            bgcolor: "#ffffff", // Fondo blanco para que resalte
            borderRadius: 2,
            "& fieldset": { borderColor: "#1976d2" },
            "&:hover fieldset": { borderColor: "#115293" },
            "&.Mui-focused fieldset": { borderColor: "#1976d2" },
          },
          // Texto dentro del input
          "& .MuiInputBase-input": {
            color: "#000000", // negro legible en fondo blanco
          },
          // Label del input
          "& .MuiInputLabel-root": {
            color: "#1976d2",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#115293",
          },
          // Iconos del calendario
          "& .MuiSvgIcon-root": {
            color: "#1976d2",
          }
        }}
      />
    )}
  />
</LocalizationProvider>

      <Typography variant="h6">
        Total pedidos: {resumen.pedidos} | Total ventas: ${resumen.total.toFixed(2)}
      </Typography>

      <Typography variant="subtitle1">Ventas por método de pago:</Typography>
      {Object.entries(resumen.porMetodo).map(([metodo, total]) => (
        <Typography key={metodo}>
          {metodo}: ${total.toFixed(2)}
        </Typography>
      ))}

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pedido</TableCell>
              <TableCell>Mesa</TableCell>
              <TableCell>Método de pago</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ventas.map((p) => {
              const totalPedido = p.items.reduce(
                (s, i) => s + i.cantidad * i.producto.precio,
                0
              );
              return (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell>{p.mesa.numero}</TableCell>
                  <TableCell>{p.metodoPago}</TableCell>
                  <TableCell>${totalPedido.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
