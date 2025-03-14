document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements
    const sidebar = document.querySelector(".sidebar");
    const chatContainer = document.querySelector(".chat-container");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const messageInput = document.getElementById("message-input");
    const sendButton = document.getElementById("send-btn");
    const messagesContainer = document.querySelector(".messages");
    const typingIndicator = document.querySelector(".typing-indicator");
    const themeToggle = document.getElementById("theme-toggle");
    
    // State
    let typingTimeout;
    const MAX_MESSAGES = 100;
    const BOT_RESPONSES = [
        "Interesting!",
        "Tell me more about that",
        "I understand",
        "How does that make you feel?",
        "Can you elaborate?",
    ];

    // Sidebar Toggle
    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("collapsed");
        chatContainer.classList.toggle("full-width");
        saveSidebarState();
    });

    // Message Handling
    function addMessage(text, isUser = true) {
        const messageDiv = document.createElement("div");
        const timestamp = new Date().toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit'
        });

        messageDiv.className = `message ${isUser ? 'sent' : 'received'}`;
        
        if (!isUser) {
            messageDiv.innerHTML = `
                <img src="images/bot-avatar.png" class="avatar" alt="Bot Avatar">
                <div class="message-content">
                    ${text}
                    <span class="timestamp">${timestamp}</span>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${text}
                    <span class="timestamp">${timestamp}</span>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
    }

    function handleSendMessage() {
        const text = messageInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        saveMessage(text, true);
        messageInput.value = "";
        typingIndicator.style.display = "none";
        
        // Simulate bot response
        setTimeout(() => {
            const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            addMessage(response, false);
            saveMessage(response, false);
        }, 1000);
    }

    // Storage Handling
    function saveMessage(text, isUser) {
        const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.push({
            text,
            isUser,
            timestamp: new Date().toISOString()
        });
        
        if (messages.length > MAX_MESSAGES) {
            messages.splice(0, messages.length - MAX_MESSAGES);
        }
        
        localStorage.setItem("chatMessages", JSON.stringify(messages));
    }

    function loadMessages() {
        const messages = JSON.parse(localStorage.getItem("chatMessages")) || [];
        messages.forEach(msg => addMessage(msg.text, msg.isUser));
    }

    function saveSidebarState() {
        localStorage.setItem("sidebarState", 
            sidebar.classList.contains("collapsed") ? "collapsed" : "expanded"
        );
    }

    function loadSidebarState() {
        const state = localStorage.getItem("sidebarState");
        if (state === "collapsed") {
            sidebar.classList.add("collapsed");
            chatContainer.classList.add("full-width");
        }
    }
    function showNotification(message) {
        const notification = document.getElementById("notification");
        const notificationText = document.getElementById("notification-text");
        notificationText.textContent = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000); // Hide after 3 seconds
    }

    // Add to your existing script.js

// Toggle between chat and game views
document.getElementById('game-trigger').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('chat-area').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initGame(); // Initialize the game
  });
  
  // Game variables
  let snakeGameActive = false;
  
  // Initialize game (called when switching to game view)
  function initGame() {
    if (snakeGameActive) return;
    snakeGameActive = true;
  
    // Your existing snake game code here
    // (Copy the JavaScript code from the previous implementation)
  }
    
    // Example usage
    showNotification("New message received!");

    // Theme Toggle
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
    });
    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light-mode");
    }
    // Particle Animation
    function createParticles() {
        const particlesContainer = document.createElement("div");
        particlesContainer.className = "particles";
        document.body.appendChild(particlesContainer);

        for (let i = 0; i < 50; i++) {
            const particle = document.createElement("div");
            particle.className = "particle";
            particle.style.width = `${Math.random() * 10 + 5}px`;
            particle.style.height = particle.style.width;
            particle.style.left = `${Math.random() * 100}vw`;
            particle.style.top = `${Math.random() * 100}vh`;
            particle.style.animationDuration = `${Math.random() * 5 + 3}s`;
            particlesContainer.appendChild(particle);
        }
    }

    //show/hide thespinner
    function showLoadingSpinner() {
        document.getElementById("loading-spinner").style.display = "flex";
    }
    
    function hideLoadingSpinner() {
        document.getElementById("loading-spinner").style.display = "none";
    }
    
    // Example usage
    document.addEventListener("DOMContentLoaded", () => {
        showLoadingSpinner();
        setTimeout(() => {
            hideLoadingSpinner();
        }, 2000); // Simulate a 2-second loading time
    });

    // Event Listeners
    messageInput.addEventListener("input", () => {
        typingIndicator.style.display = "block";
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            typingIndicator.style.display = "none";
        }, 1000);
    });

    messageInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    sendButton.addEventListener("click", handleSendMessage);

    // Initialization
    loadSidebarState();
    loadMessages();
    createParticles();
});