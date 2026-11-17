const { expect } = require("chai"); // Thư viện so sánh kiểm thử Chai (expect(...).to.equal(...))
const { ethers } = require("hardhat"); // Thư viện Hardhat hỗ trợ giả lập EVM và ví Web3

/**
 * ============================================================================
 * 🌳 BỘ KIỂM THỬ TỰ ĐỘNG SMART CONTRACT (URBANTREE REGISTRY TESTS)
 * Học phần: Blockchain Cơ bản (CNTT2311)
 * Người thực hiện: Trần Quang Lâm (MSSV: 2311074) — Blockchain Lead
 * ============================================================================
 * 📌 MỤC TIÊU CỦA BỘ TEST NÀY:
 * - Tự động hóa kiểm tra tính an toàn, bảo mật và logic của Smart Contract.
 * - Bao phủ 3 trường hợp then chốt:
 *   1. Phân quyền: Chỉ Admin (Owner) mới được cấp quyền ví ghi dấu.
 *   2. Chống gian lận: Tuyệt đối không cho phép ghi đè lên mã ID đã tồn tại.
 *   3. Toàn vẹn: Dữ liệu chuẩn xác -> Tích xanh; dữ liệu bị can thiệp -> Cảnh báo đỏ.
 * ============================================================================
 */

describe("🌳 UrbanTreeRegistry Smart Contract Tests", function () {
    let UrbanTreeRegistry;
    let registry;
    let owner;                // Đại diện cho ví người tạo Smart Contract (Admin)
    let staffWallet;          // Đại diện cho ví nhân viên được ủy quyền
    let unauthorizedWallet;   // Đại diện cho ví người ngoài / kẻ gian (không có quyền)

    // Dữ liệu mẫu dùng trong các bài kiểm thử
    const SAMPLE_RECORD_ID = "TREE-Q1-2026-001";
    const SAMPLE_RECORD_TYPE = "TREE_PROFILE";
    const SAMPLE_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Chuẩn 64 ký tự hex SHA-256
    const TAMPERED_HASH = "1111111111111111111111111111111111111111111111111111111111111111"; // Mã băm giả mạo

    // Hàm chạy trước mỗi bài test: Tự động deploy lại một bản Smart Contract mới toanh
    beforeEach(async function () {
        // 1. Lấy 3 tài khoản ví giả lập có sẵn từ Hardhat (mỗi ví có sẵn 10.000 ETH ảo)
        [owner, staffWallet, unauthorizedWallet] = await ethers.getSigners();

        // 2. Nạp bản thiết kế Contract từ thư mục contracts/
        UrbanTreeRegistry = await ethers.getContractFactory("UrbanTreeRegistry");

        // 3. Tiến hành deploy hợp đồng lên mạng ảo Hardhat
        registry = await UrbanTreeRegistry.deploy();
        await registry.waitForDeployment();
    });

    // ===============================================================
    // PHẦN 1: KIỂM TRA PHÂN QUYỀN (ACCESS CONTROL)
    // ===============================================================
    describe("1. Khởi tạo & Phân quyền", function () {
        // Test case 1.1: Kiểm tra người deploy có phải là owner không
        it("Khi deploy xong, owner phải là người tạo hợp đồng", async function () {
            expect(await registry.owner()).to.equal(owner.address);
        });

        // Test case 1.2: Owner cấp quyền ghi cho nhân viên thành công
        it("Owner có thể cấp quyền ghi dữ liệu cho ví nhân viên", async function () {
            await registry.connect(owner).authorizeRecorder(staffWallet.address);
            // Kiểm tra trạng thái trong mapping authorizedRecorders phải là true
            expect(await registry.authorizedRecorders(staffWallet.address)).to.be.true;
        });

        // Test case 1.3: Người ngoài tự ý cấp quyền sẽ bị chặn ngay lập tức
        it("Người ngoài (unauthorizedWallet) không thể tự ý cấp quyền", async function () {
            await expect(
                registry.connect(unauthorizedWallet).authorizeRecorder(unauthorizedWallet.address)
            ).to.be.revertedWith("UrbanTree: Caller is not the contract owner");
        });
    });

    // ===============================================================
    // PHẦN 2: KIỂM TRA GHI DẤU BẢN GHI (ANCHOR RECORD)
    // ===============================================================
    describe("2. Ghi dấu bản ghi lên Blockchain", function () {
        // Test case 2.1: Nhân viên hợp lệ ghi dấu thành công
        it("Nhân viên được cấp quyền có thể ghi dấu hồ sơ thành công", async function () {
            // Cấp quyền cho nhân viên
            await registry.connect(owner).authorizeRecorder(staffWallet.address);

            // Nhân viên gửi mã cây và mã băm lên chuỗi
            await registry.connect(staffWallet).anchorRecord(
                SAMPLE_RECORD_ID,
                SAMPLE_RECORD_TYPE,
                SAMPLE_HASH
            );

            // Đọc lại từ contract để kiểm tra xem đã lưu đúng chưa
            const record = await registry.getRecord(SAMPLE_RECORD_ID);
            expect(record.recordId).to.equal(SAMPLE_RECORD_ID);
            expect(record.dataHash).to.equal(SAMPLE_HASH);
            expect(record.recorder).to.equal(staffWallet.address);
            expect(record.exists).to.be.true;
        });

        // Test case 2.2: Người lạ cố tình ghi dấu sẽ bị chặn
        it("Hacker không có quyền sẽ BỊ CHẶN khi cố ghi dữ liệu", async function () {
            await expect(
                registry.connect(unauthorizedWallet).anchorRecord(
                    SAMPLE_RECORD_ID,
                    SAMPLE_RECORD_TYPE,
                    SAMPLE_HASH
                )
            ).to.be.revertedWith("UrbanTree: Caller is not authorized to anchor records");
        });

        // Test case 2.3: BẢO VỆ DỮ LIỆU - Tuyệt đối không cho phép ghi đè lên mã cây đã có
        it("CHỐNG GIAN LẬN: Tuyệt đối không cho phép ghi đè lên mã cây đã có", async function () {
            // Ghi lần đầu thành công
            await registry.connect(owner).anchorRecord(
                SAMPLE_RECORD_ID,
                SAMPLE_RECORD_TYPE,
                SAMPLE_HASH
            );

            // Cố tình ghi lần thứ 2 với cùng mã ID nhưng thay bằng mã băm khác
            await expect(
                registry.connect(owner).anchorRecord(
                    SAMPLE_RECORD_ID,
                    SAMPLE_RECORD_TYPE,
                    TAMPERED_HASH
                )
            ).to.be.revertedWith("UrbanTree: Record already anchored (Tampering prevented)");
        });
    });

    // ===============================================================
    // PHẦN 3: KIỂM TRA ĐỐI SOÁT TÍNH TOÀN VẸN (VERIFY RECORD - CỔNG A19)
    // ===============================================================
    describe("3. Xác minh tính toàn vẹn dữ liệu (Cổng A19)", function () {
        beforeEach(async function () {
            // Chuẩn bị sẵn một bản ghi chuẩn trên chuỗi trước khi đối soát
            await registry.connect(owner).anchorRecord(
                SAMPLE_RECORD_ID,
                SAMPLE_RECORD_TYPE,
                SAMPLE_HASH
            );
        });

        // Test case 3.1: Dữ liệu chuẩn xác 100% -> Trả về isValid = true (Tích xanh)
        it("TRƯỜNG HỢP 1: Dữ liệu chuẩn xác 100% -> Trả về isValid = TRUE (Tích xanh)", async function () {
            const result = await registry.verifyRecord(SAMPLE_RECORD_ID, SAMPLE_HASH);
            expect(result.isValid).to.be.true;       // Trùng khớp 100%
            expect(result.isExisted).to.be.true;     // Có tồn tại trên chuỗi
            expect(result.storedHash).to.equal(SAMPLE_HASH);
        });

        // Test case 3.2: Dữ liệu trong DB bị hacker sửa lén -> Trả về isValid = false (Cảnh báo đỏ)
        it("TRƯỜNG HỢP 2: Dữ liệu Database bị sửa lén -> Trả về isValid = FALSE (Cảnh báo đỏ)", async function () {
            const result = await registry.verifyRecord(SAMPLE_RECORD_ID, TAMPERED_HASH);
            expect(result.isValid).to.be.false;      // Báo sai lệch mã băm (Hash Mismatch)
            expect(result.isExisted).to.be.true;     // Bản ghi gốc vẫn còn nguyên trên Blockchain
            expect(result.storedHash).to.equal(SAMPLE_HASH); // Mã gốc vẫn là mã chuẩn
        });
    });
});
