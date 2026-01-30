package com.example.chiopedidosapp.models

data class TotalResponse(
    val pedidoId: Int,
    val total: Double,
    val items: List<PedidoItemResponse>
)