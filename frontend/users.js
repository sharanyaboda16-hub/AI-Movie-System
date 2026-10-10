const USERS_API = "http://localhost:8080/api/users";

const userForm = document.getElementById("userForm");
const usersContainer = document.getElementById("users");

// Load and display registered users
async function loadUsers() {
    usersContainer.textContent = "Loading users...";

    try {
        const response = await fetch(USERS_API);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const users = await response.json();
        usersContainer.innerHTML = "";

        if (users.length === 0) {
            usersContainer.textContent = "No users registered yet.";
            return;
        }

        users.forEach(user => {
            const card = document.createElement("div");
            card.className = "movie-card";

            const name = document.createElement("h3");
            name.textContent = user.name;

            const email = document.createElement("p");
            email.textContent = `Email: ${user.email}`;

            const genre = document.createElement("p");
            genre.textContent =
                `Preferred Genre: ${user.preferredGenre}`;

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete User";
            deleteButton.style.backgroundColor = "#dc2626";

            deleteButton.addEventListener("click", async () => {
                if (!confirm(`Delete user "${user.name}"?`)) {
                    return;
                }

                try {
                    const result = await fetch(
                        `${USERS_API}/${user.id}`,
                        { method: "DELETE" }
                    );

                    if (!result.ok) {
                        throw new Error(`Delete failed: ${result.status}`);
                    }

                    await loadUsers();
                    alert("User deleted successfully!");

                } catch (error) {
                    alert("Could not delete user.");
                    console.error(error);
                }
            });

            card.append(name, email, genre, deleteButton);
            usersContainer.appendChild(card);
        });

    } catch (error) {
        usersContainer.textContent =
            "Could not load users. Check the backend connection.";

        console.error("Load users error:", error);
    }
}

// Register a user
userForm.addEventListener("submit", async event => {
    event.preventDefault();

    const user = {
        name: document.getElementById("userName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        preferredGenre:
            document.getElementById("preferredGenre").value
    };

    try {
        const response = await fetch(USERS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        });

        if (!response.ok) {
            throw new Error(`Registration failed: ${response.status}`);
        }

        userForm.reset();
        await loadUsers();
        alert("User registered successfully!");

    } catch (error) {
        alert("Registration failed. Check the browser console.");
        console.error("Registration error:", error);
    }
});

// Start loading users
loadUsers();
