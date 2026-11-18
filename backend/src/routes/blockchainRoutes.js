const express = require('express');
const router = express.Router();
const blockchainClient = require('../services/blockchainClient');
const hashService = require('../services/hashService');
const db = require('../config/db');

/**
 * ⛓️ BLOCKCHAIN API ROUTES (Dành cho Người 1 - Trần Quang Lâm)
 * Đảm nhận các chức năng Neo dữ liệu bất biến, Cổng kiểm toán xác minh A18/A19
 */

// ==========================================
// 1. KIỂM TRA TRẠNG THÁI KẾT NỐI MẠNG BLOCKCHAIN
// GET /api/blockchain/status
// ==========================================
router.get('/status', async (req, res) => {
    try {
        const status = await blockchainClient.getNetworkStatus();
        res.json({
            success: true,
            network: status
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Không thể kết nối RPC Node Blockchain',
            error: err.message
        });
    }
});

// ==========================================
// 2. HELPER: TÍNH TOÁN MÃ BĂM SHA-256 CHO CÂY XANH
// POST /api/blockchain/hash/tree
// ==========================================
router.post('/hash/tree', (req, res) => {
    try {
        const treeData = req.body;
        const dataHash = hashService.hashTreeProfile(treeData);
        res.json({
            success: true,
            tree_code: treeData.tree_code,
            dataHash,
            algorithm: 'SHA-256'
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Lỗi tính toán mã băm',
            error: err.message
        });
    }
});

// ==========================================
// 3. NEO BẢN GHI LÊN BLOCKCHAIN (ANCHOR TO CHAIN)
// POST /api/blockchain/anchor
// ==========================================
router.post('/anchor', async (req, res) => {
    const { recordId, recordType, dataHash, treeData } = req.body;

    try {
        let finalHash = dataHash;

        // Nếu client truyền object treeData thay vì dataHash, tự động tính hash chuẩn
        if (!finalHash && treeData) {
            finalHash = hashService.hashTreeProfile(treeData);
        }

        if (!recordId || !recordType || !finalHash) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng cung cấp đầy đủ: recordId, recordType và dataHash (hoặc treeData)'
            });
        }

        const result = await blockchainClient.anchor(recordId, recordType, finalHash);
        const deployment = blockchainClient.getDeploymentConfig();

        // Đồng bộ lưu vào bảng kiểm toán blockchain_audits
        db.run(
            `INSERT INTO blockchain_audits (record_type, record_id, data_hash, tx_hash, block_number, chain_id, contract_address, recorder_address, status, confirmed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', CURRENT_TIMESTAMP)`,
            [recordType, recordId, finalHash, result.txHash, result.blockNumber, deployment.chainId || 11155111, deployment.contractAddress, result.recorder]
        );

        // Đồng bộ cập nhật hash vào bảng SQLite tương ứng
        if (recordType === 'TREE_PROFILE') {
            db.run(`UPDATE trees SET data_hash = ? WHERE tree_code = ?`, [finalHash, recordId]);
        } else if (recordType === 'CARE_LOG') {
            db.run(`UPDATE care_records SET data_hash = ?, anchor_status = 'CONFIRMED' WHERE care_code = ?`, [finalHash, recordId]);
        }

        res.status(201).json({
            success: true,
            status: 'ok',
            message: `Đã neo bản ghi ${recordId} thành công lên Blockchain`,
            recordId,
            recordType,
            dataHash: finalHash,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            gasUsed: result.gasUsed,
            recorder: result.recorder
        });
    } catch (err) {
        let statusCode = 400;
        let errorMessage = err.message;

        if (errorMessage.includes('Record already anchored')) {
            errorMessage = 'CHỐNG GIAN LẬN: Bản ghi này đã được neo trên Blockchain trước đó. Tuyệt đối không cho phép ghi đè!';
            statusCode = 409; // Conflict
        } else if (errorMessage.includes('not authorized')) {
            errorMessage = 'Ví thực hiện giao dịch chưa được cấp quyền ghi dấu trên hợp đồng thông minh.';
            statusCode = 403; // Forbidden
        }

        res.status(statusCode).json({
            success: false,
            status: 'error',
            message: errorMessage,
            rawError: err.message
        });
    }
});

// Helper promisify db.get / db.all / db.run
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
    });
}
function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
    });
}
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ lastID: this ? this.lastID : 0, changes: this ? this.changes : 0 });
        });
    });
}

function inferTypeFromId(recordId) {
    const id = String(recordId || '').toUpperCase();
    if (id.startsWith('CARE-')) return 'CARE_LOG';
    if (id.startsWith('INC-')) return 'INCIDENT_REPORT';
    return 'TREE_PROFILE';
}

async function resolveRecordAndHash(recordType, recordKey) {
    const type = recordType || inferTypeFromId(recordKey);

    if (type === 'TREE_PROFILE') {
        const tree = await dbGet('SELECT * FROM trees WHERE tree_code = ? OR id = ?', [recordKey, recordKey]);
        if (!tree) throw new Error(`Không tìm thấy cây ${recordKey} trong MySQL`);
        const onChainId = tree.tree_code;
        const snapshot = hashService.buildAuditSnapshot('TREE_PROFILE', tree);
        return { onChainId, onChainType: 'TREE_PROFILE', currentHash: snapshot.hash, snapshot, row: tree };
    }
    if (type === 'CARE_LOG' || type === 'CARE_RECORD') {
        const care = await dbGet(
            `SELECT care_records.*, trees.tree_code, trees.species, trees.location_name
             FROM care_records LEFT JOIN trees ON care_records.tree_id = trees.id
             WHERE care_records.care_code = ? OR care_records.id = ?`,
            [recordKey, recordKey]
        );
        if (!care) throw new Error(`Không tìm thấy nhật ký chăm sóc ${recordKey} trong MySQL`);
        const onChainId = care.care_code || `CARE-${care.id}`;
        const snapshot = hashService.buildAuditSnapshot('CARE_LOG', care);
        return { onChainId, onChainType: 'CARE_LOG', currentHash: snapshot.hash, snapshot, row: care };
    }
    if (type === 'INCIDENT_REPORT' || type === 'INCIDENT_RESOLUTION') {
        const cleanId = String(recordKey).replace(/^INC-/i, '');
        const inc = await dbGet(
            `SELECT incidents.*, trees.tree_code, trees.species, trees.location_name
             FROM incidents LEFT JOIN trees ON incidents.tree_id = trees.id
             WHERE incidents.id = ? OR incidents.tracking_code = ?`,
            [cleanId, recordKey]
        );
        if (!inc) throw new Error(`Không tìm thấy sự cố ${recordKey} trong MySQL`);
        const onChainId = inc.tracking_code || `INC-${inc.id}`;
        const snapshot = hashService.buildAuditSnapshot('INCIDENT_REPORT', inc);
        return { onChainId, onChainType: 'INCIDENT_REPORT', currentHash: snapshot.hash, snapshot, row: inc };
    }
    throw new Error(`Loại bản ghi không hỗ trợ: ${type}`);
}

async function buildAuditDetail(recordId, onChainRecordType, storedHash, overrideHash) {
    let resolved = null;
    try {
        resolved = await resolveRecordAndHash(onChainRecordType, recordId);
    } catch (e) {
        resolved = null;
    }

    const auditRow = await dbGet(
        "SELECT * FROM blockchain_audits WHERE record_id = ? AND status = 'CONFIRMED' ORDER BY id DESC LIMIT 1",
        [recordId]
    );

    let originalSnapshot = null;
    if (auditRow && auditRow.payload_snapshot) {
        try {
            originalSnapshot = JSON.parse(auditRow.payload_snapshot);
        } catch (e) {
            originalSnapshot = null;
        }
    }

    const liveHash = resolved ? resolved.currentHash : null;
    const effectiveCurrentHash = overrideHash || liveHash || '';
    const comparison = resolved
        ? hashService.compareSnapshots(originalSnapshot, resolved.snapshot)
        : { hasSnapshot: Boolean(originalSnapshot), allMatched: false, fields: [], changedFields: [] };

    return {
        resolved,
        auditRow,
        originalSnapshot,
        currentSnapshot: resolved ? resolved.snapshot : null,
        liveHash,
        effectiveCurrentHash,
        comparison,
        manualHashOverride: Boolean(overrideHash && liveHash && overrideHash !== liveHash),
        storedHash
    };
}

// ==========================================
// 4. CỔNG XÁC MINH TOÀN VẸN MERKLE HASH (CỔNG A19)
// GET /api/blockchain/verify/:recordId
// Query param: ?currentHash=... (nếu bỏ trống sẽ tự đọc & băm trực tiếp từ MySQL)
// ==========================================
router.get('/verify/:recordId', async (req, res) => {
    const { recordId } = req.params;
    const { currentHash, recordType } = req.query;

    try {
        let onChainType = recordType || inferTypeFromId(recordId);
        let onChainRecord = null;
        try {
            onChainRecord = await blockchainClient.getRecord(recordId);
            if (onChainRecord && onChainRecord.recordType) {
                onChainType = onChainRecord.recordType;
            }
        } catch (e) {
            // Record not found on-chain yet
        }

        const detail = await buildAuditDetail(
            recordId,
            onChainType,
            onChainRecord ? onChainRecord.dataHash : '',
            currentHash ? String(currentHash).trim() : null
        );

        const result = await blockchainClient.verify(recordId, detail.effectiveCurrentHash);

        let auditStatus = 'UNKNOWN';
        let humanMessage = '';

        if (!result.isExisted) {
            auditStatus = 'NOT_FOUND_ON_CHAIN';
            humanMessage = 'Bản ghi chưa được đăng ký hoặc chưa được neo lên chuỗi khối.';
        } else if (result.isValid) {
            auditStatus = 'VERIFIED_INTEGRITY_MATCH';
            humanMessage = '✅ XÁC THỰC THÀNH CÔNG: Toàn bộ dữ liệu nghiệp vụ trong MySQL trùng khớp 100% với dấu vân tay bất biến trên Sepolia Blockchain.';
        } else {
            auditStatus = 'TAMPERING_DETECTED_HASH_MISMATCH';
            const changedNames = detail.comparison.changedFields.map((f) => f.label).join(', ');
            humanMessage = changedNames
                ? `🚨 CẢNH BÁO GIẢ MẠO: Phát hiện sai lệch dữ liệu tại [${changedNames}] so với bản gốc đã niêm phong trên Sepolia!`
                : '🚨 CẢNH BÁO GIẢ MẠO: Mã băm hiện tại khác với mã băm gốc trên Blockchain! Có dấu hiệu sửa đổi trái phép!';
        }

        res.json({
            success: true,
            record: result,
            recordId: result.recordId,
            recordType: onChainType,
            isValid: result.isValid,
            isExisted: result.isExisted,
            auditStatus,
            message: humanMessage,
            timestamp: result.timestamp,
            dateFormatted: result.dateFormatted,
            recorder: result.recorder,
            storedHash: result.storedHash,
            currentHash: result.currentHash,
            liveMysqlHash: detail.liveHash,
            manualHashOverride: detail.manualHashOverride,
            txHash: detail.auditRow ? detail.auditRow.tx_hash : null,
            blockNumber: detail.auditRow ? detail.auditRow.block_number : null,
            originalSnapshot: detail.originalSnapshot,
            currentSnapshot: detail.currentSnapshot,
            comparison: detail.comparison
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: 'Lỗi trong quá trình xác minh dữ liệu với Smart Contract',
            error: err.message
        });
    }
});

// ==========================================
// 5. ĐỌC CHI TIẾT BẢN GHI TRÊN CHUỖI
// GET /api/blockchain/record/:recordId
// ==========================================
router.get('/record/:recordId', async (req, res) => {
    const { recordId } = req.params;
    try {
        const rec = await blockchainClient.getRecord(recordId);
        res.json({
            success: true,
            data: rec
        });
    } catch (err) {
        res.status(404).json({
            success: false,
            message: `Không tìm thấy bản ghi ${recordId} trên chuỗi khối`,
            error: err.message
        });
    }
});

// ==========================================
// 6. KHÁM PHÁ HOẠT ĐỘNG SỔ CÁI (A18 ACTIVITY EXPLORER)
// GET /api/blockchain/explorer
// ==========================================
router.get('/explorer', async (req, res) => {
    try {
        const data = await blockchainClient.getAllRecords();
        const audits = await dbAll("SELECT * FROM blockchain_audits WHERE status = 'CONFIRMED' ORDER BY id DESC");
        const auditMap = new Map();
        for (const a of audits) {
            if (!auditMap.has(a.record_id)) auditMap.set(a.record_id, a);
        }

        const enriched = await Promise.all(
            data.records.map(async (r) => {
                const audit = auditMap.get(r.recordId);
                let snapshot = null;
                if (audit && audit.payload_snapshot) {
                    try {
                        snapshot = JSON.parse(audit.payload_snapshot);
                    } catch (e) {
                        snapshot = null;
                    }
                }
                let liveInfo = null;
                try {
                    const resolved = await resolveRecordAndHash(r.recordType, r.recordId);
                    liveInfo = resolved.snapshot;
                } catch (e) {
                    liveInfo = null;
                }
                const info = snapshot || liveInfo;
                return {
                    ...r,
                    summary: info ? info.summary : null,
                    title: info ? info.title : r.recordId,
                    txHash: audit ? audit.tx_hash : null,
                    blockNumber: audit ? audit.block_number : null,
                    liveHash: liveInfo ? liveInfo.hash : null,
                    isTamperedInDb: liveInfo ? liveInfo.hash !== r.dataHash : false
                };
            })
        );

        res.json({
            success: true,
            totalRecords: data.totalRecords,
            records: enriched
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Lỗi truy xuất sổ cái Blockchain',
            error: err.message
        });
    }
});

// ==========================================
// 7. DANH SÁCH LỊCH SỬ AUDIT TRONG MYSQL
// GET /api/blockchain/audits
// ==========================================
router.get('/audits', async (req, res) => {
    try {
        const rows = await dbAll('SELECT * FROM blockchain_audits ORDER BY id DESC');
        res.json({ success: true, data: rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi đọc blockchain_audits', error: err.message });
    }
});

// ==========================================
// 8. NEO BẢN GHI TỪ MYSQL LÊN SEPOLIA (THEO ID/CODE)
// POST /api/blockchain/anchor-record
// ==========================================
router.post('/anchor-record', async (req, res) => {
    const { recordType, recordId } = req.body;
    try {
        const { onChainId, onChainType, currentHash, snapshot, row } = await resolveRecordAndHash(recordType, recordId);
        const result = await blockchainClient.anchor(onChainId, onChainType, currentHash);
        const deployment = blockchainClient.getDeploymentConfig();

        db.run(
            `INSERT INTO blockchain_audits (record_type, record_id, data_hash, payload_snapshot, tx_hash, block_number, chain_id, contract_address, recorder_address, status, confirmed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', CURRENT_TIMESTAMP)`,
            [onChainType, onChainId, currentHash, JSON.stringify(snapshot), result.txHash, result.blockNumber, deployment.chainId || 11155111, deployment.contractAddress, result.recorder]
        );

        if (onChainType === 'TREE_PROFILE') {
            db.run('UPDATE trees SET data_hash = ? WHERE id = ?', [currentHash, row.id]);
        } else if (onChainType === 'CARE_LOG') {
            db.run("UPDATE care_records SET data_hash = ?, anchor_status = 'CONFIRMED' WHERE id = ?", [currentHash, row.id]);
        }

        res.status(201).json({
            success: true,
            recordId: onChainId,
            recordType: onChainType,
            dataHash: currentHash,
            snapshot,
            txHash: result.txHash,
            blockNumber: result.blockNumber,
            contractAddress: deployment.contractAddress,
            recorder: result.recorder
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// ==========================================
// 9. XÁC MINH TRỰC TIẾP TỪ MYSQL ĐỐI CHIẾU SEPOLIA
// POST /api/blockchain/verify-live
// ==========================================
router.post('/verify-live', async (req, res) => {
    const { recordType, recordId } = req.body;
    try {
        const { onChainId, onChainType, currentHash, snapshot } = await resolveRecordAndHash(recordType, recordId);
        const result = await blockchainClient.verify(onChainId, currentHash);
        const deployment = blockchainClient.getDeploymentConfig();
        const detail = await buildAuditDetail(onChainId, onChainType, result.storedHash || '', null);

        let status = 'NOT_ANCHORED';
        if (result.isExisted) {
            status = result.isValid ? 'VALID' : 'MISMATCH';
        }

        res.json({
            success: true,
            status,
            recordId: onChainId,
            recordType: onChainType,
            currentHash,
            onChainHash: result.storedHash || null,
            txHash: detail.auditRow?.tx_hash || null,
            blockNumber: detail.auditRow?.block_number || null,
            contractAddress: deployment.contractAddress,
            anchoredAt: result.dateFormatted,
            recorder: result.recorder,
            originalSnapshot: detail.originalSnapshot,
            currentSnapshot: snapshot,
            comparison: detail.comparison
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            status: 'UNAVAILABLE',
            message: err.message
        });
    }
});

// ==========================================
// 10. DEMO GIẢ LẬP SỬA LÉN / KHÔI PHỤC TRONG MYSQL (PHỤC VỤ THUYẾT TRÌNH)
// POST /api/blockchain/tamper-demo
// body: { recordId, action: 'tamper' | 'restore' }
// ==========================================
router.post('/tamper-demo', async (req, res) => {
    const { recordId, action } = req.body;
    try {
        const auditRow = await dbGet(
            "SELECT * FROM blockchain_audits WHERE record_id = ? AND status = 'CONFIRMED' ORDER BY id DESC LIMIT 1",
            [recordId]
        );
        if (!auditRow || !auditRow.payload_snapshot) {
            return res.status(400).json({
                success: false,
                message: 'Bản ghi này chưa có snapshot gốc để chạy giả lập sửa/khôi phục.'
            });
        }

        const orig = JSON.parse(auditRow.payload_snapshot);
        const getOrigField = (key) => {
            const f = (orig.fields || []).find((x) => x.key === key);
            return f ? f.value : null;
        };

        const type = orig.recordType || inferTypeFromId(recordId);

        if (action === 'restore') {
            if (type === 'CARE_LOG') {
                await dbRun(
                    'UPDATE care_records SET service_cost = ?, action_type = ?, notes = ? WHERE care_code = ?',
                    [
                        Number(getOrigField('service_cost') || 0),
                        getOrigField('action_type'),
                        getOrigField('notes') === '(Không có)' ? '' : getOrigField('notes'),
                        recordId
                    ]
                );
            } else if (type === 'INCIDENT_REPORT') {
                const cleanId = String(recordId).replace(/^INC-/i, '');
                await dbRun(
                    'UPDATE incidents SET service_cost = ?, status = ?, resolution_notes = ? WHERE id = ? OR tracking_code = ?',
                    [
                        Number(getOrigField('service_cost') || 0),
                        getOrigField('status'),
                        getOrigField('resolution_notes') === '(Chưa ghi chú)' ? '' : getOrigField('resolution_notes'),
                        cleanId,
                        recordId
                    ]
                );
            } else if (type === 'TREE_PROFILE') {
                await dbRun(
                    'UPDATE trees SET health_status = ?, location_name = ? WHERE tree_code = ?',
                    [getOrigField('health_status'), getOrigField('location_name'), recordId]
                );
            }
            return res.json({ success: true, action: 'restore', message: `Đã khôi phục dữ liệu gốc trong MySQL cho ${recordId}.` });
        }

        // action === 'tamper': cố tình sửa lén dữ liệu trong MySQL (ví dụ nâng khống tiền dịch vụ +5,000,000đ)
        if (type === 'CARE_LOG') {
            const fakeCost = Number(getOrigField('service_cost') || 0) + 5000000;
            await dbRun(
                'UPDATE care_records SET service_cost = ? WHERE care_code = ?',
                [fakeCost, recordId]
            );
            return res.json({
                success: true,
                action: 'tamper',
                message: `Đã giả lập sửa lén MySQL: nâng khống Chi phí dịch vụ của ${recordId} lên ${fakeCost.toLocaleString('vi-VN')} VNĐ!`
            });
        } else if (type === 'INCIDENT_REPORT') {
            const cleanId = String(recordId).replace(/^INC-/i, '');
            const fakeCost = Number(getOrigField('service_cost') || 0) + 5000000;
            await dbRun(
                'UPDATE incidents SET service_cost = ? WHERE id = ? OR tracking_code = ?',
                [fakeCost, cleanId, recordId]
            );
            return res.json({
                success: true,
                action: 'tamper',
                message: `Đã giả lập sửa lén MySQL: nâng khống Chi phí xử lý của ${recordId} lên ${fakeCost.toLocaleString('vi-VN')} VNĐ!`
            });
        } else if (type === 'TREE_PROFILE') {
            const curTree = await dbGet('SELECT health_status FROM trees WHERE tree_code = ?', [recordId]);
            const fakeHealth = curTree && curTree.health_status === 'Tốt' ? 'Nguy hiểm' : 'Tốt';
            await dbRun('UPDATE trees SET health_status = ? WHERE tree_code = ?', [fakeHealth, recordId]);
            return res.json({
                success: true,
                action: 'tamper',
                message: `Đã giả lập sửa lén MySQL: đổi Tình trạng sức khỏe của ${recordId} thành "${fakeHealth}"!`
            });
        }

        res.status(400).json({ success: false, message: 'Không hỗ trợ loại bản ghi này.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
