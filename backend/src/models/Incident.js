const db = require('../config/db');

const Incident = {
  /**
   * Lấy danh sách sự cố có hỗ trợ bộ lọc và phân trang
   * @param {Object} [filters] { status, severity, tree_id, limit, offset }
   * @param {Function} callback (err, rows)
   */
  getAll: (filters, callback) => {
    if (typeof filters === 'function') {
      callback = filters;
      filters = {};
    }
    filters = filters || {};

    let query = `
      SELECT incidents.*, trees.tree_code, trees.species, trees.location_name 
      FROM incidents 
      LEFT JOIN trees ON incidents.tree_id = trees.id 
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND incidents.status = ?';
      params.push(filters.status);
    }

    if (filters.severity) {
      query += ' AND incidents.severity = ?';
      params.push(filters.severity);
    }

    if (filters.tree_id) {
      query += ' AND incidents.tree_id = ?';
      params.push(parseInt(filters.tree_id));
    }

    query += ' ORDER BY incidents.id DESC';

    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
      if (filters.offset) {
        query += ' OFFSET ?';
        params.push(parseInt(filters.offset));
      }
    }

    db.all(query, params, callback);
  },

  /**
   * Tìm sự cố theo ID
   * @param {number|string} id 
   * @param {Function} callback (err, row)
   */
  getById: (id, callback) => {
    const query = `
      SELECT incidents.*, trees.tree_code, trees.species, trees.location_name 
      FROM incidents 
      LEFT JOIN trees ON incidents.tree_id = trees.id 
      WHERE incidents.id = ?
    `;
    db.get(query, [id], callback);
  },

  /**
   * Lấy danh sách sự cố theo tree_id
   * @param {number|string} tree_id 
   * @param {Function} callback (err, rows)
   */
  getByTreeId: (tree_id, callback) => {
    const query = `
      SELECT incidents.*, trees.tree_code, trees.species, trees.location_name 
      FROM incidents 
      LEFT JOIN trees ON incidents.tree_id = trees.id 
      WHERE incidents.tree_id = ? 
      ORDER BY incidents.id DESC
    `;
    db.all(query, [tree_id], callback);
  },

  /**
   * Tạo báo cáo sự cố mới từ người dân / nhân viên
   * @param {Object} data { tree_id, reporter_name, reporter_phone, description, image_url, severity, status }
   * @param {Function} callback (err, newIncident)
   */
  create: (data, callback) => {
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
      severity,
      status
    } = data;

    const code = tracking_code || `INC-${Date.now().toString().slice(-5)}`;
    const query = `
      INSERT INTO incidents (tracking_code, tree_id, reporter_name, reporter_phone, description, address, latitude, longitude, image_url, severity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        code,
        tree_id || null,
        reporter_name,
        reporter_phone,
        description,
        address || null,
        latitude !== undefined ? latitude : null,
        longitude !== undefined ? longitude : null,
        image_url || '',
        severity || 'Trung bình',
        status || 'Chờ xử lý'
      ],
      function (err) {
        if (err) return callback(err);
        callback(null, {
          id: this ? this.lastID : null,
          tracking_code: code,
          ...data
        });
      }
    );
  },

  /**
   * Cập nhật trạng thái sự cố và mốc thời gian hoàn thành (phục vụ Blockchain anchor)
   */
  updateStatus: (id, status, resolved_at, assigned_staff_id, extra, callback) => {
    if (typeof resolved_at === 'function') {
      callback = resolved_at;
      resolved_at = null;
      assigned_staff_id = null;
      extra = {};
    } else if (typeof assigned_staff_id === 'function') {
      callback = assigned_staff_id;
      assigned_staff_id = null;
      extra = {};
    } else if (typeof extra === 'function') {
      callback = extra;
      extra = {};
    }
    extra = extra || {};

    let resolvedTimestamp = resolved_at;
    if (!resolvedTimestamp && (status === 'Đã hoàn thành' || status === 'Đã giải quyết')) {
      resolvedTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    }

    const hasCost = extra.service_cost !== undefined && extra.service_cost !== null && extra.service_cost !== '';
    const hasNotes = extra.resolution_notes !== undefined && extra.resolution_notes !== null;

    const query = `
      UPDATE incidents 
      SET status = ?, 
          resolved_at = COALESCE(?, resolved_at),
          assigned_staff_id = COALESCE(?, assigned_staff_id),
          service_cost = COALESCE(?, service_cost),
          resolution_notes = COALESCE(?, resolution_notes),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(
      query,
      [
        status,
        resolvedTimestamp,
        assigned_staff_id || null,
        hasCost ? Number(extra.service_cost) : null,
        hasNotes ? String(extra.resolution_notes).trim() : null,
        id
      ],
      function (err) {
        if (err) return callback(err);
        callback(null, {
          changes: this ? this.changes : 0,
          status,
          resolved_at: resolvedTimestamp
        });
      }
    );
  },

  /**
   * Xóa sự cố khỏi hệ thống
   * @param {number|string} id 
   * @param {Function} callback 
   */
  delete: (id, callback) => {
    const query = 'DELETE FROM incidents WHERE id = ?';
    db.run(query, [id], function (err) {
      if (err) return callback(err);
      callback(null, { changes: this ? this.changes : 0 });
    });
  }
};

module.exports = Incident;
