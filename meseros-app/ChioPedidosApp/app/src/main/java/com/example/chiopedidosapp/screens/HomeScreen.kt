package com.example.chiopedidosapp.screens

import androidx.compose.ui.graphics.Color
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.example.chiopedidosapp.navigation.Routes
import androidx.compose.material.icons.filled.AddShoppingCart
import androidx.compose.material.icons.filled.ListAlt


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController) {

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Chío Pedidos 🍔") }
            )
        }
    ) { padding ->

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(24.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {

            Text(
                text = "Sistema de Pedidos",
                style = MaterialTheme.typography.headlineMedium
            )

            Spacer(modifier = Modifier.height(32.dp))

            HomeCardButton(
                title = "Crear nuevo pedido",
                subtitle = "Tomar orden para una mesa",
                icon = Icons.Default.AddShoppingCart,
                color = MaterialTheme.colorScheme.primary,
                onClick = { navController.navigate(Routes.CrearPedido.route) }
            )

            Spacer(modifier = Modifier.height(20.dp))

            HomeCardButton(
                title = "Ver pedidos",
                subtitle = "Pedidos activos y su estado",
                icon = Icons.Default.ListAlt,
                color = MaterialTheme.colorScheme.secondary,
                onClick = { navController.navigate(Routes.VerPedidos.route) }
            )
        }
    }
}
@Composable
fun HomeCardButton(
    title: String,
    subtitle: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .height(140.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {

            Icon(
                icon,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = Color.White
            )

            Spacer(modifier = Modifier.width(20.dp))

            Column {
                Text(
                    title,
                    style = MaterialTheme.typography.headlineSmall,
                    color = Color.White
                )
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.White.copy(alpha = 0.9f)
                )
            }
        }
    }
}

