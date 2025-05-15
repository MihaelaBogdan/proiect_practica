package com.example.demo

import org.springframework.web.bind.annotation.*
import java.util.concurrent.atomic.AtomicInteger

@RestController
@RequestMapping("/tasks")
class TaskController(private val taskRepository: TaskRepository, private val projectRepository: ProjectRepository) {

    @GetMapping
    fun getAllTasks(): List<Task> = taskRepository.findAll()

    @GetMapping("/{projectId}")
    fun getTasksByProjectId(@PathVariable projectId: Int): List<Task> {
        return taskRepository.findByProjectId(projectId)
    }

    @PostMapping
    fun addTask(
        @RequestParam description: String,
        @RequestParam(required = false, defaultValue = "Normal") priority: String,
        @RequestParam(required = false) projectId: Int?,
        @RequestParam(required = false) assignedTo: String?,
        @RequestParam(required = false) tags: List<String>?
    ): List<Task> {
        val project = projectId?.let { projectRepository.findById(it).orElse(null) }
        if (project == null) {
            throw IllegalArgumentException("Project with ID $projectId not found")
        }
        val newTask = Task(
            description = description,
            status = "To Do",
            priority = priority,
            project = project,
            assignedTo = assignedTo,
//            tags = tags ?: emptyList()
        )
        taskRepository.save(newTask)
        return taskRepository.findAll()
    }

    @PutMapping("/{id}/status")
//    fun updateStatus(@PathVariable id: Int, @RequestParam value: String): List<Task> {
////        val validStatuses = listOf("To Do", "In Progress", "Done")
////        if (value !in validStatuses) return tasks
////        tasks.replaceAll { if (it.id == id) it.copy(status = value) else it }
////        return tasks
//        throw NotImplementedError()
//    }

        fun updateStatus(@PathVariable id: Int, @RequestParam value: String): List<Task> {
        val task = taskRepository.findById(id).orElseThrow {
            IllegalArgumentException("Task with ID $id not found")
        }
        val updatedTask = task.copy(status = value)

        taskRepository.save(updatedTask)
        return taskRepository.findAll()
    }
    @DeleteMapping("/{id}")
//    fun deleteTask(@PathVariable id: Int): List<Task> {
////        tasks.removeIf { it.id == id }
////        return tasks
//        throw NotImplementedError()
//    }
//}
    fun deleteTask(@PathVariable id: Int): List<Task> {
        if (!taskRepository.existsById(id)) {
            throw IllegalArgumentException("Task with ID $id not found")
        }

        taskRepository.deleteById(id)
        return taskRepository.findAll()
    }
}