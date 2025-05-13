package com.example.demo

import org.springframework.web.bind.annotation.*
import java.util.concurrent.atomic.AtomicInteger

@RestController
@RequestMapping("/tasks")
class TaskController {

    private val tasks = mutableListOf<Task>()
    private val idCounter = AtomicInteger(1)

    @GetMapping
    fun getAllTasks(): List<Task> = tasks

    @PostMapping
    fun addTask(
        @RequestParam description: String,
        @RequestParam(required = false, defaultValue = "Normal") priority: String,
        @RequestParam(required = false) projectId: Int?,
        @RequestParam(required = false) assignedTo: String?,
        @RequestParam(required = false) tags: List<String>?
    ): List<Task> {
        val newTask = Task(
            id = idCounter.getAndIncrement(),
            description = description,
            status = "To Do",
            priority = priority,
            projectId = projectId,
            assignedTo = assignedTo,
            tags = tags ?: emptyList()
        )
        tasks.add(newTask)
        return tasks
    }

    @PutMapping("/{id}/status")
    fun updateStatus(@PathVariable id: Int, @RequestParam value: String): List<Task> {
        val validStatuses = listOf("To Do", "In Progress", "Done")
        if (value !in validStatuses) return tasks
        tasks.replaceAll { if (it.id == id) it.copy(status = value) else it }
        return tasks
    }

    @DeleteMapping("/{id}")
    fun deleteTask(@PathVariable id: Int): List<Task> {
        tasks.removeIf { it.id == id }
        return tasks
    }
}
