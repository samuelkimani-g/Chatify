// script.js
document.addEventListener("DOMContentLoaded", () => {
    // ================ DOM Elements ================
    const DOM = {
        sidebar: document.querySelector(".sidebar"),
        chatContainer: document.querySelector(".chat-container"),
        sidebarToggle: document.getElementById("sidebar-toggle"),
        messageInput: document.getElementById("message-input"),
        sendBtn: document.getElementById("send-btn"),
        messagesContainer: document.querySelector(".messages"),
        typingIndicator: document.querySelector(".typing-indicator"),
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
        const { Picker } = await import("https://cdn.jsdelivr.net/npm/@emoji-mart/react");
        state.emojiPicker = new Picker({
            data: await import("https://cdn.jsdelivr.net/npm/@emoji-mart/data"),
            onEmojiSelect: (emoji) => {
                DOM.messageInput.value += emoji.native;
                messageEffects.sparkle(DOM.emojiBtn);
            },
            theme: state.currentTheme,
            position: "top-end"
        });
        
        DOM.emojiBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            state.emojiPicker.togglePicker();
        });

        document.addEventListener("click", closeEmojiPicker);
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
                    <span class="timestamp">${new Date().toLocaleTimeString()}</span>
                </div>
            `;
            return message;
        },

        add: (text, isUser) => {
            const message = messageHandler.create(text, isUser);
            DOM.messagesContainer.appendChild(message);
            messageHandler.save(text, isUser);
            messageHandler.animate(message);
            DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
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
                messageHandler.add(messageCipher.decrypt(msg.text), msg.isUser);
            });
        }
    };

    // ================ Event Handlers ================
    
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

    function sendMessage() {
        const text = DOM.messageInput.value.trim();
        if (!text) return;

        messageHandler.add(text, true);
        DOM.messageInput.value = "";
        messageEffects.float(DOM.sendBtn);
        
        // Simulate bot response
        clearTimeout(state.botResponseTimeout);
        state.botResponseTimeout = setTimeout(() => {
            const response = state.BOT_RESPONSES[Math.floor(Math.random() * state.BOT_RESPONSES.length)];
            messageHandler.add(response, false);
            notificationSystem.show("New message received", "success");
        }, 1500);
    }

    // Theme Toggle
    DOM.themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        state.currentTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
        localStorage.setItem("theme", state.currentTheme);
        DOM.themeToggle.innerHTML = state.currentTheme === "light" 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
    });

    // Game Handling
    DOM.gameTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        DOM.chatArea.style.display = "none";
        DOM.gameContainer.style.display = "block";
        notificationSystem.show("Game mode activated!", "game");
    });

    DOM.exitGameBtn.addEventListener("click", () => {
        DOM.chatArea.style.display = "block";
        DOM.gameContainer.style.display = "none";
        notificationSystem.show("Welcome back to chat!", "info");
    });

    // ================ Initialization ================
    
    // Load initial state
    const initializeApp = () => {
        messageHandler.load();
        DOM.themeToggle.innerHTML = state.currentTheme === "light" 
            ? '<i class="fa-solid fa-sun"></i>' 
            : '<i class="fa-solid fa-moon"></i>';
        document.body.classList.toggle("light-mode", state.currentTheme === "light");
        initEmojiPicker();
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
        50% { filter: drop-shadow(0 0 10px rgba(255,255,255,0.8)); }
        100% { filter: drop-shadow(0 0 5px rgba(255,255,255,0)); }
    }

    .notification.game {
        background: linear-gradient(45deg, #ff6b6b, #ff8e53);
        border: 2px solid #ff4757;
    }
`;
document.head.appendChild(style);

// ================ SCROLL MANAGEMENT ================
const scrollManager = {
    // Auto-scroll to bottom when new message arrives
    autoScroll: () => {
        const messagesContainer = DOM.messagesContainer;
        const isAtBottom = 
            messagesContainer.scrollHeight - messagesContainer.clientHeight <= 
            messagesContainer.scrollTop + 50;

        if (isAtBottom) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    },

    // Smooth scroll to specific position
    smoothScroll: (position) => {
        DOM.messagesContainer.scrollTo({
            top: position,
            behavior: 'smooth'
        });
    },

    // Scroll to bottom button
    initScrollButton: () => {
        const scrollBtn = document.createElement('div');
        scrollBtn.className = 'scroll-down-btn hidden';
        scrollBtn.innerHTML = '▼';
        
        scrollBtn.addEventListener('click', () => {
            scrollManager.smoothScroll(DOM.messagesContainer.scrollHeight);
        });

        document.body.appendChild(scrollBtn);

        // Show/hide button based on scroll position
        DOM.messagesContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = DOM.messagesContainer;
            const scrollBottom = scrollHeight - (scrollTop + clientHeight);
            scrollBtn.classList.toggle('hidden', scrollBottom < 100);
        });
    }
};