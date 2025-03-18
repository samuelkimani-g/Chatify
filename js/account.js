const API_BASE_URL = "http://localhost:3000"; 

document.addEventListener("DOMContentLoaded", async () => {
    const DOM = {
        authModal: document.getElementById('auth-modal'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        openLoginBtn: document.getElementById('open-login-btn'),
        startChatBtn: document.querySelector('.start-chat')
    };

    let state = {
        authToken: localStorage.getItem('chatifyToken'),
        videoPlayed: localStorage.getItem('videoPlayed') === 'true'
    };

    class Auth {
        static async check() {
            if (!state.authToken) return false;
            const response = await fetch(`${API_BASE_URL}/api/auth/check`, {
                headers: { 'Authorization': `Bearer ${state.authToken}` }
            });
            return response.ok;
        }

        static async login(email, password) {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                console.log("✅ Login successful! Redirecting...");
                localStorage.setItem('chatifyToken', data.token);

                if (!localStorage.getItem('videoPlayed')) {
                    window.location.href = "/html/intro.html"; 
                } else {
                    window.location.href = "/html/chat.html"; 
                }
            } else {
                alert(`❌ Login failed: ${data.error || "Invalid credentials"}`);
            }
        }

        static async signup(name, email, password) {
            const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('chatifyToken', data.token);
                localStorage.removeItem('videoPlayed');  // Ensure video plays for first-time users
                window.location.href = "/html/intro.html"; 
            } else {
                alert(`❌ Signup failed: ${data.error || "Please try again."}`);
            }
        }

        static async handleLogin(e) {
            e.preventDefault();
            
            const emailField = document.getElementById('login-email'); // Fixed field name
            const passwordField = document.getElementById('login-password');

            if (!emailField || !passwordField) {
                console.error("❌ ERROR: Login form fields not found.");
                return;
            }

            const email = emailField.value.trim();
            const password = passwordField.value.trim();

            if (!email || !password) {
                alert("⚠️ Please enter both email and password.");
                return;
            }

            console.log("✅ Logging in with:", { email, password });
            await Auth.login(email, password);
        }

        static async handleSignup(e) {
            e.preventDefault();
            
            const nameField = document.getElementById('signup-username');
            const emailField = document.getElementById('signup-email');
            const passwordField = document.getElementById('signup-password');

            if (!nameField || !emailField || !passwordField) {
                console.error("❌ ERROR: Signup form fields are missing.");
                return;
            }

            const name = nameField.value.trim();
            const email = emailField.value.trim();
            const password = passwordField.value.trim();

            if (!name || !email || !password) {
                alert("⚠️ Please fill in all fields.");
                return;
            }

            console.log("✅ Signing up with:", { name, email, password });
            await Auth.signup(name, email, password);
        }

        static async showTransitionVideo() {
            return new Promise(resolve => {
                const video = document.createElement('video');
                video.src = '/videos/chatifyvideo.mp4';
                video.style.position = 'fixed';
                video.style.top = '50%';
                video.style.left = '50%';
                video.style.transform = 'translate(-50%, -50%)';
                video.style.zIndex = '10000';
                video.style.maxWidth = '80%';
                video.autoplay = true;

                video.onended = () => {
                    document.body.removeChild(video);
                    localStorage.setItem('videoPlayed', 'true');
                    window.location.href = "/html/chat.html"; 
                    resolve();
                };

                document.body.appendChild(video);
            });
        }

        static redirectToChat() {
            if (state.authToken) {
                window.location.href = '/html/chat.html';
            } else {
                DOM.authModal.style.display = 'flex';
                DOM.signupForm.style.display = 'block';
                DOM.loginForm.style.display = 'none';
            }
        }
    }

    // Event Listeners
    DOM.openLoginBtn?.addEventListener('click', () => DOM.authModal.style.display = 'flex');
    DOM.loginForm?.addEventListener('submit', Auth.handleLogin);
    DOM.signupForm?.addEventListener('submit', Auth.handleSignup);
    DOM.startChatBtn?.addEventListener('click', Auth.redirectToChat);

    // Check Authentication & Play Video if First Time
    if (!await Auth.check()) {
        DOM.authModal.style.display = 'flex';
    } else if (!state.videoPlayed) {
        await Auth.showTransitionVideo();
        localStorage.setItem('videoPlayed', 'true');
        DOM.authModal.style.display = 'none';
    } else {
        DOM.authModal.style.display = 'none';
    }
});
