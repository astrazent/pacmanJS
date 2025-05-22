# 🎮 Dự Án Pacman - Nhóm Đề Tài 04

## 📌 Giới Thiệu

Đây là một dự án tái hiện lại trò chơi **Pacman cổ điển** bằng ngôn ngữ **JavaScript**. Mục tiêu của trò chơi là điều khiển nhân vật Pacman ăn hết các chấm vàng trên bản đồ và tránh bị các kẻ thù bắt được.

Dự án được thực hiện bởi **Nhóm Đề Tài 04** trong khuôn khổ môn học, với mong muốn vận dụng kiến thức lập trình để xây dựng một sản phẩm có tính thực tiễn và giải trí.

## 👥 Thành Viên Nhóm

| Họ và Tên        | Mã Sinh Viên    |
|------------------|-----------------|
| Mai Quý Tùng     | B21DCCN767      |
| Vũ Hồng Quân     | B21DCCN619      |
| Vũ Văn Khương    | B22DCAT166      |
| Phan Gia Nguyên  | B21DCCN096      |
| Lý Thành Đạt     | B21DCCN214      |

## 🧠 Công Nghệ & Cấu Trúc

Dự án sử dụng **JavaScript thuần (Vanilla JS)** để xử lý logic trò chơi, kết hợp với HTML và CSS để hiển thị giao diện.

### Cấu trúc các file chính:

- `Astar.js`: Cài đặt thuật toán **A\*** để tính đường đi tối ưu cho kẻ thù.
- `Enemy.js`: Định nghĩa lớp **Enemy**, điều khiển hành vi của các kẻ thù.
- `Game.js`: Quản lý vòng lặp trò chơi, cập nhật trạng thái và xử lý điều kiện thắng/thua.
- `MovingDirection.js`: Khai báo các hướng di chuyển có thể có.
- `Pacman.js`: Định nghĩa lớp **Pacman**, đại diện cho nhân vật chính của trò chơi.
- `TileMap.js`: Quản lý bản đồ ô gạch của trò chơi, bao gồm vẽ bản đồ và phát hiện va chạm.

Ngoài ra, thư mục dự án còn bao gồm:

- `images/`: Chứa các tài nguyên hình ảnh sử dụng trong trò chơi.
- `sounds/`: Chứa các hiệu ứng âm thanh như tiếng ăn điểm, nhạc nền,...

## 🕹️ Hướng Dẫn Sử Dụng

1. Mở file `index.html` bằng trình duyệt web (Chrome, Firefox,...).
2. Sử dụng **các phím mũi tên** để điều khiển Pacman.
3. Nhiệm vụ của người chơi là **ăn hết tất cả các chấm vàng** trên bản đồ mà **không để bị kẻ thù bắt được**.

## 🚀 Hướng Phát Triển Tương Lai

- Tối ưu hành vi AI của kẻ thù bằng các kỹ thuật học máy.
- Phát triển thêm các bản đồ và cấp độ chơi.
- Xây dựng chế độ **chơi nhiều người**.
- Tích hợp bảng xếp hạng điểm số và tính năng lưu tiến trình.

---

> Nhóm rất mong nhận được sự góp ý từ cô để hoàn thiện sản phẩm tốt hơn.  
> **Chân thành cảm ơn cô đã theo dõi và đánh giá dự án của nhóm!**

no pathdot:  11 5 1 0
Pacman.js:319 no pathdot:  11 6 1 0
Pacman.js:319 no pathdot:  11 7 1 0
Pacman.js:319 no pathdot:  11 8 1 0
Pacman.js:319 no pathdot:  11 9 2 0
Pacman.js:319 no pathdot:  10 9 3 2
Pacman.js:315 pathdot:  11 9 0 2
Pacman.js:315 pathdot:  11 8 0 1
Pacman.js:315 pathdot:  11 7 0 1
Pacman.js:315 pathdot:  11 6 0 1
Pacman.js:319 no pathdot:  11 5 1 0




pathdot:  1 4 0 1
Pacman.js:227 inf
Pacman.js:319 no pathdot:  1 3 1 0
Pacman.js:227 inf
Pacman.js:315 pathdot:  1 4 0 1
Pacman.js:227 inf
Pacman.js:319 no pathdot:  1 3 1 0
Pacman.js:227 inf
Pacman.js:315 pathdot:  1 4 0 1
Pacman.js:227 inf
Pacman.js:319 no pathdot:  1 3 1 0
Pacman.js:227 inf
Pacman.js:315 pathdot:  1 4 0 1
Pacman.js:227 inf
Pacman.js:319 no pathdot:  1 3 1 0