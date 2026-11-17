const crypto = require('crypto'); // Sử dụng thư viện mật mã học chuẩn (native) có sẵn của Node.js

/**
 * ============================================================================
 * 🔒 DỊCH VỤ BĂM DỮ LIỆU CHUẨN HÓA (SHA-256 HASHING SERVICE)
 * Dành cho Dự án: UrbanTree — Đảm bảo Zero Mismatch giữa DB và Blockchain
 * Người thực hiện: Trần Quang Lâm (MSSV: 2311074) — Blockchain Lead
 * ============================================================================
 * 📌 NGUYÊN TẮC HOẠT ĐỘNG:
 * - Để so sánh 2 mã băm chuẩn xác, dữ liệu đầu vào bắt buộc phải theo chuẩn "Canonical":
 *   1. Thứ tự các trường dữ liệu luôn cố định.
 *   2. Cắt bỏ khoảng trắng thừa đầu/cuối bằng .trim().
 *   3. Số thực/số nguyên được ép kiểu rõ ràng (Number).
 *   4. Các trường nối với nhau bằng ký tự phân cách gạch đứng '|'.
 *   5. Sử dụng thuật toán SHA-256 băm ra chuỗi đúng 64 ký tự hex chữ thường.
 * ============================================================================
 */

/**
 * 1. Băm Hồ sơ Cây xanh (Dành cho loại bản ghi: TREE_PROFILE)
 * Cú pháp chuỗi thô: `${tree_code}|${species}|${location_name}|${latitude}|${longitude}|${planted_date}`
 * Ví dụ chuỗi thô: "TREE-001|Cây Sao Đen|Công viên 23/9|10.7684|106.6934|2023-01-15"
 * @param {Object} tree { tree_code, species, location_name, latitude, longitude, planted_date }
 * @returns {string} Chuỗi 64 ký tự Hex chữ thường
 */
function hashTreeProfile(tree) {
    // Kiểm tra đầu vào: nếu không có object truyền vào thì báo lỗi ngay
    if (!tree) {
        throw new Error('hashService: Thông tin cây xanh không được để trống');
    }

    // Chuẩn hóa từng trường dữ liệu để tránh lệch dấu cách hay khoảng trắng vô tình
    const treeCode = (tree.tree_code || '').trim();                               // Mã cây: "TREE-001"
    const species = (tree.species || '').trim();                                   // Tên loài cây: "Cây Sao Đen"
    const locationName = (tree.location_name || '').trim();                       // Vị trí: "Công viên 23/9"
    const latitude = Number(tree.latitude !== undefined ? tree.latitude : 0);     // Tọa độ vĩ độ (ép sang kiểu Số)
    const longitude = Number(tree.longitude !== undefined ? tree.longitude : 0);  // Tọa độ kinh độ (ép sang kiểu Số)
    const plantedDate = (tree.planted_date || '').trim();                         // Ngày trồng: "2023-01-15"

    // Ràng buộc nghiệp vụ: Mã cây và loài cây là 2 trường cốt lõi không được để trống
    if (!treeCode || !species) {
        throw new Error('hashService: Cây xanh phải có tree_code và species để tính mã băm');
    }

    // Nối các trường lại thành một chuỗi đại diện duy nhất (Canonical String)
    const rawString = `${treeCode}|${species}|${locationName}|${latitude}|${longitude}|${plantedDate}`;

    // Tạo mã băm SHA-256 từ chuỗi thô và xuất ra dạng thập lục phân (hex) 64 ký tự
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 2. Băm Nhật ký Chăm sóc Thực địa (Dành cho loại bản ghi: CARE_LOG)
 * Cú pháp chuỗi thô: `${tree_id}|${caretaker_name}|${action_type}|${action_date}`
 * Ví dụ chuỗi thô: "1|Đội Cơ Động 1|Cắt tỉa|2026-11-04 10:00:00"
 * @param {Object} care { tree_id, caretaker_name, action_type, action_date }
 * @returns {string} Chuỗi 64 ký tự Hex chữ thường
 */
function hashCareLog(care) {
    if (!care) {
        throw new Error('hashService: Thông tin chăm sóc không được để trống');
    }

    const treeId = care.tree_id || '';                      // ID số của cây trong Database
    const caretakerName = (care.caretaker_name || '').trim();// Tên người hoặc đội ngũ chăm sóc
    const actionType = (care.action_type || '').trim();     // Hành động: Cắt tỉa, Bón phân, Xịt thuốc
    const actionDate = (care.action_date || '').trim();     // Ngày giờ thực hiện công việc

    // Nối thành chuỗi chuẩn hóa
    const rawString = `${treeId}|${caretakerName}|${actionType}|${actionDate}`;

    // Tính mã băm SHA-256
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 3. Băm Báo cáo & Nghiệm thu Sự cố (Dành cho loại bản ghi: INCIDENT_REPORT)
 * Cú pháp chuỗi thô: `${incident_id}|${tree_id}|${severity}|${status}|${resolved_at}`
 * Ví dụ chuỗi thô: "INC-01|1|Nguy hiểm|Đã giải quyết|2026-11-04 15:30:00"
 * @param {Object} incident { id or incident_id, tree_id, severity, status, resolved_at }
 * @returns {string} Chuỗi 64 ký tự Hex chữ thường
 */
function hashIncidentReport(incident) {
    if (!incident) {
        throw new Error('hashService: Thông tin sự cố không được để trống');
    }

    const incidentId = incident.id || incident.incident_id || ''; // Mã vé sự cố
    const treeId = incident.tree_id || '';                        // Cây gặp sự cố
    const severity = (incident.severity || '').trim();           // Mức độ: Khẩn cấp, Bình thường
    const status = (incident.status || '').trim();               // Trạng thái: Chờ xử lý, Đang xử lý, Đã xử lý
    const resolvedAt = (incident.resolved_at || '').trim();       // Thời điểm nghiệm thu xong

    // Nối thành chuỗi chuẩn hóa
    const rawString = `${incidentId}|${treeId}|${severity}|${status}|${resolvedAt}`;

    // Tính mã băm SHA-256
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 4. Hàm băm chuỗi văn bản tự do SHA-256
 * Dùng khi cần băm nhanh một đoạn chuỗi bất kỳ để đối chiếu
 * @param {string} text
 * @returns {string} 64 ký tự Hex
 */
function hashGenericString(text) {
    return crypto.createHash('sha256').update(String(text)).digest('hex');
}

// Xuất các hàm ra ngoài để Controller và Service khác tái sử dụng
module.exports = {
    hashTreeProfile,
    hashCareLog,
    hashIncidentReport,
    hashGenericString
};
