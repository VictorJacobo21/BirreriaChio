// Ticket.jsx
import React from "react";

export default function Ticket({ pedido }) {
  return (
    <div className="ticket">
      <h2>Birriería Chío</h2>
      <p>Fecha: {new Date(pedido.pagadoEn).toLocaleString()}</p>
      <hr />

      {pedido.items.map(item => (
        <div key={item.id} className="fila">
          <span>{item.producto.nombre} x{item.cantidad}</span>
          <span>${(item.producto.precio * item.cantidad).toFixed(2)}</span>
        </div>
      ))}

      <hr />

      <div className="fila total">
        <strong>Total:</strong>
        <strong>${pedido.total.toFixed(2)}</strong>
      </div>

      <p>Método de pago: {pedido.metodoPago}</p>

      <p className="gracias">¡Gracias por su compra!</p>
    </div>
  );
}
