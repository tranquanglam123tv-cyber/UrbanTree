const CareRecord = require('../models/CareRecord');

// 1. Lấy danh sách lịch sử chăm sóc
exports.getAllCareRecords = (req, res) => {
  CareRecord.getAll((err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi truy vấn lịch sử chăm sóc', error: err.message });
    }
    res.json({ success: true, count: rows.length, data: rows });
  });
};

// 2. Thêm ghi nhận chăm sóc (Tưới nước, Bón phân, Cắt tỉa...)
exports.addCareRecord = (req, res) => {
  const { tree_id, caretaker_name, action_type, notes } = req.body;

  if (!tree_id || !caretaker_name || !action_type) {
    return res.status(400).json({ success: false, message: 'Vui lòng cung cấp đầy đủ tree_id, caretaker_name, action_type' });
  }

  CareRecord.create({
    tree_id,
    caretaker_name,
    action_type,
    notes: notes || ''
  }, (err, newRecord) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Lỗi lưu thông tin chăm sóc', error: err.message });
    }
    res.status(201).json({
      success: true,
      message: 'Ghi nhận chăm sóc cây xanh thành công',
      data: newRecord
    });
  });
};
