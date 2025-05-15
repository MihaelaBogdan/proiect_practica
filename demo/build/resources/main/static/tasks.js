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
       if (selectedProject) {
           if (!task.project || String(task.project.id) !== selectedProject) return;
       }

        const li = document.createElement('li');
        li.className = 'task';
        li.draggable = true;

        li.ondragstart = e => {
            e.dataTransfer.setData('text/plain', String(task.id));
            li.classList.add('dragging');
        };
        li.ondragend = () => li.classList.remove('dragging');

        const tagsHtml = task.tags?.length
            ? `<div class="tags">${task.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</div>`
            : '';

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

    const trash = document.getElementById('trash-area');
    if (trash) {
        trash.ondragover = e => {
            e.preventDefault();
            trash.classList.add('drag-over');
        };
        trash.ondragleave = () => trash.classList.remove('drag-over');
        trash.ondrop = async e => {
            e.preventDefault();
            trash.classList.remove('drag-over');
            const taskId = parseInt(e.dataTransfer.getData('text/plain'));
            if (!isNaN(taskId)) await deleteTask(taskId);
        };
    }
}

async function addTask(e) {
    e.preventDefault();

    const desc = document.getElementById('taskInput').value.trim();
    const priority = document.getElementById('priorityInput').value;
    let projectId = document.getElementById('projectSelect')?.value;
    if (projectId === '') projectId = null;

    const assignedTo = document.getElementById('assignedTo')?.value.trim();
    const tagsRaw = document.getElementById('tagsInput')?.value.trim();
    if (!desc) return;

    const tagParams = tagsRaw
        ? tagsRaw.split(',').map(t => `tags=${encodeURIComponent(t.trim())}`).join('&')
        : '';

    let url = `/tasks?description=${encodeURIComponent(desc)}&priority=${priority}`;
    if (projectId) url += `&projectId=${projectId}`;
    if (assignedTo) url += `&assignedTo=${encodeURIComponent(assignedTo)}`;
    if (tagParams) url += `&${tagParams}`;

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
    await fetch(`/tasks/${id}/status?value=${encodeURIComponent(status)}`, { method: 'PUT' });
    loadTasks();
}
