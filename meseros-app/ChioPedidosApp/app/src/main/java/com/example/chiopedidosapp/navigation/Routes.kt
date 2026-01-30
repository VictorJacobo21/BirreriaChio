package com.example.chiopedidosapp.navigation

import androidx.compose.ui.input.pointer.PointerId
import com.example.chiopedidosapp.models.Pedido

sealed class Routes(val route: String) {
    object Home : Routes("home")
    object CrearPedido : Routes("crear_pedido")
    object VerPedidos : Routes("ver_pedidos")

    object editarPedidos: Routes("editar_pedido/{pedidoId}"){
        fun createRoute(pedidoId: Int) = "editar_pedido/$pedidoId"
    }
    object DetallePedidoMesa : Routes("detalle_pedido_mesa/{mesaId}") {
        fun createRoute(mesaId: Int) = "detalle_pedido_mesa/$mesaId"
    }
}