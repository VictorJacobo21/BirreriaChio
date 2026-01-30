import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Cocina from "./pages/Cocina";
import Caja from "./pages/Caja";
import Ventas from "./pages/VentasDiarias";
import { AppBar, Toolbar, Button, Box } from "@mui/material";

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
        <AppBar position="static">
          <Toolbar sx={{ justifyContent: "center" }}>
            <Button component={Link} to="/cocina" color="inherit">
              Cocina
            </Button>
            <Button component={Link} to="/caja" color="inherit">
              Caja
            </Button>
            <Button component={Link} to="/VentasDiarias" color="inherit">
              Ventas
            </Button>
          </Toolbar>
        </AppBar>

        {/* Contenido */}
        <Box sx={{ width: "100%", height: "calc(100vh - 64px)" }}>
          <Routes>
            <Route path="/cocina" element={<Cocina />} />
            <Route path="/caja" element={<Caja />} />
             <Route path="/VentasDiarias" element={<Ventas />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
