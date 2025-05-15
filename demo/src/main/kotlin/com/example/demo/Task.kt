package com.example.demo

import jakarta.persistence.*


@Entity
@Table(name="practica_tasks")
data class Task(
    val description: String,
    val status: String = "To Do",
    val priority: String = "Normal",

    @ManyToOne
    val project: Project? = null,
    val assignedTo: String? = null,
//    val tags: List<String> = emptyList()
) {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    val id: Int? = null

    constructor() : this(
        description = "",
        status = "To Do",
        priority = "Normal",
        project = null,
        assignedTo = null
    )
}
