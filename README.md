# 🌳 UrbanTree — Hệ thống Quản lý Cây xanh Đô thị (QR Code & Blockchain Sepolia)

> **Học phần:** Đồ án 4 / Blockchain Cơ bản (CNTT2311)  
> **Nhóm thực hiện (2 thành viên):**  
> - **Đoàn Thế Thuần:** Backend nghiệp vụ, Database (MySQL), RESTful API, Seed data & Postman.  
> - **Trần Quang Lâm:** Smart Contract (Solidity trên Ethereum Sepolia Testnet), SHA-256 Hash Integrity & Field Diff, Frontend React & Tích hợp xác minh.

---

## 📌 1. Mục tiêu & Vấn đề giải quyết

Dự án **UrbanTree** giải quyết 3 bài toán trọng tâm trong quản trị cây xanh đô thị:
1. **Định danh số & Tra cứu tức thì qua QR:** Mỗi cây xanh được cấp mã công khai (`TREE-001`, ...) và mã QR cố định. Người dân quét QR để xem lý lịch cây, lịch sử chăm sóc/sự cố của cây đó và gửi báo cáo sự cố (không cần tài khoản hay nhớ mã vé để theo dõi lại).
2. **Theo dõi tác nghiệp, Chi phí dịch vụ & Điều phối sự cố:** Nhân viên ghi nhận nhật ký chăm sóc/cắt tỉa (kèm chi phí dịch vụ VNĐ); Ban quản lý tiếp nhận phản ánh và điều phối xử lý theo quy trình rõ ràng.
3. **Bảo chứng toàn vẹn dữ liệu (Ethereum Sepolia Blockchain):** Mọi bản ghi quan trọng (`TREE_PROFILE`, `CARE_LOG`, `INCIDENT_REPORT`) được chuẩn hóa dữ liệu, băm **SHA-256** và neo bất biến lên Smart Contract `UrbanTreeRegistry` trên mạng **Sepolia Testnet**. Hệ thống kiểm toán hỗ trợ đối chiếu từng trường dữ liệu (*cây xanh, dịch vụ cắt tỉa, chi phí VNĐ, thời gian...*) để phát hiện và chỉ rõ ngay vị trí bị chỉnh sửa trái phép trong cơ sở dữ liệu (*Zero Mismatch*).

---

## 🛠️ 2. Công nghệ thực tế của Dự án (Tech Stack)

| Thành phần | Công nghệ lựa chọn | Ghi chú kỹ thuật |
| :--- | :--- | :--- |
| **Giao diện hợp nhất** | React 19 + TypeScript + Tailwind CSS + Vite | Build thành bundle `dist/` và phục vụ chung một cổng duy nhất qua Express (`http://localhost:5001`). |
| **Backend API** | Node.js (v18+) + Express.js | Phục vụ cả Giao diện React và toàn bộ RESTful API + Web3 Relayer trên cổng `5001`. |
| **Cơ sở dữ liệu** | MySQL (`mysql2/promise` — Aiven Cloud) | Lưu trữ dữ liệu Off-chain (schema `blockchain`, SSL, `dateStrings: true`, `timezone: 'Z'`). |
| **Blockchain** | Solidity `0.8.20` (Deploy qua **Remix IDE**) | Triển khai trên **Ethereum Sepolia Testnet** (`Chain ID: 11155111`), Contract: `0x5E18EdFb8a30B647853dA6171B32Be9C5f98573C`. |
| **RPC & Web3 Client** | Alchemy Sepolia RPC + Ethers.js (v6) | Backend ký gửi transaction (`Signer`) và đọc/xác minh miễn phí 0 gas (`Provider`). |
| **Tính toàn vẹn** | SHA-256 Canonical Hashing + Snapshot Diff | Chuẩn hóa chuỗi trước khi băm và lưu `payload_snapshot` để đối chiếu chi tiết từng trường khi kiểm toán. |
| **Mã định danh** | Thư viện `qrcode` + Leaflet Map | Tạo mã QR động và bản đồ phân bố cây xanh trực quan. |

---

## 🚀 3. Luồng Nghiệp vụ & Kịch bản Trình diễn (Demo Flow)

1. **Luồng Công cộng (Người dân / Khách vãng lai):**
   - Quét mã QR trên thân cây $\rightarrow$ Mở lý lịch cây, xem sẵn lịch sử chăm sóc & các phản ánh sự cố của cây đó.
   - Bấm **"Báo cáo sự cố"** $\rightarrow$ Chọn mức độ, nhập mô tả $\rightarrow$ Lưu tự động lịch sử phản ánh trên trình duyệt và cho phép tra cứu theo cây / SĐT / danh sách gần đây (không cần nhớ mã `INC-...`).

2. **Luồng Tác nghiệp (Nhân viên hiện trường):**
   - Chọn cây cần chăm sóc $\rightarrow$ Nhập loại dịch vụ (*Cắt tỉa, Tưới nước, Bón phân...*), **Chi phí dịch vụ (VNĐ)** và ghi chú.
   - Hệ thống băm SHA-256 toàn bộ thông tin và tự động gửi transaction neo lên **Sepolia**.

3. **Luồng Quản trị & Điều phối (Admin):**
   - Quản lý cây xanh, bản đồ, in QR code.
   - Tiếp nhận phản ánh sự cố $\rightarrow$ Điều phối nhân viên $\rightarrow$ Nghiệm thu hoàn thành kèm chi phí xử lý và niêm phong lên **Sepolia**.

4. **Luồng Kiểm toán & Phát hiện gian lận (Tamper Lab):**
   - Mở tab **Kiểm toán Blockchain** (`/verifier` hoặc tab trên giao diện chính).
   - Chọn bản ghi $\rightarrow$ Hệ thống đọc dữ liệu **trực tiếp từ MySQL**, tính lại SHA-256 và đối chiếu với hash gốc trên **Sepolia Smart Contract**:
     - **Dữ liệu chuẩn:** Báo **Xanh (`VALID`)** — hiển thị bảng đối chiếu khớp toàn bộ từng trường (cây xanh, dịch vụ, tiền dịch vụ VNĐ, thời gian).
     - **Giả lập gian lận (Tamper Lab):** Bấm sửa lén dữ liệu trong MySQL (ví dụ nâng khống tiền dịch vụ +5.000.000 VNĐ) $\rightarrow$ Kiểm tra lại $\rightarrow$ Báo **Đỏ (`MISMATCH`)** và tô đỏ chỉ thẳng dòng bị sửa!

---

## 📂 4. Cấu trúc Dự án

```text
UrbanTree/
├── backend/
│   ├── contracts/
│   │   └── UrbanTreeRegistry.sol   # Smart Contract Solidity 0.8.20 (deploy qua Remix IDE lên Sepolia)
│   ├── deployed-contract.json      # Lưu thông tin mạng Sepolia & địa chỉ Contract đã deploy
│   ├── scripts/
│   │   └── run_demo.js             # Script chạy thử luồng API tự động
│   ├── src/
│   │   ├── config/db.js            # Kết nối MySQL (Aiven Cloud) + khởi tạo schema & seed data
│   │   ├── controllers/            # Xử lý nghiệp vụ (Tree, Care, Incident, Dashboard)
│   │   ├── models/                 # Truy vấn SQL (Tree, CareRecord, Incident)
│   │   ├── public/                 # Các trang HTML dự phòng (/legacy/admin, /legacy/citizen, /legacy/verifier)
│   │   ├── routes/                 # RESTful API & Blockchain Audit Routes (/api/blockchain/*)
│   │   ├── services/
│   │   │   ├── blockchainClient.js # Kết nối Alchemy Sepolia RPC & tương tác Smart Contract qua Ethers.js
│   │   │   └── hashService.js      # Chuẩn hóa dữ liệu, băm SHA-256 & so sánh từng trường (compareSnapshots)
│   │   └── server.js               # Server hợp nhất (phục vụ React dist/ + Backend API trên cổng 5001)
│   └── package.json
├── src/                            # Mã nguồn Frontend React + TypeScript + Tailwind + Leaflet
│   ├── components/                 # Dashboard, TreeList, Map, CareRecords, Incidents, BlockchainVerifyView
│   ├── db/storage.ts               # Tầng giao tiếp Backend API (/api/*)
│   ├── services/                   # apiMapper, blockchainService, hashService, qrService
│   ├── types/index.ts
│   └── App.tsx
├── vite.config.ts
├── package.json                    # Chứa lệnh hợp nhất: npm start
└── README.md
```

---

## ⚡ 5. Hướng dẫn Cài đặt & Khởi chạy (1 Cổng Duy Nhất)

### 5.1. Yêu cầu môi trường
* Node.js phiên bản 18.x hoặc 20.x trở lên.
* Tài khoản MySQL (hoặc dùng MySQL Aiven Cloud) và RPC URL mạng Sepolia (Alchemy/Infura).

### 5.2. Cài đặt thư viện
Chạy cài đặt cho cả thư mục gốc (Frontend) và thư mục `backend`:
```powershell
npm install
cd backend
npm install
cd ..
```

### 5.3. Cấu hình biến môi trường (`backend/.env`)
Tạo file `backend/.env` (không commit lên Git) với các biến sau:
```env
PORT=5001

# MySQL (Aiven Cloud hoặc MySQL Local)
DB_HOST=<MYSQL_HOST>
DB_PORT=<MYSQL_PORT>
DB_USER=<MYSQL_USER>
DB_PASSWORD=<MYSQL_PASSWORD>
DB_NAME=blockchain
DB_SSL=true

# Blockchain (Ethereum Sepolia Testnet - Deploy bằng Remix IDE)
BLOCKCHAIN_NETWORK=sepolia
BLOCKCHAIN_CHAIN_ID=11155111
BLOCKCHAIN_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<ALCHEMY_API_KEY>
DEPLOYER_PRIVATE_KEY=<SEPOLIA_WALLET_PRIVATE_KEY>
CONTRACT_ADDRESS=0x5E18EdFb8a30B647853dA6171B32Be9C5f98573C
```

### 5.4. Khởi chạy toàn bộ hệ thống (chỉ 1 lệnh)
Tại thư mục gốc `UrbunTree`:
```powershell
npm start
```
*(Lệnh này tự động build giao diện React vào `dist/` và khởi chạy Server hợp nhất tại cổng `5001`).*

* **Truy cập ứng dụng trên trình duyệt:** `http://localhost:5001`
* **Truy cập nhanh các màn hình:**
  * Kiểm toán Blockchain: `http://localhost:5001/verifier`
  * Phản ánh & Tra cứu (Người dân): `http://localhost:5001/citizen`
  * Kiểm tra kết nối Sepolia API: `GET http://localhost:5001/api/blockchain/status`

*(Nếu muốn chạy chế độ hot-reload Frontend riêng khi phát triển giao diện: chạy Backend `npm --prefix backend run dev` ở Terminal 1 và `npm run dev` ở Terminal 2 rồi mở `http://localhost:3000` — Vite đã cấu hình proxy `/api` về `5001`).*

---

## 👥 6. Phân chia Trách nhiệm

* **Đoàn Thế Thuần (Backend / Database):** Phụ trách toàn bộ CRUD Tree, Incident, Care Logs, MySQL schema, Seed data dữ liệu mẫu và viết API kiểm thử qua Postman.
* **Trần Quang Lâm (Blockchain / Frontend):** Phụ trách Smart Contract `UrbanTreeRegistry.sol` (Sepolia Testnet via Remix), module băm SHA-256 & đối chiếu từng trường, dịch vụ Web3 `blockchainClient.js` và giao diện React tích hợp.
