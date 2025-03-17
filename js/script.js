class ChatifyApp {
  constructor() {
      this.DOM = {};
      this.state = {
          currentUser: null,
          activeChat: 'general',
          messages: [],
          users: [],
          theme: localStorage.getItem('theme') || 'dark'
      };
      this.socket = io();
      this.initDOM();
      this.initAuth();
      this.initEvents();
      this.initEmojiPicker();
      this.loadMessages();
      this.loadUsers();
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
          gameContainer: $('#game-container'),
          exitGameBtn: $('#exit-game')
      };
  }

  async initAuth() {
      const authCheck = await this.checkAuth();
      if (!authCheck) {
          $('#auth-modal').show();
          this.DOM.messageInput.prop('disabled', true);
          this.DOM.sendBtn.prop('disabled', true);
      }
  }

  async checkAuth() {
      const response = await fetch('/api/auth/check');
      return response.ok;
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
          return true;
      }
      return false;
  }

  async loadUsers() {
      const response = await fetch('/api/users');
      this.state.users = await response.json();
      this.renderUserList();
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
      // Theme toggle
      this.DOM.themeToggle.on('click', () => {
          const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
          this.setTheme(newTheme);
      });

      // Message sending
      this.DOM.sendBtn.on('click', () => this.sendMessage());
      this.DOM.messageInput.on('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              this.sendMessage();
          }
      });

      // User list interactions
      $(document).on('click', '.user-item', (e) => {
          const userId = $(e.target).closest('.user-item').data('user');
          this.switchChat(userId);
      });

      // Game toggle
      this.DOM.gameTrigger.on('click', (e) => {
          e.preventDefault();
          this.showGame();
      });

      this.DOM.exitGameBtn.on('click', () => this.showChat());
      
      // Logout
      $('#logout-btn').on('click', async () => {
          await fetch('/api/auth/logout');
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

      // Encrypt message
      const encrypted = btoa(unescape(encodeURIComponent(text)));
      
      // Send via Socket.IO
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

  showGame() {
      this.DOM.chatArea.hide();
      this.DOM.gameContainer.show();
      if (typeof initGame === 'function') initGame();
  }

  showChat() {
      this.DOM.gameContainer.hide();
      this.DOM.chatArea.show();
  }

  initEmojiPicker() {
      // Emoji picker implementation
      this.DOM.emojiBtn.on('click', () => {
          // Integrate emoji picker library here
      });
  }
}

// Socket.IO event handlers
const app = new ChatifyApp();

socket.on('user list', (users) => {
  app.state.users = users;
  app.renderUserList();
});

socket.on('private message', (message) => {
  const decrypted = decodeURIComponent(escape(atob(message.content)));
  app.addMessage(decrypted, false);
});

// Document ready
$(async () => {
  await app.initAuth();
  $('#login-btn').on('click', async () => app.login());
});