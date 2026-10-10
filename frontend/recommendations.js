
const API_URL = "http://localhost:8080/api/recommendations";
const MOVIES_API_URL = "http://localhost:8080/api/movies";

const recommendationForm = document.getElementById("recommendationForm");
const userIdInput = document.getElementById("recommendationUserId");
const recommendationsContainer = document.getElementById("recommendations");

// Get recommendations when the form is submitted
recommendationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const userId = userIdInput.value.trim();

    if (!userId || Number(userId) < 1) {
        alert("Please enter a valid registered User ID.");
        return;
    }

    recommendationsContainer.innerHTML = "<p>Finding your best movies...</p>";

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(userId)}`);

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage || `HTTP ${response.status}`);
        }

        const movies = await response.json();

        displayRecommendations(movies);
    } catch (error) {
        console.error("Recommendation error:", error);

        recommendationsContainer.innerHTML = `
            <p>Could not load recommendations.</p>
            <p>Please check the user ID and make sure the backend is running.</p>
        `;
    }
});

// Display recommended movies
function displayRecommendations(movies) {
    recommendationsContainer.innerHTML = "";

    if (!movies || movies.length === 0) {
        recommendationsContainer.innerHTML = `
            <p>No recommendations found for this user.</p>
            <p>Make sure the user exists and movies are saved in the database.</p>
        `;
        return;
    }

    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        const title = document.createElement("h3");
        title.textContent = movie.title || "Untitled Movie";

        const genre = document.createElement("p");
        genre.textContent = `🎭 Genre: ${movie.genre || "Unknown"}`;

        const language = document.createElement("p");
        language.textContent = `🗣️ Language: ${movie.language || "Unknown"}`;

        const year = document.createElement("p");
        year.textContent = `📅 Year: ${movie.year ?? movie.releaseYear ?? "Unknown"}`;

        const rating = document.createElement("p");
        rating.textContent = `⭐ Rating: ${movie.rating ?? "N/A"}/10`;

        const description = document.createElement("p");
        description.textContent = movie.description || "No description available.";

        card.append(title, genre, language, year, rating, description);
        recommendationsContainer.appendChild(card);
    });
}
