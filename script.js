const API_KEY = "b86addadc61148d0d47a7c067d2efffe"; 
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=fr-FR`;

// 1. Variables globales
let allMovies = [];      
// On charge les favoris enregistrés dans le localStorage, ou un tableau vide s'il n'y en a pas encore
let favorites = JSON.parse(localStorage.getItem('myMovieFavorites')) || []; 

// Helper pour attribuer la couleur selon la note
function getRatingClass(vote) {
    if (vote >= 7) return 'rating-green';
    if (vote >= 5) return 'rating-orange';
    return 'rating-red';
}

// 2. Récupération des films depuis l'API
async function filmsPopular() {
    try {
        console.log("Envoi de la requête à l'API...");
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP ! Statut : ${response.status}`);
        }

        const data = await response.json();
        allMovies = data.results; 
        console.log("SUCCÈS ! Films reçus :", allMovies);

        displayMovies(allMovies);
        // On met à jour l'interface des favoris au premier chargement pour afficher ceux enregistrés
        updateFavoritesUI();
    } catch (erreur) {
        console.error("Erreur lors du chargement :", erreur.message);
    }
}

// 3. Affichage de la grille de films
function displayMovies(movies) {
    const gridContainer = document.querySelector('.grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = "";

    if (movies.length === 0) {
        gridContainer.innerHTML = '<p class="no-results">Aucun film trouvé.</p>';
        return;
    }

    movies.forEach(film => {
        const card = document.createElement('div');
        card.classList.add('card');

        const posterUrl = film.poster_path 
            ? `https://image.tmdb.org/t/p/w500${film.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=Pas+d+image';

        const ratingClass = getRatingClass(film.vote_average);

        card.innerHTML = `
            <img src="${posterUrl}" alt="${film.title}">
            <h3>${film.title}</h3>
            <p class="release-date">Sortie : ${film.release_date || 'N/C'}</p>
            <span class="note ${ratingClass}">⭐ ${film.vote_average ? film.vote_average.toFixed(1) : 'N/A'}</span>
            <button class="add-btn">❤️ Ajouter aux favoris</button>
        `;

        // Écoute du bouton d'ajout aux favoris
        const addBtn = card.querySelector('.add-btn');
        addBtn.addEventListener('click', () => addToFavorites(film));

        gridContainer.appendChild(card);
    });
}

// 4. GESTION DES FAVORIS ET DU LOCALSTORAGE

// Sauvegarder le tableau des favoris dans le navigateur
function saveFavoritesToLocalStorage() {
    localStorage.setItem('myMovieFavorites', JSON.stringify(favorites));
}

function addToFavorites(movie) {
    const exists = favorites.some(fav => fav.id === movie.id);

    if (!exists) {
        favorites.push(movie);
        saveFavoritesToLocalStorage(); // 💾 Sauvegarde
        updateFavoritesUI();
    } else {
        alert("Ce film est déjà dans vos favoris !");
    }
}

function removeFromFavorites(movieId) {
    favorites = favorites.filter(fav => fav.id !== movieId);
    saveFavoritesToLocalStorage(); // 💾 Sauvegarde après suppression
    updateFavoritesUI();
}

function updateFavoritesUI() {
    // Compteur dans le header
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = favorites.length;
    }

    // Liste dans le tiroir latéral
    const favListContainer = document.getElementById('favorites-list');
    if (!favListContainer) return;

    favListContainer.innerHTML = '';

    if (favorites.length === 0) {
        favListContainer.innerHTML = '<p class="empty-msg">Votre liste de favoris est vide.</p>';
        return;
    }

    favorites.forEach(film => {
        const posterUrl = film.poster_path 
            ? `https://image.tmdb.org/t/p/w500${film.poster_path}` 
            : 'https://via.placeholder.com/500x750?text=N/A';

        const favItem = document.createElement('div');
        favItem.classList.add('fav-item');

        favItem.innerHTML = `
            <img src="${posterUrl}" alt="${film.title}">
            <div class="fav-info">
                <h4>${film.title}</h4>
                <p>⭐ ${film.vote_average ? film.vote_average.toFixed(1) : 'N/A'}</p>
            </div>
            <button class="remove-btn">🗑️</button>
        `;

        const removeBtn = favItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => removeFromFavorites(film.id));

        favListContainer.appendChild(favItem);
    });
}

// 5. GESTION D'OUVERTURE / FERMETURE DU PANNEAU LATÉRAL
const btnFavorites = document.getElementById('btn-favorites');
const closeDrawerBtn = document.getElementById('close-drawer');
const drawer = document.getElementById('favorites-drawer');
const overlay = document.getElementById('overlay');

function openDrawer() {
    if (drawer && overlay) {
        drawer.classList.add('open');
        overlay.classList.add('active');
    }
}

function closeDrawer() {
    if (drawer && overlay) {
        drawer.classList.remove('open');
        overlay.classList.remove('active');
    }
}

if (btnFavorites) btnFavorites.addEventListener('click', openDrawer);
if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

// 6. BARRE DE RECHERCHE EN TEMPS RÉEL
const searchInput = document.getElementById('search-input');

if (searchInput) {
    searchInput.addEventListener('input', (event) => {
        const searchTerm = event.target.value.toLowerCase().trim();
        const filteredMovies = allMovies.filter(film => {
            return film.title.toLowerCase().includes(searchTerm);
        });
        displayMovies(filteredMovies);
    });
}

// 7. Lancement initial
filmsPopular();