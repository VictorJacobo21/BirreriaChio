package com.example.chiopedidosapp.network

import com.example.chiopedidosapp.network.ApiService

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object ApiClient {

    private const val BASE_URL = "http://192.168.100.134:3000/"
    // ⚠️ cambia por la IP de tu laptop donde corre Node

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
