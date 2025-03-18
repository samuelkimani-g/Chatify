class ChatifyApp {
    constructor() {
        this.state = {
            currentUser: null,
            activeChat: 'general',
            users: [],
            theme: localStorage.getItem('theme') || 'dark',
            typingUsers: {}
        };

        this.socket = io();
        this.initDOM();
        this.initAuth();
        this.initEvents();
    }

    initDOM() {
        this.DOM = {
            sidebar: $('.sidebar'),
            messagesContainer: $('#messages-container'),
            messageInput: $('#message-input'),
            sendBtn: $('#send-btn'),
            emojiBtn: $('#emoji-btn'),
            userList: $('#user-list'),
            themeToggle: $('#theme-toggle'),
            typingIndicator: $('#typing-indicator'),
            loginModal: $('#auth-modal'),
            loginBtn: $('#login-btn'),
            usernameInput: $('#username')
        };
    }

    async initAuth() {
        try {
            const response = await fetch('/api/auth/check');
            if (!response.ok) throw new Error();
            const data = await response.json();
            this.state.currentUser = data.user.name;
            this.DOM.loginModal.hide();
            this.loadUsers();
        } catch (error) {
            this.showAuthModal();
        }
    }

    showAuthModal() {
        this.DOM.loginModal.show();
        this.DOM.messageInput.prop('disabled', true);
        this.DOM.sendBtn.prop('disabled', true);
    }

    async login() {
        const username = this.DOM.usernameInput.val().trim();
        if (!username) return;
    
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
        });
    
        if (response.ok) {
            const data = await response.json();
            this.state.currentUser = data.user.name;
            localStorage.setItem('token', data.token);
            this.DOM.loginModal.hide();
            this.DOM.messageInput.prop('disabled', false);
            this.DOM.sendBtn.prop('disabled', false);
            this.loadUsers();
        } else {
            console.error("Login failed");
        }
    }

    async loadUsers() {
        try {
            const response = await fetch('/api/users');
            const users = await response.json();
            this.updateUserList(users);
        } catch (error) {
            console.error("Error loading users:", error);
        }
    }

    updateUserList(users) {
        this.state.users = users;
        this.DOM.userList.html(users.map(user => `
            <li class="user-item ${user.online ? 'online' : ''}" data-user="${user.id}">
                <div class="user-avatar">${user.name[0]}</div>
                <div class="user-info">
                    <span>${user.name}</span>
                </div>
            </li>
        `).join(''));
    }

    initEvents() {
        this.DOM.themeToggle.on('click', () => this.toggleTheme());
        this.DOM.sendBtn.on('click', () => this.sendMessage());
        this.DOM.messageInput.on('keypress', (e) => this.handleTyping(e));
        this.DOM.userList.on('click', '.user-item', (e) => this.switchChat($(e.currentTarget).data('user')));
        this.DOM.loginBtn.on('click', () => this.login());

        $('#logout-btn').on('click', () => {
            localStorage.removeItem('token');
            location.reload();
        });
    }

    toggleTheme() {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.state.theme = newTheme;
        localStorage.setItem('theme', newTheme);
        document.body.classList.toggle('light-mode', newTheme === 'light');
    }

    sendMessage() {
        const text = this.DOM.messageInput.val().trim();
        if (!text) return;

        this.socket.emit('private message', {
            senderId: this.state.currentUser,
            receiverId: this.state.activeChat,
            message: text
        });

        this.addMessage(text, true);
        this.DOM.messageInput.val('');
    }

    receiveMessage(message) {
        this.addMessage(message.message, false);
    }

    addMessage(text, isUser) {
        this.DOM.messagesContainer.append(`
            <div class="message ${isUser ? 'sent' : 'received'}">
                <div class="message-content">
                    ${text}
                    <span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        `).scrollTop(this.DOM.messagesContainer[0].scrollHeight);
    }

    handleTyping(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        } else {
            this.socket.emit('typing', { user: this.state.currentUser, chat: this.state.activeChat });
        }
    }

    showTypingIndicator(data) {
        if (data.chat === this.state.activeChat) {
            this.DOM.typingIndicator.text(`${data.user} is typing...`).show();
            setTimeout(() => this.DOM.typingIndicator.hide(), 2000);
        }
    }

    switchChat(userId) {
        this.state.activeChat = userId;
        $('.user-item').removeClass('active');
        $(`.user-item[data-user="${userId}"]`).addClass('active');
        this.socket.emit('join chat', userId);
    }
}

// Initialize app
$(document).ready(() => {
    new ChatifyApp();
});
