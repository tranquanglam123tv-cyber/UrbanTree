# URBANTREE — DETAILED PROJECT ROADMAP
## Frontend, Backend, UI/UX, Database, Blockchain & Testing

**Phiên bản:** 1.0 — Roadmap triển khai chi tiết  
**Thời lượng mục tiêu:** 60 ngày  
**Dự án:** UrbanTree — Hệ thống quản lý cây xanh đô thị sử dụng QR Code và Blockchain  
**Mục tiêu:** Xây dựng MVP chạy được, có giao diện hoàn chỉnh, dữ liệu nhất quán, luồng người dùng có thể kiểm thử và kịch bản demo cuối kỳ.

---

# 1. TỔNG QUAN DỰ ÁN

## 1.1. Mục tiêu sản phẩm

UrbanTree hỗ trợ quản lý cây xanh đô thị xuyên suốt từ hồ sơ cây, mã QR, hoạt động chăm sóc đến tiếp nhận và xử lý phản ánh của người dân.

Hệ thống gồm ba bề mặt giao diện chính:

1. **Admin Web:** quản trị cây, loại cây, bản đồ, chăm sóc, sự cố, nhân viên và xác minh dữ liệu.
2. **Public Web:** tra cứu thông tin cây qua QR, gửi phản ánh và tra cứu trạng thái phản ánh.
3. **Staff Mobile App:** nhân viên quét QR, xem thông tin cây và ghi nhận hoạt động chăm sóc hoặc cập nhật công việc được giao.

Backend xử lý nghiệp vụ và quyền truy cập. MySQL lưu dữ liệu nghiệp vụ. Blockchain lưu bằng chứng hash để hỗ trợ phát hiện dữ liệu bị thay đổi sau khi ghi dấu.

## 1.2. Kiến trúc mục tiêu

| Thành phần | Công nghệ định hướng | Trách nhiệm |
|---|---|---|
| Admin Web | React, TypeScript, Vite | Giao diện quản trị |
| Public Web | React, TypeScript, Vite | Tra cứu công khai, gửi và tra cứu phản ánh |
| Staff App | Flutter | Quét QR và ghi nhận nghiệp vụ |
| Backend | Java, Spring Boot | API, xác thực, phân quyền, nghiệp vụ |
| Database | MySQL 8 | Dữ liệu cây, người dùng, chăm sóc, sự cố |
| Blockchain | Solidity, Hardhat local node | Ghi và xác minh hash |
| Map | Leaflet, OpenStreetMap | Hiển thị vị trí cây |
| API documentation | OpenAPI hoặc Postman | Hợp đồng API và kiểm thử |
| Version control | Git | Quản lý phiên bản và phối hợp nhóm |

Đây là kiến trúc mục tiêu theo roadmap, không phải xác nhận rằng toàn bộ thành phần đã được cài đặt hoặc tích hợp.

## 1.3. Phạm vi MVP

### Bắt buộc

- Đăng nhập Admin và Staff theo quyền.
- Dashboard sử dụng dữ liệu từ backend.
- CRUD cây xanh và danh mục loài cây.
- Bản đồ cây xanh.
- QR định danh cây và trang tra cứu công khai.
- Ghi nhận hoạt động chăm sóc.
- Người dân gửi phản ánh kèm ảnh và nhận mã tra cứu.
- Admin xác minh, phân công và cập nhật trạng thái sự cố.
- Nhân viên xem thông tin cây và cập nhật nghiệp vụ được giao.
- Nhật ký xử lý và bằng chứng Blockchain cho các loại bản ghi đã chốt.
- Tra cứu và xác minh hash.
- Loading, empty, validation, error và success state.
- Responsive cho các luồng chính.
- Hướng dẫn cài đặt, dữ liệu demo và checklist nghiệm thu.

### Mở rộng khi MVP ổn định

- Báo cáo nâng cao và xuất CSV/PDF.
- Trung tâm thông báo nâng cao.
- Cài đặt hệ thống.
- Lịch sử hoạt động cá nhân nâng cao.
- Bộ lọc bản đồ nâng cao.
- AI hỗ trợ phân loại hoặc tóm tắt phản ánh theo phạm vi an toàn đã được phê duyệt.

**Nguyên tắc:** Không triển khai tính năng mở rộng nếu nó làm chậm các luồng MVP hoặc chưa có API/nghiệp vụ hỗ trợ.

---

# 2. KẾ HOẠCH 60 NGÀY

## Phase 1 — Khóa phạm vi và chuẩn bị nền tảng
### Ngày 1–7

**Mục tiêu:** Thống nhất nghiệp vụ, kiến trúc, design system và hợp đồng dữ liệu trước khi triển khai diện rộng.

### Công việc

**Ngày 1 — Khảo sát hiện trạng**
- Đọc source code, README và cấu trúc repository nếu có.
- Kiểm tra môi trường Java, Node.js, Flutter, MySQL và Hardhat.
- Xác định phần đã tồn tại, phần thiếu và phần đang lỗi.
- Liệt kê rủi ro tích hợp và các chức năng chưa được xác nhận.

**Ngày 2 — Chốt nghiệp vụ MVP**
- Chốt vai trò Admin và Staff.
- Chốt dữ liệu nào được phép công khai.
- Chốt trạng thái cây, trạng thái chăm sóc và trạng thái sự cố.
- Chốt luồng QR công khai và mã tra cứu phản ánh.
- Chốt loại bản ghi nào được ghi dấu Blockchain.

**Ngày 3 — Kiến trúc và repository**
- Thống nhất cấu trúc thư mục.
- Thống nhất cách đặt tên branch, commit và biến môi trường.
- Xác định cách chạy các dịch vụ local.
- Chuẩn bị `.env.example` không chứa secret thật.

**Ngày 4 — Database và API contract**
- Vẽ ERD.
- Chốt DTO cho các luồng chính.
- Chốt response thành công và lỗi.
- Xác định migration ban đầu.
- Xác định phân trang, lọc và tìm kiếm.

**Ngày 5 — UI/UX inventory**
- Chốt sitemap Admin, Public Web và Staff App.
- Lập danh sách trang cấp 1, cấp 2, cấp 3.
- Ghi rõ route đích cho từng thao tác.
- Liệt kê popup, drawer, dropdown và trạng thái.
- Đánh dấu màn hình chưa có nghiệp vụ xác nhận.

**Ngày 6 — Design system**
- Chốt palette và typography.
- Tạo button, input, select, badge, card, table, dialog, drawer, toast.
- Chuẩn hóa loading, empty, error và success state.
- Chốt motion token và responsive rule.

**Ngày 7 — Gate review**
- Chạy thử từng dịch vụ độc lập.
- Review API contract, ERD và screen inventory.
- Khóa phạm vi MVP.
- Lập danh sách blocker cần giải quyết ở Phase 2.

### Deliverables
- Sơ đồ kiến trúc.
- ERD sơ bộ.
- API contract sơ bộ.
- Screen & Interaction Inventory.
- Design system nền tảng.
- Danh sách rủi ro và quyết định đã chốt.

### Tiêu chí nghiệm thu
- [x] Phân biệt rõ MVP và tính năng mở rộng.
- [x] Các vai trò và quyền cơ bản đã xác định.
- [x] Các trạng thái nghiệp vụ đã thống nhất.
- [x] Không còn xung đột nghiêm trọng trong ID màn hình và API contract.
- [x] Các dịch vụ có thể chạy hoặc có hướng xử lý blocker rõ ràng.

---

## Phase 2 — Database, Authentication và nền tảng Backend
### Ngày 8–14

**Mục tiêu:** Tạo nền dữ liệu và API có thể tích hợp với frontend.

### Backend
- Khởi tạo Spring Boot.
- Thiết lập cấu hình môi trường.
- Cấu hình kết nối MySQL.
- Thiết lập migration (Flyway / Liquibase / SQL init).
- Tạo cấu trúc controller, service, repository và DTO.
- Tạo xử lý lỗi tập trung.
- Chuẩn hóa validation.
- Triển khai đăng nhập và kiểm tra quyền theo thiết kế.
- Mã hóa mật khẩu bằng cơ chế phù hợp, chẳng hạn BCrypt.
- Không lưu mật khẩu thô.

### Database
Các nhóm bảng dự kiến:
- `users`
- `tree_types`
- `trees`
- `care_records`
- `incidents`
- `incident_updates`
- `blockchain_audits`

Chỉ tạo các bảng phù hợp với schema đã chốt. Không bổ sung bảng hoặc cột trùng lặp nếu chưa có lý do nghiệp vụ.

### Frontend
- Khởi tạo Admin Web và Public Web.
- Thiết lập routing.
- Thiết lập API client.
- Xây dựng layout shell.
- Xây dựng form, table và feedback component dùng chung.
- Xây dựng màn hình đăng nhập.
- Thiết lập route bảo vệ theo phiên và quyền.
- Chuẩn bị dữ liệu mock tách biệt khỏi API thật.

### Kiểm thử
- Kiểm tra kết nối database.
- Kiểm tra migration chạy từ database trống.
- Kiểm tra đăng nhập thành công và thất bại.
- Kiểm tra endpoint không có quyền.
- Kiểm tra lỗi validation.
- Kiểm tra response DTO không trả dữ liệu riêng tư không cần thiết.

### Deliverables
- Backend skeleton.
- Database migration đầu tiên.
- Login flow.
- Admin shell.
- API contract có thể kiểm thử.

---

## Phase 3 — Quản lý cây, loài cây và QR
### Ngày 15–21

**Mục tiêu:** Hoàn thành luồng quản lý hồ sơ cây và định danh QR.

---

## Phase 4 — Dashboard, bản đồ và ghi nhận chăm sóc
### Ngày 22–28

**Mục tiêu:** Hiển thị dữ liệu quản trị và hoàn thiện nghiệp vụ chăm sóc.

---

## Phase 5 — Sự cố và phản ánh công khai
### Ngày 29–35

**Mục tiêu:** Hoàn thành quy trình phản ánh của người dân và xử lý sự cố nội bộ.

---

## Phase 6 — Blockchain và xác minh bằng chứng
### Ngày 36–42

**Mục tiêu:** Tích hợp ghi dấu hash và kiểm tra tính nhất quán dữ liệu.

---

## Phase 7 — Tích hợp toàn hệ thống và hardening
### Ngày 43–49

**Mục tiêu:** Đưa các luồng chính thành một hệ thống có thể demo xuyên suốt.

---

## Phase 8 — QA, tài liệu và demo cuối kỳ
### Ngày 50–56

**Mục tiêu:** Đảm bảo hệ thống cài đặt được, có dữ liệu demo và có bằng chứng kiểm thử.

---

## Phase 9 — Hoàn thiện và bàn giao
### Ngày 57–60

**Mục tiêu:** Chốt sản phẩm, sửa lỗi cuối cùng và chuẩn bị báo cáo.

---

# 3. TRẠNG THÁI HIỆN TẠI VÀ BƯỚC TIẾP THEO

- **Giai đoạn đã hoàn thành:** **Phase 1 (Ngày 1–7)** — Toàn bộ UI/UX Design System, 44 màn hình chuyên đề (A01–A19, P01–P04, M01–M10, Subpages), 7 Thematic Banners và 21 luồng Prototype Native đã hoàn thành 100% trên Figma Desktop và đồng bộ tài liệu tại [roadmapfe.md](file:///d:/TQLCNTT2311074/Nam4HK1/GUI/Da4/roadmapfe.md).
- **Giai đoạn tiếp theo:** **Phase 2 (Ngày 8–14)** — Database, Authentication & Nền tảng Backend + Khởi tạo Frontend Web Admin Codebase.
