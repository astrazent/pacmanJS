import TileMap from "./TileMap.js";

const tileSize = 32; // Kích thước của mỗi ô trong game
const velocity = 2; // Tốc độ di chuyển của pacman và ghost

const canvas = document.getElementById("gameCanvas"); // Lấy thẻ canvas từ HTML
const ctx = canvas.getContext("2d"); // Lấy context 2d từ canvas
let tileMap = new TileMap(tileSize); // Tạo một tileMap mới
let pacman = tileMap.getPacman(velocity); // Lấy pacman từ tileMap
let enemies = tileMap.getEnemies(velocity); // Lấy danh sách ghost từ tileMap
let gameOver = false; // Biến kiểm tra game over
let gameWin = false; // Biến kiểm tra game win
let gamePause = false; // Biến kiểm tra game có đang tạm dừng không
const gameOverSound = new Audio("../sounds/gameOver.wav"); // Âm thanh game over
const gameWinSound = new Audio("../sounds/gameWin.wav"); // Âm thanh game win


function gameLoop(){ // Hàm vòng lặp game
    tileMap.draw(ctx); // Vẽ map
    drawGameEnd(ctx); // Vẽ game over hoặc game win
    pacman.draw(ctx ,pause(), enemies); // Vẽ pacman
    enemies.forEach((enemy) => { // Vẽ ghost
        enemy.draw(ctx, pause(), pacman);
    });
    checkGameOver(); // Kiểm tra game over
    checkGameWin(); // Kiểm tra game win
}

// Sự kiện click vào canvas
canvas.addEventListener("click", ()=>{
    if(gameOver || gameWin){
        resetGame();
    }
});

const buttonPauseGame = document.getElementById("pause-game"); // Lấy button pause từ HTML
buttonPauseGame.addEventListener("click", () => {
    if(gamePause){
        buttonPauseGame.innerHTML = "Pause";
        gamePause = false;
    }
    else{
        buttonPauseGame.innerHTML = "Resume";
        gamePause = true;
    }
}); // Sự kiện click vào button pause{}


// Hàm vẽ game over hoặc game win
function drawGameEnd(){
    if(gameOver || gameWin){
        let text = 'You Win!';
        if(gameOver){
            text = 'Game Over!';
        }
        ctx.fillStyle = 'black';
        ctx.fillRect(0, canvas.height/3.2, canvas.width, 80);
        ctx.font = "80px comic sans";
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop("0", "magenta");
        gradient.addColorStop("0.5", "blue");
        gradient.addColorStop("1.0", "red");

        ctx.fillStyle = gradient;
        ctx.fillText(text, 10, canvas.height/2);

    }
}

// Hàm reset game
function resetGame() {
    tileMap = null;
    pacman = null;
    enemies.forEach((enemy) => {
        enemy = null;
    });

    tileMap = new TileMap(tileSize);
    pacman = tileMap.getPacman(velocity);;
    enemies = tileMap.getEnemies(velocity);
    gameOver = false;
    gameWin = false;
}

// Hàm kiểm tra game win
function checkGameWin(){
    if(!gameWin){
        gameWin = tileMap.didGameWin();
        if(gameWin){
            gameWinSound.play();
        }
    }
}

// Hàm kiểm tra game over
function checkGameOver(){
    if(!gameOver){
        gameOver = isGameOver();
        if(gameOver){
            gameOverSound.play();
        }
    }
}

// Hàm kiểm tra xem game đã kết thúc chưa
function isGameOver(){
    return enemies.some((enemy) => {
        return !pacman.powerDotActive && enemy.collideWith(pacman);
    });

}

// Hàm kiểm tra xem game có đang tạm dừng không
function pause(){
    return !pacman.madeFirstMove || gameOver || gameWin || gamePause;
}

// Set kích thước canvas
tileMap.setCanvasSize(canvas);

// Vòng lặp game
setInterval(gameLoop, 15);
