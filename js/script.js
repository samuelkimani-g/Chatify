document.addEventListener("DOMContentLoaded", () => {
  // ================ DOM Elements ================
  const DOM = {
    sidebar: document.querySelector(".sidebar"),
    chatContainer: document.querySelector(".chat-container"),
    sidebarToggle: document.getElementById("sidebar-toggle"),
    messageInput: document.getElementById("message-input"),
    sendBtn: document.getElementById("send-btn"),
    messagesContainer: document.getElementById("messages-container"),
    typingIndicator: document.getElementById("typing-indicator"),
    themeToggle: document.getElementById("theme-toggle"),
    emojiBtn: document.getElementById("emoji-btn"),
    gameTrigger: document.getElementById("game-trigger"),
    gameContainer: document.getElementById("game-container"),
    chatArea: document.getElementById("chat-area"),
    notification: document.getElementById("notification"),
    exitGameBtn: document.getElementById("exit-game")
  };

  // ================ State Management ================
  let state = {
    isTyping: false,
    lastTypingTime: 0,
    botResponseTimeout: null,
    emojiPicker: null,
    currentTheme: localStorage.getItem("theme") || "dark",
    messages: JSON.parse(localStorage.getItem("chatMessages")) || [],
    BOT_RESPONSES: [
      "Interesting! 🤔",
      "Tell me more! 💬",
      "That's fascinating! 🌟",
      "How does that make you feel? ❤️",
      "I'm listening... 👂"
    ]
  };

  // ================ Premium Features ================
  // 1. Message Encryption (Basic)
  const messageCipher = {
    encrypt: text => btoa(unescape(encodeURIComponent(text))),
    decrypt: base64 => decodeURIComponent(escape(atob(base64)))
  };

  // 2. Real-time Message Effects
  const messageEffects = {
    sparkle: element => {
      element.style.animation = "sparkle 1s ease-out";
      setTimeout(() => element.style.animation = "", 1000);
    },
    float: element => {
      element.style.transform = "translateY(-5px)";
      setTimeout(() => element.style.transform = "", 500);
    }
  };

  // 3. Advanced Notification System
  const notificationSystem = {
    show: (message, type = "info") => {
      DOM.notification.textContent = message;
      DOM.notification.className = `notification ${type}`;
      DOM.notification.style.display = "block";
      setTimeout(() => DOM.notification.style.opacity = 1, 10);
      setTimeout(notificationSystem.hide, 3000);
    },
    hide: () => {
      DOM.notification.style.opacity = 0;
      setTimeout(() => DOM.notification.style.display = "none", 300);
    }
  };

  // ================ Core Functionality ================
  // Initialize Emoji Picker
  const initEmojiPicker = async () => {
    const { Picker: EmojiPicker } = await import("https://cdn.jsdelivr.net/npm/@emoji-mart/react");
    const emojiData = await import("https://cdn.jsdelivr.net/npm/@emoji-mart/data");

    state.emojiPicker = new EmojiPicker({
      data: emojiData,
      onEmojiSelect: (emoji) => {
        DOM.messageInput.value += emoji.native;
        messageEffects.sparkle(DOM.emojiBtn);
      },
      theme: state.currentTheme === "dark" ? "dark" : "light"
    });

    // Create container for emoji picker
    const pickerContainer = document.createElement("div");
    pickerContainer.id = "emoji-picker-container";
    pickerContainer.appendChild(state.emojiPicker);
    DOM.chatContainer.appendChild(pickerContainer);

    // Toggle emoji picker visibility
    DOM.emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      pickerContainer.classList.toggle("visible");
    });

    // Close emoji picker when clicking outside
    document.addEventListener("click", (e) => {
      if (!DOM.emojiBtn.contains(e.target) && !pickerContainer.contains(e.target)) {
        pickerContainer.classList.remove("visible");
      }
    });
  };

  // Message Handling System
  const messageHandler = {
    create: (text, isUser) => {
      const message = document.createElement("div");
      message.className = `message ${isUser ? "sent" : "received"}`;
      message.innerHTML = `
        ${!isUser ? `<img src="images/bot-avatar.png" class="avatar" alt="Bot">` : ""}
        <div class="message-content">
          ${text}
          <span class="timestamp">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      `;
      return message;
    },
    add: (text, isUser) => {
      const message = messageHandler.create(text, isUser);
      DOM.messagesContainer.appendChild(message);
      messageHandler.save(text, isUser);
      messageHandler.animate(message);
      scrollManager.autoScroll();
    },
    animate: element => {
      element.style.animation = "messageAppear 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)";
      setTimeout(() => element.style.animation = "", 400);
    },
    save: (text, isUser) => {
      state.messages.push({
        text: messageCipher.encrypt(text),
        isUser,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem("chatMessages", JSON.stringify(state.messages));
    },
    load: () => {
      state.messages.forEach(msg => {
        try {
          messageHandler.add(messageCipher.decrypt(msg.text), msg.isUser);
        } catch (e) {
          messageHandler.add("[Encrypted message]", msg.isUser); // Fallback for old messages
        }
      });
    }
  };

  // ================ Scroll Management ================
  const scrollManager = {
    autoScroll: () => {
      const isAtBottom = 
        DOM.messagesContainer.scrollHeight - DOM.messagesContainer.scrollTop <= 
        DOM.messagesContainer.clientHeight + 50;
        
      if (isAtBottom) {
        DOM.messagesContainer.scrollTo({
          top: DOM.messagesContainer.scrollHeight,
          behavior: "smooth"
        });
      }
    },
    initScrollButton: () => {
      const scrollBtn = document.createElement('button');
      scrollBtn.className = 'scroll-down-btn hidden';
      scrollBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
      scrollBtn.setAttribute('aria-label', 'Scroll to latest message');
      
      scrollBtn.addEventListener('click', () => {
        scrollManager.autoScroll();
        scrollBtn.classList.add('hidden');
      });
      
      DOM.chatContainer.appendChild(scrollBtn);

      DOM.messagesContainer.addEventListener('scroll', () => {
        const { scrollTop, scrollHeight, clientHeight } = DOM.messagesContainer;
        const scrollBottom = scrollHeight - (scrollTop + clientHeight);
        scrollBtn.classList.toggle('hidden', scrollBottom < 50);
      });
    }
  };

  // ================ Send Message ================
  const sendMessage = () => {
    const text = DOM.messageInput.value.trim();
    if (!text) return;

    // Add user message
    messageHandler.add(text, true);
    DOM.messageInput.value = "";
    
    // Simulate bot response
    clearTimeout(state.botResponseTimeout);
    state.botResponseTimeout = setTimeout(() => {
      const response = state.BOT_RESPONSES[Math.floor(Math.random() * state.BOT_RESPONSES.length)];
      messageHandler.add(response, false);
      notificationSystem.show("New message received", "success");
    }, 1500);
  };

  // ================ Event Listeners ================
  // Message Input Handling
  DOM.messageInput.addEventListener("input", () => {
    state.isTyping = true;
    state.lastTypingTime = Date.now();
    DOM.typingIndicator.style.display = "flex";
    
    setTimeout(() => {
      if (Date.now() - state.lastTypingTime > 1000) {
        state.isTyping = false;
        DOM.typingIndicator.style.display = "none";
      }
    }, 1000);
  });

  // Send Message
  DOM.sendBtn.addEventListener("click", sendMessage);
  DOM.messageInput.addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Theme Toggle
  DOM.themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    state.currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
    localStorage.setItem("theme", state.currentTheme);
    
    // Update theme toggle icon
    DOM.themeToggle.innerHTML = 
      state.currentTheme === "light" 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
    
    // Update emoji picker theme
    if (state.emojiPicker) {
      state.emojiPicker.update({ theme: state.currentTheme });
    }
  });

  // Sidebar Toggle
  DOM.sidebarToggle.addEventListener("click", () => {
    DOM.sidebar.classList.toggle("collapsed");
    messageEffects.sparkle(DOM.sidebarToggle);
  });

  // Game Handling
  DOM.gameTrigger.addEventListener("click", (e) => {
    e.preventDefault();
    DOM.chatArea.style.display = "none";
    DOM.gameContainer.style.display = "block";
    notificationSystem.show("Entering game mode...", "game");
    // Initialize game (call snake.js function)
    if (typeof initGame === "function") initGame();
  });

  DOM.exitGameBtn.addEventListener("click", () => {
    DOM.gameContainer.style.display = "none";
    DOM.chatArea.style.display = "block";
    notificationSystem.show("Welcome back to chat!", "info");
  });

  // ================ Initialization ================
  const initializeApp = () => {
    messageHandler.load();
    scrollManager.initScrollButton();
    initEmojiPicker();
    
    // Set initial theme
    document.body.classList.toggle("light-mode", state.currentTheme === "light");
    DOM.themeToggle.innerHTML = 
      state.currentTheme === "light" 
        ? '<i class="fa-solid fa-sun"></i>' 
        : '<i class="fa-solid fa-moon"></i>';
  };

  initializeApp();
});

// ================ Additional CSS Animations ================
const style = document.createElement("style");
style.textContent = `
  @keyframes messageAppear {
    0% { transform: scale(0.8) translateY(20px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes sparkle {
    0% { filter: drop-shadow(0 0 5px rgba(255,255,255,0)); }
    50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.8)); }
    100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0)); }
  }
  .notification.game {
    background: linear-gradient(45deg, #ff6b6b, #ff8e53);
    border: 2px solid #ff4757;
  }
`;
document.head.appendChild(style);
// Authentication System
const auth = {
  check: async () => {
    const response = await fetch('/api/auth/check');
    return response.ok;
  },
  login: async (username) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return response.ok;
  }
};

// User Management
const userManagement = {
  userList: [],
  loadUsers: async () => {
    const response = await fetch('/api/users');
    this.userList = await response.json();
    this.renderUserList();
  },
  renderUserList: () => {
    const userList = document.getElementById('user-list');
    userList.innerHTML = this.userList.map(user => `
      <li class="user-item" data-user="${user.id}">
        <div class="user-avatar"></div>
        <div>
          <span>${user.name}</span>
          <div class="status-dot ${user.online ? 'online' : 'offline'}"></div>
        </div>
      </li>
    `).join('');
  }
};

// Chat System
const chat = {
  currentChat: null,
  sendMessage: (text, recipientId) => {
    socket.emit('private message', {
      content: text,
      to: recipientId,
      timestamp: new Date().toISOString()
    });
  },
  receiveMessage: (message) => {
    if (message.from === chat.currentChat) {
      messageHandler.add(message.content, false);
    } else {
      notificationSystem.show(`New message from ${message.fromName}`, 'message');
    }
  }
};

// Initialize App
document.addEventListener("DOMContentLoaded", async () => {
  const isAuthenticated = await auth.check();
  const authOverlay = document.getElementById('auth-overlay');
  
  if (!isAuthenticated) {
    authOverlay.style.display = 'flex';
    DOM.messageInput.disabled = true;
    DOM.sendBtn.disabled = true;
  } else {
    authOverlay.style.display = 'none';
    DOM.messageInput.disabled = false;
    DOM.sendBtn.disabled = false;
    userManagement.loadUsers();
  }

  // Login Button
  document.getElementById('login-btn').addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    if (await auth.login(username)) {
      authOverlay.style.display = 'none';
      DOM.messageInput.disabled = false;
      DOM.sendBtn.disabled = false;
      userManagement.loadUsers();
    }
  });
});