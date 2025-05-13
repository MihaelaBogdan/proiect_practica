package com.example.demo

import org.springframework.web.bind.annotation.*
import java.util.concurrent.atomic.AtomicInteger

@RestController
@RequestMapping("/projects")
class ProjectController {

    private val projects = mutableListOf<Project>()
    private val idCounter = AtomicInteger(1)

    @PostMapping
    fun createProject(@RequestParam name: String, @RequestParam team: List<String>): List<Project> {
        val newProject = Project(idCounter.getAndIncrement(), name, team)
        projects.add(newProject)
        return projects
    }

    @GetMapping
    fun getAllProjects(): List<Project> = projects
}
