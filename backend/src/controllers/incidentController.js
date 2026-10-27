const Incident = require('../models/Incident');

// 1. Lấy danh sách tất cả sự cố
exports.getAllIncidents = (req, res) => {
  Incident.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi truy vấn sự cố', error: err.message });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
};

// 2. Tiếp nhận sự cố mới (người dân báo cáo cây đổ, sâu bệnh, cành gãy...)
exports.reportIncident = (req, res) => {
  const { tree_id, reporter_name, reporter_phone, description, image_url, severity } = req.body;

  if (!description) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập mô tả sự cố' });
  }

  Incident.create({
    tree_id: tree_id || null,
    reporter_name: reporter_name || 'Người dân ẩn danh',
    reporter_phone: reporter_phone || '',
    description,
    image_url: image_url || '',
    severity: severity || 'Trung bình',
    status: 'Chờ xử lý'
  }, (err, newIncident) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi lưu thông tin sự cố', error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Đã tiếp nhận báo cáo sự cố thành công',
      data: newIncident
    });
  });
};

// 3. Cập nhật trạng thái sự cố (Chờ xử lý -> Đang xử lý -> Đã giải quyết)
exports.updateIncidentStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp trạng thái mới' });
  }

  Incident.updateStatus(id, status, (err, result) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi cập nhật trạng thái', error: err.message });
    }
    if (result.changes === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sự cố cần cập nhật' });
    }
    res.json({ success: true, message: `Cập nhật trạng thái sự cố thành: ${status}` });
  });
};
