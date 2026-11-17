// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================================
 * 🌳 HỢP ĐỒNG THÔNG MINH BẢO CHỨNG TOÀN VẸN DỮ LIỆU CÂY XANH ĐÔ THỊ (URBANTREE)
 * Học phần: Blockchain Cơ bản (CNTT2311)
 * Người thực hiện: Trần Quang Lâm (MSSV: 2311074) - Vai trò: Blockchain Lead
 * ============================================================================
 * 📌 NGUYÊN LÝ HOẠT ĐỘNG:
 * - Dữ liệu thô (tên cây, mô tả, ảnh, vị trí) lưu ở cơ sở dữ liệu SQLite (Off-chain).
 * - Backend tính mã băm SHA-256 (64 ký tự hex) đại diện cho dữ liệu đó.
 * - Hợp đồng này nhận mã băm và lưu bất biến lên Blockchain (On-chain Anchor).
 * - Khi cần kiểm tra: So sánh mã băm trong DB với mã băm trên chuỗi (Zero Mismatch).
 * ============================================================================
 */

contract UrbanTreeRegistry {
    // ========================================================================
    // 1. CẤU TRÚC DỮ LIỆU (STRUCTS)
    // ========================================================================
    struct Record {
        string recordId;       // Mã định danh nghiệp vụ duy nhất (Ví dụ: "TREE-001", "CARE-001", "INC-001")
        string recordType;     // Phân loại bản ghi: "TREE_PROFILE" (cây), "CARE_LOG" (chăm sóc), "INCIDENT_REPORT" (sự cố)
        string dataHash;       // Chuỗi mã băm SHA-256 gồm đúng 64 ký tự hex của dữ liệu off-chain
        uint256 timestamp;     // Dấu thời gian khối đào trên mạng Blockchain (lấy từ block.timestamp tính bằng giây)
        address recorder;      // Địa chỉ ví Ethereum của nhân viên hoặc máy chủ backend thực hiện ký gửi giao dịch
        bool exists;           // Cờ đánh dấu bản ghi đã tồn tại (dùng để kiểm tra và chống ghi đè/chống sửa đổi)
    }

    // ========================================================================
    // 2. BIẾN TRẠNG THÁI (STATE VARIABLES LƯU VĨNH VIỄN TRÊN BLOCKCHAIN STORAGE)
    // ========================================================================
    address public owner;                                      // Địa chỉ ví người tạo/triển khai hợp đồng (Admin tối cao)
    mapping(address => bool) public authorizedRecorders;       // Danh sách ví được cấp phép ghi dấu: Địa chỉ ví => true/false
    mapping(string => Record) private records;                 // Bảng băm tra cứu bản ghi theo mã: recordId => Record
    string[] private recordIds;                                // Mảng lưu trữ tất cả các mã ID để hỗ trợ duyệt danh sách (Explorer)

    // ========================================================================
    // 3. SỰ KIỆN (EVENTS - PHÁT TÍN HIỆU ĐỂ DAPP HOẶC BACKEND LẮNG NGHE LOGS)
    // ========================================================================
    // Bắn ra khi có một bản ghi mới được neo thành công lên Blockchain
    event RecordAnchored(
        string indexed recordId,   // indexed giúp backend lọc sự kiện theo mã ID nhanh chóng
        string recordType,         // Loại bản ghi
        string dataHash,           // Mã băm vừa neo
        uint256 timestamp,         // Thời gian neo
        address indexed recorder   // indexed giúp lọc xem ví nào đã thực hiện neo
    );

    event RecorderAuthorized(address indexed account);                             // Bắn ra khi cấp quyền ghi cho một ví mới
    event RecorderRevoked(address indexed account);                                // Bắn ra khi tước quyền ghi của một ví
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner); // Bắn ra khi chuyển nhượng quyền Admin

    // ========================================================================
    // 4. BỘ ĐIỀU KIỆN (MODIFIERS - DÙNG ĐỂ KIỂM SOÁT PHÂN QUYỀN TRƯỚC KHI THỰC THI HÀM)
    // ========================================================================
    // Chỉ duy nhất Admin (owner) mới được phép thực thi hàm có gắn modifier này
    modifier onlyOwner() {
        require(msg.sender == owner, "UrbanTree: Caller is not the contract owner"); // msg.sender là địa chỉ người đang gọi hàm
        _; // Dấu gạch dưới đại diện cho phần thân hàm được tiếp tục chạy nếu require thỏa mãn
    }

    // Chỉ Admin hoặc các ví nhân viên đã được cấp phép ghi mới được phép gọi
    modifier onlyAuthorized() {
        require(
            msg.sender == owner || authorizedRecorders[msg.sender], // Kiểm tra ví có trong danh sách cho phép không
            "UrbanTree: Caller is not authorized to anchor records"
        );
        _;
    }

    // ========================================================================
    // 5. KHỞI TẠO (CONSTRUCTOR - CHỈ CHẠY 1 LẦN DUY NHẤT KHI DEPLOY CONTRACT)
    // ========================================================================
    constructor() {
        owner = msg.sender;                                     // Gán người bấm nút deploy thành Admin tối cao
        authorizedRecorders[msg.sender] = true;                 // Mặc định cấp luôn quyền ghi dữ liệu cho ví Admin
        emit OwnershipTransferred(address(0), msg.sender);      // Phát sự kiện chuyển quyền từ 0x0 sang Admin
        emit RecorderAuthorized(msg.sender);                    // Phát sự kiện cấp quyền ghi
    }

    // ========================================================================
    // 6. QUẢN LÝ PHÂN QUYỀN (ACCESS CONTROL - CHỈ ADMIN GỌI ĐƯỢC)
    // ========================================================================
    // Cấp quyền ghi dữ liệu cho ví của một nhân viên mới
    function authorizeRecorder(address _account) external onlyOwner {
        require(_account != address(0), "UrbanTree: Invalid address");                       // Địa chỉ ví không được là ví rác (0x0)
        require(!authorizedRecorders[_account], "UrbanTree: Account already authorized");     // Ví này chưa từng được cấp trước đó
        authorizedRecorders[_account] = true;                                                // Bật cờ cho phép ghi
        emit RecorderAuthorized(_account);                                                   // Bắn sự kiện ra ngoài log
    }

    // Tước quyền ghi dữ liệu của một ví (khi nhân viên nghỉ việc hoặc ví bị lộ key)
    function revokeRecorder(address _account) external onlyOwner {
        require(authorizedRecorders[_account], "UrbanTree: Account is not authorized");      // Kiểm tra ví có đang có quyền không
        authorizedRecorders[_account] = false;                                               // Tắt quyền ghi
        emit RecorderRevoked(_account);
    }

    // Chuyển quyền Admin hợp đồng cho một địa chỉ ví mới
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "UrbanTree: New owner is zero address");            // Tránh chuyển nhượng vào ví chết
        emit OwnershipTransferred(owner, _newOwner);                                         // Báo sự kiện đổi chủ
        owner = _newOwner;                                                                   // Cập nhật chủ mới
    }

    // ========================================================================
    // 7. CHỨC NĂNG CỐT LÕI (CORE FUNCTIONS)
    // ========================================================================

    /**
     * @notice Ghi dấu mã băm dữ liệu lên Blockchain (Anchor Record)
     * @dev Chỉ ví được ủy quyền mới gọi được. BẮT BUỘC KHÔNG CHO PHÉP GHI ĐÈ ID ĐÃ CÓ!
     * @param _recordId Mã định danh bản ghi (VD: "TREE-001")
     * @param _recordType Loại bản ghi ("TREE_PROFILE" / "CARE_LOG" / "INCIDENT_REPORT")
     * @param _dataHash Chuỗi mã băm SHA-256 gồm 64 ký tự hex tính từ cơ sở dữ liệu
     */
    function anchorRecord(
        string memory _recordId,
        string memory _recordType,
        string memory _dataHash
    ) external onlyAuthorized {
        require(bytes(_recordId).length > 0, "UrbanTree: recordId cannot be empty");         // Mã ID không được rỗng
        require(bytes(_recordType).length > 0, "UrbanTree: recordType cannot be empty");     // Phân loại không được rỗng
        require(bytes(_dataHash).length > 0, "UrbanTree: dataHash cannot be empty");         // Mã băm không được rỗng
        
        // 🔒 CHỐNG GIAN LẬN: Nếu mã ID này đã được ghi một lần, TUYỆT ĐỐI không cho phép ghi đè!
        require(!records[_recordId].exists, "UrbanTree: Record already anchored (Tampering prevented)");

        // Tạo cấu trúc bản ghi mới và lưu vào storage của Smart Contract
        Record memory newRecord = Record({
            recordId: _recordId,
            recordType: _recordType,
            dataHash: _dataHash,
            timestamp: block.timestamp, // Lấy thời gian chuẩn của khối đang được đào
            recorder: msg.sender,       // Lưu địa chỉ ví đã gửi giao dịch này
            exists: true                // Đánh dấu bản ghi đã tồn tại bất biến
        });

        records[_recordId] = newRecord; // Lưu vào mapping tra cứu theo key là recordId
        recordIds.push(_recordId);      // Thêm mã ID vào danh sách để phục vụ thống kê duyệt danh sách

        // Bắn sự kiện ra Blockchain để thông báo giao dịch đã được ghi thành công
        emit RecordAnchored(
            _recordId,
            _recordType,
            _dataHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @notice Xác minh tính toàn vẹn của một bản ghi đối chiếu với Blockchain (Dùng cho Cổng A19)
     * @dev Hàm có từ khóa 'view' chỉ đọc dữ liệu, hoàn toàn KHÔNG TỐN PHÍ GAS (0 gas)!
     * @param _recordId Mã bản ghi cần kiểm tra (VD: "TREE-001")
     * @param _currentHash Mã băm vừa được tính lại từ cơ sở dữ liệu hiện thời
     * @return isValid Kết quả so khớp: true nếu trùng khớp 100% (Tích xanh), false nếu bị sửa lén (Cảnh báo đỏ)
     * @return isExisted Bản ghi đã từng được neo lên Blockchain hay chưa
     * @return timestamp Thời điểm bản ghi được neo vào khối
     * @return recorder Địa chỉ ví đã thực hiện neo bản ghi
     * @return storedHash Chuỗi mã băm gốc đang được lưu giữ bất biến trên hợp đồng
     */
    function verifyRecord(
        string memory _recordId,
        string memory _currentHash
    ) external view returns (
        bool isValid,
        bool isExisted,
        uint256 timestamp,
        address recorder,
        string memory storedHash
    ) {
        Record memory rec = records[_recordId]; // Đọc bản ghi từ mapping records
        
        // Nếu mã bản ghi chưa từng tồn tại trên chuỗi
        if (!rec.exists) {
            return (false, false, 0, address(0), "");
        }

        // 🔍 SO KHỚP MÃ BĂM:
        // Trong Solidity không so sánh được 2 chuỗi string trực tiếp bằng dấu ==
        // Do đó ta chuyển string sang bytes rồi dùng keccak256 để so sánh mã băm của chúng
        bool matchHash = keccak256(bytes(rec.dataHash)) == keccak256(bytes(_currentHash));
        
        // Trả về đầy đủ thông tin để giao diện hiển thị cho người kiểm toán đối soát
        return (matchHash, true, rec.timestamp, rec.recorder, rec.dataHash);
    }

    /**
     * @notice Đọc chi tiết một bản ghi theo mã ID (Hàm view - 0 tốn gas)
     */
    function getRecord(string memory _recordId) external view returns (Record memory) {
        require(records[_recordId].exists, "UrbanTree: Record does not exist");
        return records[_recordId];
    }

    /**
     * @notice Lấy tổng số lượng bản ghi đã được ghi dấu trên hợp đồng (Hàm view - 0 tốn gas)
     */
    function getRecordCount() external view returns (uint256) {
        return recordIds.length;
    }

    /**
     * @notice Lấy toàn bộ danh sách tất cả mã ID đã neo (Dùng cho Cổng Explorer A18)
     */
    function getAllRecordIds() external view returns (string[] memory) {
        return recordIds;
    }
}
