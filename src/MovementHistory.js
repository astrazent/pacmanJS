// MovementHistory.js
export default class MovementHistory {
    constructor(limit = 18) {
        this.historyMove = [];
        this.gap = [];
        this.limit = limit;
    }

    addStep(pacmanPos, gap) {
        this.historyMove.push(pacmanPos);
        this.gap.push(gap);

        if (this.historyMove.length > this.limit) this.historyMove.shift();
        if (this.gap.length > this.limit) this.gap.shift();
    }

    getStep() {
        return this.historyMove;
    }

    reset() {
        if (this.historyMove.length > 0) {
            this.historyMove.splice(0, this.historyMove.length - 1); // Xóa mọi phần tử trừ phần tử cuối
        }
    }

    checkInfiniteLoop() {
        return this.#hasRepeating(this.historyMove);
    }

    #hasRepeating(history) {
        const counter = {};
        let repeatingPoints = 0;

        for (const pos of history) {
            const key = `${pos.x},${pos.y}`;
            counter[key] = (counter[key] || 0) + 1;
        }
        // nếu có ít nhất 2 điểm có số lần lặp lại trên 2 thì trả về true
        for (const key in counter) {
            if (counter[key] > 2) {
                // nếu có 1 điểm có số lần lặp lại lớn hơn 3 lần 
                repeatingPoints++;
                if (repeatingPoints >= 1) {
                    return true;
                }
            }
            if (counter[key] >= 2) {
                // nếu có từ 3 điểm trở lên có số lần lặp lại lớn hơn 2
                repeatingPoints++;
                if (repeatingPoints > 2) {
                    return true;
                }
            }
        }

        return false;
    }
}
