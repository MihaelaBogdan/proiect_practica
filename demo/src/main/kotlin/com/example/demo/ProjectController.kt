package com.example.demo

import org.springframework.web.bind.annotation.*
import java.util.concurrent.atomic.AtomicInteger

@RestController
@RequestMapping("/projects")
class ProjectController {

    private val projects = mutableListOf<Project>()
    private val idCounter = AtomicInteger(1)

    @PostMapping
    fun createProject(@RequestBody project: Project): Project {
        val newProject = Project(
            id = idCounter.getAndIncrement(),
            name = project.name,
            team = project.team
        )
        projects.add(newProject)
        return newProject
    }

    @GetMapping
    fun getAllProjects(): List<Project> = projects
}

