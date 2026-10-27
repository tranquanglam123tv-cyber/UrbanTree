# 🌳 UrbanTree — Hệ thống Quản lý Cây xanh Đô thị (QR Code & Blockchain)

> **Học phần:** Blockchain Cơ bản (CNTT2311)  
> **Sinh viên thực hiện:** Trần Quang Lâm  
> **Đề tài:** Số hóa hồ sơ cây xanh đô thị, giám sát quy trình chăm sóc thực địa, tiếp nhận phản ánh sự cố khẩn cấp và bảo chứng toàn vẹn dữ liệu bằng Smart Contract Blockchain.

---

## 📌 1. Tổng quan Đề tài

**UrbanTree** là giải pháp công nghệ toàn diện nhằm giải quyết bài toán quản lý cây xanh đô thị tại TP.HCM:
1. **Cổng Cây xanh Công cộng (Public Citizen Web - Mobile 390×844):** Người dân quét mã QR trên thân cây để tra cứu lý lịch sinh thái (tuổi cây, loài cây, lượng CO2 hấp thụ) và gửi phản ánh sự cố (cành sà lưới điện, cây nghiêng đổ) kèm định vị GPS và ảnh chụp.
2. **Cổng Quản trị & Điều phối GIS (Admin Web - Desktop 1440×1024):** Ban quản lý giám sát bản đồ cây xanh thời gian thực, điều phối xe nâng chuyên dụng cứu hộ sự cố trong 60 phút, theo dõi lịch cắt tỉa mùa mưa bão và phê duyệt phân công nhân sự.
3. **Ứng dụng Tác nghiệp Hiện trường (Flutter Staff App - Mobile 390×844):** Nhân viên cây xanh quét mã QR định danh khi chăm sóc, chụp ảnh đối chứng Trước/Sau và ký số gửi bản ghi lên chuỗi khối (hỗ trợ Offline-First khi mất sóng 4G).
4. **Bảo chứng Toàn vẹn Dữ liệu (Blockchain EVM / Hardhat Local Node):** Mọi lịch sử chăm sóc, biên bản nghiệm thu và mã băm SHA-256 được lưu trữ bất biến trên Smart Contract, chống chỉnh sửa hồi tố và phát hiện gian lận dữ liệu (Zero Mismatch).

---

## 🎨 2. Hệ thống Thiết kế UI/UX (Verdant Starry Night)

Toàn bộ hệ thống giao diện được thiết kế độc quyền theo phong cách **Verdant Starry Night** (lấy cảm hứng từ Vincent van Gogh và sắc xanh đại ngàn đô thị):
* **Bảng màu Semantic:**
  * Forest Deep (`#174B36`) & Leaf Green (`#347A50`)
  * Warm Van Gogh Gold (`#F3E8B2`) & Emerald Mid (`#4C956C`)
  * Warm Canvas (`#F6F5EC`) & Pale Green Tint (`#E0EBDD`)
* **Thang tỷ lệ chữ (Typography):** Inter & Plus Jakarta Sans chuẩn công thái học số WCAG AAA.

### 📐 Kiến trúc 7 Hàng Artboard trên Figma:
* **Hàng 00:** Foundations & Design System Tokens (Palette, Typography Scale, Primitives, Buttons, Inputs, Cards, Sidebar).
* **Hàng 01:** Xác thực & Khung Quản trị (`A01` Đăng nhập, `A01-S1` Đăng ký công vụ, `A02` Quên mật khẩu, `Admin Shell`, `A03` Profile).
* **Hàng 02:** Bản đồ GIS & Hồ sơ Cây xanh (`A04` Dashboard, `A05` Bản đồ GIS, `A05-S1` Drawer lọc, `A05-S2` Offline state, `A06` Danh sách cây, `A06-S1` Empty state, `A06-S3` In QR hàng loạt, `A07` Hồ sơ cây 360°, `A07-S1` Tab Blockchain, `A08` Form thêm cây, `A08-S3` Cảnh báo chưa lưu, `A09` Danh mục loài cây, `A10` Quản lý QR, `A10-S2` Spec thẻ nhôm đúc ngoài trời).
* **Hàng 03:** Điều phối Sự cố & Nhân viên Hiện trường (`A14` Trung tâm sự cố, `A15` Bản đồ điều phối, `A15 Drawer` Chi tiết điều phối, `A15-S1` Phân công đội cơ động, `A15-S2` Từ chối phản ánh, `INC-S6` Lightbox xem ảnh, `A11` Nhật ký chăm sóc, `A12` Chi tiết chăm sóc, `CARE-S1` Lịch tháng chăm sóc, `A16` Danh sách nhân viên, `A17` Chi tiết nhân sự).
* **Hàng 04:** Kiểm toán & Minh bạch Blockchain (`A18` Sổ cái Blockchain Activity Explorer, `A19` Cổng xác minh toàn vẹn Merkle Hash, `A19-S1` Modal bằng chứng EVM, `A19-S2` Cảnh báo sai lệch Hash Mismatch).
* **Hàng 05:** Cổng Dịch vụ Công cộng Dành cho Người dân (`P01` Tra cứu QR, `P02` Form báo sự cố, `P03` Tiếp nhận thành công, `P04` Theo dõi tiến độ đang xử lý, `P04-S2` Sự cố đã hoàn tất kèm ảnh Trước/Sau và Đánh giá sao, `PUB-S10` Không tìm thấy sự cố).
* **Hàng 06:** Ứng dụng Di động Nhân viên Flutter (`M01` Đăng nhập ca trực, `M02` Dashboard nhiệm vụ hôm nay, `M03` Quét QR cây, `M03-S2` Cấp quyền camera, `M04` Chi tiết cây mobile, `M05` Biểu mẫu chăm sóc thực địa, `M05-S3` Hàng đợi đồng bộ Offline, `M06` Danh sách việc cần làm, `M07` Xử lý sự cố, `M08` Nghiệm thu hiện trường, `M09` Lịch sử hoạt động, `M10` Tài khoản & Đăng xuất).

---

## ⚡ 3. Tính năng Tương tác Prototype (End-to-End Interactive)

Dự án đã thiết lập sẵn **246 liên kết Prototype tương tác** với **0 màn hình cụt (Zero Dead Ends)**:
* **Luồng 1 (Admin Web):** Đăng nhập $\rightarrow$ Dashboard $\rightarrow$ Điều phối GIS $\rightarrow$ Phân công đội cứu hộ $\rightarrow$ Kiểm toán Blockchain.
* **Luồng 2 (Public Web):** Quét QR thân cây $\rightarrow$ Báo sự cố $\rightarrow$ Nhận mã Ticket $\rightarrow$ Theo dõi tiến độ thời gian thực $\rightarrow$ Xem nghiệm thu ảnh Trước/Sau.
* **Luồng 3 (Staff App):** Đăng nhập $\rightarrow$ Nhận lệnh khẩn cấp $\rightarrow$ Dẫn đường GPS $\rightarrow$ Cắt tỉa cành nguy hiểm $\rightarrow$ Chụp ảnh đối chứng $\rightarrow$ Ký số đẩy lên Blockchain.

---

## 🛠️ 4. Công nghệ Dự án (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Thiết kế UI/UX** | Figma Desktop, FigCli Automation, Design Tokens |
| **Frontend Web** | React 18, TypeScript, Tailwind CSS, Leaflet GIS |
| **Mobile App** | Flutter 3.47 (Dart 3.13), Mobile Scanner, Hive (Offline Cache) |
| **Backend API** | Spring Boot 3 (Java 17), Spring Security, JWT, Spring Data JPA |
| **Database** | MySQL 8.0, Flyway Database Migration |
| **Blockchain** | Solidity Smart Contracts, Hardhat Local Node, Ethers.js, SHA-256 |

---

## 🚀 5. Lộ trình Triển khai (Roadmap)

- [x] **Phase 1: UI/UX & Design System (Figma-First)** — *Hoàn thành 100% (52 màn hình, 246 prototype wires).*
- [ ] **Phase 2: Backend Architecture & Database** — *Spring Boot 3, MySQL 8, JPA Entities, JWT Authentication.*
- [ ] **Phase 3: Blockchain Integration** — *Hardhat Smart Contracts, Hash Integrity Verifier.*
- [ ] **Phase 4: Frontend Web & GIS Map** — *Leaflet OpenStreetMap, Dashboard Bento, Citizen Portal.*
- [ ] **Phase 5: Flutter Mobile Staff App** — *QR Scanner, Camera Evidence, Offline Sync Queue.*
- [ ] **Phase 6: Testing & Final Demo Presentation** — *Kịch bản Demo cuối kỳ môn Blockchain cơ bản.*

---
*Bản quyền đề tài thuộc về Nhóm sinh viên CNTT2311 — Đại học Công nghệ TP.HCM.*
