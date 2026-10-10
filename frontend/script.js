
const API_URL = "http://localhost:8080/api/movies";
const TMDB_API_URL = "http://localhost:8080/api/tmdb/search";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const POSTER_PLACEHOLDER =
    "https://placehold.co/400x600/172338/f8fafc?text=No+Poster";

// Page elements
const movieForm = document.getElementById("movieForm");
const moviesContainer = document.getElementById("movies");
const searchInput = document.getElementById("searchInput");
const genreFilter = document.getElementById("genreFilter");

const tmdbSearch = document.getElementById("tmdbSearch");
const tmdbSearchButton = document.getElementById("tmdbSearchButton");
const tmdbMoviesContainer = document.getElementById("tmdbMovies");

// Cache poster searches to avoid repeated API requests
const posterCache = new Map();

// ---------------- POSTER FUNCTIONS ----------------

function createPoster(path, title, className = "movie-poster") {
    const image = document.createElement("img");

    image.className = className;
    image.alt = `${title || "Movie"} poster`;
    image.loading = "lazy";
    image.src = path
        ? (path.startsWith("http") ? path : TMDB_IMAGE_BASE + path)
        : POSTER_PLACEHOLDER;

    image.onerror = () => {
        image.onerror = null;
        image.src = POSTER_PLACEHOLDER;
    };

    return image;
}

// Find a poster for an already-saved movie
async function getMoviePoster(title) {
    if (!title) return POSTER_PLACEHOLDER;

    const key = title.trim().toLowerCase();

    if (posterCache.has(key)) {
        return posterCache.get(key);
    }

    const request = (async () => {
        try {
            const response = await fetch(
                `${TMDB_API_URL}?query=${encodeURIComponent(title)}`
            );

            if (!response.ok) return POSTER_PLACEHOLDER;

            const data = await response.json();
            const results = data.results || [];

            // Prefer an exact title match
            const exactMatch = results.find(movie =>
                movie.title?.trim().toLowerCase() === key &&
                movie.poster_path
            );

            // Otherwise use the first result with a poster
            const match = exactMatch ||
                results.find(movie => movie.poster_path);

            return match
                ? TMDB_IMAGE_BASE + match.poster_path
                : POSTER_PLACEHOLDER;
        } catch (error) {
            console.error("Poster lookup failed:", error);
            return POSTER_PLACEHOLDER;
        }
    })();

    posterCache.set(key, request);
    return request;
}

// ---------------- RATINGS AND DETAILS ----------------

function createStarRating(value, maxRating = 10) {
    const rating = Number(value);
    const valid =
        value !== null &&
        value !== undefined &&
        value !== "" &&
        Number.isFinite(rating) &&
        rating >= 0 &&
        rating <= maxRating;

    const wrapper = document.createElement("div");
    wrapper.className = "movie-stars";

    if (!valid) {
        wrapper.textContent = "☆☆☆☆☆ N/A";
        return wrapper;
    }

    const stars = Math.round((rating / maxRating) * 5);

    wrapper.textContent =
        `${"★".repeat(stars)}${"☆".repeat(5 - stars)}  ${rating.toFixed(1)}/${maxRating}`;

    wrapper.setAttribute(
        "aria-label",
        `Rating ${rating} out of ${maxRating}`
    );

    return wrapper;
}

function createDetail(label, value, className = "movie-details") {
    const element = document.createElement("p");
    element.className = className;
    element.textContent = `${label}: ${value ?? "Unknown"}`;
    return element;
}

// ---------------- LOAD SAVED MOVIES ----------------

async function loadMovies() {
    if (!moviesContainer) return;

    moviesContainer.textContent = "Loading movies...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Failed to load movies: ${response.status}`);
        }

        const movies = await response.json();
        displayMovies(movies);
    } catch (error) {
        console.error("Load movies error:", error);
        moviesContainer.textContent =
            "Could not load movies. Check that the backend is running.";
    }
}

// ---------------- DISPLAY SAVED MOVIES ----------------

function displayMovies(movies) {
    if (!moviesContainer) return;

    moviesContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
        moviesContainer.textContent = "No movies available. Add a movie!";
        return;
    }

    const searchTerm = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    const selectedGenre = genreFilter ? genreFilter.value : "";

    const filteredMovies = movies.filter(movie => {
        const titleMatches = (movie.title || "")
            .toLowerCase()
            .includes(searchTerm);

        const genreMatches =
            !selectedGenre ||
            (movie.genre || "").toLowerCase() ===
                selectedGenre.toLowerCase();

        return titleMatches && genreMatches;
    });

    if (filteredMovies.length === 0) {
        moviesContainer.textContent = "No matching movies found.";
        return;
    }

    filteredMovies.forEach(movie => {
        const card = document.createElement("article");
        card.className = "movie-card";

        // Show saved poster first, then search TMDB automatically
        const poster = createPoster(
            movie.posterUrl || movie.posterPath,
            movie.title
        );

        card.appendChild(poster);

        if (!movie.posterUrl && !movie.posterPath) {
            getMoviePoster(movie.title).then(posterUrl => {
                if (poster.isConnected) {
                    poster.src = posterUrl;
                }
            });
        }

        const content = document.createElement("div");
        content.className = "movie-card-content";

        const title = document.createElement("h3");
        title.textContent = movie.title || "Untitled";

        const rating = createStarRating(movie.rating);
        const genre = createDetail("Genre", movie.genre);
        const language = createDetail("Language", movie.language);

        const year = createDetail(
            "Year",
            movie.year ?? movie.releaseYear
        );

        const description = document.createElement("p");
        description.className = "movie-description";
        description.textContent =
            movie.description || "No description available.";

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.style.background =
            "linear-gradient(135deg, #dc2626, #991b1b)";

        deleteButton.addEventListener("click", async () => {
            if (!confirm(`Delete "${movie.title}"?`)) return;

            try {
                const response = await fetch(
                    `${API_URL}/${movie.id}`,
                    { method: "DELETE" }
                );

                if (!response.ok) {
                    throw new Error(`Delete failed: ${response.status}`);
                }

                await loadMovies();
            } catch (error) {
                console.error("Delete movie error:", error);
                alert("Could not delete movie: " + error.message);
            }
        });

        content.append(
            title,
            rating,
            genre,
            language,
            year,
            description,
            deleteButton
        );

        card.appendChild(content);
        moviesContainer.appendChild(card);
    });
}

// ---------------- ADD MOVIE ----------------

if (movieForm) {
    movieForm.addEventListener("submit", async event => {
        event.preventDefault();

        const getValue = id => {
            const element = document.getElementById(id);
            return element ? element.value.trim() : "";
        };

        const movie = {
            title: getValue("title"),
            genre: getValue("genre"),
            language: getValue("language"),
            year: Number(getValue("year")),
            rating: Number(getValue("rating")),
            description: getValue("description")
        };

        if (
            !movie.title ||
            !movie.genre ||
            !movie.language ||
            !getValue("year") ||
            !getValue("rating")
        ) {
            alert("Please fill in all required movie fields.");
            return;
        }

        if (
            !Number.isFinite(movie.rating) ||
            movie.rating < 0 ||
            movie.rating > 10
        ) {
            alert("Rating must be between 0 and 10.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(movie)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP ${response.status}`);
            }

            movieForm.reset();
            await loadMovies();
            alert("Movie added successfully!");
        } catch (error) {
            console.error("Add movie error:", error);
            alert("Could not add movie: " + error.message);
        }
    });
}

// ---------------- SEARCH AND GENRE FILTER ----------------

if (searchInput) {
    searchInput.addEventListener("input", loadMovies);
}

if (genreFilter) {
    genreFilter.addEventListener("change", loadMovies);
}

// ---------------- TMDB SEARCH ----------------

async function searchTMDBMovies() {
    if (!tmdbSearch || !tmdbMoviesContainer) return;

    const query = tmdbSearch.value.trim();

    if (!query) {
        alert("Please enter a movie name.");
        return;
    }

    tmdbMoviesContainer.textContent = "Searching movies...";

    try {
        const response = await fetch(
            `${TMDB_API_URL}?query=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error(`TMDB search failed: ${response.status}`);
        }

        const data = await response.json();
        tmdbMoviesContainer.innerHTML = "";

        if (!data.results || data.results.length === 0) {
            tmdbMoviesContainer.textContent = "No movies found.";
            return;
        }

        data.results.forEach(movie => {
            const card = document.createElement("article");
            card.className = "movie-card";

            card.appendChild(
                createPoster(
                    movie.poster_path,
                    movie.title,
                    "tmdb-poster"
                )
            );

            const content = document.createElement("div");
            content.className = "movie-card-content";

            const title = document.createElement("h3");
            title.textContent = movie.title || "Untitled";

            const rating = createStarRating(movie.vote_average);

            const release = createDetail(
                "Release date",
                movie.release_date || "Unknown"
            );

            const description = document.createElement("p");
            description.className = "movie-description";
            description.textContent =
                movie.overview || "No description available.";

            content.append(title, rating, release, description);
            card.appendChild(content);
            tmdbMoviesContainer.appendChild(card);
        });
    } catch (error) {
        console.error("TMDB search error:", error);
        tmdbMoviesContainer.textContent =
            "Could not load TMDB movies. Check that the backend is running.";
    }
}

if (tmdbSearchButton) {
    tmdbSearchButton.addEventListener("click", searchTMDBMovies);
}

if (tmdbSearch) {
    tmdbSearch.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault();
            searchTMDBMovies();
        }
    });
}

// ---------------- INITIAL LOAD ----------------

loadMovies();
