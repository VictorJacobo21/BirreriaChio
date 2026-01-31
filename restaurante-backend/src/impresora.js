// impresora.js - VERSIÓN CON POWERSHELL
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const crearTicketTexto = (pedido, metodoPago) => {
  const total = pedido.items.reduce(
    (sum, item) => sum + (item.producto.precio * item.cantidad), 
    0
  );
  
  let ticket = `\x1B\x40`; // Initialize printer
  
  // Header
  ticket += `\x1B\x61\x01`; // Center
  ticket += `\x1B\x21\x30`; // Double height + bold
  ticket += `BIRRIERIA CHIO\x0A`;
  ticket += `\x1B\x21\x00`; // Normal
  ticket += `Ciudad Victoria y Quintana Roo\x0A`;
  ticket += `Tel: 686-426-7716\x0A`;
  ticket += `==============================\x0A`;
  
  // Order info
  ticket += `\x1B\x61\x00`; // Left align
  ticket += `Mesa: ${pedido.mesaId}\x0A`;
  ticket += `Fecha: ${new Date().toLocaleString('es-MX')}\x0A`;
  ticket += `Folio: #${pedido.id.toString().padStart(4, '0')}\x0A`;
  ticket += `------------------------------\x0A`;
  ticket += `Cant Descripcion           Total\x0A`;
  ticket += `------------------------------\x0A`;
  
  // Items
  pedido.items.forEach(item => {
    const subtotal = item.producto.precio * item.cantidad;
    const nombre = item.producto.nombre.substring(0, 20).padEnd(20, ' ');
    ticket += `x${item.cantidad} ${nombre} $${subtotal.toFixed(2)}\x0A`;
  });
  
  // Total
  ticket += `==============================\x0A`;
  ticket += `SUBTOTAL:            $${total.toFixed(2)}\x0A`;
  ticket += `TOTAL:               $${total.toFixed(2)}\x0A`;
  ticket += `------------------------------\x0A`;
  ticket += `Metodo: ${metodoPago}\x0A`;
  ticket += `==============================\x0A`;
  ticket += `Gracias por su preferencia!\x0A`;
  ticket += `Vuelva pronto\x0A\x0A\x0A\x0A\x0A`;
  ticket += `\x1D\x56\x41\x03`; // Cut paper (GS V m)
  
  return ticket;
};

// Método 1: Usar PowerShell con Out-Printer
const imprimirConPowerShell = async (ticketTexto) => {
  try {
    // Guardar como archivo binario para ESC/POS
    const tempFile = path.join(__dirname, 'ticket_raw.bin');
    fs.writeFileSync(tempFile, Buffer.from(ticketTexto, 'binary'));
    
    // Comando PowerShell para imprimir RAW
    const comando = `powershell -Command "$printerName = 'POS-80'; $fileBytes = [System.IO.File]::ReadAllBytes('${tempFile.replace(/\\/g, '\\\\')}'); $printer = New-Object System.Drawing.Printing.PrintDocument; $printer.PrinterSettings = New-Object System.Drawing.Printing.PrinterSettings; $printer.PrinterSettings.PrinterName = $printerName; if ($printer.PrinterSettings.IsValid) { $printer.PrintController = New-Object System.Drawing.Printing.StandardPrintController; $printer.PrintPage += { param($sender, $e) $e.Graphics.DrawString([System.Text.Encoding]::Default.GetString($fileBytes), [System.Drawing.Font]::new('Courier New', 10), [System.Drawing.Brushes]::Black, 0, 0); $e.HasMorePages = $false; }; $printer.Print(); Write-Host 'Impreso correctamente'; } else { Write-Host 'Impresora no válida'; }"`;
    
    console.log("Ejecutando PowerShell...");
    const { stdout, stderr } = await execAsync(comando, { shell: true, maxBuffer: 1024 * 1024 });
    
    // Limpiar
    setTimeout(() => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
    }, 1000);
    
    if (stderr) {
      console.error("PowerShell error:", stderr);
      return false;
    }
    
    console.log("PowerShell output:", stdout);
    return stdout.includes("Impreso correctamente");
    
  } catch (error) {
    console.error("Error PowerShell:", error.message);
    return false;
  }
};

// Método 2: Usar COPY a puerto LPT1 (para impresoras térmicas antiguas)
const imprimirConCOPY = async (ticketTexto) => {
  try {
    const tempFile = path.join(__dirname, 'ticket_copy.txt');
    fs.writeFileSync(tempFile, ticketTexto, 'binary');
    
    // OPCIÓN A: Si la impresora está en LPT1
    // const comando = `copy /B "${tempFile}" LPT1`;
    
    // OPCIÓN B: Si está como impresora compartida
    const comando = `copy /B "${tempFile}" "\\\\localhost\\POS-80"`;
    
    console.log("Ejecutando COPY:", comando);
    const { stdout, stderr } = await execAsync(comando, { shell: true });
    
    setTimeout(() => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
    }, 1000);
    
    return !stderr;
    
  } catch (error) {
    console.error("Error COPY:", error.message);
    return false;
  }
};

// Método 3: Usar NET USE para asignar puerto
const imprimirConNET = async (ticketTexto) => {
  try {
    // Primero asignar puerto
    await execAsync('net use LPT2: \\\\localhost\\POS-80 /PERSISTENT:YES', { shell: true });
    
    const tempFile = path.join(__dirname, 'ticket_net.txt');
    fs.writeFileSync(tempFile, ticketTexto, 'binary');
    
    const comando = `copy /B "${tempFile}" LPT2`;
    console.log("Ejecutando NET COPY:", comando);
    
    const { stdout, stderr } = await execAsync(comando, { shell: true });
    
    setTimeout(() => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
    }, 1000);
    
    return !stderr;
    
  } catch (error) {
    console.error("Error NET:", error.message);
    return false;
  }
};

router.post("/imprimir-ticket", async (req, res) => {
  try {
    const { pedido, metodoPago } = req.body;
    
    console.log("🖨️ Generando ticket ESC/POS para pedido:", pedido.id);
    
    // Crear ticket con comandos ESC/POS
    const ticketTexto = crearTicketTexto(pedido, metodoPago);
    
    console.log("Ticket generado (tamaño):", ticketTexto.length, "bytes");
    
    // Intentar métodos en orden
    let impreso = false;
    let metodoUsado = "";
    
    // Método 1: PowerShell
    console.log("Intentando método 1: PowerShell...");
    impreso = await imprimirConPowerShell(ticketTexto);
    if (impreso) {
      metodoUsado = "PowerShell";
    } else {
      // Método 2: COPY
      console.log("Intentando método 2: COPY...");
      impreso = await imprimirConCOPY(ticketTexto);
      if (impreso) metodoUsado = "COPY";
    }
    
    if (!impreso) {
      // Método 3: NET USE
      console.log("Intentando método 3: NET USE...");
      impreso = await imprimirConNET(ticketTexto);
      if (impreso) metodoUsado = "NET USE";
    }
    
    if (impreso) {
      console.log(`✅ Ticket impreso usando ${metodoUsado}`);
      return res.json({
        success: true,
        message: `Ticket impreso usando ${metodoUsado}`,
        metodo: metodoUsado
      });
    } else {
      console.log("⚠️ Todos los métodos fallaron, usando fallback");
      
      // Devolver ticket en texto plano para fallback
      const ticketLegible = crearTicketLegible(pedido, metodoPago);
      
      return res.json({
        success: false,
        error: "No se pudo imprimir automáticamente",
        fallback: true,
        ticketTexto: ticketLegible,
        pedidoId: pedido.id,
        mesa: pedido.mesaId
      });
    }
    
  } catch (error) {
    console.error("❌ Error general:", error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Función para ticket legible (fallback)
const crearTicketLegible = (pedido, metodoPago) => {
  const total = pedido.items.reduce(
    (sum, item) => sum + (item.producto.precio * item.cantidad), 
    0
  );
  
  let ticket = `
================================
        BIRRIERIA CHIO
Ciudad Victoria y Quintana Roo
        Tel: 686-426-7716
================================
Mesa: ${pedido.mesaId}
Fecha: ${new Date().toLocaleString('es-MX')}
Folio: #${pedido.id.toString().padStart(4, '0')}
--------------------------------
Cant. Descripción          Total
--------------------------------
`;
  
  pedido.items.forEach(item => {
    const subtotal = item.producto.precio * item.cantidad;
    const nombre = item.producto.nombre.substring(0, 22);
    ticket += `x${item.cantidad} ${nombre.padEnd(22, ' ')} $${subtotal.toFixed(2)}\n`;
  });
  
  ticket += `
================================
SUBTOTAL:            $${total.toFixed(2)}
TOTAL:               $${total.toFixed(2)}
================================
Método: ${metodoPago}
================================
¡Gracias por su preferencia!
       Vuelva pronto



`;
  
  return ticket;
};

// Test endpoint
router.get("/test-impresion", async (req, res) => {
  try {
    // Probar con un ticket simple
    const ticketTest = "\x1B\x40\x1B\x61\x01PRUEBA IMPRESORA\x0A\x1B\x61\x00" + 
                      new Date().toLocaleString() + "\x0A\x0A\x0A\x1D\x56\x41\x03";
    
    const tempFile = path.join(__dirname, 'test.bin');
    fs.writeFileSync(tempFile, Buffer.from(ticketTest, 'binary'));
    
    const comando = `copy /B "${tempFile}" "\\\\localhost\\POS-80"`;
    console.log("Comando test:", comando);
    
    const { stdout, stderr } = await execAsync(comando, { shell: true });
    
    setTimeout(() => {
      try { fs.unlinkSync(tempFile); } catch (e) {}
    }, 1000);
    
    res.json({
      success: !stderr,
      comando: comando,
      stdout: stdout,
      stderr: stderr
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;