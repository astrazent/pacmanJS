import MovingDirection from "./MovingDirection.js";
import nextStepAstar from "./Astar.js";
import { isValid } from "./Astar.js";
import MovementHistory from "./MovementHistory.js";

export default class Pacman {
    constructor(x, y, tileSize, velocity, tileMap) {
        this.x = x; // vị trí của pacman trên trục x
        this.y = y; // vị trí của pacman trên trục y
        this.tileSize = tileSize; // kích thước của mỗi ô trong game
        this.velocity = velocity; // vận tốc di chuyển
        this.tileMap = tileMap; // map của game
        this.#loadPacmanImages(); // load hình ảnh pacman

        // Cơi nới thêm
        this.historyPac = new MovementHistory();
        this.historyGhost = new MovementHistory();
        this.currentMovingDirection = null; // hướng di chuyển hiện tại
        this.requestedMovingDirection = null; // hướng di chuyển yêu cầu
        this.pathDot = null; // lưu đường đi ngắn nhất đến một dot
        this.pathDotEscape = null; // lưu đường đi ngắn nhất đến một dot
        this.exitLoop = 0; // mảng lưu vị trí thoát vòng lặp vô tận

        this.pacmanAnimationTimeDefault = 10; // thời gian chuyển đổi giữa các hình ảnh của pacman
        this.pacmanAnimationTimer = null; // thời gian chuyển đổi giữa các hình ảnh của pacman

        this.pacmanRotation = this.Rotation.right; // hướng quay của pacman

        this.wakaSound = new Audio("../sounds/waka.wav");
        this.powerDotSound = new Audio("../sounds/power_dot.wav");

        this.eatGhostSound = new Audio("../sounds/eat_ghost.wav");

        this.powerDotAboutToExpire = false; // biến kiểm tra power dot sắp hết hạn
        this.powerDotActive = false; // biến kiểm tra power dot còn hoạt động
        this.madeFirstMove = false; // biến kiểm tra pacman đã di chuyển lần đầu tiên
        this.timers = []; // mảng chứa các timer

        document.addEventListener("keydown", (event) => this.#keyDown(event)); // sự kiện keydown
    }

    // hàm quay pacman
    Rotation = {
        right: 0,
        down: 1,
        left: 2,
        up: 3,
    };

    // hàm load hình ảnh pacman
    #loadPacmanImages() {
        const pacmanImage1 = new Image();
        pacmanImage1.src = "../images/pac0.png";

        const pacmanImage2 = new Image();
        pacmanImage2.src = "../images/pac1.png";

        const pacmanImage3 = new Image();
        pacmanImage3.src = "../images/pac2.png";

        const pacmanImage4 = new Image();
        pacmanImage4.src = "../images/pac1.png";

        this.pacmanImages = [
            pacmanImage1,
            pacmanImage2,
            pacmanImage3,
            pacmanImage4,
        ];
        this.pacmanImageIndex = 0;
    }

    // hàm xử lý sự kiện keydown
    #keyDown(event) {
        if (event.keyCode == 38) {
            if (this.currentMovingDirection == MovingDirection.down) {
                this.currentMovingDirection = MovingDirection.up;
            }
            this.requestedMovingDirection = MovingDirection.up;
            this.madeFirstMove = true;
        }

        if (event.keyCode == 40) {
            if (this.currentMovingDirection == MovingDirection.up) {
                this.currentMovingDirection = MovingDirection.down;
            }
            this.requestedMovingDirection = MovingDirection.down;
            this.madeFirstMove = true;
        }

        if (event.keyCode == 37) {
            if (this.currentMovingDirection == MovingDirection.right) {
                this.currentMovingDirection = MovingDirection.left;
            }
            this.requestedMovingDirection = MovingDirection.left;
            this.madeFirstMove = true;
        }

        if (event.keyCode == 39) {
            if (this.currentMovingDirection == MovingDirection.left) {
                this.currentMovingDirection = MovingDirection.right;
            }
            this.requestedMovingDirection = MovingDirection.right;
            this.madeFirstMove = true;
        }
    }

    #manualKeyDown(arrowKey) {
        if (arrowKey == 0) {
            if (this.currentMovingDirection == MovingDirection.down) {
                this.currentMovingDirection = MovingDirection.up;
            }
            this.requestedMovingDirection = MovingDirection.up;
            this.madeFirstMove = true;
        }

        if (arrowKey == 1) {
            if (this.currentMovingDirection == MovingDirection.up) {
                this.currentMovingDirection = MovingDirection.down;
            }
            this.requestedMovingDirection = MovingDirection.down;
            this.madeFirstMove = true;
        }

        if (arrowKey == 2) {
            if (this.currentMovingDirection == MovingDirection.right) {
                this.currentMovingDirection = MovingDirection.left;
            }
            this.requestedMovingDirection = MovingDirection.left;
            this.madeFirstMove = true;
        }

        if (arrowKey == 3) {
            if (this.currentMovingDirection == MovingDirection.left) {
                this.currentMovingDirection = MovingDirection.right;
            }
            this.requestedMovingDirection = MovingDirection.right;
            this.madeFirstMove = true;
        }
    }

    #findNearestZeros(map, rm = [], startY, startX) {
        // Clone map để tránh thay đổi bản gốc
        const clonedMap = map.map((row) => [...row]);

        // Chặn các ô
        if (Array.isArray(rm)) {
            for (const point of rm) {
                const blockY = point.y;
                const blockX = point.x;
                if (
                    blockY >= 0 &&
                    blockY < clonedMap.length &&
                    blockX >= 0 &&
                    blockX < clonedMap[0].length
                ) {
                    clonedMap[blockY][blockX] = 1;
                }
            }
        }

        const queue = [[startY, startX]];
        const visited = new Set();
        const parents = {}; // key: "y,x" -> value: "prevY,prevX"

        const directions = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1],
        ];

        while (queue.length > 0) {
            const [y, x] = queue.shift();
            const key = `${y},${x}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (clonedMap[y] && clonedMap[y][x] === 0) {
                // Truy ngược đường đi
                const path = [];
                let curKey = key;

                while (curKey !== undefined) {
                    const [cy, cx] = curKey.split(",").map(Number);
                    path.unshift({ y: cy, x: cx });
                    curKey = parents[curKey];
                }

                return { y, x, path };
            }

            for (const [dy, dx] of directions) {
                const newY = y + dy;
                const newX = x + dx;
                const newKey = `${newY},${newX}`;

                if (
                    newY >= 0 &&
                    newY < clonedMap.length &&
                    newX >= 0 &&
                    newX < clonedMap[0].length &&
                    !visited.has(newKey) &&
                    clonedMap[newY][newX] !== 1
                ) {
                    queue.push([newY, newX]);
                    if (!(newKey in parents)) {
                        parents[newKey] = key; // Ghi nhớ đường đi
                    }
                }
            }
        }

        return null;
    }

    #getDirection(currentX, currentY, tileSize, targetTile) {
        const dx = currentX / tileSize - targetTile.x;
        const dy = currentY / tileSize - targetTile.y;

        if (dy == 1) {
            return MovingDirection.up;
        } else if (dy == -1) {
            return MovingDirection.down;
        } else if (dx == 1) {
            return MovingDirection.left;
        } else if (dx == -1) {
            return MovingDirection.right;
        }

        return null; // Không có hướng hợp lệ
    }

    // dùng để chỉ kích hoạt visualize nhưng không kích hoạt chức năng khác
    #onOFFautoMove(action, visualize = true) {
        if (
            Number.isInteger(this.x / this.tileSize) &&
            Number.isInteger(this.y / this.tileSize)
        ) {
            // nếu vị trí hiện tại của pacman nằm trên một ô
            const value = document.getElementById("pacmanData").value;
            let dir = null; // vị trí pacman không được đi
            let gap = null; // khoảng cách thực từ pacman đến ghot
            let powerDot = null; // kiểm tra xem pacman có ăn powerdot không
            let pathh = null;
            let ghostX = null;
            let ghostY = null;
            if (value) {
                try {
                    const hiddenInput = JSON.parse(value);
                    dir = hiddenInput.guest ?? null;
                    gap = hiddenInput.gap ?? null;
                    powerDot = hiddenInput.powerDot ?? null;
                    pathh = hiddenInput.path ?? null;
                    ghostX = hiddenInput.ghostX ?? null;
                    ghostY = hiddenInput.ghostY ?? null;
                } catch (error) {
                    console.error("Dữ liệu JSON không hợp lệ:", error);
                }
            } else {
                console.warn("pacman chưa di chuyển");
            }
            if (
                pathh == null &&
                isValid(
                    Math.floor(ghostY),
                    Math.floor(ghostX),
                    this.tileMap.map
                )
            ) {
                try {
                    const pathl = nextStepAstar(
                        Math.floor(ghostY),
                        Math.floor(ghostX),
                        Math.floor(this.y / this.tileSize),
                        Math.floor(this.x / this.tileSize),
                        this.tileMap.map
                    );
                    pathh = pathl[3]; // phần tử thứ 4
                } catch (error) {
                    console.error("Lỗi khi lấy bước di chuyển từ A*:", error);
                }
            }

            // Đảo ngược thứ tự x, y của mảng
            if (pathh != null) {
                pathh = pathh.map(({ x, y }) => ({ x: y, y: x }));
                if (visualize) {
                    if (!powerDot || this.powerDotAboutToExpire) {
                        this.tileMap.getPath(pathh, "ghost");
                        this.tileMap.deletePath("pac");
                        this.tileMap.deletePath("block");
                    } else {
                        pathh.pop();
                        this.tileMap.getPath(pathh, "pac");
                        this.tileMap.deletePath("ghost");
                    }
                }
            }

            // tìm điểm thức ăn gần nhất với vị trí hiện tại
            let dot;
            const clonedMap = this.tileMap.map.map((row) => [...row]); // để tránh kiểu tham chiếu
            dot = this.#findNearestZeros(
                clonedMap,
                pathh,
                Math.floor(this.y / this.tileSize),
                Math.floor(this.x / this.tileSize)
            );
            if (dot != null) {
                const title = dot.path[1];
                this.pathDot = this.#getDirection(
                    this.x,
                    this.y,
                    this.tileSize,
                    title
                );
            }
            if (action == "ON") {
                // Nếu bị rơi vào vòng lặp vô tận
                if (this.exitLoop != 0) {
                    if (
                        gap > 4 &&
                        this.pathDotEscape != null &&
                        this.pathDotEscape.length > 0
                    ) {
                        if (visualize) {
                            this.tileMap.deletePath("block");
                            this.tileMap.deletePath("pac");
                            this.tileMap.getPath(
                                [...this.pathDotEscape],
                                "loop"
                            ); //clone để tránh tham chiếu
                        }

                        let dirDot;
                        dirDot = this.#getDirection(
                            this.x,
                            this.y,
                            this.tileSize,
                            this.pathDotEscape[0]
                        );
                        this.#manualKeyDown(dirDot);
                        this.pathDotEscape.shift();
                        this.historyPac.addStep(
                            {
                                x: this.x / this.tileSize,
                                y: this.y / this.tileSize,
                            },
                            gap
                        );
                        this.historyGhost.addStep(
                            {
                                x: Math.floor(ghostX),
                                y: Math.floor(ghostY),
                            },
                            gap
                        );
                        this.exitLoop -= 1;
                        return;
                    } else {
                        this.exitLoop = 0;
                    }
                }
                // Kiểm tra vòng lặp vô tận
                if (
                    this.historyPac.checkInfiniteLoop() 
                    //&& this.historyGhost.checkInfiniteLoop()
                ) {
                    if (dot == null) {
                        this.pathDotEscape = null;
                        return;
                    }
                    if (this.exitLoop == 0) {
                        this.exitLoop = 7;
                        // reset toàn bộ mảng để tránh bị tính là lặp lại ở lần duyệt tiếp theo
                        this.historyPac.reset();
                        this.historyGhost.reset();
                        this.pathDotEscape = dot.path.slice(1);
                    }
                    return;
                }
            }

            const step = [];
            if (dir === null) {
                if (action == "ON") {
                    let tempStep = [];
                    for (let i = 0; i < 4; i++) {
                        if (
                            !this.tileMap.didCollideWithEnviroment(
                                this.x,
                                this.y,
                                i
                            )
                        ) {
                            // nếu không va chạm với môi trường
                            tempStep.push(i);
                        }
                    }
                    const k = Math.floor(Math.random() * tempStep.length);
                    this.#manualKeyDown(tempStep[k]);
                } 
            } else {
                if (!powerDot || this.powerDotAboutToExpire) {
                    for (let i = 0; i < 4; i++) {
                        if (
                            !this.tileMap.didCollideWithEnviroment(
                                this.x,
                                this.y,
                                i
                            ) &&
                            dir != i
                        ) {
                            // nếu không va chạm với môi trường
                            step.push(i);
                        }
                    }
                } else if(!this.powerDotAboutToExpire) {
                    step.push(dir); // cho pacman đuổi ma
                }
                if (step.includes(this.pathDot)) {
                    if (dot != null && visualize) {
                        this.tileMap.deletePath("loop");
                        this.tileMap.deletePath("block");
                        this.tileMap.getPath(dot.path, "pac");
                    }
                    if (action == "ON") {
                        this.#manualKeyDown(this.pathDot);
                    }
                    this.historyPac.addStep(
                        {
                            x: this.x / this.tileSize,
                            y: this.y / this.tileSize,
                        },
                        gap
                    );
                    this.historyGhost.addStep(
                        {
                            x: Math.floor(ghostX),
                            y: Math.floor(ghostY),
                        },
                        gap
                    );
                } else {
                    const j = Math.floor(Math.random() * step.length); // việc random sẽ giúp tránh vòng lặp (vì lúc nào cũng đi vào 0)
                    if (dot != null && visualize) {
                        this.tileMap.deletePath("loop");
                        this.tileMap.deletePath("pac");
                        this.tileMap.getPath(dot.path, "block");
                    }
                    if (action == "ON") {
                        this.#manualKeyDown(step[j]);
                    }
                    this.historyPac.addStep(
                        {
                            x: this.x / this.tileSize,
                            y: this.y / this.tileSize,
                        },
                        gap
                    );
                    this.historyGhost.addStep(
                        {
                            x: Math.floor(ghostX),
                            y: Math.floor(ghostY),
                        },
                        gap
                    );
                }
            }
        }
    }

    // Hàm tự động di chuyển
    #automove(visualize) {
        if (visualize) {
            this.#onOFFautoMove("ON");
        } else {
            this.tileMap.deletePath("pac");
            this.tileMap.deletePath("loop");
            this.tileMap.deletePath("block");
            this.tileMap.deletePath("ghost");
            this.#onOFFautoMove("ON", visualize);
        }
    }

    // hàm di chuyển pacman
    #move(visualize) {
        if (visualize) {
            this.#onOFFautoMove("OFF");
        } else {
            this.tileMap.deletePath("pac");
            this.tileMap.deletePath("loop");
            this.tileMap.deletePath("block");
            this.tileMap.deletePath("ghost");
        }
        if (this.currentMovingDirection != this.requestedMovingDirection) {
            // nếu hướng di chuyển hiện tại khác hướng di chuyển yêu cầu
            if (
                Number.isInteger(this.x / this.tileSize) &&
                Number.isInteger(this.y / this.tileSize)
            ) {
                // nếu vị trí hiện tại của pacman nằm trên một ô
                if (
                    !this.tileMap.didCollideWithEnviroment(
                        this.x,
                        this.y,
                        this.requestedMovingDirection
                    )
                ) {
                    // nếu không va chạm với môi trường
                    this.currentMovingDirection = this.requestedMovingDirection; // hướng di chuyển hiện tại bằng hướng di chuyển yêu cầu
                }
            }
        }
        if (
            this.tileMap.didCollideWithEnviroment(
                this.x,
                this.y,
                this.requestedMovingDirection
            )
        ) {
            // nếu va chạm với môi trường
            this.pacmanAnimationTimer = null; // dừng chuyển đổi giữa các hình ảnh của pacman
            this.pacmanImageIndex = 1; // hiển thị hình ảnh pacman mở miệng
            return;
        } else if (
            this.currentMovingDirection != null &&
            this.pacmanAnimationTimer == null
        ) {
            // nếu hướng di chuyển hiện tại khác null và thời gian chuyển đổi giữa các hình ảnh của pacman bằng null
            this.pacmanAnimationTimer = this.pacmanAnimationTimeDefault; // thời gian chuyển đổi giữa các hình ảnh của pacman bằng thời gian mặc định
        }
        // di chuyển theo hướng di chuyển hiện tại
        switch (this.currentMovingDirection) {
            case MovingDirection.up:
                this.y -= this.velocity; // di chuyển lên trên
                this.pacmanRotation = this.Rotation.up; // quay pacman lên trên
                break;
            case MovingDirection.down:
                this.y += this.velocity;
                this.pacmanRotation = this.Rotation.down;
                break;
            case MovingDirection.left:
                this.x -= this.velocity;
                this.pacmanRotation = this.Rotation.left;
                break;
            case MovingDirection.right:
                this.x += this.velocity;
                this.pacmanRotation = this.Rotation.right;
                break;
        }
    }

    // hàm chuyển đổi giữa các hình ảnh của pacman
    #animate() {
        if (this.pacmanAnimationTimer == null) {
            return;
        }
        this.pacmanAnimationTimer--;
        if (this.pacmanAnimationTimer == 0) {
            this.pacmanAnimationTimer = this.pacmanAnimationTimeDefault;
            this.pacmanImageIndex++;
            if (this.pacmanImageIndex == this.pacmanImages.length) {
                this.pacmanImageIndex = 0;
            }
        }
    }

    // hàm ăn thức ăn
    #eatDot() {
        if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
            this.wakaSound.play();
        }
    }

    // hàm ăn viên sức mạnh
    #eatPowerDot() {
        if (this.tileMap.eatPowerDot(this.x, this.y)) {
            // nếu ăn viên sức mạnh
            this.powerDotSound.play(); // phát âm thanh
            this.powerDotActive = true; // power dot hoạt động
            this.powerDotAboutToExpire = false; // power dot chưa hết hạn
            this.timers.forEach((timer) => clearTimeout(timer)); // xóa các timer
            this.timers = []; // khởi tạo lại mảng timer

            let powerDotTimer = setTimeout(() => {
                // tạo timer cho power dot
                this.powerDotActive = false; // power dot không hoạt động
                this.powerDotAboutToExpire = false; // power dot chưa hết hạn
            }, 1000 * 6);
            this.timers.push(powerDotTimer); // thêm timer vào mảng timer

            let powerDotAboutToExpireTimer = setTimeout(() => {
                // tạo timer cho power dot sắp hết hạn
                this.powerDotAboutToExpire = true; // power dot sắp hết hạn
            }, 1000 * 3);

            this.timers.push(powerDotAboutToExpireTimer); // thêm timer vào mảng timer
        }
    }

    // hàm ăn ghost
    #eatGhost(enimes) {
        if (this.powerDotActive) {
            // nếu power dot hoạt động
            enimes.forEach((enemy) => {
                // duyệt qua danh sách ghost
                if (enemy.collideWith(this)) {
                    // nếu pacman va chạm với ghost
                    this.eatGhostSound.play(); // phát âm thanh
                    enimes.splice(enimes.indexOf(enemy), 1); // xóa ghost khỏi danh sách ghost
                }
            });
        }
    }

    // hàm vẽ pacman
    draw(ctx, pause, autoplay, visualize, enimes) {
        if (autoplay) {
            this.#automove(visualize); // tự động di chuyển
        }
        if (!pause) {
            this.#move(visualize); // di chuyển
            this.#animate(); // chuyển đổi giữa các hình ảnh của pacman
        }
        this.#eatDot(); // ăn thức ăn
        this.#eatPowerDot(); // ăn viên sức mạnh
        this.#eatGhost(enimes); // ăn ghost
        const size = this.tileSize / 2;

        ctx.save(); // lưu trạng thái của canvas
        ctx.translate(this.x + size, this.y + size); // di chuyển tọa độ của canvas
        ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180); // quay canvas

        ctx.drawImage(
            this.pacmanImages[this.pacmanImageIndex],
            -size,
            -size,
            this.tileSize,
            this.tileSize
        ); // vẽ pacman

        const path = [
            { x: 9, y: 3 },
            { x: 9, y: 4 },
            { x: 9, y: 5 },
            { x: 8, y: 5 },
            { x: 7, y: 5 },
            { x: 6, y: 5 },
            { x: 5, y: 5 },
            { x: 5, y: 6 },
            { x: 5, y: 7 },
        ];

        ctx.restore(); // khôi phục trạng thái của canvas
    }
}
