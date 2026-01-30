package com.example.chiopedidosapp.models

data class ComboRequest(
    val nombre: String,
    val items: List<ItemRequest>
)