const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameState = {
    lives: 3,
    score: 0,
    gameOver: false,
    paused: false
};

const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 60,
    height: 60,
    speed: 8,
    defaultImageL: new Image(),
    defaultImageR: new Image(),
    imageLeft: new Image(),
    imageRight: new Image(),
    direction: 'right', // Default direction
    isCatching: false, // Track if player is catching a character
    catchTimer: 0 // Timer to control how long the catching state lasts
};

// Load player images
player.defaultImageL.src = 'a1.jpeg'; 
player.defaultImageR.src = 'd1.jpeg'; 
player.imageLeft.src = 'catch_l.jpeg'; 
player.imageRight.src = 'catch_r.jpeg'; 

// Falling characters array
let fallingCharacters = [];

// Character types with images
const characterTypes = {
    healing: { name: 'Alteyah', image: new Image(), effect: 'heal' },
    poison: { name: 'Thea', image: new Image(), effect: 'poison' },
    points: { name: 'Meljah', image: new Image(), effect: 'points' },
    random: { name: 'Lloyd', image: new Image(), effect: 'random' }
};

// Load character images
characterTypes.healing.image.src = 'https://placehold.co/40x40/27ae60/ffffff/png?text=Alteyah';
characterTypes.poison.image.src = 'https://placehold.co/40x40/e74c3c/ffffff/png?text=Thea';
characterTypes.points.image.src = 'https://placehold.co/40x40/f39c12/ffffff/png?text=Meljah';
characterTypes.random.image.src = 'https://placehold.co/40x40/9b59b6/ffffff/png?text=Lloyd';

// Wait for all images to load before starting the game
let imagesLoaded = 0;
const totalImages = 7; // Player (3 images: default, left, right) + 4 character types

function checkImagesLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        updateUI();
        gameLoop();
    }
}

player.defaultImageL.onload = checkImagesLoaded;
player.defaultImageR.onload = checkImagesLoaded;
player.imageLeft.onload = checkImagesLoaded;
player.imageRight.onload = checkImagesLoaded;
characterTypes.healing.image.onload = checkImagesLoaded;
characterTypes.poison.image.onload = checkImagesLoaded;
characterTypes.points.image.onload = checkImagesLoaded;
characterTypes.random.image.onload = checkImagesLoaded;

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
        image: character.image,
        name: character.name,
        effect: character.effect
    });
}

function drawPlayer() {
    let currentImage;
    if (player.isCatching) {
        currentImage = player.direction === 'left' ? player.imageLeft : player.imageRight;
    } else {
        currentImage = player.direction === 'left' ? player.defaultImageL : player.defaultImageR;
    }
    ctx.drawImage(currentImage, player.x, player.y, player.width, player.height);

    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sir Klent', player.x + 30, player.y - 5);
}

function drawFallingCharacters() {
    fallingCharacters.forEach(char => {
        // Draw character image
        ctx.drawImage(char.image, char.x, char.y, char.width, char.height);
        
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
        player.direction = 'left'; // Update direction to left
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
        player.direction = 'right'; // Update direction to right
    }

    // Update catch timer
    if (player.isCatching) {
        player.catchTimer--;
        if (player.catchTimer <= 0) {
            player.isCatching = false;
        }
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
    // Set catching state
    player.isCatching = true;
    player.catchTimer = 30; // Show catching image for 0.5 seconds (30 frames at 60 FPS)

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
    player.direction = 'right'; // Reset direction
    player.isCatching = false; // Reset catching state
    player.catchTimer = 0;
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