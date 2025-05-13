package com.example.demo

data class Project(
    val id: Int,
    val name: String,
    val team: List<String> = emptyList(),
    val teamName: String? = null
)

