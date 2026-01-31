// components/TicketPrinter.js
import { useEffect } from 'react';
import { USB, Network } from 'escpos';

export function useTicketPrinter() {
  const imprimirTicket = async (pedido, metodoPago) => {
    try {
      // Opción 1: Impresora USB (más común)
      const dispositivo = new USB();
      
      // Opción 2: Impresora de red
      // const dispositivo = new Network('192.168.1.100', 9100);
      
      const impresora = await dispositivo.open();
      
      // Configuración inicial
      impresora
        .font('a')
        .align('ct')
        .size(1, 1)
        .text('🌮 Birriería Chio\n')
        .size(0, 0)
        .text('Ciudad Victoria y Quintana Roo 300 #123\n')
        .text('Tel: 686-426-7716\n')
        .drawLine()
        .align('lt')
        .text(`Mesa: ${pedido.mesaId}\n`)
        .text(`Fecha: ${new Date().toLocaleString('es-MX')}\n`)
        .text(`Folio: #${pedido.id.toString().padStart(4, '0')}\n`)
        .drawLine();
      
      // Items del pedido
      impresora.table(['Cant.', 'Descripción', 'Total']);
      pedido.items.forEach(item => {
        impresora.table([
          `x${item.cantidad}`,
          item.producto.nombre,
          `$${(item.producto.precio * item.cantidad).toFixed(2)}`
        ]);
      });
      
      // Totales
      const total = pedido.items.reduce((t, i) => t + i.producto.precio * i.cantidad, 0);
      impresora
        .drawLine()
        .text(`SUBTOTAL: $${total.toFixed(2)}\n`)
        .style('b')
        .text(`TOTAL: $${total.toFixed(2)}\n`)
        .style('normal')
        .drawLine()
        .text(`Método de pago: ${metodoPago}\n`)
        .drawLine()
        .align('ct')
        .text('¡Gracias por su preferencia!\n')
        .text('Vuelva pronto\n\n')
        .cut();
      
      await impresora.close();
      return true;
    } catch (error) {
      console.error('Error de impresión:', error);
      // Fallback a impresión HTML
      return false;
    }
  };
  
  return { imprimirTicket };
}