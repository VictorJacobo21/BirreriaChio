package com.example.chiopedidosapp.ViewModels

import android.net.http.HttpException
import android.os.Build
import androidx.annotation.RequiresExtension
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.chiopedidosapp.RetrofitClient
import com.example.chiopedidosapp.models.ItemPedidoUI
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.Producto
import kotlinx.coroutines.launch

class CrearPedidoViewModel : ViewModel() {

    var productos by mutableStateOf<List<Producto>>(emptyList())
        private set

    var cargando by mutableStateOf(false)
    var error by mutableStateOf<String?>(null)

    init {
        cargarProductos()
    }

    private fun cargarProductos() {
        viewModelScope.launch {
            try {
                cargando = true
                productos = RetrofitClient.api.getProductos()
            } catch (e: Exception) {
                error = "Error cargando productos"
            } finally {
                cargando = false
            }
        }
    }

    @RequiresExtension(extension = Build.VERSION_CODES.S, version = 7)
    fun enviarPedido(
        mesaId: Int,
        items: List<ItemPedidoUI>,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        viewModelScope.launch {
            try {
                val request = PedidoRequest(
                    mesaId = mesaId,
                    items = items.map {
                        ItemRequest(
                            productoId = it.producto.id,
                            cantidad = it.cantidad
                        )
                    }
                )

                RetrofitClient.api.crearPedido(request)
                onSuccess()

            } catch (e: HttpException) {
                if (e.message == 400.toString()) {
                    onError("⚠️ La mesa ya tiene un pedido activo")
                } else {
                    onError("Error del servidor")
                }
            } catch (e: Exception) {
                onError("Error de red")
            }
        }
    }
}
