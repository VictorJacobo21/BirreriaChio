package com.example.chiopedidosapp.network

import com.example.chiopedidosapp.models.Combo
import com.example.chiopedidosapp.models.ComboRequest
import com.example.chiopedidosapp.models.ItemRequest
import com.example.chiopedidosapp.models.Mesa
import com.example.chiopedidosapp.models.Pedido
import com.example.chiopedidosapp.models.PedidoRequest
import com.example.chiopedidosapp.models.PedidoResponse
import com.example.chiopedidosapp.models.Producto
import com.example.chiopedidosapp.models.TotalResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    @GET("pedidos")
    suspend fun getProductos(): List<Producto>
    @GET("pedidos/activos")
    suspend fun getPedidos(): List<Pedido>


    @GET("combos")
    suspend fun getCombos(): List<Combo>

    @PUT("pedidos/{id}")
    suspend fun editarPedido(
        @Path("id") pedidoId: Int,
        @Body pedido: PedidoRequest
    ): Pedido

    @POST("pedidos")
    suspend fun crearPedido(@Body pedido: PedidoRequest): Pedido

    @POST("pedidos/{id}/items")
    suspend fun agregarProducto(
        @Path("id") id: Int,
        @Body body: ItemRequest
    ): Response<Unit>

    @POST("pedidos/{id}/combo")
    suspend fun agregarCombo(
        @Path("id") id: Int,
        @Body body: ComboRequest
    ): Response<Unit>

    @GET("pedidos/mesas")
    suspend fun getMesas(): List<Mesa>

    @GET("pedidos/{id}/total")
    suspend fun obtenerTotal(@Path("id") id: Int): TotalResponse

    @GET("pedidos/{id}")
    suspend fun getPedido(@Path("id") id: Int): PedidoResponse

    @GET("pedidos/mesas/{mesaId}/pedido-actual")
    suspend fun getPedidoPorMesa(@Path("mesaId") mesaId: Int): PedidoResponse


}