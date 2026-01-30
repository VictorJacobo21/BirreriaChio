package com.example.chiopedidosapp.models

data class PedidoResponse(
    val id: Int,
    val estado: String,
    val mesaId: Int,
    val items: List<PedidoItemResponse>
)