window.onload = () => {
    loadProjects();
    loadTasks();
    document.getElementById('taskForm').addEventListener('submit', addTask);
    document.getElementById('filterProject').addEventListener('change', () => {
        highlightSelectedProject(document.getElementById('filterProject').value);
        loadTasks();
    });
    setupSidebarToggle();
    setupModal();
};
