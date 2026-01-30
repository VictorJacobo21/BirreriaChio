package com.example.chiopedidosapp.models

data class Combo(
    val id: Int,
    val nombre: String,
    val precio: Double,
    val activo: Boolean,
    val items: List<ComboItem>
)