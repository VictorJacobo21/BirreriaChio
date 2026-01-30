package com.example.chiopedidosapp.models

data class PedidoItemResponse(
    val id: Int,
    val cantidad: Int,
    val producto: Producto
)