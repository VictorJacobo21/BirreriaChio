package com.example.chiopedidosapp.screens

import android.widget.Toast
import androidx.annotation.Nullable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.chiopedidosapp.models.ItemPedidoUI
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.Pedido
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.PedidoResponse
import com.example.chiopedidosapp.models.Producto
import com.example.chiopedidosapp.network.ApiClient
import kotlinx.coroutines.launch

@Composable
fun EditarPedidoScreen(
    pedidoId: Int,
    navController: NavController
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var productos by remember { mutableStateOf<List<Producto>>(emptyList()) }
    val pedidoItems = remember { mutableStateListOf<ItemPedidoUI>() }
    var pedido by remember { mutableStateOf<PedidoResponse?>(null) }

    fun agregarProducto(producto: Producto) {
        val index = pedidoItems.indexOfFirst { it.producto.id == producto.id }
        if (index >= 0) {
            val actual = pedidoItems[index]
            if (actual.cantidad < 2) {
                pedidoItems[index] = actual.copy(cantidad = actual.cantidad + 1)
            }
        } else {
            pedidoItems.add(ItemPedidoUI(producto, 1))
        }
    }

    fun quitarProducto(producto: Producto) {
        val index = pedidoItems.indexOfFirst { it.producto.id == producto.id }
        if (index >= 0) {
            val actual = pedidoItems[index]
            if (actual.cantidad > 1) {
                pedidoItems[index] = actual.copy(cantidad = actual.cantidad - 1)
            } else {
                pedidoItems.removeAt(index)
            }
        }
    }

    LaunchedEffect(Unit) {
        val pedidoResponse = ApiClient.api.getPedido(pedidoId)
        pedido = pedidoResponse

        pedidoItems.clear()
        pedidoResponse.items.forEach {
            pedidoItems.add(ItemPedidoUI(it.producto, it.cantidad))
        }

        productos = ApiClient.api.getProductos()
    }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = {
                val itemsParaEnviar = pedidoItems.map {
                    ItemRequest(it.producto.id, it.cantidad)
                }

                scope.launch {
                    try {
                        ApiClient.api.editarPedido(
                            pedidoId,
                            PedidoRequest(pedido!!.mesaId, itemsParaEnviar)
                        )
                        Toast.makeText(context, "Pedido actualizado", Toast.LENGTH_SHORT).show()
                        navController.popBackStack()
                    } catch (e: Exception) {
                        Toast.makeText(context, "Error editando pedido", Toast.LENGTH_LONG).show()
                    }
                }
            }) {
                Icon(Icons.Default.Send, contentDescription = null)
            }
        }
    ) { padding ->

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(12.dp)
        ) {
            items(productos) { producto ->

                val cantidadActual =
                    pedidoItems.find { it.producto.id == producto.id }?.cantidad ?: 0

                ProductoCard(
                    producto = producto,
                    cantidadActual = cantidadActual,
                    onAdd = { agregarProducto(producto) },
                    onRemove = { quitarProducto(producto) }
                )
            }
        }
    }

    @Composable
    fun ProductoCard(
        producto: Producto,
        cantidadActual: Int,
        onAdd: () -> Unit,
        onRemove: () -> Unit
    ) {
        Card(
            modifier = Modifier.padding(8.dp),
            elevation = CardDefaults.cardElevation(6.dp)
        ) {
            Column(
                modifier = Modifier.padding(12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {

                Text(producto.nombre, style = MaterialTheme.typography.titleMedium)

                Spacer(modifier = Modifier.height(6.dp))

                Text("$${producto.precio}", color = MaterialTheme.colorScheme.primary)

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    modifier = Modifier.fillMaxWidth()
                ) {

                    Button(
                        onClick = onRemove,
                        enabled = cantidadActual > 0,
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                    ) {
                        Text("-", color = Color.White)
                    }

                    Text(
                        cantidadActual.toString(),
                        style = MaterialTheme.typography.headlineSmall,
                        modifier = Modifier.padding(horizontal = 12.dp)
                    )

                    Button(
                        onClick = onAdd,
                        enabled = cantidadActual < 2,
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32))
                    ) {
                        Text("+", color = Color.White)
                    }
                }

                if (cantidadActual == 2) {
                    Text(
                        "Máx 2",
                        color = Color.Red,
                        style = MaterialTheme.typography.labelSmall
                    )
                }
            }
        }
    }
}


