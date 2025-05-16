import MovingDirection from "./MovingDirection.js";

// File thuật toán A*


// Node quản lý vị trí của từng ô trong game
class Node {
    constructor(x, y, parent = null) {
        this.x = x; // vị trí của node trên trục x
        this.y = y; // vị trí của node trên trục y
        this.parent = parent; // node cha
        this.f = 0; // giá trị ước lượng từ điểm bắt đầu đến điểm kết thúc thông qua nút hiện tại
        this.g = 0; // giá trị thực tế từ điểm bắt đầu đến nút hiện tại
        this.h = 0; // giá trị ước lượng từ nút hiện tại đến điểm kết thúc
    }

    // Hàm để tính giá trị f của nút
    calculateF() {
        this.f = this.g + this.h;
    }
}

// Hàm kiểm tra xem ô có hợp lệ không
function isValid(x, y, grid) {
    return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length && grid[x][y] !== 1;
}

// Hàm kiểm tra xem ô có phải là điểm đích không
function isDestination(x, y, dest) {
    return x === dest.x && y === dest.y;
}

// Hàng đợi ưu tiên dùng cho A*
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) { // Thêm phần tử vào hàng đợi
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority); // Sắp xếp hàng đợi theo priority
    }

    dequeue() {
        return this.elements.shift(); // Lấy phần tử đầu tiên ra khỏi hàng đợi
    }

    isEmpty() { 
        return this.elements.length === 0; // Kiểm tra hàng đợi rỗng
    }

    contains(node) {
        return this.elements.some(elem => elem.element.x === node.x && elem.element.y === node.y); // Kiểm tra nút có trong hàng đợi không
    }

    get(node) { // Lấy giá trị g của nút
        const found = this.elements.find(elem => elem.element.x === node.x && elem.element.y === node.y);
        return found ? found.element.g : Infinity;
    }
}

// Hàm tìm đường đi từ điểm bắt đầu đến điểm kết thúc
function astarSearch(grid, src, dest) {
    const openList = new PriorityQueue(); // Hàng đợi ưu tiên chứa các nút cần duyệt
    openList.enqueue(src, 0); // Thêm nút bắt đầu vào hàng đợi

    const directions = [
        [-1, 0], [1, 0], [0, -1], [0, 1] // lên, xuống, trái, phải
    ]; // Các hướng di chuyển

    while (!openList.isEmpty()) { // Duyệt đến khi hàng đợi rỗng
        const currentNode = openList.dequeue().element; // Lấy nút đầu tiên ra khỏi hàng đợi

        // Nếu đến điểm đích
        if (isDestination(currentNode.x, currentNode.y, dest)) {
            // Tạo và trả về đường đi từ dest đến src
            const path = [];
            let current = currentNode; 
            while (current !== null) {
                path.push({ x: current.x, y: current.y });
                current = current.parent;
            }
            return path.reverse();
        }

        // Duyệt các ô lân cận
        for (const dir of directions) {
            const newX = currentNode.x + dir[0];
            const newY = currentNode.y + dir[1];

            if (isValid(newX, newY, grid)) { // Nếu ô lân cận hợp lệ
                const newNode = new Node(newX, newY, currentNode);

                // Tính toán giá trị g, h, f cho nút mới
                newNode.g = currentNode.g + 1;
                newNode.h = Math.abs(newX - dest.x) + Math.abs(newY - dest.y);
                console.log(newNode.h);
                newNode.calculateF();

                // Nếu nút chưa được duyệt hoặc có chi phí tốt hơn
                if (!openList.contains(newNode) || newNode.g < openList.get(newNode)) {
                    openList.enqueue(newNode, newNode.f);
                }
            }

        }
    }

    // Không tìm được đường đi
    return null;
}

export default function nextStepAstar(xStart, yStart, xEnd, yEnd, grid) { // Hàm tìm bước đi tiếp theo cho A*
    // Khởi tạo và chạy thuật toán A*
    const src = new Node(xStart, yStart); // Nút bắt đầu
    const dest = new Node(xEnd, yEnd); // Nút kết thúc
    const path = astarSearch(grid, src, dest); // Tìm đường đi

    if (path === null || path.length < 2) { // Nếu không tìm được đường đi hoặc chỉ còn 1 nút
        return null;
    }

    const tile = path[1]; // Lấy nút thứ 2 trong đường đi
    // So sánh vị trí của nút thứ 2 với vị trí hiện tại để xác định hướng di chuyển
    if (tile.x - xStart == 1) { 
        return MovingDirection.down; // Nếu nút thứ 2 nằm phía dưới
    } else if (tile.x - xStart == -1) {
        return MovingDirection.up; // Nếu nút thứ 2 nằm phía trên
    } else if (tile.y - yStart == 1) {
        return MovingDirection.right; // Nếu nút thứ 2 nằm bên phải
    } else if (tile.y - yStart == -1) {
        return MovingDirection.left; // Nếu nút thứ 2 nằm bên trái
    }
    return null; // Trường hợp còn lại
}
