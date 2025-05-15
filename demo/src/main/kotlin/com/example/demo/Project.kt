package com.example.demo

import com.fasterxml.jackson.annotation.JsonIgnore
import jakarta.persistence.*

@Entity
@Table(name="practica_projects")
data class Project(
    val name: String,
//    val team: List<String> = emptyList(),
    val teamName: String? = null
) {
    @Id
    @GeneratedValue(strategy= GenerationType.AUTO)
    val id: Int? = null

    @OneToMany(fetch = FetchType.LAZY, mappedBy = "project")
    @JsonIgnore
    val tasks: List<Task> = emptyList()

    constructor() : this(
        name = "")
}

