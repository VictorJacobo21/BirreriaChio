package com.example.chiopedidosapp.models

data class PedidoRequest(
    val mesaId: Int,
    val items: List<ItemRequest>
)