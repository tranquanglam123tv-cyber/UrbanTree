# BẢN ĐẶC TẢ VÀ LỘ TRÌNH PHÁT TRIỂN GIAO DIỆN TOÀN DIỆN (ROADMAP FE 100%)
## TÍCH HỢP HỆ THỐNG QUẢN LÝ CÂY XANH ĐÔ THỊ (QR CODE & BLOCKCHAIN)
### HỢP NHẤT: SHADCN-ADMIN + FANCY COMPONENTS + REACT-LEAFLET + FIGMA-CLI VÀO GOOGLE ANTIGRAVITY

> **Phiên bản tài liệu:** 2.0.0 — Production-Ready Master Specification  
> **Hệ sinh thái:** Google Antigravity Agentic IDE | Figma Desktop Live Bridge | React 19 + TypeScript + Vite  
> **Nguyên tắc cốt lõi:** Bền vững, thẩm mỹ đỉnh cao (Verdant Starry Night), an toàn dữ liệu tuyệt đối, xác minh trực tiếp.

---

## MỤC LỤC
1. [Tổng quan dự án & Cấu hình môi trường](#1-tổng-quan-dự-án--cấu-hình-môi-trường)
2. [Đánh giá an toàn & Tương thích 4 Repositories](#2-đánh-giá-an-toàn--tương-thích-4-repositories)
3. [Cơ chế tích hợp Google Antigravity & Figma-CLI](#3-cơ-chế-tích-hợp-google-antigravity--figma-cli)
4. [Master Prompt chuẩn hóa cho Antigravity AI](#4-master-prompt-chuẩn-hóa-cho-antigravity-ai)
5. [Design System: Verdant Starry Night (Tokens & Styling)](#5-design-system-verdant-starry-night-tokens--styling)
6. [Đặc tả chi tiết 100% Giao diện (Admin, Public Web, Mobile)](#6-đặc-tả-chi-tiết-100-giao-diện-admin-public-web-mobile)
7. [Kiến trúc Frontend Codebase (Shadcn + Fancy + Leaflet)](#7-kiến-trúc-frontend-codebase-shadcn--fancy--leaflet)
8. [Quy trình 8 bước vận hành, kiểm tra và Rollback](#8-quy-trình-8-bước-vận-hành-kiểm-tra-và-rollback)

---

## 1. TỔNG QUAN DỰ ÁN & CẤU HÌNH MÔI TRƯỜNG

### 1.1. Bối cảnh dự án
Hệ thống Quản lý Cây xanh Đô thị tích hợp QR Code & Blockchain là nền tảng quản trị và dịch vụ công cộng đa bên:
- **Người dân (Public Citizen):** Quét QR tại cây để tra cứu thông tin sinh thái, lịch sử chăm sóc và gửi báo cáo sự cố cây ngã đổ/sâu bệnh tức thời.
- **Nhân viên hiện trường (Staff):** Quét QR để cập nhật sức khỏe cây định kỳ, ghi nhận nhật ký chăm sóc kèm ảnh chụp thực địa.
- **Quản trị viên đô thị (Admin):** Bàn làm việc số toàn diện (Dashboard, GIS Map, quản lý cây, điều phối sự cố, quản lý loài, kiểm toán minh bạch qua Blockchain).

### 1.2. Hiện trạng môi trường hệ thống (Đã kiểm chứng ngày 27/10/2026)
| Thành phần | Phiên bản / Trạng thái | Đánh giá tính sẵn sàng |
|---|---|---|
| **Hệ điều hành** | Windows 11 / PowerShell | Đạt chuẩn |
| **Node.js** | `v24.22.0` (LTS/Current) | Tương thích cao với ESM và Figma-CLI |
| **npm** | `11.19.1` | Sẵn sàng quản lý dependencies |
| **Git** | `2.55.0.windows.4` | Sẵn sàng tracking code và design snapshots |
| **Figma Desktop** | Đang chạy (PID 2260, 2400...), phiên bản `126.10.13` | Cần lưu ý: v126+ mặc định chặn remote debugging port 9222 |
| **Figma CLI** | `figma-ds-cli` đã cài đặt toàn cục | Cung cấp JSX rendering, token management và contract testing |
| **Plugin Safe Bridge** | Đã thiết lập tại `d:/TQLCNTT2311074/Nam4HK1/GUI/Da4/plugin` | Sẵn sàng nạp trực tiếp qua Figma Plugin Manifest |

---

## 2. ĐÁNH GIÁ AN TOÀN & TƯƠNG THÍCH 4 REPOSITORIES

### 2.1. Phân loại vai trò từng Repository
1. **`satnaing/shadcn-admin`**:
   - *Bản chất:* Template Dashboard mã nguồn mở chuẩn mực xây dựng trên Vite + React + TypeScript + Tailwind CSS + Shadcn UI (Radix UI) + TanStack Table v8.
   - *Vai trò trong đồ án:* Khung xương (App Shell), hệ thống bảng dữ liệu, bộ lọc nâng cao, phân trang, Dark/Light mode, điều hướng Sidebar đa cấp và thông báo.
2. **`danielpetho/fancy`**:
   - *Bản chất:* Thư viện UI components giàu tương tác thị giác, sử dụng Framer Motion và CSS Variables (hiệu ứng ánh sáng hover, spring physics, text morphing, magnetic buttons, glowing cards).
   - *Vai trò trong đồ án:* Nâng tầm thẩm mỹ đạt chuẩn "WOW effect", biến giao diện quản trị khô khan thành trải nghiệm sinh động đậm chất thiên nhiên kết hợp công nghệ hiện đại.
3. **`PaulLeCam/react-leaflet`**:
   - *Bản chất:* Thư viện React Wrapper cho Leaflet.js, tích hợp bản đồ mã nguồn mở OpenStreetMap.
   - *Vai trò trong đồ án:* Hiển thị bản đồ phân bố cây xanh toàn đô thị, cụm sự cố theo tọa độ thực, đánh dấu vị trí cây cần xử lý khẩn cấp và công cụ ghim tọa độ cho người dân.
4. **`silships/figma-cli`**:
   - *Bản chất:* Công cụ CLI điều khiển Figma Desktop trực tiếp từ Terminal qua WebSocket hoặc Chrome DevTools Protocol (CDP).
   - *Vai trò trong đồ án:* Cầu nối hai chiều để Antigravity AI đọc cấu trúc cây thư mục thiết kế, render các khung giao diện JSX trực tiếp vào Canvas Figma Desktop, đồng bộ design tokens và kiểm tra tính nhất quán (a11y audit, drift check).

### 2.2. Kiểm tra an toàn & Tránh xung đột cấu hình
- **Quy tắc MCP / IDE Config:** Không ghi đè các tệp cấu hình IDE (`settings.json`, `.vscode`, `mcp_config.json`) của người dùng. Antigravity tương tác với `figma-cli` thông qua command line runners và Skill chuyên dụng.
- **Tách biệt phụ thuộc:** `fancy` và `shadcn-admin` chia sẻ nền tảng Tailwind CSS và React. Cần chuẩn hóa cấu hình `tailwind.config.js` để tích hợp mượt mà các animation keyframes của `fancy` mà không phá vỡ utility tokens của `shadcn/ui`.

---

## 3. CƠ CHẾ TÍCH HỢP GOOGLE ANTIGRAVITY & FIGMA-CLI

### 3.1. Phân tích 3 chế độ kết nối của Figma-CLI
| Tiêu chí | Chế độ Safe (Khuyên dùng) | Chế độ Browser | Chế độ Yolo (Desktop Patch) |
|---|---|---|---|
| **Lệnh kích hoạt** | `figma-cli connect --safe` | `figma-cli connect --browser` | `figma-cli connect` |
| **Cơ chế** | WebSocket nội bộ qua Plugin `FigCli` (Port 3456-3460) | Chromium CDP điều khiển tab Figma Web | Patch tệp thực thi của Figma Desktop để mở port 9222 |
| **Sửa đổi ứng dụng** | **HOÀN TOÀN KHÔNG** | **HOÀN TOÀN KHÔNG** | **CÓ** (Chỉnh sửa file binary/asar) |
| **Rủi ro bảo mật** | Rất thấp (chạy hoàn toàn trong sandbox Figma API) | Thấp (chỉ tác động phiên trình duyệt) | Cao (Antivirus chặn, lỗi khi Figma tự update) |
| **Khả năng khôi phục** | Đóng plugin trong Figma là ngắt kết nối hoàn toàn | Tắt trình duyệt | Cần cài đặt lại Figma Desktop nếu hỏng file patch |

> **QUYẾT ĐỊNH:** Dự án sử dụng **CHẾ ĐỘ SAFE (SAFE MODE)** làm tiêu chuẩn. 

### 3.2. Hướng dẫn thiết lập Safe Mode một lần (One-Time Setup)
1. Mở ứng dụng **Figma Desktop** và mở tệp thiết kế của Đồ án.
2. Trên thanh menu Figma: Chọn **Plugins** → **Development** → **Import plugin from manifest...**
3. Trỏ đến tệp đã chuẩn bị sẵn tại:
   `D:\TQLCNTT2311074\Nam4HK1\GUI\Da4\plugin\manifest.json`
4. Bấm **Open** — Plugin `FigCli` đã được cài đặt vào máy.
5. Khi làm việc: Vào **Plugins** → **Development** → **FigCli** để kích hoạt cầu nối.

---

## 4. MASTER PROMPT CHUẨN HÓA CHO ANTIGRAVITY AI

Prompt dưới đây được cấu hình để người dùng hoặc AI agent có thể kích hoạt bất kỳ lúc nào để thực thi thiết kế và lập trình frontend:

```markdown
Bạn là Chuyên gia Thiết kế Hệ thống UI/UX & Kỹ sư Frontend Cao cấp của Google Antigravity.
Nhiệm vụ của bạn là xây dựng hệ sinh thái giao diện hoàn thiện 100% cho Dự án "Quản lý Cây xanh Đô thị tích hợp QR Code & Blockchain", kết nối trực tiếp với Figma Desktop qua figma-cli và triển khai mã nguồn trên nền tảng React 19 + TypeScript + Vite.

BẠN PHẢI TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU:
1. AN TOÀN VÀ BẢO TOÀN DỮ LIỆU:
   - Trước khi thực hiện bất kỳ lệnh ghi nào vào Figma, chạy chế độ đọc để kiểm kê (Inventory) toàn bộ các Page, Frame, Component hiện có.
   - TUYỆT ĐỐI KHÔNG xóa, đổi tên, di chuyển hoặc ghi đè lên các Frame cũ do con người thiết kế.
   - Luôn sử dụng Safe Mode (qua plugin FigCli) để tương tác.

2. KIỂM CHỨNG TRƯỚC KHI HÀNH ĐỘNG (CANARY TEST):
   - Trước khi tạo hàng loạt giao diện, tạo duy nhất một component thử nghiệm: `Test/Button/AI`.
   - Sử dụng lệnh `figma-cli verify "<nodeId>" --measure` để chụp ảnh màn hình và đo kích thước.
   - Chỉ khi đọc lại được kết quả thành công từ Figma Desktop mới được kết luận kết nối thành công và chuyển sang giai đoạn tạo màn hình.

3. TIÊU CHUẨN THẨM MỸ CAO CẤP:
   - Ngôn ngữ thị giác: "Verdant Starry Night" — kết hợp giữa màu xanh đại ngàn (Forest Deep Green), ánh vàng ấm áp (Warm Gold/Cream) và nền sinh thái thanh lịch.
   - Tích hợp linh hồn của `fancy` (Daniel Petho): Magnetic hover, subtle spring animations, dynamic glow borders, micro-interactions tinh tế tại các card trạng thái và CTA buttons.
   - Tích hợp chuẩn mực của `shadcn-admin`: Bố cục Dashboard bento-grid, Data Table với bộ lọc đa tiêu chí, phân trang mượt mà, Drawer chi tiết responsive.
   - Tích hợp `react-leaflet`: Bản đồ trực quan với Marker phân cấp theo sức khỏe cây (Xanh - Vàng - Cam - Đỏ), popup thông tin nhanh và bộ lọc vị trí.

4. BÁO CÁO MINH BẠCH:
   - Luôn trình bày bảng theo dõi: Lệnh đã chạy, File đã sửa/tạo, Node Figma đã thêm, Trạng thái kiểm tra và Cách Rollback nếu gặp sự cố.
```

---

## 5. DESIGN SYSTEM: VERDANT STARRY NIGHT (TOKENS & STYLING)

### 5.1. Bảng màu Semantic (Tokens Palette)
Lấy cảm hứng từ nét cọ thiên nhiên và bầu trời đêm chuyển động của Van Gogh, kết hợp độ sắc nét của giao diện quản trị hiện đại:

| Tên Token Semantic | Mã Hex | Vai trò / Ngữ cảnh sử dụng | Tỷ lệ tương phản WCAG |
|---|---|---|---|
| `var:brand-primary` | `#174B36` | Xanh rừng sâu — Màu chủ đạo của Header, Primary Buttons, Active States | AAA (10.4:1 trên nền trắng) |
| `var:brand-secondary` | `#347A50` | Xanh tán lá — Nút phụ, icon sinh thái, đường nét liên kết | AA (4.8:1) |
| `var:brand-accent` | `#4C956C` | Xanh ngọc lục bảo — Hover states, progress bars, active tabs | AA (3.2:1 trên nền tối) |
| `var:surface-canvas` | `#F6F5EC` | Nền canvas toàn ứng dụng — Tone màu kem sáng chống mỏi mắt | Chuẩn công thái học |
| `var:surface-card` | `#FFFFFF` | Nền card, modal, data table — Tạo chiều sâu với viền mảnh | N/A |
| `var:surface-subtle` | `#E0EBDD` | Nền chip, badge nền phụ, thanh highlight | Dễ đọc |
| `var:gold-warm` | `#F3E8B2` | Vàng rơm ấm — Điểm nhấn huy hiệu Blockchain, sao đánh giá, QR highlight | Nét chấm phá Van Gogh |
| `var:text-primary` | `#28352B` | Màu chữ chính — Đen ánh rêu, dễ đọc tuyệt đối | AAA |
| `var:text-secondary` | `#667368` | Màu chữ phụ, caption, metadata, timestamps | AA |
| `var:border-subtle` | `#DDE4D9` | Đường viền card, bảng dữ liệu, phân cách | Tinh tế, không gây rối mắt |
| `var:status-good` | `#22C55E` | Trạng thái cây tốt, Blockchain Verified, Đã xử lý | Chuẩn quốc tế |
| `var:status-fair` | `#EAB308` | Cây bình thường, Đang xử lý sự cố | Chuẩn cảnh báo |
| `var:status-poor` | `#F97316` | Cây có dấu hiệu sâu bệnh, Sự cố ưu tiên cao | Cảnh giác |
| `var:status-danger` | `#EF4444` | Cây gãy đổ nguy hiểm, Hash Mismatch, Sự cố khẩn | Khẩn cấp |

### 5.2. Typography & Spacing Scale
- **Font Family:** `Inter` cho dữ liệu bảng/số liệu kỹ thuật; `Plus Jakarta Sans` cho Tiêu đề & Brand Header.
- **Thang kích thước:**
  - Display (Hero Banner): 36px / Line-height 44px / Bold
  - Heading 1 (Page Title): 28px / Line-height 36px / SemiBold
  - Heading 2 (Section Title): 20px / Line-height 28px / SemiBold
  - Heading 3 (Card Title): 16px / Line-height 24px / Medium
  - Body Text: 14px / Line-height 20px / Regular
  - Caption / Metadata: 12px / Line-height 16px / Regular
- **Hệ thống Spacing:** Bội số của 4px/8px: `gap-2` (8px), `gap-4` (16px), `gap-6` (24px), `p-6` (24px).
- **Bo góc (Border Radius):** Input: 10px, Card: 16px, Modal: 20px, Button: 12px, Tag/Chip: 9999px (Pill).

---

## 6. ĐẶC TẢ CHI TIẾT 100% GIAO DIỆN (ADMIN, PUBLIC WEB, MOBILE)

### 6.1. HỆ THỐNG GIAO DIỆN WEB ADMIN (Desktop 1440×1024)
*Xây dựng theo chuẩn `shadcn-admin` phối hợp `fancy` micro-interactions:*

1. **A01 — Đăng nhập & Xác thực (Auth Shell):**
   - Bố cục Split Screen: Cột trái chứa artwork đồ họa tương tác mô phỏng tán cây Van Gogh kết hợp các hạt ánh sáng chuyển động (`fancy` particle/glow effect); cột phải là Form đăng nhập tối giản chuẩn Radix UI.
   - Trường nhập Email/Tài khoản, Mật khẩu (có toggle hiện/ẩn), ghi nhớ phiên, nút Đăng nhập hiệu ứng Magnetic Button.
   - Thông báo lỗi xác thực trực quan, chặn Brute-force với countdown timer.

2. **A02 — Khung điều hướng chuẩn (Admin Shell Layout):**
   - **Collapsible Sidebar (248px -> 80px):** Logo dự án, cụm Menu phân cấp theo vai trò (ADMIN / STAFF), icon Lucide sinh thái học, tooltip khi thu nhỏ.
   - **Top Navigation Bar:** Breadcrumb tự động theo Route, Search Bar toàn cục (Command Menu `Cmd + K`), Chuông thông báo sự cố tức thời (Real-time Badge), Menu Profile & Theme Switcher (Light / Dark Verdant).

3. **A03 — Dashboard Quản trị Tổng thể (Verdant Bento Grid):**
   - **Hàng 1 (KPI Metric Cards):** 4 thẻ chỉ số với hiệu ứng Glowing Border khi hover:
     - Tổng số cây trong hệ sinh thái (kèm xu hướng tăng trưởng).
     - Số sự cố mới tiếp nhận cần duyệt (Badge đỏ nhấp nháy nhẹ).
     - Số lượt chăm sóc hoàn thành trong tuần.
     - Tỷ lệ giao dịch Blockchain đã xác thực an toàn (100% On-chain Verified).
   - **Hàng 2 (GIS Mini-Map & Phân bổ Sức khỏe):**
     - Bên trái: Bản đồ nhiệt (Heatmap) thu nhỏ hiển thị mật độ cây và điểm nóng sự cố.
     - Bên phải: Biểu đồ Donut phân bố sức khỏe cây (Tốt / Bình thường / Sâu bệnh / Nguy hiểm) có legend tương tác.
   - **Hàng 3 (Bảng Sự cố mới & Nhật ký Blockchain mới nhất):**
     - Danh sách sự cố người dân vừa gửi từ QR kèm ảnh thumbnail và nút "Điều phối ngay".
     - Feed giao dịch Blockchain: TxHash rút gọn, khối, thời gian ghi nhận dấu vân tay dữ liệu.

4. **A04 — Bản đồ Cây xanh GIS Chuyên sâu (React-Leaflet Interactive Map):**
   - Chế độ toàn màn hình có Toolbar điều khiển: Bộ lọc loài cây, lọc theo bán kính, lọc theo trạng thái sức khỏe, switch bật/tắt lớp ranh giới phường/quận.
   - Custom SVG Markers: Hình biểu tượng cây màu xanh lục/vàng/đỏ. Khi click mở **Quick-Detail Popup Card** gồm: Tên cây, mã QR, ảnh đại diện, đường kính tán, ngày chăm sóc gần nhất và nút mở Hồ sơ chi tiết.

5. **A05 — Danh bạ & Quản lý Cây xanh (Tree Data Table):**
   - TanStack Table v8 với khả năng chọn cột, sắp xếp đa trường, xuất Excel/CSV.
   - Bộ lọc Faceted: Lọc theo đường phố, năm trồng, loài cây, tình trạng sâu bệnh.
   - Hàng dữ liệu: Checkbox chọn nhiều để in QR Code hàng loạt, Menu thao tác 3 chấm (Xem, Sửa, Lịch sử, In QR).

6. **A06 — Hồ sơ Chi tiết Cây (Tree Detail 360°):**
   - Header: Mã định danh công khai (`TREE-0001`), tên loài tiếng Việt và khoa học, mã QR vector tải về SVG/PNG.
   - Tab 1 — Thông tin sinh học: Chiều cao, đường kính thân, tuổi ước tính, tọa độ GPS ghim trên mini-map.
   - Tab 2 — Nhật ký Chăm sóc: Timeline tương tác hiển thị từng lần nhân viên kiểm tra, ảnh chụp lá/thân, đơn vị thực hiện.
   - Tab 3 — Lịch sử Sự cố: Các phản ánh ngã đổ, gãy cành liên quan đến cây này và kết quả xử lý.
   - Tab 4 — Bằng chứng Blockchain: Danh sách các Block Hash chứng thực hồ sơ không bị can thiệp trái phép.

7. **A07 — Trung tâm Tiếp nhận & Điều phối Sự cố (Incident Command Center):**
   - Chế độ xem kép: Dạng Bảng (List view) hoặc Dạng Thẻ Kanban kéo thả theo quy trình:
     `Mới gửi (NEW) → Đã xác minh (VERIFIED) → Đã phân công (ASSIGNED) → Đang xử lý (IN_PROGRESS) → Đã hoàn thành (RESOLVED)`
   - Modal phân công công việc: Chọn nhân viên phụ trách từ danh sách, đặt mức độ ưu tiên (Thấp / Trung bình / Cao / Khẩn cấp), ghi chú chỉ đạo hiện trường.

8. **A08 — Cổng Kiểm toán & Xác minh Blockchain (Transparency & Audit Portal):**
   - Công cụ kiểm tra độc lập: Nhập ID bản ghi hoặc tải tệp dữ liệu -> Hệ thống tính toán hàm băm SHA-256 nội bộ -> Đối chiếu với Smart Contract trên mạng Hardhat.
   - Kết quả trực quan:
     - **HỢP LỆ (VERIFIED):** Dấu tích xanh lục, hiển thị thời điểm ký số, số khối, không phát hiện chỉnh sửa.
     - **KHÔNG KHỚP (MISMATCH):** Cảnh báo đỏ rực rỡ, chỉ ra sự sai lệch giữa cơ sở dữ liệu hiện tại và bằng chứng bất biến trên chuỗi khối.

---

### 6.2. HỆ THỐNG GIAO DIỆN WEB NGƯỜI DÂN (Public Responsive Web 390×844)
*Tối ưu Mobile-First, tải siêu nhanh, không bắt buộc cài app hay đăng ký tài khoản:*

1. **P01 — Trang Tra cứu Cây xanh từ QR Code (`/tree/{publicCode}`):**
   - Hero Header: Tên cây thân thiện, huy hiệu trạng thái sức khỏe dạng viên thuốc dễ hiểu (Ví dụ: "Cây khỏe mạnh" kèm icon mặt cười màu xanh).
   - Card sinh thái: Cung cấp thông tin thú vị (Lượng CO2 cây hấp thụ hàng năm, bóng mát tạo ra).
   - Bản đồ vị trí: Giúp người dân nhận diện cây xung quanh vị trí thực tế.
   - Hai nút hành động nổi bật (Floating Action Buttons):
     - **"Báo sự cố cho cây này"** (Nút màu cam đất nổi bật, viền phát sáng nhẹ).
     - **"Xem lịch sử chăm sóc công khai"** (Minh bạch hóa hoạt động của thành phố).

2. **P02 — Form Gửi Phản ánh Sự cố Tức thời (`/report`):**
   - Tự động điền mã cây nếu quét từ QR; nếu đứng ngoài đường thì có nút "Lấy tọa độ hiện tại qua GPS" an toàn.
   - Chọn loại sự cố trực quan qua Icon Grid: Cành gãy sà xuống, Cây nghiêng nguy hiểm, Bị phá hoại, Sâu bệnh héo úa.
   - Bộ kéo thả / chụp ảnh trực tiếp từ camera điện thoại (tối đa 3 ảnh), hiển thị thanh tiến trình tải ảnh mượt mà.
   - Trường nhập số điện thoại tùy chọn (để nhận tin nhắn cập nhật tiến độ xử lý).
   - Nút Gửi với hiệu ứng phản hồi xúc giác (Haptic/Spring feedback của `fancy`).

3. **P03 — Màn hình Xác nhận & Theo dõi Tiến độ (`/tracking/{code}`):**
   - Cung cấp Mã theo dõi sự cố (Tracking Code) to, rõ ràng kèm nút "Sao chép" và "Lưu ảnh biên nhận".
   - Timeline trạng thái công khai: "Đã tiếp nhận" -> "Đội cây xanh đang di chuyển" -> "Đã khắc phục xong (kèm ảnh nghiệm thu)".

---

### 6.3. HỆ THỐNG GIAO DIỆN NHÂN VIÊN HIỆN TRƯỜNG (Staff Mobile App / PWA)
*Thiết kế chuyên biệt cho thao tác một tay ngoài trời nắng:*

1. **S01 — Máy quét QR Thông minh (Quick Scanner Screen):**
   - Giao diện kính ngắm quét camera toàn màn hình, tốc độ nhận diện dưới 200ms.
   - Đèn pin trợ sáng, tự động chuyển hướng vào màn hình cập nhật sau khi quét đúng mã cây.

### 6.4. BẢNG KIỂM KÊ 100% GIAO DIỆN ĐÃ ĐỒNG BỘ FIGMA DESKTOP (CANVAS SNAPSHOT)

| Screen ID | Tên Frame Figma | Kích thước | Node ID | Trạng thái |
| :--- | :--- | :--- | :--- | :---: |
| **Canary** | `Test/Button/AI` | 134 × 41 px | `3:4` | **PASS ✓** |
| **Tokens** | `Tokens/Color Palette — Verdant Starry Night` | 680 × 519 px | `4:21` | **PASS ✓** |
| **Tokens** | `Tokens/Typography Scale — Inter & Plus Jakarta` | 680 × 697 px | `4:81` | **PASS ✓** |
| **Tokens** | `Primitives/Badges — Trạng thái Cây, Sự cố & Blockchain` | 680 × 421 px | `4:116` | **PASS ✓** |
| **A01** | `A01 — Login Admin/Staff (Desktop 1440x1024)` | 1440 × 1024 px | `5:166` | **PASS ✓** |
| **Shell** | `Admin Shell — Desktop 1440x1024 (Navigation & Layout)` | 1440 × 1024 px | `5:251` | **PASS ✓** |
| **A02** | `A02 — Quên & Đặt lại Mật khẩu (Desktop 1440x1024)` | 1440 × 1024 px | `8:2674` | **PASS ✓** |
| **A03** | `A03 — Hồ sơ Cá nhân & Bảo mật (Profile Drawer 600x1024)` | 600 × 1024 px | `8:2721` | **PASS ✓** |
| **A04** | `A04 — Dashboard Tổng quan (Desktop 1440x1024)` | 1440 × 1024 px | `5:384` | **PASS ✓** |
| **A05** | `A05 — Bản đồ Cây xanh GIS (Leaflet Map View 1440x1024)` | 1440 × 1024 px | `5:668` | **PASS ✓** |
| **A06** | `A06 — Danh sách Cây xanh (Tree List Table 1440x1024)` | 1440 × 1024 px | `6:861` | **PASS ✓** |
| **A07** | `A07 — Hồ sơ Chi tiết Cây 360 (Tree Detail 1440x1024)` | 1440 × 1024 px | `6:1200` | **PASS ✓** |
| **A08** | `A08 — Form Thêm & Chỉnh sửa Cây (Drawer Form 600x1024)` | 600 × 1024 px | `6:1351` | **PASS ✓** |
| **A09** | `A09 — Danh mục Loài cây (Species Catalog 1440x1024)` | 1440 × 1024 px | `8:2790` | **PASS ✓** |
| **A10** | `A10 — Quản lý QR Code & Thẻ In ấn (QR Management 600x1024)` | 600 × 1024 px | `6:1431` | **PASS ✓** |
| **A11** | `A11 — Nhật ký Chăm sóc Thực địa (Care Records 1440x1024)` | 1440 × 1024 px | `7:2074` | **PASS ✓** |
| **A12** | `A12 — Chi tiết Bản ghi Chăm sóc (Care Detail Drawer 600x1024)` | 600 × 1024 px | `8:2948` | **PASS ✓** |
| **A14** | `A14 — Trung tâm Điều phối Sự cố (Incident Command Center 1440x1024)` | 1440 × 1024 px | `7:1496` | **PASS ✓** |
| **A15** | `A15 — Chi tiết & Điều phối Sự cố (Dispatch Drawer 640x1024)` | 640 × 1024 px | `7:1720` | **PASS ✓** |
| **A15-Map** | `A15 — Bản đồ Điều phối Sự cố Hiện trường (Incident GIS Map 1440x1024)` | 1440 × 1024 px | `7:1798` | **PASS ✓** |
| **A16** | `A16 — Danh sách Nhân viên Hiện trường (Staff List 1440x1024)` | 1440 × 1024 px | `7:1916` | **PASS ✓** |
| **A17** | `A17 — Chi tiết Nhân viên & Phân quyền (Staff Detail Drawer 600x1024)` | 600 × 1024 px | `8:3005` | **PASS ✓** |
| **A18** | `A18 — Kiểm toán Giao dịch Blockchain (Activity Explorer 1440x1024)` | 1440 × 1024 px | `7:2203` | **PASS ✓** |
| **A19** | `A19 — Cổng Xác minh Toàn vẹn Dữ liệu (Integrity Verification 1440x1024)` | 1440 × 1024 px | `7:2327` | **PASS ✓** |
| **P01** | `P01 — Trang Cây xanh Công khai từ QR (Mobile 390x844)` | 390 × 844 px | `7:2420` | **PASS ✓** |
| **P02** | `P02 — Form Báo Phản ánh Sự cố (Mobile 390x844)` | 390 × 844 px | `8:2489` | **PASS ✓** |
| **P03** | `P03 — Màn hình Tiếp nhận Thành công (Mobile 390x844)` | 390 × 844 px | `8:2558` | **PASS ✓** |
| **P04** | `P04 — Tra cứu Tiến độ Xử lý Sự cố (Mobile 390x844)` | 390 × 844 px | `8:2608` | **PASS ✓** |
| **M01** | `M01 — Đăng nhập Nhân viên Hiện trường (Mobile 390x844)` | 390 × 844 px | `10:3096` | **PASS ✓** |
| **M02** | `M02 — Màn hình Chính / Nhiệm vụ Hôm nay (Mobile 390x844)` | 390 × 844 px | `10:3145` | **PASS ✓** |
| **M03** | `M03 — Máy quét QR Thông minh (Mobile 390x844)` | 390 × 844 px | `10:3217` | **PASS ✓** |
| **M04** | `M04 — Chi tiết Cây trên Mobile (Mobile 390x844)` | 390 × 844 px | `10:3249` | **PASS ✓** |
| **M05** | `M05 — Biểu mẫu Chăm sóc Thực địa (Mobile 390x844)` | 390 × 844 px | `10:3300` | **PASS ✓** |
| **M06** | `M06 — Danh sách Công việc Hiện trường (Mobile 390x844)` | 390 × 844 px | `10:3364` | **PASS ✓** |
| **M07** | `M07 — Xử lý Sự cố Được giao (Mobile 390x844)` | 390 × 844 px | `10:3430` | **PASS ✓** |
| **M08** | `M08 — Cập nhật Tiến độ & Nghiệm thu (Mobile 390x844)` | 390 × 844 px | `10:3467` | **PASS ✓** |
| **M10** | `M10 — Tài khoản & Phiên làm việc (Mobile 390x844)` | 390 × 844 px | `10:3516` | **PASS ✓** |
## 7. KIẾN TRÚC FRONTEND CODEBASE (SHADCN + FANCY + LEAFLET)

### 7.1. Cấu trúc thư mục chuẩn mực (Vite + React 19)
```
src/
├── assets/                  # Icons, vector artwork phong cách Van Gogh, static tiles
├── components/
│   ├── ui/                  # Các primitives từ shadcn/ui (Button, Dialog, Input, Table...)
│   ├── fancy/               # Các component hiệu ứng từ Daniel Petho (GlowCard, Magnetic, TextMorph...)
│   ├── maps/                # Leaflet map container, custom markers, cluster layer, popups
│   ├── layout/              # Sidebar, Header, Breadcrumbs, AdminShell, MobileShell
│   └── shared/              # StatusBadge, QRViewer, BlockchainBadge, MetricCard
├── features/
│   ├── auth/                # Login form, auth context, permission guards
│   ├── dashboard/           # Bento grid widgets, metric analytics, chart components
│   ├── trees/               # Tree catalog table, tree detail tabs, tree add/edit drawer
│   ├── incidents/           # Incident board (Kanban), incident list, assignment modal
│   ├── blockchain/          # Blockchain verification tool, audit log table, hash diff viewer
│   └── public-portal/       # Citizen tree viewer, public incident report form, tracking timeline
├── hooks/                   # useFigmaTokens, useGeolocation, useMediaQuery, useLeafletMap
├── lib/                     # utils.ts, tailwind-merge, contract-helpers, api-client
├── styles/                  # globals.css (chứa toàn bộ CSS Variables tương thích Figma tokens)
└── App.tsx                  # React Router v7 routes configuration
```

### 7.2. Cấu hình Tailwind CSS hòa hợp với Fancy và Shadcn
File `tailwind.config.js` được chuẩn hóa để nạp trọn bộ bảng màu `Verdant Starry Night`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "var(--brand-primary)",       /* #174B36 */
          secondary: "var(--brand-secondary)",   /* #347A50 */
          accent: "var(--brand-accent)",         /* #4C956C */
          warm: "var(--gold-warm)",              /* #F3E8B2 */
        },
        surface: {
          canvas: "var(--surface-canvas)",       /* #F6F5EC */
          card: "var(--surface-card)",           /* #FFFFFF */
          subtle: "var(--surface-subtle)",       /* #E0EBDD */
        },
        status: {
          good: "#22C55E",
          fair: "#EAB308",
          poor: "#F97316",
          danger: "#EF4444",
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "glow-pulse": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.5" } }
      },
      animation: {
        "glow-pulse": "glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## 8. QUY TRÌNH 8 BƯỚC VẬN HÀNH, KIỂM TRA VÀ ROLLBACK

### 8.1. Ma trận 8 bước thực thi chuẩn mực (SOP)
| Bước | Tên nhiệm vụ | Thao tác kỹ thuật chi tiết | Tiêu chuẩn nghiệm thu |
|---|---|---|---|
| **Bước 1** | **Đọc tài liệu & Đánh giá an toàn** | Đọc kỹ `README.md`, `package.json` của 4 repo. Không tự động clone mã lạ. | Hiểu rõ license, cơ chế IPC của figma-cli |
| **Bước 2** | **Kiểm tra môi trường Windows** | Chạy kiểm tra Node.js, npm, Git, trạng thái tiến trình Figma Desktop. | Đã xác nhận: Node v24, npm 11, Figma đang chạy |
| **Bước 3** | **Xác định cơ chế gọi CLI trong Antigravity** | Sử dụng Antigravity Skill `figma-cli` và lệnh nền qua `run_command`. | Không phụ thuộc cấu hình Cursor/Claude |
| **Bước 4** | **Bảo toàn cấu hình & Dự án cũ** | Không chỉnh sửa `mcp_config.json`, không can thiệp thư mục hệ thống. | Zero side-effects |
| **Bước 5** | **Ưu tiên Safe Mode / Cảnh báo rủi ro** | Khởi chạy Daemon Safe Mode, xuất plugin manifest vào thư mục dự án. | Port 3456-3460 mở, không can thiệp tệp nhị phân Figma |
| **Bước 6** | **Kiểm kê Figma chỉ đọc (Read-Only Inventory)** | Chạy lệnh đọc danh sách Page, Frame, Component hiện hành trên file mở. | Tạo bảng snapshot chi tiết, không sửa frame cũ |
| **Bước 7** | **Thử nghiệm ghi với Canary Component** | Render component mẫu: `Test/Button/AI` trên khu vực canvas cô lập. | Đo lường bằng `figma-cli verify` đạt kích thước chuẩn |
| **Bước 8** | **Báo cáo, Bàn giao & Kế hoạch Rollback** | Xuất báo cáo trạng thái chi tiết, tài liệu hóa các bước và kịch bản hoàn tác. | Người dùng nghiệm thu 100% |

### 8.2. Kế hoạch Phục hồi & Khôi phục khẩn cấp (Rollback Plan)
- **Nếu lệnh Render vào Figma bị lỗi hoặc đặt sai vị trí:**
  - Chạy ngay lệnh: `figma-cli undo` để xóa ngay các node vừa được tạo ra ở phiên render gần nhất.
  - Hoặc trong Figma Desktop: Nhấn tổ hợp phím chuẩn `Ctrl + Z`.
- **Nếu Plugin Safe Mode bị treo hoặc mất kết nối:**
  - Đóng cửa sổ Plugin FigCli trong Figma Desktop.
  - Khởi động lại daemon bằng lệnh: `figma-cli daemon restart`.
- **Nếu tệp mã nguồn Frontend bị xung đột:**
  - Git rollback: `git checkout -- <file>` hoặc hoàn tác qua lịch sử phiên làm việc của Antigravity IDE.

---

## 9. KẾT QUẢ TRIỂN KHAI PROMPT 08 — SUB-PAGES, TRANG CON CẤP 2/3 & TRẠNG THÁI NGHIỆP VỤ

### 9.1. Danh sách Sub-pages & Exceptional States Đã Đồng bộ Figma Desktop
| Subpage ID | Tên Frame Figma | Kích thước | Node ID | Phân loại & Chức năng Nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- |
| **CARE-S1** | `CARE-S1 — Lịch Chăm sóc Cây xanh Dạng Tháng (Calendar 1440x1024)` | 1440 × 1024 px | `10:3603` | Lịch tháng công tác cắt tỉa, bón phân theo khu vực; thẻ ngày hôm nay nổi bật, filter tuần/tháng/danh sách. |
| **INC-S6** | `INC-S6 — Lightbox Xem Ảnh Hiện trường (Gallery 1440x1024)` | 1440 × 1024 px | `11:3815` | Dark mode overlay phóng to ảnh hiện trường, thanh 3 thumbnails (người dân gửi, xe nâng cắt, nghiệm thu an toàn) kèm SHA-256 On-chain. |
| **A08-S3** | `A08-S3 — Dialog Cảnh báo Chưa lưu (Unsaved Dialog 520x260)` | 520 × 260 px | `11:3864` | Hộp thoại cảnh báo mất dữ liệu nhập dở khi đóng form thêm cây, nút "Tiếp tục chỉnh sửa" & "Bỏ thay đổi". |
| **A06-S3** | `A06-S3 — Dialog Thao tác Hàng loạt (Bulk Print Modal 520x280)` | 520 × 280 px | `11:3883` | Xác nhận in hàng loạt 25 tem Decal xi bạc ngoài trời chống nước tuyến Lê Lợi, xuất file PDF/SVG 300 DPI. |
| **PUB-S10** | `PUB-S10 — Tra cứu Không tìm thấy (Mobile 390x844)` | 390 × 844 px | `11:3908` | Màn hình người dân nhập sai mã ticket #INC-9999, hướng dẫn quét lại QR trên thân cây hoặc gọi tổng đài 1022. |
| **M03-S2** | `M03-S2 — Cấp quyền Camera (Mobile 390x844)` | 390 × 844 px | `11:3945` | Màn hình giải thích lý do cần camera quét QR và chụp ảnh nghiệm thu, nút vào Cài đặt thiết bị & Nhập mã số tay. |
| **M05-S3** | `M05-S3 — Hàng đợi Đồng bộ Offline (Mobile 390x844)` | 390 × 844 px | `11:3979` | Danh sách 2 bản ghi lưu tạm vào bộ nhớ máy (Hive) khi mất sóng 4G, tự động đồng bộ khi có kết nối trở lại. |

---

## 10. KẾT QUẢ NGHIỆM THU PROMPT 09 — FIGMA QA, PROTOTYPES & HANDOFF

### 10.1. Inventory QA Checklist Toàn diện (44 Màn hình + Sub-pages + 7 Section Banners)
- **Foundations (4/4)**: Canary Component, Color Palette Verdant Starry Night, Typography Scale Inter & Plus Jakarta, Primitives Badges.
- **Web Admin A01–A19 + Sub-pages (22 màn hình Desktop & Drawer/Modal)**: A01 Login, Admin Shell, A02 Quên mật khẩu, A03 Profile Drawer, A04 Bento Dashboard, A05 GIS Map Leaflet, A06 Tree List Table, A06-S3 Bulk Print Modal, A07 Tree Detail 360°, A08 Add Tree Drawer, A08-S3 Unsaved Changes Dialog, A09 Species Catalog, A10 QR Management Drawer, A11 Care Records, A12 Care Detail Drawer, CARE-S1 Care Calendar Month, A14 Incident Command Center, A15 Incident Dispatch Drawer, A15 Incident Map, INC-S6 Evidence Gallery Lightbox, A16 Staff List, A17 Staff Detail Drawer, A18 Blockchain Explorer, A19 Integrity Verification Portal.
- **Public Web P01–P04 + Sub-page (5 màn hình Mobile 390×844)**: P01 Tra cứu QR công khai, P02 Form báo sự cố khẩn cấp, P03 Màn hình tiếp nhận mã #INC-1024, P04 Tra cứu tiến độ timeline, PUB-S10 Lookup Not Found state.
- **Flutter Staff App M01–M10 + Sub-pages (11 màn hình Mobile 390×844)**: M01 Login nhân viên, M02 Home nhiệm vụ & Nút QR 56px, M03 Smart QR Scanner, M03-S2 Camera Permission Denied, M04 Chi tiết cây sau quét QR, M05 Form chăm sóc 4 mức sức khỏe & camera, M05-S3 Offline Sync Queue, M06 Danh sách công việc 3 tabs, M07 Tiếp nhận sự cố khẩn cấp, M08 Nghiệm thu sự cố & an toàn lưới điện, M10 Hồ sơ nhân viên & Đồng bộ dữ liệu offline.

### 10.2. Visual & Accessibility QA (WCAG 2.1 AA)
- **Độ tương phản màu sắc**: Text chính `#174B36` và `#28352B` trên nền `#F6F5EC` đạt tỉ lệ tương phản `8.4:1` (vượt chuẩn yêu cầu 4.5:1).
- **Vùng chạm cảm ứng Mobile**: Đạt tối thiểu từ 44×44px đến 56×56px trên mọi màn hình di động.
- **Typography Scale**: Thống nhất font Inter & Plus Jakarta Sans với phân tầng kích thước chuẩn.

### 10.3. Prototype Interaction Flows (21 Native Figma Connections)
1. **Luồng Quản trị (Admin Flow - 7 kết nối)**:
   - `A01 Login` ➔ `A04 Dashboard` ➔ `A07 Tree Detail` ➔ `A15 Dispatch Drawer` ➔ `A14 Incident Center`.
   - `A06 Tree List` ➔ Bấm "In hàng loạt" ➔ Mở `A06-S3 Bulk Print Modal`.
   - `A08 Add Tree Drawer` ➔ Bấm Hủy bỏ ➔ Mở `A08-S3 Unsaved Changes Dialog`.
   - `A11 Care Records` ➔ Bấm Lịch biểu ➔ Mở `CARE-S1 Care Calendar Month`.
   - `A14 Incident Center` ➔ Bấm xem ảnh hiện trường ➔ Mở `INC-S6 Evidence Gallery Lightbox`.
2. **Luồng Người dân (Public Web Flow - 4 kết nối)**:
   - `P01 Tree Profile` ➔ `P02 Report Form` ➔ `P03 Success Confirmation (#INC-1024)` ➔ `P04 Tracking Timeline`.
   - `P04 Tracking Timeline` ➔ Nhập sai mã ➔ Mở `PUB-S10 Lookup Not Found State`.
3. **Luồng Nhân viên Hiện trường (Flutter Mobile Flow - 10 kết nối)**:
   - `M01 Login` ➔ `M02 Home` ➔ `M03 QR Scanner` ➔ `M04 Tree Detail` ➔ `M05 Care Form`.
   - `M03 Scanner` ➔ Khi từ chối quyền camera ➔ Mở `M03-S2 Camera Permission Denied`.
   - `M05 Care Form` ➔ Khi mất sóng 4G ➔ Mở `M05-S3 Offline Sync Queue`.
   - `M02 Home` ➔ `M07 Incident Action` ➔ `M08 Resolution` ➔ `M06 Task List` ➔ `M10 Profile & Sync`.

### 10.4. Handoff Checklist cho Frontend Development
- **Web Admin**: React 19 + TypeScript + Vite + Tailwind CSS + Lucide Icons + TanStack Table v8 + React-Leaflet + Radix UI (Shadcn Admin) + Ethers.js v6 kết nối Hardhat.
- **Public Web**: React / Next.js Responsive Mobile-first (390×844), thời gian tải trang < 1.5s, không cần login.
- **Staff Mobile App**: Flutter 3.x (Dart), `mobile_scanner`, `geolocator`, cơ chế Offline-First với Hive/Isar.
