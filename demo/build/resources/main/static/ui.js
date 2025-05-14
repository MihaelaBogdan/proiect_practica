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

function setupSidebarToggle() {
    document.getElementById('hamburger').addEventListener('click', () => {
        const sidebar = document.getElementById('sidebar');
        const isOpen = sidebar.classList.toggle('open');
        document.body.classList.toggle('sidebar-open', isOpen);
    });
}

function setupModal() {
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
}
