// Define routes and corresponding HTML files
const routes = {
    "/": "home.html",
    "/events": "events.html",
    "/tickets": "tickets.html",
    "/registration": "registration.html",
    "/login": "login.html",
};

// Check login state. If user is not logged in, redirect to login page.
function checkLogin() {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (!loggedInUser && window.location.pathname !== "/login") {
        window.history.pushState({}, "", "/login"); // Redirect to login page
    }
}

// Handle login form submission
function setupLoginPage() {
    const form = document.getElementById("login-form");
    const messageDiv = document.getElementById("login-message");

    // Add submit event listener to login form. async/await is used to handle fetch API used for user authentication.
    form.addEventListener("submit", async (event) => {
        event.preventDefault(); // Prevent form submission
        const username = form.username.value; 
        const password = form.password.value;
        
        // Fetch user credentials from external JSON file
        const response = await fetch("users.json"); 
        const users = await response.json();

        const user = users.find(
            (user) => user.username === username && user.password === password
        );

        if (user) {
            localStorage.setItem("loggedInUser", JSON.stringify(user));
            messageDiv.textContent = "Login successful!";
            messageDiv.style.color = "green";
            setTimeout(() => {
                window.history.pushState({}, "", "/");
                router();
            }, 1000);
        } else {
            messageDiv.textContent = "Invalid credentials. Please try again.";
            messageDiv.style.color = "red";
        }
    });
}

// Display user greeting on the home page
function setupHomePage() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (loggedInUser) {
        const mainContent = document.getElementById("main-content");
        const greeting = document.createElement("p");
        greeting.textContent = "Hello, " + loggedInUser.username + "!";
        mainContent.prepend(greeting);
    }
    attachHomePageFeatures();
}

// Router function. Here we fetch the HTML content of the requested route and display it in the main content area.
// We also call setup functions for each page to add specific features.
// If the route is not found, we display a 404 error message.
// If an error occurs while loading the content, we display an error message.
async function loadContent(route) {
    try {
        const response = await fetch(route);
        if (response.ok) {
            const content = await response.text();
            document.getElementById("main-content").innerHTML = content;
        } else {
            document.getElementById("main-content").innerHTML =
                "<h1>404 - Page Not Found</h1>";
        }
    } catch (error) {
        console.error("Error loading content:", error);
        document.getElementById("main-content").innerHTML =
            "<h1>Error loading page</h1>";
    }
}

// Router function to handle client-side navigation.
// It checks the current path and loads the corresponding route.
function router() {
    const path = window.location.pathname;
    const route = path === "/event-details.html" ? "/event-details.html" : routes[path] || null; // Check if the path is event-details.html because it's not in the routes object

    if (route) {
        loadContent(route).then(() => {
            if (path === "/login") {
                setupLoginPage();
            } else if (path === "/") {
                setupHomePage();
            } else if (path === "/events") {
                setupEventsPage();
            } else if (path === "/tickets") {
                setupTicketsPage();
            } else if (path === "/registration") {
                setupRegistrationPage();
            }
        });
    } else {
        document.getElementById("main-content").innerHTML =
            "<h1>404 - Page Not Found</h1>";
    }
}
document.addEventListener("click", (event) => {
    if (event.target.matches("[data-link]")) {
        event.preventDefault();
        const path = event.target.getAttribute("href");
        window.history.pushState({}, "", path);
        router();
    }
});

// Handle link clicks for client-side navigation
function handleNavigation(event) {
    if (event.target.matches("[data-link]"))// Check if the clicked element has the data-link attribute.data-link is used to identify the links that should trigger client-side navigation.
    {
        event.preventDefault();
        const path = event.target.getAttribute("href");
        window.history.pushState({}, "", path);
        router();
    }
}

// Theme Switcher
function setupThemeSwitcher() {
    const themeSwitcher = document.getElementById("themeSwitcher");
    const body = document.body;

    // Load saved theme from localStorage (if any)
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        body.className = savedTheme;
        themeSwitcher.textContent = savedTheme === "dark-theme" ? "Switch to Light" : "Switch to Dark";
    }

    // Add click event to toggle theme
    themeSwitcher.addEventListener("click", () => {
        if (body.className === "dark-theme") {
            body.className = "light-theme"; // Switch to Light
            themeSwitcher.textContent = "Switch to Dark";
            localStorage.setItem("theme", "light-theme"); // Save preference
        } else {
            body.className = "dark-theme"; // Switch to Dark
            themeSwitcher.textContent = "Switch to Light";
            localStorage.setItem("theme", "dark-theme"); // Save preference
        }
    });
}
setupThemeSwitcher();

// Home page-specific features
function attachHomePageFeatures() {
    const modal = document.getElementById("modal");
    const openModal = document.getElementById("openModal");
    const closeModal = document.querySelector(".close");

    if (modal && openModal && closeModal) {
        openModal.addEventListener("click", () => {
            modal.style.display = "block";
        });

        closeModal.addEventListener("click", () => {
            modal.style.display = "none";
        });

        window.addEventListener("click", (e) => {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }

    const benefitsList = document.getElementById("benefits-list");
    const addBenefitButton = document.getElementById("add-benefit");

    if (benefitsList && addBenefitButton) {
        function addEditDeleteButtons(li) {
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            li.appendChild(editButton);

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            li.appendChild(deleteButton);

            editButton.addEventListener("click", () => {
                const newText = prompt("Edit benefit:", li.firstChild.textContent.trim());
                if (newText) {
                    li.firstChild.textContent = newText + " ";
                }
            });

            deleteButton.addEventListener("click", () => {
                li.remove();
            });
        }

        // Add edit and delete buttons to existing benefits. Array.from is used to convert the HTMLCollection to an array.
        // We use it here because we need to iterate over the children of benefitsList.
        Array.from(benefitsList.children).forEach((li) => addEditDeleteButtons(li));

        addBenefitButton.addEventListener("click", () => {
            const newBenefit = prompt("Enter a new benefit:");
            if (newBenefit) {
                const li = document.createElement("li");
                li.textContent = newBenefit + " ";
                addEditDeleteButtons(li);
                benefitsList.appendChild(li);
            }
        });
    }
}

// Tickets page-specific features
function setupTicketsPage() {
    function showToast(message, type = "success") {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = "toast " + type;
        toast.innerText = message;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 100);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 500);
        }, 3000);
    }

    const addToCartButtons = document.querySelectorAll(".add-to-cart-button");
    addToCartButtons.forEach((button) => {
        button.addEventListener("click", () => {
            showToast("Ticket added to cart!", "success");
        });
    });
}

function setupEventsPage() {
    const events = [
        {
            title: "Music Festival 2024",
            date: "June 15, 2024",
            location: "Sarajevo City Park",
            price: "$50",
            description: "Join us for an unforgettable night of music with top artists and bands.",
            image: "music festival.png",
        },
        {
            title: "Art Exhibition",
            date: "July 20, 2024",
            location: "Sarajevo Art Center",
            price: "$30",
            description: "Explore stunning art pieces from local and international artists.",
            image: "art.png",
        },
        {
            title: "Food Fair 2024",
            date: "August 10, 2024",
            location: "Main Square",
            price: "$20",
            description: "Taste delicious cuisines from around the world.",
            image: "food.png",
        },
        {
            title: "Book Fair 2024",
            date: "September 5, 2024",
            location: "Library Hall",
            price: "$15",
            description: "Meet your favorite authors and discover new books at the annual book fair.",
            image: "book.png",
        },
        {
            title: "Theater Show",
            date: "October 12, 2024",
            location: "City Theater",
            price: "$40",
            description: "Enjoy a captivating performance at the city's renowned theater.",
            image: "theater.png",
        },
        {
            title: "Sports Event",
            date: "November 20, 2024",
            location: "Sports Arena",
            price: "$35",
            description: "Cheer on your favorite teams and athletes in an exciting sports event.",
            image: "sports.png",
        },
    ];

    const buttons = document.querySelectorAll(".view-details-btn");

    // Add click event to each "View Details" button. When clicked, the selected event is stored in localStorage and the user is redirected to the event-details page.
    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            const event = events[index];
            if (event) {
                localStorage.setItem("selectedEvent", JSON.stringify(event));
                window.history.pushState({}, "", "/event-details.html");
                router();
            }
        });
    });
}

// Registration page-specific features
function setupRegistrationPage() {
    const form = document.getElementById("registration-form");
    const messageDiv = document.getElementById("message");

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(form);

        // Send form data to an external API
        fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: formData,
        })
            .then((response) => {
                if (response.ok) {
                    messageDiv.textContent = "Registration successful!";
                    messageDiv.style.color = "green";
                    form.reset();
                } else {
                    messageDiv.textContent = "Registration failed. Please try again.";
                    messageDiv.style.color = "red";
                }
            })
            .catch(() => {
                messageDiv.textContent = "An error occurred. Please try again.";
                messageDiv.style.color = "red";
            });
    });
}
if (routes[window.location.pathname]) {
    router();
} else {
    window.history.pushState({}, "", "/");
    router();
}
document.addEventListener("click", handleNavigation);
window.addEventListener("popstate", router);
checkLogin();
router();