document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");
            window.location.href = "/chat.html"; // Redirect to chat page
        } else {
            document.getElementById("error-message").innerText = data.error;
        }
    } catch (error) {
        document.getElementById("error-message").innerText = "Server error. Try again.";
        console.error("Error:", error);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("login-modal");
    const closeBtn = document.querySelector(".close-btn");
    const loginBtn = document.getElementById("open-login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

//.........................//
//SIGN UP//
//........................//

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("login-modal");
    const closeBtn = document.querySelector(".close-btn");
    const loginBtn = document.getElementById("open-login-btn");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");

    const submitLogin = document.getElementById("submit-login");
    const submitSignup = document.getElementById("submit-signup");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Switch to Sign-Up Form
    showSignup.addEventListener("click", () => {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    // Switch to Login Form
    showLogin.addEventListener("click", () => {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Handle Login Form Submission
    submitLogin.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login successful!");
                window.location.href = "/chat.html";
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Handle Sign-Up Form Submission
    submitSignup.addEventListener("click", async () => {
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Account created! You can now log in.");
                signupForm.style.display = "none";
                loginForm.style.display = "block";
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});

//STORAGE//
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            // ✅ Store token in localStorage
            localStorage.setItem("token", data.token);
            alert("Login successful!");

            // Redirect (optional)
            window.location.href = "/chat.html";
        } else {
            document.getElementById("error-message").innerText = data.error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

// CHECK IF USER HAS SIGNED IN//
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        console.log("User is logged in.");
        // You can show a "Welcome Back" message or auto-redirect
    } else {
        console.log("User is not logged in.");
    }
});

//LOG OUT//
document.getElementById("logout-btn").addEventListener("click", () => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Redirect to landing page
    window.location.href = "index.html"; // Change to your actual landing page file
});

//Auto Redirect if Not Logged In//

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to access this page!");
        window.location.href = "index.html"; // Redirect to login
    }
});


document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent default form submission

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");
            window.location.href = "/chat.html"; // Redirect to chat page
        } else {
            document.getElementById("error-message").innerText = data.error;
        }
    } catch (error) {
        document.getElementById("error-message").innerText = "Server error. Try again.";
        console.error("Error:", error);
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("login-modal");
    const closeBtn = document.querySelector(".close-btn");
    const loginBtn = document.getElementById("open-login-btn");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});

//.........................//
//SIGN UP//
//........................//

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("login-modal");
    const closeBtn = document.querySelector(".close-btn");
    const loginBtn = document.getElementById("open-login-btn");

    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    const showSignup = document.getElementById("show-signup");
    const showLogin = document.getElementById("show-login");

    const submitLogin = document.getElementById("submit-login");
    const submitSignup = document.getElementById("submit-signup");

    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            modal.style.display = "flex";
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Switch to Sign-Up Form
    showSignup.addEventListener("click", () => {
        loginForm.style.display = "none";
        signupForm.style.display = "block";
    });

    // Switch to Login Form
    showLogin.addEventListener("click", () => {
        signupForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Handle Login Form Submission
    submitLogin.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Login successful!");
                window.location.href = "/chat.html";
            } else {
                alert(data.error);
                alert("Login unsuccessful! Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Handle Sign-Up Form Submission
    submitSignup.addEventListener("click", async () => {
        const name = document.getElementById("signup-name").value;
        const email = document.getElementById("signup-email").value;
        const password = document.getElementById("signup-password").value;

        try {
            const response = await fetch("http://localhost:5000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                alert("Account created! You can now log in.");
                signupForm.style.display = "none";
                loginForm.style.display = "block";
            } else {
                alert(data.error);
                alert("Sign-up unsuccessful! Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });
});

//STORAGE//
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
            //  Store token in localStorage
            localStorage.setItem("token", data.token);
            alert("Login successful!");

            // Redirect (optional)
            window.location.href = "/chat.html";
        } else {
            document.getElementById("error-message").innerText = data.error;
        }
    } catch (error) {
        console.error("Error:", error);
    }
});

// CHECK IF USER HAS SIGNED IN//
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (token) {
        console.log("User is logged in.");
        // You can show a "Welcome Back" message or auto-redirect
    } else {
        console.log("User is not logged in.");
    }
});

//LOG OUT//
document.getElementById("logout-btn").addEventListener("click", () => {
    // Clear token from localStorage
    localStorage.removeItem("token");

    // Redirect to landing page
    window.location.href = "index.html"; // Change to your actual landing page file
});

//Auto Redirect if Not Logged In (only loged in users can acees the chat)//

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to access this page!");
        window.location.href = "index.html"; // Redirect to login
    }
});

function redirectToChat() {
    window.location.href = "chat.html";
}


document.getElementById("login-form").addEventListener("submit", async (e) => {
e.preventDefault();
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

try {
const response = await fetch("http://localhost:5000/login", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({ email, password }),
});

const data = await response.json();
if (response.ok) {
alert("Login successful!");
window.location.href = "/chat.html";
} else {
document.getElementById("error-message").innerText = data.error;
}
} catch (error) {
console.error("Error:", error);
}
});



