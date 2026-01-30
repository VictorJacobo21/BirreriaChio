package com.example.chiopedidosapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.Producto
import com.example.chiopedidosapp.navigation.MainNavHost
import com.example.chiopedidosapp.screens.CrearPedidoScreen
import com.example.chiopedidosapp.screens.HomeScreen
import com.example.chiopedidosapp.screens.VerPedidosScreen
import com.example.chiopedidosapp.ui.theme.ChioPedidosAppTheme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ChioPedidosAppTheme {
                MainNavHost()
            }
        }
    }

    @OptIn(ExperimentalMaterial3Api::class)
    @Composable
    fun PantallaPedidos() {

        val productos = remember {
            listOf(
                Producto(1, "Tacos", 25.0, true),
                Producto(2, "Burrito", 45.0, true),
                Producto(3, "Refresco", 20.0, true)
            )
        }

        val pedido = remember { mutableStateMapOf<Producto, Int>() }
        val total = pedido.entries.sumOf { it.key.precio * it.value }

        val scope = rememberCoroutineScope()
        var mensaje by remember { mutableStateOf("") }

        Scaffold(
            topBar = {
                TopAppBar(title = { Text("Chío Pedidos 🍔") })
            },
            bottomBar = {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text("Total: $${"%.2f".format(total)}")

                    Button(
                        onClick = {
                            scope.launch {
                                try {
                                    val items = pedido.map {
                                        ItemRequest(
                                            productoId = it.key.id,
                                            cantidad = it.value
                                        )
                                    }

                                    val request = PedidoRequest(
                                        mesaId = 1,
                                        items = items
                                    )

                                    val response = RetrofitClient.api.crearPedido(request)

                                    mensaje = "Pedido enviado #${response.id}"
                                    pedido.clear()

                                } catch (e: Exception) {
                                    println("Error: ${e.message}")
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Enviar Pedido")
                    }

                    if (mensaje.isNotEmpty()) {
                        Text(mensaje)
                    }
                }
            }
        ) { padding ->

            LazyColumn(
                modifier = Modifier.padding(padding).padding(16.dp)
            ) {
                items(productos) { producto ->
                    ProductoItem(
                        producto = producto,
                        cantidad = pedido[producto] ?: 0,
                        onAgregar = {
                            pedido[producto] = (pedido[producto] ?: 0) + 1
                        },
                        onQuitar = {
                            val actual = pedido[producto] ?: 0
                            if (actual > 1) pedido[producto] = actual - 1
                            else pedido.remove(producto)
                        }
                    )
                }
            }
        }
    }

    @Composable
    fun ProductoItem(
        producto: Producto,
        cantidad: Int,
        onAgregar: () -> Unit,
        onQuitar: () -> Unit
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp),
            elevation = CardDefaults.cardElevation(4.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {

                Text(producto.nombre, style = MaterialTheme.typography.titleMedium)
                Text("$${producto.precio}", style = MaterialTheme.typography.bodyMedium)

                Row(
                    modifier = Modifier.padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Button(onClick = onQuitar, enabled = cantidad > 0) {
                        Text("-")
                    }

                    Text("Cantidad: $cantidad", modifier = Modifier.padding(horizontal = 16.dp))

                    Button(onClick = onAgregar) {
                        Text("+")
                    }
                }
            }
        }
    }
//    @Composable
//    fun AppNavigation() {
//        val navController = rememberNavController()
//
//        NavHost(navController, startDestination = "home") {
//
//            composable("home") {
//                HomeScreen(navController)
//            }
//
//            composable("crearPedido") {
//                CrearPedidoScreen(navController)
//            }
//
//            composable("verPedidos") {
//                VerPedidosScreen(navController)
//            }
//
//            composable("detallePedido/{id}") { backStack ->
//                val id = backStack.arguments?.getString("id")!!.toInt()
//                DetallePedidoScreen(id)
//            }
//
//            composable("agregarProducto/{id}") { backStack ->
//                val id = backStack.arguments?.getString("id")!!.toInt()
//                AgregarProductoScreen(id)
//            }
//        }
//    }

}

