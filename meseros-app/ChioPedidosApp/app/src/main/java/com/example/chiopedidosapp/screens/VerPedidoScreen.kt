package com.example.chiopedidosapp.screens
import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.MutableState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.chiopedidosapp.models.ItemPedido
import com.example.chiopedidosapp.models.Pedido
import com.example.chiopedidosapp.navigation.Routes
import com.example.chiopedidosapp.network.ApiClient

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VerPedidosScreen(navController: NavController) {

    val context = LocalContext.current
    var pedidos by remember { mutableStateOf<List<Pedido>>(emptyList()) }

    LaunchedEffect(Unit) {
        try {
            pedidos = ApiClient.api.getPedidos()
        } catch (e: Exception) {
            Toast.makeText(context, "Error cargando pedidos", Toast.LENGTH_LONG).show()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Pedidos activos") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Regresar")
                    }
                }
            )
        }
    ) { paddingValues ->

        LazyColumn(
            modifier = Modifier
                .padding(paddingValues)
                .padding(16.dp)
                .fillMaxSize()
        ) {
            items(pedidos) { pedido ->
                PedidoCard(
                    pedido = pedido,
                    onVer = {
                        navController.navigate(
                            Routes.DetallePedidoMesa.createRoute(pedido.mesaId)
                        )
                    },
                    onAgregar = {
                        navController.navigate(
                            Routes.editarPedidos.createRoute(pedido.id)
                        )
                    }
                )
            }
        }
    }
}


@Composable
fun PedidoCard(
    pedido: Pedido,
    onVer: () -> Unit,
    onAgregar: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = CardDefaults.cardElevation(6.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {

            Text(
                text = "Mesa ${pedido.mesaId}",
                style = MaterialTheme.typography.titleLarge

            )

            Text(
                text = "Estado: ${pedido.estado}",
                style = MaterialTheme.typography.bodyMedium,
                color = when(pedido.estado) {
                    "PENDIENTE" -> Color.Red
                    "PREPARACION" -> Color.Yellow
                    "LISTO" -> Color.Green
                    else -> Color.Gray
                }
            )

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Button(onClick = onVer) {
                    Text("Ver")
                }

                Button(onClick = onAgregar) {
                    Text("Editar pedido")
                }
            }
        }
    }
}



