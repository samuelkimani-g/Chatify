class ChatifyApp {
    constructor() {
        this.DOM = {};
        this.state = {
            currentUser: null,
            activeChat: 'general',
            messages: [],
            users: [],
            theme: localStorage.getItem('theme') || 'dark',
            typingUsers: {}
        };
        this.socket = io(); // ✅ Fixed socket initialization
        this.initDOM();
        this.initAuth();
        this.initEvents();
        this.initEmojiPicker();
        this.loadMessages();
        this.loadUsers();

        // ✅ Moved WebSocket event listeners inside the class
        this.socket.on('user list', (users) => {
            this.state.users = users;
            this.renderUserList();
        });

        this.socket.on('private message', (message) => {
            const decrypted = decodeURIComponent(escape(atob(message.content)));
            this.addMessage(decrypted, false);
        });

        this.socket.on('typing', (data) => {
            if (data.chat === this.state.activeChat) {
                this.DOM.typingIndicator.text(`${data.user} is typing...`).show();
                setTimeout(() => this.DOM.typingIndicator.hide(), 2000);
            }
        });
    }

    initDOM() {
        this.DOM = {
            sidebar: $('.sidebar'),
            chatArea: $('#chat-area'),
            messagesContainer: $('#messages-container'),
            messageInput: $('#message-input'),
            sendBtn: $('#send-btn'),
            emojiBtn: $('#emoji-btn'),
            userList: $('#user-list'),
            themeToggle: $('#theme-toggle'),
            chatHeader: $('#chat-header'),
            typingIndicator: $('#typing-indicator')
        };
    }

    async initAuth() {
        const authCheck = await this.checkAuth();
        if (authCheck) {
            const firstTime = localStorage.getItem('firstTime');
            if (!firstTime) {
                localStorage.setItem('firstTime', 'true');
                window.location.href = "/intro.html";
            } else {
                window.location.href = "/html/chat.html";
            }
        } else {
            $('#auth-modal').show();
            this.DOM.messageInput.prop('disabled', true);
            this.DOM.sendBtn.prop('disabled', true);
        }
    }

    async checkAuth() {
        try {
            const response = await fetch('/api/auth/check');
            if (!response.ok) return false;
            const data = await response.json();
            this.state.currentUser = data.username;
            return true;
        } catch (error) {
            console.error("Auth check failed:", error);
            return false;
        }
    }

    async login() {
        const username = $('#username').val();
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });

        if (response.ok) {
            this.state.currentUser = username;
            $('#auth-modal').hide();
            this.DOM.messageInput.prop('disabled', false);
            this.DOM.sendBtn.prop('disabled', false);
            this.loadUsers();
            const firstTime = localStorage.getItem('firstTime');
            if (!firstTime) {
                localStorage.setItem('firstTime', 'true');
                window.location.href = "/html/intro.html";
            } else {
                window.location.href = "/html/chat.html";
            }
            return true;
        }
        return false;
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            this.state.users = await response.json();
            this.renderUserList();
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    renderUserList() {
        this.DOM.userList.html(this.state.users.map(user => `
            <li class="user-item ${user.online ? 'online' : ''}" data-user="${user.id}">
                <div class="user-avatar">${user.name[0]}</div>
                <div class="user-info">
                    <span>${user.name}</span>
                    <div class="status-dot"></div>
                </div>
            </li>
        `).join(''));
    }

    initEvents() {
        this.DOM.themeToggle.on('click', () => {
            const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });

        this.DOM.sendBtn.on('click', () => this.sendMessage());

        this.DOM.messageInput.on('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            } else {
                this.socket.emit('typing', { user: this.state.currentUser, chat: this.state.activeChat });
            }
        });

        $(document).on('click', '.user-item', (e) => {
            const userId = $(e.target).closest('.user-item').data('user');
            this.switchChat(userId);
        });

        $('#logout-btn').on('click', async () => {
            localStorage.removeItem('token'); // ✅ Fixed logout (no need for API call)
            location.reload();
        });
    }

    setTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem('theme', theme);
        document.body.classList.toggle('light-mode', theme === 'light');
        this.DOM.themeToggle.html(theme === 'light' 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>');
    }

    async sendMessage() {
        const text = this.DOM.messageInput.val().trim();
        if (!text) return;

        const encrypted = btoa(unescape(encodeURIComponent(text)));
        this.socket.emit('private message', {
            to: this.state.activeChat,
            content: encrypted,
            timestamp: new Date().toISOString()
        });

        this.addMessage(text, true);
        this.DOM.messageInput.val('');
    }

    addMessage(text, isUser) {
        const $message = $(`
            <div class="message ${isUser ? 'sent' : 'received'}">
                ${!isUser ? '<img src="images/bot-avatar.png" class="avatar">' : ''}
                <div class="message-content">
                    ${text}
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        `);
        this.DOM.messagesContainer.append($message);
        this.DOM.messagesContainer.scrollTop(this.DOM.messagesContainer[0].scrollHeight);
    }

    switchChat(userId) {
        this.state.activeChat = userId;
        $('.user-item').removeClass('active');
        $(`.user-item[data-user="${userId}"]`).addClass('active');
        this.socket.emit('join chat', userId);
        this.loadChatHistory(userId);
    }

    // ✅ Added missing function to prevent errors
    loadChatHistory(userId) {
        console.log(`Loading chat history for ${userId}`);
        // Implement actual chat history loading from backend here
    }

    initEmojiPicker() {
        this.DOM.emojiBtn.on('click', () => {
            // Integrate emoji picker library here
        });
    }
}

// ✅ Initialize app
const app = new ChatifyApp();

// ✅ Moved auth check inside jQuery ready function
$(async () => {
    await app.initAuth();
    $('#login-btn').on('click', async () => app.login());
});
