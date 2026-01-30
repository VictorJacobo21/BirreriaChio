package com.example.chiopedidosapp.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
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
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.chiopedidosapp.models.ItemPedido
import com.example.chiopedidosapp.models.ItemPedidoUI
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.PedidoResponse
import com.example.chiopedidosapp.models.Producto
import com.example.chiopedidosapp.navigation.Routes
import com.example.chiopedidosapp.network.ApiClient

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DetallePedidoScreen(
    mesaId: Int,
    navController: NavController
) {
    val scope = rememberCoroutineScope()
    var pedido by remember { mutableStateOf<PedidoResponse?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf("") }

    LaunchedEffect(mesaId) {
        try {
            val response = ApiClient.api.getPedidoPorMesa(mesaId)
            pedido = response
            println("✅ PEDIDO RECIBIDO: $response")
        } catch (e: Exception) {
            error = e.message ?: "Error desconocido"
            println("❌ ERROR AL CARGAR PEDIDO: ${e.message}")
        } finally {
            loading = false
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    if (pedido != null) {
                        Text("Pedido #${pedido!!.id} - Mesa ${pedido!!.mesaId}")
                    } else {
                        Text("Cargando pedido...")
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Volver")
                    }
                }
            )
        }
    ) { padding ->

        when {
            loading -> {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator()
                }
            }

            error.isNotEmpty() -> {
                Text(
                    text = error,
                    modifier = Modifier.padding(16.dp),
                    color = Color.Red
                )
            }

            pedido != null -> {
                PedidoDetalleContent(
                    pedido = pedido!!,
                    navController = navController,
                    padding = padding
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PedidoDetalleContent(
    pedido: PedidoResponse,
    navController: NavController,
    padding: PaddingValues
) {
    val total = pedido.items.sumOf { it.producto.precio * it.cantidad }

    Column(
        modifier = Modifier
            .padding(padding)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("Mesa ${pedido.mesaId}", style = MaterialTheme.typography.headlineSmall)
                Text("Estado: ${pedido.estado}", style = MaterialTheme.typography.titleMedium)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text("Productos", style = MaterialTheme.typography.titleLarge)

        pedido.items.forEach { item ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                elevation = CardDefaults.cardElevation(4.dp)
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(item.producto.nombre, style = MaterialTheme.typography.titleMedium)
                        Text("x${item.cantidad}")
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("$${item.producto.precio}")
                        Text("Subtotal: $${item.producto.precio * item.cantidad}")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)
        ) {
            Text(
                "Total: $${"%.2f".format(total)}",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(16.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = { navController.navigate(Routes.editarPedidos.createRoute(pedido.id))}
        ) {
            Text("Editar Pedido")
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            modifier = Modifier.fillMaxWidth(),
            onClick = { navController.popBackStack() }
        ) {
            Text("⬅ Volver")
        }
    }
}

