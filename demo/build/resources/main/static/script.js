
async function loadProjects() {
    const res = await fetch('/projects');
    const projects = await res.json();

    const select = document.getElementById('projectSelect');
    const filter = document.getElementById('filterProject');
    const sidebarList = document.getElementById('projectList');

    select.innerHTML = '';
    filter.innerHTML = '<option value="">All Projects</option>';
    sidebarList.innerHTML = '';

    const homeItem = document.createElement('li');
    homeItem.textContent = '🏠 Home';
    homeItem.classList.add('sidebar-project');
    homeItem.dataset.projectId = '';
    homeItem.onclick = () => {
        document.getElementById('filterProject').value = '';
        highlightSelectedProject('');
        loadTasks();
    };
    sidebarList.appendChild(homeItem);

    projects.forEach(project => addProjectToUI(project));
}

function addProjectToUI(project) {
    const opt1 = document.createElement('option');
    opt1.value = project.id;
    opt1.textContent = project.name;
    document.getElementById('projectSelect').appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = project.id;
    opt2.textContent = project.name;
    document.getElementById('filterProject').appendChild(opt2);

    const li = document.createElement('li');
    li.textContent = project.name;
    li.dataset.projectId = project.id;
    li.classList.add('sidebar-project');
    li.onclick = () => {
        document.getElementById('filterProject').value = project.id;
        highlightSelectedProject(project.id);
        loadTasks();
    };
    document.getElementById('projectList').appendChild(li);
}

function highlightSelectedProject(projectId) {
    const projectTitle = document.getElementById('currentProjectTitle');
    let selectedName = '';

    document.querySelectorAll('#projectList li').forEach(li => {
        const isSelected = li.dataset.projectId === projectId;
        li.classList.toggle('selected', isSelected);
        if (isSelected) selectedName = li.textContent;
    });

    projectTitle.textContent = selectedName && projectId ? `Project: ${selectedName}` : '';
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

        // 🔁 Filtrare logică:
        // - Dacă e proiect selectat => doar task-urile acelui proiect
        // - Dacă e Home => toate task-urile (cu și fără projectId)
        if (selectedProject) {
            if (task.projectId != selectedProject) return;
        }
        // în Home nu filtrăm deloc

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

async function createProject() {
    const name = document.getElementById('newProjectName').value.trim();
    const teamRaw = document.getElementById('newProjectTeam').value.trim();

    if (!name) return;

    const team = teamRaw ? teamRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

    const res = await fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, team })
    });

    const newProject = await res.json();

    document.getElementById('newProjectName').value = '';
    document.getElementById('newProjectTeam').value = '';
    document.getElementById('projectModal').style.display = 'none';

    addProjectToUI(newProject);

    document.getElementById('projectSelect').value = newProject.id;
    document.getElementById('filterProject').value = newProject.id;

    highlightSelectedProject(newProject.id);
    loadTasks();
}

// Toggle Sidebar
document.getElementById('hamburger').addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');
    const isOpen = sidebar.classList.toggle('open');
    document.body.classList.toggle('sidebar-open', isOpen);
});

// Modal
document.getElementById('addProjectBtn').addEventListener('click', () => {
    document.getElementById('projectModal').style.display = 'block';
});
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('projectModal').style.display = 'none';
});
window.addEventListener('click', e => {
    const modal = document.getElementById('projectModal');
    if (e.target === modal) modal.style.display = 'none';
});

// Init
window.onload = () => {
    loadProjects();
    loadTasks();
    document.getElementById('taskForm').addEventListener('submit', addTask);
    document.getElementById('filterProject').addEventListener('change', () => {
        highlightSelectedProject(document.getElementById('filterProject').value);
        loadTasks();
    });
};
