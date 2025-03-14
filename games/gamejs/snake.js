// script.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const GRID_SIZE = 20;
const SPEED = 80; // Lower = faster
const SNAKE_COLOR = '#00ffff';
const FOOD_COLOR = '#ff00ff';

let snake = [{ x: 200, y: 200 }];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let gameOver = false;
let gameLoop;

// Initialize game
function init() {
  snake = [{ x: 200, y: 200 }];
  direction = { x: GRID_SIZE, y: 0 };
  score = 0;
  placeFood();
  gameOver = false;
  document.getElementById('gameOverScreen').style.display = 'none';
  gameLoop = setInterval(update, SPEED);
}

// Place food randomly
function placeFood() {
  food.x = Math.floor(Math.random() * (canvas.width / GRID_SIZE)) * GRID_SIZE;
  food.y = Math.floor(Math.random() * (canvas.height / GRID_SIZE)) * GRID_SIZE;
}

// Draw a glowing block
function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = '#00ffff';
  ctx.lineWidth = 2;
  
  // Gradient effect
  const gradient = ctx.createRadialGradient(
    x + GRID_SIZE/2, y + GRID_SIZE/2, 0,
    x + GRID_SIZE/2, y + GRID_SIZE/2, GRID_SIZE
  );
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, '#00ffff');
  ctx.fillStyle = gradient;
  
  ctx.fillRect(x, y, GRID_SIZE, GRID_SIZE);
  ctx.strokeRect(x, y, GRID_SIZE, GRID_SIZE);
}

// Draw snake with trail effect
function drawSnake() {
  snake.forEach((segment, index) => {
    ctx.save();
    ctx.globalAlpha = 1 - (index / snake.length) * 0.5;
    drawBlock(segment.x, segment.y, SNAKE_COLOR);
    ctx.restore();
  });
}

// Draw pulsating food
function drawFood() {
  ctx.save();
  ctx.shadowBlur = 20;
  ctx.shadowColor = FOOD_COLOR;
  drawBlock(food.x, food.y, FOOD_COLOR);
  ctx.restore();
}

// Update game state
function update() {
  if (gameOver) return;

  // Move snake
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Check collisions
  if (
    head.x < 0 || head.x >= canvas.width ||
    head.y < 0 || head.y >= canvas.height ||
    snake.some(segment => segment.x === head.x && segment.y === head.y)
  ) {
    gameOver = true;
    clearInterval(gameLoop);
    document.getElementById('gameOverScreen').style.display = 'block';
    return;
  }

  snake.unshift(head);

  // Check food collision
  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById('score').textContent = score;
    placeFood();
    // Add particle effect
    createParticles(food.x, food.y);
  } else {
    snake.pop();
  }

  // Clear canvas with gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#191970');
  gradient.addColorStop(1, '#1a1a40');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawSnake();
  drawFood();
}

// Particle effect
function createParticles(x, y) {
  const particles = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      x: x + GRID_SIZE/2,
      y: y + GRID_SIZE/2,
      size: Math.random() * 3 + 1,
      speedX: (Math.random() - 0.5) * 4,
      speedY: (Math.random() - 0.5) * 4,
      color: `hsl(${Math.random() * 360}, 100%, 50%)`
    });
  }

  function animateParticles() {
    particles.forEach((particle, index) => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.size *= 0.95;

      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      if (particle.size < 0.1) particles.splice(index, 1);
    });

    if (particles.length > 0) requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// Handle keyboard input
document.addEventListener('keydown', e => {
  switch(e.key) {
    case 'ArrowUp':
      if (direction.y === 0) direction = { x: 0, y: -GRID_SIZE };
      break;
    case 'ArrowDown':
      if (direction.y === 0) direction = { x: 0, y: GRID_SIZE };
      break;
    case 'ArrowLeft':
      if (direction.x === 0) direction = { x: -GRID_SIZE, y: 0 };
      break;
    case 'ArrowRight':
      if (direction.x === 0) direction = { x: GRID_SIZE, y: 0 };
      break;
    case 'r':
      init();
      break;
  }
});

// Start screen interaction
document.getElementById('startScreen').addEventListener('click', () => {
  document.getElementById('startScreen').style.display = 'none';
  init();
});

// Initialize canvas size
function resizeCanvas() {
  canvas.width = 600;
  canvas.height = 400;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Initial start screen
document.getElementById('startScreen').style.display = 'flex';
