import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel
} from "@mui/material";

const API_URL = "http://192.168.100.134:3000"; // CAMBIA A TU URL

export default function ProductosAdmin() {
  const [productos, setProductos] = useState([]);
  const [open, setOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [activo, setActivo] = useState(true);

  const cargarProductos = async () => {
    const res = await axios.get(`${API_URL}/pedidos/productos/todos`);
    setProductos(res.data);
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre("");
    setPrecio("");
    setActivo(true);
    setOpen(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setNombre(p.nombre);
    setPrecio(p.precio);
    setActivo(p.activo);
    setOpen(true);
  };

  const guardarProducto = async () => {
    if (!nombre || !precio) {
      alert("Completa todos los campos");
      return;
    }

    try {
      if (editando) {
        await axios.patch(`${API_URL}/pedidos/${editando.id}/actualizar`, {
          nombre,
          precio: parseFloat(precio),
          activo
        });
      } else {
        await axios.post(`${API_URL}/pedidos/nuevoProducto`, {
          nombre,
          precio: parseFloat(precio)
        });
      }

      setOpen(false);
      cargarProductos();
    } catch (error) {
      console.error("Error guardando producto:", error);
      alert(error);
    }
  };

  const productosFiltrados = productos.filter(p =>
  p.nombre.toLowerCase().includes(busqueda.toLowerCase())
);

  return (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4" gutterBottom>
      Administración de Productos
    </Typography>

    {/* Barra superior */}
    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
      <Button variant="contained" color="primary" onClick={abrirNuevo}>
        ➕ Nuevo Producto
      </Button>

      <TextField
        placeholder="Buscar producto..."
        size="small"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
       
      />
    </Box>

    {/* Tabla con scroll */}
    <TableContainer
      component={Paper}
      sx={{ maxHeight: 400 }}   // 👈 altura fija con scroll
    >
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>Nombre</TableCell>
            <TableCell>Precio</TableCell>
            <TableCell>Activo</TableCell>
            <TableCell>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {productosFiltrados.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.nombre}</TableCell>
              <TableCell>${p.precio.toFixed(2)}</TableCell>
              <TableCell>
                <Switch checked={p.activo} disabled />
              </TableCell>
              <TableCell>
                <Button size="small" onClick={() => abrirEditar(p)}>
                  Editar
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {productosFiltrados.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} align="center">
                No se encontraron productos
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

    {/* MODAL */}
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle>
        {editando ? "Editar Producto" : "Nuevo Producto"}
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <TextField
          label="Precio"
          type="number"
          value={precio}
          onChange={(e) => setPrecio(e.target.value)}
        />

        <FormControlLabel
          control={
            <Switch
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
          }
          label="Activo"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancelar</Button>
        <Button variant="contained" onClick={guardarProducto}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  </Box>
);

}
