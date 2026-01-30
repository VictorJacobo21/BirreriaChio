package com.example.chiopedidosapp.models

data class Pedido(
    val id: Int,
    val mesaId: Int,
    val estado: String,
    val items: List<ItemPedido>
)
