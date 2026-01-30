package com.example.chiopedidosapp.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavType
import androidx.navigation.compose.*
import androidx.navigation.navArgument
import com.example.chiopedidosapp.screens.*

@Composable
fun MainNavHost() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = Routes.Home.route
    ) {

        composable(Routes.Home.route) {
            HomeScreen(navController)
        }

        composable(Routes.CrearPedido.route) {
            CrearPedidoScreen(navController)
        }

        composable(Routes.VerPedidos.route) {
            VerPedidosScreen(navController)
        }

        composable(
            Routes.DetallePedidoMesa.route,
            arguments = listOf(navArgument("mesaId") { type = NavType.IntType })
        ) { backStackEntry ->
            val mesaId = backStackEntry.arguments?.getInt("mesaId") ?: 0
            DetallePedidoScreen(mesaId, navController)
        }

        composable(
            route = Routes.editarPedidos.route,
            arguments = listOf(navArgument("pedidoId") { type = NavType.IntType })
        ) { backStackEntry ->
            val pedidoId = backStackEntry.arguments?.getInt("pedidoId") ?: 0
            EditarPedidoScreen(pedidoId = pedidoId, navController = navController)
        }


    }
}
