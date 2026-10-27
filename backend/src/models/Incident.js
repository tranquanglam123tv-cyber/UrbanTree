const db = require('../config/db');

const Incident = {
  getAll: (callback) => {
    const query = `
      SELECT incidents.*, trees.tree_code, trees.species, trees.location_name 
      FROM incidents 
      LEFT JOIN trees ON incidents.tree_id = trees.id 
      ORDER BY incidents.id DESC
    `;
    db.all(query, [], callback);
  },

  getById: (id, callback) => {
    const query = 'SELECT * FROM incidents WHERE id = ?';
    db.get(query, [id], callback);
  },

  getByTreeId: (tree_id, callback) => {
    const query = 'SELECT * FROM incidents WHERE tree_id = ? ORDER BY id DESC';
    db.all(query, [tree_id], callback);
  },

  create: (data, callback) => {
    const { tree_id, reporter_name, reporter_phone, description, image_url, severity, status } = data;
    const query = `
      INSERT INTO incidents (tree_id, reporter_name, reporter_phone, description, image_url, severity, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(query, [tree_id, reporter_name, reporter_phone, description, image_url, severity || 'Trung bình', status || 'Chờ xử lý'], function (err) {
      callback(err, { id: this ? this.lastID : null, ...data });
    });
  },

  updateStatus: (id, status, callback) => {
    const query = 'UPDATE incidents SET status = ? WHERE id = ?';
    db.run(query, [status, id], function (err) {
      callback(err, { changes: this ? this.changes : 0 });
    });
  }
};

module.exports = Incident;
