async function loadProjects() {
    const res = await fetch('/projects');
    const projects = await res.json();

    const select = document.getElementById('projectSelect');
    const filter = document.getElementById('filterProject');

    select.innerHTML = '';
    filter.innerHTML = '<option value="">All Projects</option>';

    projects.forEach(project => {
        const opt1 = document.createElement('option');
        opt1.value = project.id;
        opt1.textContent = project.name;
        select.appendChild(opt1);

        const opt2 = document.createElement('option');
        opt2.value = project.id;
        opt2.textContent = project.name;
        filter.appendChild(opt2);
    });
}

async function loadTasks() {
    const res = await fetch('/tasks');
    const tasks = await res.json();

    const selectedPriority = document.getElementById('filterPriority')?.value;
    const selectedProject = document.getElementById('filterProject')?.value;

    const lists = {
        'To Do': document.getElementById('todo-list'),
        'In Progress': document.getElementById('progress-list'),
        'Done': document.getElementById('done-list')
    };

    Object.values(lists).forEach(list => list.innerHTML = '');

    tasks.forEach(task => {
        if (selectedPriority && task.priority !== selectedPriority) return;
        if (selectedProject && task.projectId != selectedProject) return;

        const li = document.createElement('li');
        li.className = 'task';
        li.draggable = true;

        li.ondragstart = (e) => {
            e.dataTransfer.setData('text/plain', String(task.id));
            li.classList.add('dragging');
        };
        li.ondragend = () => li.classList.remove('dragging');

        let tagsHtml = '';
        if (task.tags && Array.isArray(task.tags)) {
            tagsHtml = `<div class="tags">${task.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>`;
        }

        li.innerHTML = `
            <div><strong>${task.description}</strong></div>
            <div class="priority ${task.priority}">Priority: ${task.priority}</div>
            ${task.assignedTo ? `<div><small>Assigned to: ${task.assignedTo}</small></div>` : ''}
            ${tagsHtml}
            <div class="task-actions">
                <select onchange="updateStatus(${task.id}, this.value)">
                    <option ${task.status === 'To Do' ? 'selected' : ''}>To Do</option>
                    <option ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                </select>
                <button onclick="deleteTask(${task.id})">🗑</button>
            </div>
        `;

        lists[task.status].appendChild(li);
    });

    // Drag & drop între coloane
    Object.entries(lists).forEach(([status, list]) => {
        list.ondragover = (e) => e.preventDefault();
        list.ondrop = async (e) => {
            e.preventDefault();
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            if (!isNaN(taskId)) await updateStatus(taskId, status);
        };
    });

    // Zona de ștergere
    const trash = document.getElementById('trash-area');
    trash.ondragover = (e) => {
        e.preventDefault();
        trash.classList.add('drag-over');
    };
    trash.ondragleave = () => trash.classList.remove('drag-over');
    trash.ondrop = async (e) => {
        e.preventDefault();
        trash.classList.remove('drag-over');
        const taskId = parseInt(e.dataTransfer.getData('text/plain'));
        if (!isNaN(taskId)) await deleteTask(taskId);
    };
}

async function addTask(e) {
    e.preventDefault();
    const desc = document.getElementById('taskInput').value.trim();
    const priority = document.getElementById('priorityInput').value;
    const projectId = document.getElementById('projectSelect').value;
    const assignedTo = document.getElementById('assignedTo')?.value.trim();
    const tagsRaw = document.getElementById('tagsInput')?.value.trim();

    if (!desc) return;

    const tagParams = tagsRaw
        ? tagsRaw.split(',').map(t => `tags=${encodeURIComponent(t.trim())}`).join('&')
        : '';

    const url = `/tasks?description=${encodeURIComponent(desc)}&priority=${priority}&projectId=${projectId}`
        + (assignedTo ? `&assignedTo=${encodeURIComponent(assignedTo)}` : '')
        + (tagParams ? `&${tagParams}` : '');

    await fetch(url, { method: 'POST' });

    document.getElementById('taskInput').value = '';
    document.getElementById('assignedTo').value = '';
    document.getElementById('tagsInput').value = '';

    loadTasks();
}

async function deleteTask(id) {
    await fetch(`/tasks/${id}`, { method: 'DELETE' });
    loadTasks();
}

async function updateStatus(id, status) {
    await fetch(`/tasks/${id}/status?value=${encodeURIComponent(status)}`, {
        method: 'PUT'
    });
    loadTasks();
}

document.getElementById('taskForm').addEventListener('submit', addTask);
window.onload = () => {
    loadProjects();
    loadTasks();
    document.getElementById('filterProject').addEventListener('change', loadTasks);
};
