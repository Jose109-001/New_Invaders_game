// Space Invaders Game - JavaScript Version
// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game State
let gameRunning = true;
let gamePaused = false;
let score = 0;

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 30,
    speed: 7,
    color: '#00ffff'
};

// Bullet
const bullet = {
    x: 0,
    y: 0,
    width: 4,
    height: 20,
    speed: 10,
    color: '#ffff00',
    active: false
};

// Aliens
const aliens = [];
const alienConfig = {
    rows: 4,
    cols: 8,
    width: 30,
    height: 30,
    padding: 20,
    offsetX: 80,
    offsetY: 80,
    speed: 2,
    direction: 1,
    dropAmount: 30
};

// Barriers
const barriers = [];
const barrierBlocks = [];

// Initialize Aliens
function createAliens() {
    aliens.length = 0;
    for (let row = 0; row < alienConfig.rows; row++) {
        for (let col = 0; col < alienConfig.cols; col++) {
            aliens.push({
                x: alienConfig.offsetX + col * (alienConfig.width + alienConfig.padding),
                y: alienConfig.offsetY + row * (alienConfig.height + alienConfig.padding),
                width: alienConfig.width,
                height: alienConfig.height,
                alive: true,
                color: '#00ff00'
            });
        }
    }
}

// Initialize Barriers
function createBarriers() {
    barrierBlocks.length = 0;
    const barrierPositions = [150, 350, 550];
    const blockSize = 10;
    const rows = 3;
    const cols = 7;

    barrierPositions.forEach(centerX => {
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                barrierBlocks.push({
                    x: centerX + (col - Math.floor(cols / 2)) * (blockSize + 2),
                    y: canvas.height - 200 + row * (blockSize + 2),
                    width: blockSize,
                    height: blockSize,
                    alive: true,
                    color: '#ffffff'
                });
            }
        }
    });
}

// Draw Functions
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.x + player.width / 2, player.y);
    ctx.lineTo(player.x, player.y + player.height);
    ctx.lineTo(player.x + player.width, player.y + player.height);
    ctx.closePath();
    ctx.fill();
}

function drawAliens() {
    aliens.forEach(alien => {
        if (alien.alive) {
            ctx.fillStyle = alien.color;
            ctx.beginPath();
            ctx.arc(alien.x + alien.width / 2, alien.y + alien.height / 2, alien.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    });
}

function drawBullet() {
    if (bullet.active) {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}

function drawBarriers() {
    barrierBlocks.forEach(block => {
        if (block.alive) {
            ctx.fillStyle = block.color;
            ctx.fillRect(block.x, block.y, block.width, block.height);
        }
    });
}

function drawScore() {
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 20, 30);
}

function drawBorder() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
}

// Movement and Game Logic
function movePlayer(direction) {
    if (!gameRunning || gamePaused) return;
    
    player.x += direction * player.speed;
    
    // Boundaries
    if (player.x < 20) player.x = 20;
    if (player.x > canvas.width - player.width - 20) {
        player.x = canvas.width - player.width - 20;
    }
}

function fireBullet() {
    if (!gameRunning || gamePaused) return;
    
    if (!bullet.active) {
        bullet.active = true;
        bullet.x = player.x + player.width / 2 - bullet.width / 2;
        bullet.y = player.y;
    }
}

function moveBullet() {
    if (bullet.active) {
        bullet.y -= bullet.speed;
        
        // Check if bullet is off screen
        if (bullet.y < 0) {
            bullet.active = false;
        }
    }
}

function moveAliens() {
    let shouldDrop = false;
    
    // Move aliens horizontally
    aliens.forEach(alien => {
        if (alien.alive) {
            alien.x += alienConfig.speed * alienConfig.direction;
            
            // Check boundaries
            if (alien.x <= 20 || alien.x >= canvas.width - alien.width - 20) {
                shouldDrop = true;
            }
        }
    });
    
    // Drop aliens and reverse direction
    if (shouldDrop) {
        alienConfig.direction *= -1;
        aliens.forEach(alien => {
            if (alien.alive) {
                alien.y += alienConfig.dropAmount;
            }
        });
    }
}

// Collision Detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function checkBulletCollisions() {
    if (!bullet.active) return;
    
    // Check alien collisions
    aliens.forEach(alien => {
        if (alien.alive && checkCollision(bullet, alien)) {
            alien.alive = false;
            bullet.active = false;
            score += 10;
            
            // Check if all aliens destroyed
            if (aliens.every(a => !a.alive)) {
                gameWin();
            }
        }
    });
    
    // Check barrier collisions
    barrierBlocks.forEach(block => {
        if (block.alive && checkCollision(bullet, block)) {
            block.alive = false;
            bullet.active = false;
        }
    });
}

function checkAlienPlayerCollision() {
    aliens.forEach(alien => {
        if (alien.alive) {
            // Check if alien reached player
            if (alien.y + alien.height >= player.y) {
                gameOver('ALIENS GOT YOU!');
            }
            
            // Check if alien reached bottom
            if (alien.y >= canvas.height - 100) {
                gameOver('EARTH INVADED!');
            }
        }
    });
}

function checkAlienBarrierCollisions() {
    aliens.forEach(alien => {
        if (alien.alive) {
            barrierBlocks.forEach(block => {
                if (block.alive && checkCollision(alien, block)) {
                    block.alive = false;
                }
            });
        }
    });
}

// Game Over and Win
function gameOver(message) {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

function gameWin() {
    gameRunning = false;
    document.getElementById('winScore').textContent = score;
    document.getElementById('winScreen').style.display = 'block';
}

function restartGame() {
    // Reset game state
    gameRunning = true;
    gamePaused = false;
    score = 0;
    
    // Reset player
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 80;
    
    // Reset bullet
    bullet.active = false;
    
    // Reset alien speed
    alienConfig.speed = 2;
    alienConfig.direction = 1;
    
    // Recreate aliens and barriers
    createAliens();
    createBarriers();
    
    // Hide game over screens
    document.getElementById('gameOverScreen').style.display = 'none';
    document.getElementById('winScreen').style.display = 'none';
    
    // Restart game loop
    gameLoop();
}

// Keyboard Controls
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        fireBullet();
    }
    
    if (e.key.toLowerCase() === 'p') {
        gamePaused = !gamePaused;
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game Loop
function gameLoop() {
    if (!gameRunning) return;
    
    if (!gamePaused) {
        // Clear canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        drawBorder();
        
        // Handle continuous key presses
        if (keys['ArrowLeft']) movePlayer(-1);
        if (keys['ArrowRight']) movePlayer(1);
        
        // Update game objects
        moveBullet();
        moveAliens();
        
        // Check collisions
        checkBulletCollisions();
        checkAlienPlayerCollision();
        checkAlienBarrierCollisions();
        
        // Draw everything
        drawBarriers();
        drawAliens();
        drawPlayer();
        drawBullet();
        drawScore();
    } else {
        // Draw pause message
        ctx.fillStyle = '#ffffff';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Initialize and Start Game
function initGame() {
    createAliens();
    createBarriers();
    gameLoop();
}

// Start the game when page loads
initGame();
