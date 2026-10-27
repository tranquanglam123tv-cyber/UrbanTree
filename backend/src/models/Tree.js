const db = require('../config/db');

const Tree = {
  // Lấy tất cả cây xanh
  getAll: (callback) => {
    const query = 'SELECT * FROM trees ORDER BY id DESC';
    db.all(query, [], callback);
  },

  // Tìm cây theo ID
  getById: (id, callback) => {
    const query = 'SELECT * FROM trees WHERE id = ?';
    db.get(query, [id], callback);
  },

  // Tìm cây theo mã Tree Code
  getByCode: (tree_code, callback) => {
    const query = 'SELECT * FROM trees WHERE tree_code = ?';
    db.get(query, [tree_code], callback);
  },

  // Thêm mới một cây xanh
  create: (data, callback) => {
    const { tree_code, species, location_name, latitude, longitude, planted_date, health_status, qr_code_url, data_hash } = data;
    const query = `
      INSERT INTO trees (tree_code, species, location_name, latitude, longitude, planted_date, health_status, qr_code_url, data_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [tree_code, species, location_name, latitude, longitude, planted_date, health_status || 'Tốt', qr_code_url, data_hash], function (err) {
      callback(err, { id: this ? this.lastID : null, ...data });
    });
  },

  // Cập nhật thông tin cây
  update: (id, data, callback) => {
    const { species, location_name, latitude, longitude, planted_date, health_status, qr_code_url, data_hash } = data;
    const query = `
      UPDATE trees 
      SET species = ?, location_name = ?, latitude = ?, longitude = ?, planted_date = ?, health_status = ?, qr_code_url = ?, data_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    db.run(query, [species, location_name, latitude, longitude, planted_date, health_status, qr_code_url, data_hash, id], function (err) {
      callback(err, { changes: this ? this.changes : 0 });
    });
  },

  // Cập nhật mã QR URL cho cây
  updateQrUrl: (id, qr_code_url, callback) => {
    const query = `UPDATE trees SET qr_code_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [qr_code_url, id], function (err) {
      callback(err, { changes: this ? this.changes : 0 });
    });
  },

  // Cập nhật hash dữ liệu đối chiếu Blockchain
  updateHash: (id, data_hash, callback) => {
    const query = `UPDATE trees SET data_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(query, [data_hash, id], function (err) {
      callback(err, { changes: this ? this.changes : 0 });
    });
  },

  // Xóa cây
  delete: (id, callback) => {
    const query = 'DELETE FROM trees WHERE id = ?';
    db.run(query, [id], function (err) {
      callback(err, { changes: this ? this.changes : 0 });
    });
  }
};

module.exports = Tree;
