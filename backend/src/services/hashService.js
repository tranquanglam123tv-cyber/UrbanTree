const crypto = require('crypto');

/**
 * ============================================================================
 * 🔒 DỊCH VỤ BĂM DỮ LIỆU CHUẨN HÓA & ĐỐI CHIẾU TỪNG TRƯỜNG (SHA-256)
 * ============================================================================
 */

function toDateTimeStr(val) {
    if (!val) return '';
    if (val instanceof Date) {
        return val.toISOString().replace('T', ' ').substring(0, 19);
    }
    return String(val).trim();
}

function toMoneyNum(val) {
    const n = Number(val ?? 0);
    return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
}

/**
 * 1. Băm Hồ sơ Cây xanh (TREE_PROFILE)
 */
function hashTreeProfile(tree) {
    if (!tree) {
        throw new Error('hashService: Thông tin cây xanh không được để trống');
    }

    const treeCode = (tree.tree_code || '').trim();
    const species = (tree.species || '').trim();
    const locationName = (tree.location_name || '').trim();
    const latitude = Number(tree.latitude !== undefined ? tree.latitude : 0);
    const longitude = Number(tree.longitude !== undefined ? tree.longitude : 0);
    const plantedDate = toDateTimeStr(tree.planted_date);
    const healthStatus = (tree.health_status || 'Tốt').trim();

    if (!treeCode || !species) {
        throw new Error('hashService: Cây xanh phải có tree_code và species để tính mã băm');
    }

    const rawString = `${treeCode}|${species}|${locationName}|${latitude}|${longitude}|${plantedDate}|${healthStatus}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 2. Băm Nhật ký Chăm sóc Thực địa (CARE_LOG)
 */
function hashCareLog(care) {
    if (!care) {
        throw new Error('hashService: Thông tin chăm sóc không được để trống');
    }

    const treeId = care.tree_id || '';
    const caretakerName = (care.caretaker_name || '').trim();
    const actionType = (care.action_type || '').trim();
    const serviceCost = toMoneyNum(care.service_cost);
    const notes = (care.notes || '').trim();
    const actionDate = toDateTimeStr(care.action_date);

    const rawString = `${treeId}|${caretakerName}|${actionType}|${serviceCost}|${notes}|${actionDate}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 3. Băm Báo cáo & Nghiệm thu Sự cố (INCIDENT_REPORT)
 */
function hashIncidentReport(incident) {
    if (!incident) {
        throw new Error('hashService: Thông tin sự cố không được để trống');
    }

    const incidentId = incident.id || incident.incident_id || '';
    const treeId = incident.tree_id || '';
    const severity = (incident.severity || '').trim();
    const status = (incident.status || '').trim();
    const serviceCost = toMoneyNum(incident.service_cost);
    const resolutionNotes = (incident.resolution_notes || '').trim();
    const resolvedAt = toDateTimeStr(incident.resolved_at);

    const rawString = `${incidentId}|${treeId}|${severity}|${status}|${serviceCost}|${resolutionNotes}|${resolvedAt}`;
    return crypto.createHash('sha256').update(rawString).digest('hex');
}

/**
 * 4. Hàm băm chuỗi văn bản tự do SHA-256
 */
function hashGenericString(text) {
    return crypto.createHash('sha256').update(String(text)).digest('hex');
}

/**
 * 5. Tạo Snapshot thông tin nghiệp vụ rõ ràng để hiển thị & đối chiếu từng trường
 */
function buildAuditSnapshot(recordType, row) {
    if (!row) return null;

    if (recordType === 'TREE_PROFILE') {
        const treeLabel = `${row.tree_code || ''} — ${row.species || ''}`.trim();
        return {
            recordType: 'TREE_PROFILE',
            title: `Hồ sơ Cây xanh (${row.tree_code || ''})`,
            summary: `${treeLabel} • Vị trí: ${row.location_name || 'N/A'} • Tình trạng: ${row.health_status || 'Tốt'}`,
            hash: hashTreeProfile(row),
            fields: [
                { key: 'tree_code', label: 'Mã cây xanh', value: (row.tree_code || '').trim(), type: 'text' },
                { key: 'species', label: 'Loài cây', value: (row.species || '').trim(), type: 'text' },
                { key: 'location_name', label: 'Vị trí trồng', value: (row.location_name || '').trim(), type: 'text' },
                { key: 'coordinates', label: 'Tọa độ GPS', value: `${Number(row.latitude || 0)}, ${Number(row.longitude || 0)}`, type: 'text' },
                { key: 'planted_date', label: 'Ngày trồng', value: toDateTimeStr(row.planted_date), type: 'text' },
                { key: 'health_status', label: 'Tình trạng sức khỏe', value: (row.health_status || 'Tốt').trim(), type: 'text' },
            ],
        };
    }

    if (recordType === 'CARE_LOG' || recordType === 'CARE_RECORD') {
        const cost = toMoneyNum(row.service_cost);
        const treeLabel = row.tree_code
            ? `${row.tree_code}${row.species ? ` (${row.species})` : ''}`
            : `Cây #${row.tree_id || ''}`;
        return {
            recordType: 'CARE_LOG',
            title: `Nhật ký Chăm sóc / Cắt tỉa (${row.care_code || `CARE-${row.id}`})`,
            summary: `Dịch vụ: ${row.action_type || ''} • ${treeLabel} • Chi phí: ${cost.toLocaleString('vi-VN')} VNĐ`,
            hash: hashCareLog(row),
            fields: [
                { key: 'tree_info', label: 'Cây xanh được chăm sóc', value: treeLabel, type: 'text' },
                { key: 'action_type', label: 'Loại dịch vụ thực hiện', value: (row.action_type || '').trim(), type: 'text' },
                { key: 'service_cost', label: 'Chi phí dịch vụ (VNĐ)', value: cost, type: 'currency' },
                { key: 'caretaker_name', label: 'Đơn vị / Nhân viên thực hiện', value: (row.caretaker_name || '').trim(), type: 'text' },
                { key: 'notes', label: 'Ghi chú công việc', value: (row.notes || '').trim() || '(Không có)', type: 'text' },
                { key: 'action_date', label: 'Thời gian thực hiện', value: toDateTimeStr(row.action_date), type: 'text' },
            ],
        };
    }

    if (recordType === 'INCIDENT_REPORT' || recordType === 'INCIDENT_RESOLUTION') {
        const cost = toMoneyNum(row.service_cost);
        const treeLabel = row.tree_code
            ? `${row.tree_code}${row.species ? ` (${row.species})` : ''}`
            : (row.tree_id ? `Cây #${row.tree_id}` : 'Không xác định');
        const incCode = row.tracking_code || `INC-${row.id}`;
        return {
            recordType: 'INCIDENT_REPORT',
            title: `Biên bản Xử lý Sự cố (${incCode})`,
            summary: `${treeLabel} • Mức độ: ${row.severity || ''} • Trạng thái: ${row.status || ''} • Chi phí xử lý: ${cost.toLocaleString('vi-VN')} VNĐ`,
            hash: hashIncidentReport(row),
            fields: [
                { key: 'tree_info', label: 'Cây xanh liên quan', value: treeLabel, type: 'text' },
                { key: 'severity', label: 'Mức độ sự cố', value: (row.severity || '').trim(), type: 'text' },
                { key: 'status', label: 'Trạng thái xử lý', value: (row.status || '').trim(), type: 'text' },
                { key: 'service_cost', label: 'Chi phí dịch vụ xử lý / cắt tỉa (VNĐ)', value: cost, type: 'currency' },
                { key: 'resolution_notes', label: 'Nội dung nghiệm thu xử lý', value: (row.resolution_notes || '').trim() || '(Chưa ghi chú)', type: 'text' },
                { key: 'description', label: 'Mô tả sự cố ban đầu', value: (row.description || '').trim(), type: 'text' },
                { key: 'resolved_at', label: 'Thời gian nghiệm thu', value: toDateTimeStr(row.resolved_at) || '(Chưa nghiệm thu)', type: 'text' },
            ],
        };
    }

    return null;
}

/**
 * 6. Đối chiếu từng trường giữa Snapshot gốc (niêm phong trên Sepolia) và Dữ liệu MySQL hiện tại
 */
function compareSnapshots(originalSnapshot, currentSnapshot) {
    if (!currentSnapshot) {
        return { hasSnapshot: false, allMatched: false, fields: [], changedFields: [] };
    }

    const origMap = new Map();
    if (originalSnapshot && Array.isArray(originalSnapshot.fields)) {
        for (const f of originalSnapshot.fields) {
            origMap.set(f.key, f);
        }
    }

    const fields = currentSnapshot.fields.map((cur) => {
        const orig = origMap.get(cur.key);
        const hasOriginal = Boolean(orig);
        const originalValue = hasOriginal ? orig.value : null;
        const matched = hasOriginal ? String(originalValue) === String(cur.value) : null;
        return {
            key: cur.key,
            label: cur.label,
            type: cur.type || 'text',
            originalValue,
            currentValue: cur.value,
            matched,
        };
    });

    const changedFields = fields.filter((f) => f.matched === false);

    return {
        hasSnapshot: Boolean(originalSnapshot && Array.isArray(originalSnapshot.fields)),
        allMatched: changedFields.length === 0,
        fields,
        changedFields,
    };
}

module.exports = {
    hashTreeProfile,
    hashCareLog,
    hashIncidentReport,
    hashGenericString,
    buildAuditSnapshot,
    compareSnapshots,
};
