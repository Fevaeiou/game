const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    lives: 3,
    score: 0,
    gameOver: false,
    paused: false
};

// Player object (Sir Klent)
const player = {
    x: canvas.width / 2 - 30,
    y: canvas.height - 80,
    width: 60,
    height: 60,
    speed: 8,
    color: '#3498db'
};

// Falling characters array
let fallingCharacters = [];

// Character types
const characterTypes = {
    healing: { name: 'Alteyah', color: '#27ae60', effect: 'heal' },
    poison: { name: 'Thea', color: '#e74c3c', effect: 'poison' },
    points: { name: 'Meljah', color: '#f39c12', effect: 'points' },
    random: { name: 'Lloyd', color: '#9b59b6', effect: 'random' }
};

// Input handling
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Character spawning
function spawnCharacter() {
    const types = Object.keys(characterTypes);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const character = characterTypes[randomType];
    
    fallingCharacters.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: Math.random() * 3 + 2,
        type: randomType,
        color: character.color,
        name: character.name,
        effect: character.effect
    });
}

// Draw functions
function drawPlayer() {
    // Draw Sir Klent as a simple character
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Add face
    ctx.fillStyle = '#fff';
    ctx.fillRect(player.x + 15, player.y + 15, 8, 8); // left eye
    ctx.fillRect(player.x + 37, player.y + 15, 8, 8); // right eye
    
    ctx.fillStyle = '#333';
    ctx.fillRect(player.x + 17, player.y + 17, 4, 4); // left pupil
    ctx.fillRect(player.x + 39, player.y + 17, 4, 4); // right pupil
    
    // Smile
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(player.x + 30, player.y + 35, 10, 0, Math.PI);
    ctx.stroke();
    
    // Name label
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sir Klent', player.x + 30, player.y - 5);
}

function drawFallingCharacters() {
    fallingCharacters.forEach(char => {
        // Draw character body
        ctx.fillStyle = char.color;
        ctx.fillRect(char.x, char.y, char.width, char.height);
        
        // Add simple face
        ctx.fillStyle = '#fff';
        ctx.fillRect(char.x + 8, char.y + 8, 6, 6); // left eye
        ctx.fillRect(char.x + 26, char.y + 8, 6, 6); // right eye
        
        ctx.fillStyle = '#333';
        ctx.fillRect(char.x + 10, char.y + 10, 2, 2); // left pupil
        ctx.fillRect(char.x + 28, char.y + 10, 2, 2); // right pupil
        
        // Expression based on type
        if (char.effect === 'poison') {
            // Frown
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(char.x + 20, char.y + 28, 6, Math.PI, 0);
            ctx.stroke();
        } else {
            // Smile
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(char.x + 20, char.y + 25, 6, 0, Math.PI);
            ctx.stroke();
        }
        
        // Name label
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(char.name, char.x + 20, char.y - 3);
    });
}

function drawBackground() {
    // Sky gradient is already in CSS, add some clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    
    // Simple cloud shapes
    for (let i = 0; i < 3; i++) {
        const x = (i * 250) + 50;
        const y = 50 + (i * 30);
        
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Game logic
function updatePlayer() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x = Math.max(0, player.x - player.speed);
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
    }
}

function updateFallingCharacters() {
    for (let i = fallingCharacters.length - 1; i >= 0; i--) {
        const char = fallingCharacters[i];
        char.y += char.speed;
        
        // Check collision with player
        if (char.x < player.x + player.width &&
            char.x + char.width > player.x &&
            char.y < player.y + player.height &&
            char.y + char.height > player.y) {
            
            // Handle character effect
            handleCharacterEffect(char);
            fallingCharacters.splice(i, 1);
            continue;
        }
        
        // Remove if off screen
        if (char.y > canvas.height) {
            fallingCharacters.splice(i, 1);
        }
    }
}

function handleCharacterEffect(char) {
    switch (char.effect) {
        case 'heal':
            if (gameState.lives < 3) {
                gameState.lives++;
                showEffect('❤️ +1 Life!', '#27ae60');
            }
            gameState.score += 50;
            break;
            
        case 'poison':
            gameState.lives--;
            showEffect('💀 -1 Life!', '#e74c3c');
            if (gameState.lives <= 0) {
                endGame();
            }
            break;
            
        case 'points':
            gameState.score += 100;
            showEffect('⭐ +100 Points!', '#f39c12');
            break;
            
        case 'random':
            if (Math.random() < 0.5) {
                // Heal
                if (gameState.lives < 3) {
                    gameState.lives++;
                    showEffect('🎲 Lucky! +1 Life!', '#9b59b6');
                }
                gameState.score += 25;
            } else {
                // Poison
                gameState.lives--;
                showEffect('🎲 Unlucky! -1 Life!', '#9b59b6');
                if (gameState.lives <= 0) {
                    endGame();
                }
            }
            break;
    }
    
    updateUI();
}

let effects = [];

function showEffect(text, color) {
    effects.push({
        text: text,
        color: color,
        x: player.x + player.width / 2,
        y: player.y - 20,
        life: 60,
        maxLife: 60
    });
}

function updateEffects() {
    for (let i = effects.length - 1; i >= 0; i--) {
        const effect = effects[i];
        effect.y -= 2;
        effect.life--;
        
        if (effect.life <= 0) {
            effects.splice(i, 1);
        }
    }
}

function drawEffects() {
    effects.forEach(effect => {
        const alpha = effect.life / effect.maxLife;
        ctx.fillStyle = effect.color;
        ctx.globalAlpha = alpha;
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(effect.text, effect.x, effect.y);
        ctx.globalAlpha = 1;
    });
}

function updateUI() {
    document.getElementById('lives').textContent = gameState.lives;
    document.getElementById('score').textContent = gameState.score;
}

function endGame() {
    gameState.gameOver = true;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').style.display = 'block';
}

function restartGame() {
    gameState.lives = 3;
    gameState.score = 0;
    gameState.gameOver = false;
    fallingCharacters = [];
    effects = [];
    player.x = canvas.width / 2 - 30;
    document.getElementById('gameOver').style.display = 'none';
    updateUI();
}

// Game loop
let lastSpawn = 0;
const spawnInterval = 1500; // Spawn every 1.5 seconds

function gameLoop() {
    if (!gameState.gameOver) {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        drawBackground();
        
        // Update game objects
        updatePlayer();
        updateFallingCharacters();
        updateEffects();
        
        // Spawn new characters
        const now = Date.now();
        if (now - lastSpawn > spawnInterval) {
            spawnCharacter();
            lastSpawn = now;
        }
        
        // Draw everything
        drawPlayer();
        drawFallingCharacters();
        drawEffects();
    }
    
    requestAnimationFrame(gameLoop);
}

// Initialize game
updateUI();
gameLoop();