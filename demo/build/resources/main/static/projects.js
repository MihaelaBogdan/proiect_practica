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
