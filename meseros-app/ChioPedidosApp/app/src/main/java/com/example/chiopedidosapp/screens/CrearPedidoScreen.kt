package com.example.chiopedidosapp.screens

import android.util.Log
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Send
import androidx.lifecycle.viewmodel.compose.viewModel

import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.chiopedidosapp.ViewModels.CrearPedidoViewModel
import com.example.chiopedidosapp.models.ItemPedido
import com.example.chiopedidosapp.models.ItemPedidoUI
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.Producto
import com.example.chiopedidosapp.navigation.Routes
import com.example.chiopedidosapp.network.ApiClient
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CrearPedidoScreen(navController: NavController,
                      viewModel: CrearPedidoViewModel = viewModel()
) {
    var productos by remember { mutableStateOf<List<Producto>>(emptyList()) }
    var isLoading by remember { mutableStateOf(true) }
    val context = LocalContext.current
    var mesas by remember { mutableStateOf<List<Int>>(emptyList()) }

    var mesaSeleccionada by rememberSaveable { mutableStateOf<Int?>(null) }
    var expanded by rememberSaveable { mutableStateOf(false) }
    val pedidoItems = rememberSaveable { mutableStateListOf<ItemPedidoUI>() }

    LaunchedEffect(Unit) {
        try {
            productos = ApiClient.api.getProductos()
            val mesasResponse = ApiClient.api.getMesas()
            mesas = mesasResponse.map { it.numero }

            Log.d("PRODUCTOS", productos.toString())
        } catch (e: Exception) {
            Log.e("ERROR PRODUCTOS", e.toString())
            Toast.makeText(context, "Error cargando productos", Toast.LENGTH_LONG).show()
        } finally {
            isLoading = false
        }
    }

    fun agregarProducto(producto: Producto) {
        val existente = pedidoItems.indexOfFirst{ it.producto.id == producto.id }

        if (existente >= 0) {
            val actual = pedidoItems[existente]
            if (actual.cantidad < 999) {
                pedidoItems[existente] = actual.copy(
                    cantidad = actual.cantidad+1
                )

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
                pedidoItems[index] = actual.copy(
                    cantidad = actual.cantidad - 1
                )
            } else {
                pedidoItems.removeAt(index)
            }
        }
    }

    val total = pedidoItems.sumOf { it.producto.precio * it.cantidad }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Crear Pedido") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = null)
                    }
                }
            )
        },
        floatingActionButton = {
            EnviarPedidoFAB(
                mesaSeleccionada = mesaSeleccionada,
                pedidoItems = pedidoItems,
                navController = navController
            )

        }
    ) { padding ->

        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {

            // ===== SELECTOR DE MESA =====
            Text("Selecciona Mesa", modifier = Modifier.padding(16.dp))

            ExposedDropdownMenuBox(
                expanded = expanded,
                onExpandedChange = { expanded = !expanded },
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                TextField(
                    value = mesaSeleccionada?.toString() ?: "",
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Mesa") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded) },
                    modifier = Modifier.menuAnchor().fillMaxWidth()
                )

                ExposedDropdownMenu(
                    expanded = expanded,
                    onDismissRequest = { expanded = false }
                ) {
                    mesas.forEach { mesa ->
                        DropdownMenuItem(
                            text = { Text("Mesa ${mesa}") },
                            onClick = {
                                mesaSeleccionada = mesa
                                expanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // ===== GRID DE PRODUCTOS =====
            if(isLoading){
                Text("Cargando Productos...", modifier = Modifier.padding(16.dp))
            }
            else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier.weight(1f),
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
            // ===== RESUMEN =====
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(8.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {

                    Text("Resumen", style = MaterialTheme.typography.titleMedium)

                    pedidoItems.forEach {
                        Text("${it.producto.nombre} x${it.cantidad}")
                    }

                    Divider(modifier = Modifier.padding(vertical = 8.dp))

                    Text(
                        "Total: $${"%.2f".format(total)}",
                        style = MaterialTheme.typography.headlineSmall
                    )
                }
            }
        }
    }
}


@Composable
fun ProductoItemCrear(producto: Producto, onAgregar: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        elevation = CardDefaults.cardElevation(4.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(producto.nombre, style = MaterialTheme.typography.titleMedium)
                Text("$${producto.precio}")
            }

            Button(onClick = onAgregar) {
                Text("Agregar")
            }
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
                    enabled = cantidadActual < 999,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF2E7D32))
                ) {
                    Text("+", color = Color.White)
                }
            }

            if (cantidadActual == 99999) {
                Text(
                    "Máx",
                    color = Color.Red,
                    style = MaterialTheme.typography.labelSmall
                )
            }
        }
    }
}
@Composable
fun EnviarPedidoFAB(
    mesaSeleccionada: Int?,
    pedidoItems: List<ItemPedidoUI>,
    navController: NavController
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    FloatingActionButton(
        onClick = {
            if (mesaSeleccionada == null || pedidoItems.isEmpty()) {
                Toast.makeText(context, "Selecciona mesa y productos", Toast.LENGTH_SHORT).show()
                return@FloatingActionButton
            }

            // Mapear ItemPedidoUI -> ItemRequest
            val itemsParaEnviar = pedidoItems.map { itemUI ->
                ItemRequest(
                    productoId = itemUI.producto.id,
                    cantidad = itemUI.cantidad
                )
            }

            val pedidoRequest = PedidoRequest(
                mesaId = mesaSeleccionada,
                items = itemsParaEnviar
            )

            scope.launch {
                try {
                    val response = ApiClient.api.crearPedido(pedidoRequest)
                    Log.d("PEDIDO_JSON", Gson().toJson(pedidoRequest))
                    Toast.makeText(context, "Pedido enviado con éxito!", Toast.LENGTH_SHORT).show()

                    navController.popBackStack() // regresar a pantalla anterior
                } catch (e: Exception) {
                    Toast.makeText(context, "Error enviando pedido: ${e.message}", Toast.LENGTH_LONG).show()
                }
            }
        },
        containerColor = MaterialTheme.colorScheme.primary
    ) {
        Icon(Icons.Default.Send, contentDescription = null)
    }
}