const { ethers } = require('ethers'); // Thư viện Web3 Ethers.js phiên bản 6
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * ============================================================================
 * 🌐 MODULE KẾT NỐI VÀ THAO TÁC HỢP ĐỒNG THÔNG MINH (BLOCKCHAIN CLIENT)
 * Dành cho Dự án UrbanTree (CNTT2311)
 * Người thực hiện: Trần Quang Lâm (MSSV: 2311074) — Blockchain Lead
 * ============================================================================
 * 📌 VAI TRÒ CỦA FILE NÀY:
 * - Đóng vai trò là cầu nối giữa Backend Node.js với Mạng EVM Blockchain (Hardhat Node).
 * - Quản lý việc đọc ABI và Contract Address từ file `deployed-contract.json`.
 * - Cung cấp 2 cơ chế:
 *   1. READ-ONLY qua Provider: Gọi các hàm 'view' (0 tốn gas, không cần private key).
 *   2. WRITE qua Signer: Ký số bằng Private Key để gửi transaction neo dữ liệu lên chuỗi.
 * ============================================================================
 */

// Địa chỉ cổng mạng RPC của Node Hardhat chạy local (mặc định cổng 8545)
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';

// Khóa bí mật (Private Key) của tài khoản ví #0 mà Hardhat tự tạo ra khi chạy `hardhat node`
// Đây là ví mặc định có sẵn 10.000 ETH ảo để test, được gán làm Owner của Smart Contract
const DEFAULT_PRIVATE_KEY =
    process.env.DEPLOYER_PRIVATE_KEY ||
    '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

// Khai báo giao diện ABI (Application Binary Interface) để Ethers.js biết các hàm của Smart Contract
const ABI = [
    'function owner() external view returns (address)',
    'function authorizedRecorders(address) external view returns (bool)',
    'function authorizeRecorder(address _account) external',
    'function revokeRecorder(address _account) external',
    'function anchorRecord(string _recordId, string _recordType, string _dataHash) external',
    'function verifyRecord(string _recordId, string _currentHash) external view returns (bool isValid, bool isExisted, uint256 timestamp, address recorder, string memory storedHash)',
    'function getRecord(string _recordId) external view returns (tuple(string recordId, string recordType, string dataHash, uint256 timestamp, address recorder, bool exists))',
    'function getRecordCount() external view returns (uint256)',
    'function getAllRecordIds() external view returns (string[] memory)'
];

let cachedDeployment = null; // Biến cache cấu hình contract để tránh đọc file nhiều lần

// Đọc địa chỉ hợp đồng thông minh đã deploy từ file deployed-contract.json
function getDeploymentConfig() {
    if (cachedDeployment) return cachedDeployment; // Nếu đã nạp rồi thì trả về luôn
    const deploymentPath = path.resolve(__dirname, '../../deployed-contract.json');
    if (!fs.existsSync(deploymentPath)) {
        throw new Error(`blockchainClient: Không tìm thấy file ${deploymentPath}. Bạn cần chạy lệnh 'npm run chain:deploy' trước.`);
    }
    const raw = fs.readFileSync(deploymentPath, 'utf8');
    cachedDeployment = JSON.parse(raw);
    return cachedDeployment;
}

// 1. Tạo Provider: Kết nối đường truyền chỉ đọc (Read-only) tới Node Blockchain
function getProvider() {
    return new ethers.JsonRpcProvider(RPC_URL);
}

// 2. Tạo Signer: Đại diện cho chiếc ví có Private Key dùng để ký giao dịch (Write)
function getSigner(provider = getProvider()) {
    return new ethers.Wallet(DEFAULT_PRIVATE_KEY, provider);
}

// 3. Khởi tạo đối tượng Smart Contract bằng Ethers.js
function getContract(signerOrProvider) {
    const deployment = getDeploymentConfig();
    const target = signerOrProvider || getSigner(); // Mặc định dùng Signer nếu không chỉ định
    return new ethers.Contract(deployment.contractAddress, ABI, target);
}

/**
 * 4. HÀM NEO BẢN GHI LÊN CHUỖI KHỐI (Gửi Transaction thực thụ)
 * @param {string} recordId Mã định danh bản ghi (VD: "TREE-001")
 * @param {string} recordType Phân loại bản ghi ("TREE_PROFILE" / "CARE_LOG" / "INCIDENT_REPORT")
 * @param {string} dataHash Mã băm SHA-256 gồm đúng 64 ký tự hex
 * @returns {Promise<Object>} Trả về { txHash, blockNumber, gasUsed, recorder }
 */
async function anchor(recordId, recordType, dataHash) {
    // Kiểm tra tính hợp lệ của các tham số đầu vào
    if (!recordId || !recordType || !dataHash) {
        throw new Error('blockchainClient.anchor: Thiếu tham số (recordId, recordType, dataHash)');
    }
    if (dataHash.length !== 64) {
        throw new Error(`blockchainClient.anchor: dataHash phải có đúng 64 ký tự hex (hiện tại: ${dataHash.length})`);
    }

    const signer = getSigner();             // Lấy ví có khóa riêng để ký
    const contract = getContract(signer);   // Kết nối tới Smart Contract

    // Gửi giao dịch gọi hàm anchorRecord lên mạng Blockchain
    const tx = await contract.anchorRecord(recordId, recordType, dataHash);
    
    // Chờ giao dịch được các node thợ đào xác nhận đóng gói vào khối (Block)
    const receipt = await tx.wait();

    // Trả về biên lai giao dịch thành công
    return {
        txHash: tx.hash,                                      // Mã băm định danh giao dịch (Tx Hash)
        blockNumber: receipt.blockNumber,                      // Số thứ tự khối chứa giao dịch
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : null, // Lượng gas đã tiêu tốn
        recorder: signer.address                               // Địa chỉ ví thực hiện ký
    };
}

/**
 * 5. HÀM XÁC THỰC TOÀN VẸN BẢN GHI (Hàm View - Hoàn toàn 0 tốn gas)
 * @param {string} recordId Mã bản ghi cần kiểm tra (VD: "TREE-001")
 * @param {string} currentHash Mã băm vừa tính lại từ SQLite
 * @returns {Promise<Object>} Kết quả so khớp: isValid = true (Tích xanh) hoặc false (Báo đỏ)
 */
async function verify(recordId, currentHash) {
    if (!recordId) {
        throw new Error('blockchainClient.verify: recordId không được để trống');
    }

    const provider = getProvider();             // Dùng provider đọc dữ liệu (không cần ký phí)
    const contract = getContract(provider);     // Kết nối hợp đồng chế độ View

    // Gọi hàm verifyRecord trên Smart Contract
    const [isValid, isExisted, timestamp, recorder, storedHash] = await contract.verifyRecord(
        recordId,
        currentHash || ''
    );

    // Trả về kết quả đối soát trực quan cho Cổng kiểm toán A19
    return {
        recordId,
        isValid: Boolean(isValid),               // true nếu trùng khớp 100%, false nếu dữ liệu bị sửa lén
        isExisted: Boolean(isExisted),           // true nếu đã có trên Blockchain
        timestamp: Number(timestamp),            // Thời gian lưu dạng timestamp giây
        dateFormatted: Number(timestamp) > 0 ? new Date(Number(timestamp) * 1000).toISOString() : null, // Đổi sang ngày giờ đọc được
        recorder,                                // Ví đã neo bản ghi này
        storedHash,                              // Mã băm gốc lưu trên chuỗi
        currentHash: currentHash || null         // Mã băm hiện thời của database
    };
}

/**
 * 6. Đọc trực tiếp chi tiết 1 bản ghi từ Smart Contract (Hàm View - 0 gas)
 */
async function getRecord(recordId) {
    const provider = getProvider();
    const contract = getContract(provider);
    const rec = await contract.getRecord(recordId);

    return {
        recordId: rec.recordId,
        recordType: rec.recordType,
        dataHash: rec.dataHash,
        timestamp: Number(rec.timestamp),
        dateFormatted: new Date(Number(rec.timestamp) * 1000).toISOString(),
        recorder: rec.recorder,
        exists: rec.exists
    };
}

/**
 * 7. Lấy danh sách toàn bộ bản ghi phục vụ Cổng Explorer A18 (Hàm View - 0 gas)
 */
async function getAllRecords() {
    const provider = getProvider();
    const contract = getContract(provider);

    const count = Number(await contract.getRecordCount()); // Đọc tổng số bản ghi
    const ids = await contract.getAllRecordIds();          // Đọc danh sách mã ID

    const records = [];
    for (const id of ids) {
        try {
            const rec = await contract.getRecord(id);
            records.push({
                recordId: rec.recordId,
                recordType: rec.recordType,
                dataHash: rec.dataHash,
                timestamp: Number(rec.timestamp),
                dateFormatted: new Date(Number(rec.timestamp) * 1000).toISOString(),
                recorder: rec.recorder
            });
        } catch (e) {
            // Bỏ qua nếu có lỗi ở từng bản ghi đơn lẻ
        }
    }

    return {
        totalRecords: count,
        records
    };
}

/**
 * 8. Kiểm tra tình trạng kết nối mạng Blockchain Node
 * Dùng cho endpoint GET /api/blockchain/status
 */
async function getNetworkStatus() {
    try {
        const provider = getProvider();
        const blockNumber = await provider.getBlockNumber();    // Lấy số block mới nhất
        const signer = getSigner(provider);
        const balance = await provider.getBalance(signer.address); // Lấy số dư ví (ETH ảo)
        const deployment = getDeploymentConfig();               // Lấy địa chỉ contract

        return {
            status: 'CONNECTED',                                // Báo kết nối thành công
            rpcUrl: RPC_URL,
            blockNumber,
            contractAddress: deployment.contractAddress,
            deployerAddress: signer.address,
            deployerBalanceEth: ethers.formatEther(balance)     // Đổi từ Wei sang ETH dễ đọc
        };
    } catch (err) {
        return {
            status: 'DISCONNECTED',                             // Báo mất kết nối nếu Node chưa bật
            rpcUrl: RPC_URL,
            error: err.message
        };
    }
}

// Xuất các hàm ra ngoài
module.exports = {
    getDeploymentConfig,
    getProvider,
    getSigner,
    getContract,
    anchor,
    verify,
    getRecord,
    getAllRecords,
    getNetworkStatus
};
