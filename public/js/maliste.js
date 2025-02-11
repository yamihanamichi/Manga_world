let currentPage = 1;
const mangasPerPage = 20;

async function fetchUserMangas() {
    try {
        const response = await fetch('/manga/list');
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des mangas:', error);
        return [];
    }
}

function createMangaCard(manga) {
    const statusOptions = [
        { value: 'plan_to_read', label: 'À lire' },
        { value: 'reading', label: 'En cours' },
        { value: 'completed', label: 'Terminé' },
        { value: 'on_hold', label: 'En pause' },
        { value: 'dropped', label: 'Abandonné' }
    ];

    const statusOptionsHtml = statusOptions.map(option => 
        `<option value="${option.value}" ${manga.status === option.value ? 'selected' : ''}>
            ${option.label}
        </option>`
    ).join('');

    return `
        <div class="col-6 col-md-3 mb-4">
            <div class="card h-100 manga-card" data-mal-id="${manga.mal_id}">
                <img src="${manga.image_url}" class="card-img-top" alt="${manga.title}">
                <div class="card-body">
                    <h5 class="card-title">${manga.title}</h5>
                    <div class="mb-3">
                        <select class="form-select status-select" data-mal-id="${manga.mal_id}">
                            ${statusOptionsHtml}
                        </select>
                    </div>
                    <button class="btn btn-danger remove-manga w-100" data-mal-id="${manga.mal_id}">Retirer</button>
                </div>
            </div>
        </div>
    `;
}

async function displayMyMangas(page) {
    const myMangas = await fetchUserMangas();
    const start = (page - 1) * mangasPerPage;
    const end = start + mangasPerPage;
    const paginatedMangas = myMangas.slice(start, end);

    const container = document.getElementById('myMangaContainer');
    container.innerHTML = '';

    if (paginatedMangas.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <h3 class="text-white">Votre liste est vide</h3>
                <p class="text-white">Ajoutez des mangas depuis la page de classement !</p>
            </div>
        `;
        return;
    }

    for (let i = 0; i < paginatedMangas.length; i += 4) {
        const row = document.createElement('div');
        row.className = 'row mb-4';
        const rowMangas = paginatedMangas.slice(i, i + 4);
        row.innerHTML = rowMangas.map(createMangaCard).join('');
        container.appendChild(row);
    }

    setupEventListeners();
    updatePagination(myMangas.length);
}

function setupEventListeners() {
    document.querySelectorAll('.remove-manga').forEach(button => {
        button.addEventListener('click', async (e) => {
            const malId = e.target.dataset.malId;
            if (confirm('Êtes-vous sûr de vouloir retirer ce manga de votre liste ?')) {
                try {
                    const response = await fetch(`/manga/remove/${malId}`, {
                        method: 'DELETE'
                    });
                    if (response.ok) {
                        displayMyMangas(currentPage);
                    }
                } catch (error) {
                    console.error('Erreur lors de la suppression:', error);
                }
            }
        });
    });

    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const malId = e.target.dataset.malId;
            const status = e.target.value;

            try {
                const response = await fetch(`/manga/update/${malId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status })
                });
                
                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour');
                }
                
                // Afficher un message de confirmation
                const card = select.closest('.manga-card');
                const statusMessage = document.createElement('div');
                statusMessage.className = 'alert alert-success mt-2';
                statusMessage.textContent = 'Statut mis à jour !';
                card.querySelector('.card-body').appendChild(statusMessage);
                
                // Supprimer le message après 2 secondes
                setTimeout(() => {
                    statusMessage.remove();
                }, 2000);
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                alert('Une erreur est survenue lors de la mise à jour du statut');
            }
        });
    });
}

function updatePagination(totalMangas) {
    const totalPages = Math.ceil(totalMangas / mangasPerPage);
    document.getElementById('currentPage').textContent = `Page ${currentPage}`;
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage >= totalPages;
}

document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayMyMangas(currentPage);
    }
});

document.getElementById('nextPageBtn').addEventListener('click', async () => {
    const myMangas = await fetchUserMangas();
    const totalPages = Math.ceil(myMangas.length / mangasPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayMyMangas(currentPage);
    }
});

displayMyMangas(currentPage);