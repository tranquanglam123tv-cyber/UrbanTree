const Incident = require('../models/Incident');
const db = require('../config/db');
const hashService = require('../services/hashService');
const blockchainClient = require('../services/blockchainClient');

/**
 * 1. Lấy danh sách sự cố (Hỗ trợ phân trang và bộ lọc: status, severity, tree_id)
 * Endpoint: GET /api/incidents?status=Chờ xử lý&severity=Khẩn cấp&page=1&limit=50
 */
exports.getAllIncidents = (req, res) => {
  const { status, severity, tree_id, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 50));
  const offset = (pageNum - 1) * limitNum;

  Incident.getAll({ status, severity, tree_id, limit: limitNum, offset }, (err, rows) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn danh sách sự cố',
        error: err.message
      });
    }

    res.json({
      success: true,
      count: rows.length,
      page: pageNum,
      limit: limitNum,
      filters: {
        status: status || null,
        severity: severity || null,
        tree_id: tree_id ? parseInt(tree_id) : null
      },
      data: rows
    });
  });
};

/**
 * 2. Lấy chi tiết một sự cố theo ID
 * Endpoint: GET /api/incidents/:id
 */
exports.getIncidentById = (req, res) => {
  const { id } = req.params;

  Incident.getById(id, (err, row) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi truy vấn sự cố',
        error: err.message
      });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy sự cố với ID: ${id}`
      });
    }

    res.json({
      success: true,
      data: row
    });
  });
};

/**
 * 3. Tiếp nhận báo cáo sự cố mới từ người dân / nhân viên
 * Endpoint: POST /api/incidents
 */
exports.reportIncident = (req, res) => {
  const {
    tracking_code,
    tree_id,
    reporter_name,
    reporter_phone,
    description,
    address,
    latitude,
    longitude,
    image_url,
    severity
  } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp mô tả chi tiết về sự cố'
    });
  }

  if (!reporter_name || !reporter_name.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp họ tên người phản ánh'
    });
  }

  if (!reporter_phone || !reporter_phone.trim()) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp số điện thoại người phản ánh'
    });
  }

  const validSeverities = ['Thấp', 'Trung bình', 'Cao', 'Khẩn cấp'];
  const finalSeverity = severity && validSeverities.includes(severity) ? severity : 'Trung bình';

  Incident.create(
    {
      tracking_code: tracking_code || null,
      tree_id: tree_id ? parseInt(tree_id) : null,
      reporter_name: reporter_name.trim(),
      reporter_phone: reporter_phone.trim(),
      description: description.trim(),
      address: address || null,
      latitude: latitude !== undefined ? Number(latitude) : null,
      longitude: longitude !== undefined ? Number(longitude) : null,
      image_url: image_url || '',
      severity: finalSeverity,
      status: 'Chờ xử lý'
    },
    (err, newIncident) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Lỗi lưu thông tin tiếp nhận sự cố',
          error: err.message
        });
      }

      // Format response chuẩn theo đặc tả THUAN-04
      res.status(201).json({
        success: true,
        message: 'Tiếp nhận phản ánh thành công. Đội cứu hộ đang điều phối.',
        incident_id: newIncident.id,
        data: newIncident
      });
    }
  );
};

/**
 * 4. Cập nhật trạng thái sự cố và mốc thời gian hoàn thành (phục vụ Blockchain anchor)
 * Endpoint: PATCH /api/incidents/:id/status
 */
exports.updateIncidentStatus = (req, res) => {
  const { id } = req.params;
  const { status, resolved_at, assigned_staff_id, actor_id, note, service_cost, resolution_notes } = req.body;

  if (!status) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng cung cấp trạng thái mới cho sự cố'
    });
  }

  const validStatuses = ['Chờ xử lý', 'Đã tiếp nhận', 'Đang xử lý', 'Đã giải quyết', 'Đã hoàn thành', 'Từ chối'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Trạng thái không hợp lệ. Chỉ chấp nhận một trong các giá trị: ${validStatuses.join(', ')}`
    });
  }

  Incident.getById(id, (getErr, existing) => {
    if (getErr) {
      return res.status(500).json({ success: false, message: 'Lỗi truy vấn sự cố', error: getErr.message });
    }
    if (!existing) {
      return res.status(404).json({ success: false, message: `Không tìm thấy sự cố với ID: ${id}` });
    }

    const lockedStatuses = ['Đã hoàn thành', 'Đã giải quyết', 'Từ chối'];
    if (lockedStatuses.includes(existing.status)) {
      return res.status(409).json({
        success: false,
        locked: true,
        message: `CHỐT HỒ SƠ: Sự cố này đã ở trạng thái "${existing.status}" và đã được chốt bất biến, không thể cập nhật lại!`
      });
    }

    const finalNotes = resolution_notes !== undefined ? resolution_notes : (note || existing.resolution_notes || '');
    const finalCost = service_cost !== undefined ? Number(service_cost) : Number(existing.service_cost || 0);

    Incident.updateStatus(
      id,
      status,
      resolved_at,
      assigned_staff_id || null,
      { service_cost: finalCost, resolution_notes: finalNotes },
      async (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Lỗi cập nhật trạng thái sự cố',
            error: err.message
          });
        }

        if (result.changes === 0) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sự cố với ID: ${id}`
          });
        }

        // Ghi log lịch sử xử lý sự cố
        db.run(
          'INSERT INTO incident_updates (incident_id, actor_id, old_status, new_status, notes) VALUES (?, ?, ?, ?, ?)',
          [id, actor_id || null, existing.status, status, note || finalNotes || `Cập nhật trạng thái: ${status}`]
        );

        // Nếu đã hoàn thành / giải quyết, tự động neo mã băm + snapshot lên Sepolia
        let blockchainResult = null;
        if (status === 'Đã hoàn thành' || status === 'Đã giải quyết') {
          const recordKey = existing.tracking_code || `INC-${existing.id}`;
          const resolvedStr = result.resolved_at || '';
          const snapshot = hashService.buildAuditSnapshot('INCIDENT_REPORT', {
            ...existing,
            status,
            service_cost: finalCost,
            resolution_notes: finalNotes,
            resolved_at: resolvedStr
          });
          const dataHash = snapshot.hash;

          try {
            const anchorRes = await blockchainClient.anchor(recordKey, 'INCIDENT_REPORT', dataHash);
            const deployment = blockchainClient.getDeploymentConfig();
            blockchainResult = {
              anchored: true,
              status: 'CONFIRMED',
              dataHash,
              txHash: anchorRes.txHash,
              blockNumber: anchorRes.blockNumber,
              recorder: anchorRes.recorder
            };
            db.run(
              `INSERT INTO blockchain_audits (record_type, record_id, data_hash, payload_snapshot, tx_hash, block_number, chain_id, contract_address, recorder_address, status, confirmed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED', CURRENT_TIMESTAMP)`,
              ['INCIDENT_REPORT', recordKey, dataHash, JSON.stringify(snapshot), anchorRes.txHash, anchorRes.blockNumber, deployment.chainId || 11155111, deployment.contractAddress, anchorRes.recorder]
            );
          } catch (bcErr) {
            blockchainResult = { anchored: false, status: 'PENDING', message: bcErr.message };
          }
        }

      res.json({
        success: true,
        message: `Cập nhật trạng thái sự cố thành: ${status}`,
        incident_id: parseInt(id),
        status: result.status,
        resolved_at: result.resolved_at,
        blockchain: blockchainResult
      });
    });
  });
};
