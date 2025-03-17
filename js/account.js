document.addEventListener("DOMContentLoaded", async () => {
    const DOM = {
        authModal: document.getElementById('auth-modal'),
        loginForm: document.getElementById('login-form'),
        signupForm: document.getElementById('signup-form'),
        openLoginBtn: document.getElementById('open-login-btn'),
        startChatBtn: document.querySelector('.start-chat'),
        videoContainer: document.createElement('div')
    };

    let state = {
        authToken: localStorage.getItem('chatifyToken'),
        videoPlayed: localStorage.getItem('videoPlayed') === 'true'
    };

    // Authentication Class
    class Auth {
        static async check() {
            if (!state.authToken) return false;
            const response = await fetch('/api/auth/check', {
                headers: { 'Authorization': `Bearer ${state.authToken}` }
            });
            return response.ok;
        }

        static async login(email, password) {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            return await response.json();
        }

        static async signup(name, email, password) {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            return await response.json();
        }

        static async handleLogin(e) {
            e.preventDefault();
            const email = DOM.loginForm.querySelector('#login-email').value;
            const password = DOM.loginForm.querySelector('#login-password').value;
            
            try {
                const { token } = await Auth.login(email, password);
                if (token) {
                    localStorage.setItem('chatifyToken', token);
                    await Auth.showTransitionVideo();
                    window.location.href = '/chat.html';
                }
            } catch (error) {
                alert('Login failed. Please check your credentials.');
            }
        }

        static async handleSignup(e) {
            e.preventDefault();
            const name = DOM.signupForm.querySelector('#signup-name').value;
            const email = DOM.signupForm.querySelector('#signup-email').value;
            const password = DOM.signupForm.querySelector('#signup-password').value;
            
            try {
                const { success } = await Auth.signup(name, email, password);
                if (success) {
                    localStorage.setItem('chatifyToken', 'temp_token'); // Temporary token for demo
                    await Auth.showTransitionVideo();
                    window.location.href = '/chat.html';
                }
            } catch (error) {
                alert('Signup failed. Please try again.');
            }
        }

        static async showTransitionVideo() {
            return new Promise(resolve => {
                const video = document.createElement('video');
                video.src = 'transition.mp4';
                video.style.position = 'fixed';
                video.style.top = '50%';
                video.style.left = '50%';
                video.style.transform = 'translate(-50%, -50%)';
                video.style.zIndex = '10000';
                video.style.maxWidth = '80%';
                video.autoplay = true;
                video.onended = () => {
                    document.body.removeChild(video);
                    resolve();
                };
                document.body.appendChild(video);
            });
        }

        static redirectToChat() {
            if (state.authToken) {
                window.location.href = '/chat.html';
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

    // Initialize
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