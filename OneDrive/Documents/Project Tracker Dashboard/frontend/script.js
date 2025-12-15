const apiUrl = 'http://localhost/your-folder-name/backend/api.php'; 

// Fetch Projects on Load
document.addEventListener('DOMContentLoaded', fetchProjects);

async function fetchProjects() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const list = document.getElementById('projectList');
    
    list.innerHTML = '';
    data.forEach(project => {
        list.innerHTML += `
            <div class="project-item">
                <h3>${project.title} <span class="badge">${project.category}</span></h3>
                <p>${project.description}</p>
            </div>
        `;
    });
}

// Add Project Logic
document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const projectData = {
        title: document.getElementById('title').value,
        category: document.getElementById('category').value,
        description: document.getElementById('description').value
    };

    await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });

    document.getElementById('projectForm').reset();
    fetchProjects(); // Refresh list
});