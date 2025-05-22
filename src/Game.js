import TileMap from "./TileMap.js";

const tileSize = 32; // Kích thước của mỗi ô trong game
const velocity = 2; // Tốc độ di chuyển của pacman và ghost

const canvas = document.getElementById("gameCanvas"); // Lấy thẻ canvas từ HTML
const ctx = canvas.getContext("2d"); // Lấy context 2d từ canvas
let tileMap = new TileMap(tileSize); // Tạo một tileMap mới
let pacman = tileMap.getPacman(velocity); // Lấy pacman từ tileMap
let enemies = tileMap.getEnemies(velocity); // Lấy danh sách ghost từ tileMap
let qtyEnemies = enemies.length; // lấy ra số lượng ghost
let gameOver = false; // Biến kiểm tra game over
let gameWin = false; // Biến kiểm tra game win
let gamePause = false; // Biến kiểm tra game có đang tạm dừng không
let autoPlay = false; // Biến kiểm tra auto play có đang bật không
let visualize = false; // Biến kiểm tra visualize có đang bật không
const gameOverSound = new Audio("../sounds/gameOver.wav"); // Âm thanh game over
const gameWinSound = new Audio("../sounds/gameWin.wav"); // Âm thanh game win


function gameLoop(){ // Hàm vòng lặp game
    tileMap.draw(ctx); // Vẽ map
    drawGameEnd(ctx); // Vẽ game over hoặc game win
    if(!gameOver && !gameWin){
        if(enemies.length < qtyEnemies){
            const addEnemies = tileMap.resetEnemies(qtyEnemies - enemies.length, velocity);
            addEnemies.forEach((enemy) => { // Thêm ghost vừa bị ăn vào danh sách
                enemies.push(enemy);
            });
        }
        enemies.forEach((enemy) => { // Vẽ ghost
            enemy.draw(ctx, pause(), pacman);
        });
        pacman.draw(ctx ,pause(), autoPlayCheck(), visualizeCheck(), enemies); // Vẽ pacman
        checkGameOver(); // Kiểm tra game over
        checkGameWin(); // Kiểm tra game win
    }
}

// Sự kiện click vào canvas
canvas.addEventListener("click", ()=>{
    if(gameOver || gameWin){
        resetGame();
    }
});


const buttonPauseGame = document.getElementById("pause-game"); // Lấy button pause từ HTML
buttonPauseGame.addEventListener("click", () => {
    if(pacman.y/tileSize != 5 && pacman.x/tileSize != 7){
        if(gamePause){
            if(document.getElementById("auto-play").innerHTML == "Auto play: ON" && autoPlay == false){
                autoPlay = true;
            }
            if(document.getElementById("visualize").innerHTML == "Visualize: ON" && visualize == false){
                visualize = true;
            }
            buttonPauseGame.innerHTML = "Pause";
            gamePause = false;
        }
        else{
            if(autoPlay == true){
                autoPlay = false;
            }
            if(visualize == true){
                visualize = false;
            }
            buttonPauseGame.innerHTML = "Resume";
            gamePause = true;
        }
    }
}); // Sự kiện click vào button pause{}

// button auto play
const buttonAutoPlay = document.getElementById("auto-play"); // Lấy button auto play từ HTML
buttonAutoPlay.addEventListener("click", () => {
    if(!gamePause){
        if(!autoPlay){
            buttonAutoPlay.innerHTML = "Auto play: ON";
            autoPlay = true;
        }
        else{
            buttonAutoPlay.innerHTML = "Auto play: OFF";
            autoPlay = false;
        }
    }
});

// button auto play
const buttonVisualize = document.getElementById("visualize"); // Lấy button auto play từ HTML
buttonVisualize.addEventListener("click", () => {
    if(!gamePause){
        if(!visualize){
            buttonVisualize.innerHTML = "Visualize: ON";
            visualize = true;
        }
        else{
            buttonVisualize.innerHTML = "Visualize: OFF";
            visualize = false;
        }
    }
});

// Hàm vẽ game over hoặc game win
function drawGameEnd(){
    if(gameOver || gameWin){
        let text = 'You Win!';
        if(gameOver){
            text = 'Game Over!';
        }
        tileMap.deletePath("ghost");
        tileMap.deletePath("pac");
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
    pacman = tileMap.getPacman(velocity);
    enemies = tileMap.getEnemies(velocity);
    gameOver = false;
    gameWin = false;
    autoPlay = false;
    visualize = false;
    document.getElementById("auto-play").innerHTML = "Autoplay: OFF";
    document.getElementById("visualize").innerHTML = "Visualize: OFF";
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

// Hàm kiểm tra xem game có đang auto play không
function autoPlayCheck(){
    return autoPlay;
}

// Hàm kiểm tra xem visualize có đang bật không
function visualizeCheck(){
    return visualize;
}

// Set kích thước canvas
tileMap.setCanvasSize(canvas);

// Vòng lặp game
setInterval(gameLoop, 15);
