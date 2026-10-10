const REVIEWS_API = "http://localhost:8080/api/reviews";
const MOVIES_API = "http://localhost:8080/api/movies";
const USERS_API = "http://localhost:8080/api/users";

const reviewForm = document.getElementById("reviewForm");
const reviewsContainer = document.getElementById("reviews");

// Load and display reviews
async function loadReviews() {
    reviewsContainer.textContent = "Loading reviews...";

    try {
        const response = await fetch(REVIEWS_API);

        if (!response.ok) {
            throw new Error(`Failed to load reviews: ${response.status}`);
        }

        const reviews = await response.json();
        reviewsContainer.innerHTML = "";

        if (reviews.length === 0) {
            reviewsContainer.textContent = "No reviews available yet.";
            return;
        }

        reviews.forEach(review => {
            const card = document.createElement("div");
            card.className = "movie-card";

            const heading = document.createElement("h3");
            heading.textContent =
                `${review.movie?.title || "Unknown Movie"} — ${review.rating}/10`;

            const reviewer = document.createElement("p");
            reviewer.textContent =
                `Reviewed by: ${review.user?.name || "Unknown User"}`;

            const comment = document.createElement("p");
            comment.textContent = review.comment || "No comment provided.";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete Review";
            deleteButton.style.backgroundColor = "#dc2626";

            deleteButton.addEventListener("click", async () => {
                if (!confirm("Delete this review?")) {
                    return;
                }

                try {
                    const result = await fetch(
                        `${REVIEWS_API}/${review.id}`,
                        { method: "DELETE" }
                    );

                    if (!result.ok) {
                        throw new Error(`Delete failed: ${result.status}`);
                    }

                    await loadReviews();
                    alert("Review deleted successfully!");

                } catch (error) {
                    console.error(error);
                    alert("Could not delete review.");
                }
            });

            card.append(heading, reviewer, comment, deleteButton);
            reviewsContainer.appendChild(card);
        });

    } catch (error) {
        reviewsContainer.textContent =
            "Could not load reviews. Check the backend connection.";
        console.error("Load error:", error);
    }
}

// Submit a review
reviewForm.addEventListener("submit", async event => {
    event.preventDefault();

    const userId = Number(
        document.getElementById("reviewUserId").value
    );

    const movieId = Number(
        document.getElementById("reviewMovieId").value
    );

    const rating = Number(
        document.getElementById("reviewRating").value
    );

    const comment =
        document.getElementById("reviewComment").value.trim();

    if (
        !Number.isInteger(userId) || userId < 1 ||
        !Number.isInteger(movieId) || movieId < 1 ||
        !Number.isInteger(rating) || rating < 1 || rating > 10 ||
        !comment
    ) {
        alert("Enter valid user ID, movie ID, rating, and comment.");
        return;
    }

    try {
        // Check that the user exists
        const userResponse = await fetch(`${USERS_API}/${userId}`);

        if (!userResponse.ok) {
            throw new Error("User not found. Register a user first.");
        }

        // Check that the movie exists
        const movieResponse = await fetch(`${MOVIES_API}/${movieId}`);

        if (!movieResponse.ok) {
            throw new Error("Movie not found. Add a movie first.");
        }

        // Controller requires IDs as URL parameters
        const url = new URL(REVIEWS_API);
        url.searchParams.set("movieId", movieId);
        url.searchParams.set("userId", userId);

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                rating: rating,
                comment: comment
            })
        });

        if (!response.ok) {
            throw new Error(
                `Could not submit review: HTTP ${response.status}`
            );
        }

        reviewForm.reset();
        await loadReviews();
        alert("Review submitted successfully!");

    } catch (error) {
        console.error("Submit error:", error);
        alert(error.message || "Could not submit review.");
    }
});

// Load reviews when page opens
loadReviews();
