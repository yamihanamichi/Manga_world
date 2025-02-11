const mangaContainer = document.getElementById('mangaContainer');
const currentPageSpan = document.getElementById('currentPage');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const genreFilter = document.getElementById('genreFilter');
const popupContainer = document.createElement('div');
popupContainer.id = 'mangaPopup';
popupContainer.classList.add('popup-container');
document.body.appendChild(popupContainer);

let currentPage = 1;
const mangasPerPage = 20;
let currentSearchQuery = '';
let currentFilter = 'bypopularity';
let currentGenre = '';

// Liste des genres de manga
const genres = [
    { id: 1, name: "Action" },
    { id: 2, name: "Aventure" },
    { id: 4, name: "Comédie" },
    { id: 8, name: "Drame" },
    { id: 10, name: "Fantasy" },
    { id: 14, name: "Horreur" },
    { id: 7, name: "Mystère" },
    { id: 22, name: "Romance" },
    { id: 24, name: "Sci-Fi" },
    { id: 36, name: "Slice of Life" },
    { id: 30, name: "Sports" },
    { id: 37, name: "Surnaturel" },
    { id: 41, name: "Thriller" }
];

// Charger les genres dans le select
genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre.id;
    option.textContent = genre.name;
    genreFilter.appendChild(option);
});

async function fetchMangas(page, searchQuery = '') {
    try {
        let url;
        if (searchQuery) {
            // Recherche par titre de manga
            url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(searchQuery)}&page=${page}&limit=${mangasPerPage}&order_by=popularity`;
        } else if (currentGenre) {
            // Filtrage par genre
            url = `https://api.jikan.moe/v4/manga?genres=${currentGenre}&page=${page}&limit=${mangasPerPage}&order_by=popularity`;
        } else {
            // Liste par popularité
            url = `https://api.jikan.moe/v4/top/manga?page=${page}&limit=${mangasPerPage}&filter=bypopularity`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error('Erreur de récupération des mangas:', error);
        return [];
    }
}

async function fetchComments(malId) {
    try {
        const response = await fetch(`/comments/manga/${malId}`);
        if (!response.ok) throw new Error('Erreur réseau');
        return await response.json();
    } catch (error) {
        console.error('Erreur lors de la récupération des commentaires:', error);
        return [];
    }
}

function createMangaCard(manga) {
    return `
        <div class="col-6 col-md-3 mb-4">
            <div class="card h-100 manga-card" data-mal-id="${manga.mal_id}">
                <img src="${manga.images.jpg.image_url}" class="card-img-top" alt="${manga.title}">
                <div class="card-body">
                    <h5 class="card-title">${manga.title}</h5>
                </div>
            </div>
        </div>
    `;
}

async function displayMangas(page, searchQuery = '') {
    mangaContainer.innerHTML = '<div class="text-center"><div class="spinner-border text-light" role="status"></div></div>';
    const mangas = await fetchMangas(page, searchQuery);
    mangaContainer.innerHTML = '';

    if (mangas.length === 0) {
        mangaContainer.innerHTML = '<div class="col-12 text-center text-white"><h3>Aucun manga trouvé</h3></div>';
        return;
    }

    for (let i = 0; i < mangas.length; i += 4) {
        const row = document.createElement('div');
        row.className = 'row mb-4';
        
        const rowMangas = mangas.slice(i, i + 4);
        row.innerHTML = rowMangas.map(createMangaCard).join('');
        
        mangaContainer.appendChild(row);
    }

    document.querySelectorAll('.manga-card').forEach(card => {
        card.addEventListener('click', () => {
            const malId = card.dataset.malId;
            showMangaDetails(malId);
        });
    });

    currentPageSpan.textContent = `Page ${page}`;
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = mangas.length < mangasPerPage;
}

async function showMangaDetails(malId) {
    try {
        const [mangaResponse, commentsResponse] = await Promise.all([
            fetch(`https://api.jikan.moe/v4/manga/${malId}/full`),
            fetchComments(malId)
        ]);
        
        const mangaData = await mangaResponse.json();
        const manga = mangaData.data;
        const comments = commentsResponse;

        const commentsHTML = `
            <div class="comments-section mt-4">
                <h4 class="text-white">Commentaires</h4>
                <div id="commentsList" class="mb-4">
                    ${comments.map(comment => `
                        <div class="comment mb-3 p-3 bg-dark border border-secondary rounded">
                            <div class="d-flex justify-content-between align-items-center">
                                <strong class="text-white">${comment.username}</strong>
                                <div>
                                    <small class="text-muted">${new Date(comment.created_at).toLocaleString()}</small>
                                    ${comment.user_id === window.userId ? `
                                        <button class="btn btn-danger btn-sm ms-2" onclick="deleteComment(${comment.id}, ${malId})">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <p class="text-white mt-2 mb-0">${comment.comment}</p>
                        </div>
                    `).join('') || '<p class="text-muted">Aucun commentaire pour le moment</p>'}
                </div>
                <form id="addCommentForm" class="mt-3">
                    <div class="form-group">
                        <textarea id="commentText" class="form-control bg-dark text-white" rows="3" 
                            placeholder="Votre commentaire..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary mt-2">
                        Publier le commentaire
                    </button>
                </form>
            </div>
        `;

        popupContainer.innerHTML = `
            <div class="popup-content">
                <div class="popup-header">
                    <h2 class="text-white">${manga.title}</h2>
                    <button class="close-popup text-white">&times;</button>
                </div>
                <div class="popup-body">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${manga.images.jpg.large_image_url}" class="img-fluid rounded" alt="${manga.title}">
                            <button id="addToListBtn" class="btn btn-success mt-3 w-100">
                                <i class="fas fa-plus"></i> Ajouter à ma liste
                            </button>
                        </div>
                        <div class="col-md-8">
                            <h3 class="text-white">Synopsis</h3>
                            <p class="text-white">${manga.synopsis || 'Pas de synopsis disponible.'}</p>
                            <div class="manga-details text-white">
                                <p><strong>Type:</strong> ${manga.type || 'N/A'}</p>
                                <p><strong>Genres:</strong> ${manga.genres.map(g => g.name).join(', ') || 'N/A'}</p>
                                <p><strong>Auteur:</strong> ${manga.authors.map(a => a.name).join(', ') || 'N/A'}</p>
                                <p><strong>Status:</strong> ${manga.status || 'N/A'}</p>
                                <p><strong>Score:</strong> ${manga.score || 'N/A'}</p>
                            </div>
                            ${commentsHTML}
                        </div>
                    </div>
                </div>
            </div>
        `;

        popupContainer.classList.add('show');

        // Gestionnaire pour le formulaire de commentaire
        const commentForm = document.getElementById('addCommentForm');
        if (commentForm) {
            commentForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const commentText = document.getElementById('commentText').value.trim();
                if (!commentText) return;

                try {
                    await fetch(`/comments/manga/${malId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ comment: commentText })
                    });

                    showMangaDetails(malId);
                } catch (error) {
                    console.error('Erreur lors de l\'ajout du commentaire:', error);
                }
            });
        }

        // Gestionnaire pour le bouton d'ajout à la liste
        const addToListBtn = document.getElementById('addToListBtn');
        if (addToListBtn) {
            addToListBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/manga/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            mal_id: manga.mal_id,
                            title: manga.title,
                            image_url: manga.images.jpg.image_url
                        })
                    });

                    if (response.ok) {
                        alert('Manga ajouté à votre liste !');
                    } else {
                        throw new Error('Erreur lors de l\'ajout du manga');
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Une erreur est survenue lors de l\'ajout du manga');
                }
            });
        }

        // Gestionnaires de fermeture
        popupContainer.querySelector('.close-popup').addEventListener('click', closePopup);
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) closePopup();
        });
    } catch (error) {
        console.error('Erreur de récupération des détails du manga:', error);
    }
}

async function deleteComment(commentId, malId) {
    if (confirm('Voulez-vous vraiment supprimer ce commentaire ?')) {
        try {
            const response = await fetch(`/comments/${commentId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showMangaDetails(malId);
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du commentaire:', error);
        }
    }
}

function closePopup() {
    popupContainer.classList.remove('show');
}

// Gestionnaire de recherche de manga
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        currentPage = 1;
        currentGenre = '';
        genreFilter.value = '';
        displayMangas(currentPage, query);
    }
});

// Gestionnaire de filtre par genre
genreFilter.addEventListener('change', () => {
    currentGenre = genreFilter.value;
    currentPage = 1;
    currentSearchQuery = '';
    searchInput.value = '';
    displayMangas(currentPage);
});

// Gestionnaire du bouton Populaire
document.querySelector('[data-filter="bypopularity"]').addEventListener('click', () => {
    currentGenre = '';
    currentSearchQuery = '';
    currentPage = 1;
    genreFilter.value = '';
    searchInput.value = '';
    displayMangas(currentPage);
});

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayMangas(currentPage, currentSearchQuery);
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    displayMangas(currentPage, currentSearchQuery);
});

displayMangas(currentPage);