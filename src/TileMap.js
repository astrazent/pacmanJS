import MovingDirection from "./MovingDirection.js";
import Enemy from "./Enemy.js";
import Pacman from "./Pacman.js";

// Map
export default class TileMap {
    constructor(tileSize) {
        this.tileSize = tileSize; // Kích thước của mỗi ô trong game

        this.yellowDot = new Image(); // Hình ảnh của dot
        this.yellowDot.src = "../images/yellowDot.png";

        this.wall = new Image(); // Hình ảnh của wall
        this.wall.src = "../images/wall.png";

        this.pinkDot = new Image(); // Hình ảnh của power dot
        this.pinkDot.src = "../images/pinkDot.png";

        this.powerDot = this.pinkDot;
        this.powerDotAnimationTimerDefault = 100; // Thời gian chuyển đổi giữa 2 hình ảnh power dot
        this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault; // Thời gian chuyển đổi giữa 2 hình ảnh power dot

        this.pathGhost = null; // đường đi từ ma đến pacman
        this.pathPac = null; // đường đi pacman đến dot
        this.pathLoop = null; // đường đi pacman đến dot khi bị loop
    }

    //1 - wall
    //0 - dots
    //4 - pacman
    //5 - empty space
    //6 - enemy
    //7 - power dot
    // Map
    map = [
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 1],
        [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 4, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 7, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ];

    #drawPath(ctx, path, tileSize, color = "cyan") {
        if (path.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;

        ctx.moveTo(
            path[0].x * tileSize + tileSize / 2,
            path[0].y * tileSize + tileSize / 2
        );

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(
                path[i].x * tileSize + tileSize / 2,
                path[i].y * tileSize + tileSize / 2
            );
        }

        ctx.stroke();
    }

    getPath(path, action) {
        if (action == "ghost") {
            path.shift();
            path.pop();
            this.pathGhost = path;
        } else if (action == "pac") {
            path.shift();
            this.pathPac = path;
        } else if (action == "loop"){
            path.shift();
            this.pathLoop = path;
        }
    }

    deletePath(action) {
        if (action == "ghost") {
            this.pathGhost = null;
        } else if (action == "pac") {
            this.pathPac = null;
        } else if (action == "loop"){
            this.pathLoop = null;
        }
    }

    // Vẽ map
    draw(ctx) {
        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {
                let tile = this.map[row][column];
                if (tile === 1) {
                    this.#drawWall(ctx, column, row, this.tileSize);
                } else if (tile === 0) {
                    this.#drawDot(ctx, column, row, this.tileSize);
                } else if (tile === 7) {
                    this.#drawPowerDot(ctx, column, row, this.tileSize);
                } else {
                    this.#drawBlank(ctx, column, row, this.tileSize);
                }
            }
        }

        // Vẽ đường đi từ ghost đến pacman nếu có
        if (this.pathGhost && this.pathGhost.length > 1) {
            this.#drawPath(ctx, this.pathGhost, this.tileSize, "red");
        }
        // Vẽ đường đi từ pacman đến dot nếu có
        if (this.pathPac && this.pathPac.length > 1) {
            this.#drawPath(ctx, this.pathPac, this.tileSize, "green");
        }
        // Vẽ đường đi từ pacman đến dot khi loop nếu có
        if (this.pathLoop && this.pathLoop.length > 1) {
            this.#drawPath(ctx, this.pathLoop, this.tileSize, "gray");
        }
    }

    // Vẽ viên sức mạnh
    #drawPowerDot(ctx, column, row, size) {
        this.powerDotAnimationTimer--;
        if (this.powerDotAnimationTimer == 0) {
            this.powerDotAnimationTimer = this.powerDotAnimationTimerDefault;
            if (this.powerDot == this.pinkDot) {
                this.powerDot = this.yellowDot;
            } else {
                this.powerDot = this.pinkDot;
            }
        }
        ctx.drawImage(
            this.powerDot,
            column * this.tileSize,
            row * this.tileSize,
            size,
            size
        );
    }

    // Vẽ vùng trống
    #drawBlank(ctx, column, row, size) {
        ctx.fillStyle = "black";
        ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
    }

    //  Vẽ tường
    #drawWall(ctx, column, row, size) {
        ctx.drawImage(
            this.wall,
            column * this.tileSize,
            row * this.tileSize,
            size,
            size
        );
    }

    // Vẽ thức ăn
    #drawDot(ctx, column, row, size) {
        ctx.drawImage(
            this.yellowDot,
            column * this.tileSize,
            row * this.tileSize,
            size,
            size
        );
    }

    // Đếm số thức ăn còn lại
    #dotLeft() {
        return this.map.flat().filter((tile) => tile == 0).length;
    }

    // Set kích thước canvas
    setCanvasSize(canvas) {
        canvas.width = this.map[0].length * this.tileSize;
        canvas.height = this.map.length * this.tileSize;
    }

    // Lấy vị trí pacman ban đầu
    getPacman(velocity) {
        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {
                let tile = this.map[row][column];
                if (tile === 4) {
                    this.map[row][column] = 0;
                    return new Pacman(
                        column * this.tileSize,
                        row * this.tileSize,
                        this.tileSize,
                        velocity,
                        this
                    );
                }
            }
        }
    }

    //reset ma khi bị pacman ăn
    resetEnemies(soLuong, velocity) {
        const validPositions = [];

        // Tìm các vị trí có giá trị 0 hoặc 5
        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {
                const tile = this.map[row][column];
                if (tile === 0 || tile === 5) {
                    validPositions.push({ row, column });
                }
            }
        }

        // Giới hạn số lượng nếu cần
        const count = Math.min(soLuong, validPositions.length);

        // Trộn ngẫu nhiên các vị trí hợp lệ
        for (let i = validPositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [validPositions[i], validPositions[j]] = [
                validPositions[j],
                validPositions[i],
            ];
        }

        // Tạo enemy tại các vị trí đã chọn
        const enemies = [];
        for (let i = 0; i < count; i++) {
            const { row, column } = validPositions[i];
            enemies.push(
                new Enemy(
                    column * this.tileSize,
                    row * this.tileSize,
                    this.tileSize,
                    velocity,
                    this
                )
            );
        }

        return enemies;
    }

    // Lấy danh sách ghost
    getEnemies(velocity) {
        const enimes = [];

        for (let row = 0; row < this.map.length; row++) {
            for (let column = 0; column < this.map[row].length; column++) {
                const tile = this.map[row][column];
                if (tile === 6) {
                    this.map[row][column] = 0;
                    enimes.push(
                        new Enemy(
                            column * this.tileSize,
                            row * this.tileSize,
                            this.tileSize,
                            velocity,
                            this
                        )
                    );
                }
            }
        }

        return enimes;
    }

    // Ăn thức ăn
    eatDot(x, y) {
        const row = y / this.tileSize;
        const column = x / this.tileSize;
        if (Number.isInteger(row) && Number.isInteger(column)) {
            if (this.map[row][column] == 0) {
                this.map[row][column] = 5;
                return true;
            }
        }
        return false;
    }

    // Ăn viên sức mạnh
    eatPowerDot(x, y) {
        const row = y / this.tileSize;
        const column = x / this.tileSize;
        if (Number.isInteger(row) && Number.isInteger(column)) {
            if (this.map[row][column] == 7) {
                this.map[row][column] = 5;
                return true;
            }
        }
        return false;
    }

    // Kiểm tra va chạm với môi trường
    didCollideWithEnviroment(x, y, direction) {
        if (direction == null) {
            return;
        }

        if (
            Number.isInteger(x / this.tileSize) &&
            Number.isInteger(y / this.tileSize)
        ) {
            let row = 0;
            let column = 0;
            let nextRow = 0;
            let nextColumn = 0;

            switch (direction) {
                case MovingDirection.right:
                    nextColumn = x + this.tileSize;
                    column = nextColumn / this.tileSize;
                    row = y / this.tileSize;
                    break;
                case MovingDirection.left:
                    nextColumn = x - this.tileSize;
                    column = nextColumn / this.tileSize;
                    row = y / this.tileSize;
                    break;
                case MovingDirection.up:
                    nextRow = y - this.tileSize;
                    row = nextRow / this.tileSize;
                    column = x / this.tileSize;
                    break;
                case MovingDirection.down:
                    nextRow = y + this.tileSize;
                    row = nextRow / this.tileSize;
                    column = x / this.tileSize;
                    break;
            }

            const tile = this.map[row][column];
            if (tile === 1) {
                return true;
            }
            return false;
        }
    }

    // Kiểm tra game over
    didGameWin() {
        return this.#dotLeft() == 0;
    }
}
