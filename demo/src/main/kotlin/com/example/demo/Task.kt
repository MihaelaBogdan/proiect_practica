package com.example.demo

data class Task(
    val id: Int,
    val description: String,
    val status: String = "To Do",
    val priority: String = "Normal",
    val projectId: Int? = null,
    val assignedTo: String? = null,
    val tags: List<String> = emptyList()
)
