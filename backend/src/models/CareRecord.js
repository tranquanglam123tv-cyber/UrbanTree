const db = require('../config/db');

const CareRecord = {
  getAll: (callback) => {
    const query = `
      SELECT care_records.*, trees.tree_code, trees.species, trees.location_name 
      FROM care_records 
      LEFT JOIN trees ON care_records.tree_id = trees.id 
      ORDER BY care_records.id DESC
    `;
    db.all(query, [], callback);
  },

  getByTreeId: (tree_id, callback) => {
    const query = 'SELECT * FROM care_records WHERE tree_id = ? ORDER BY id DESC';
    db.all(query, [tree_id], callback);
  },

  create: (data, callback) => {
    const { tree_id, caretaker_name, action_type, notes } = data;
    const query = `
      INSERT INTO care_records (tree_id, caretaker_name, action_type, notes)
      VALUES (?, ?, ?, ?)
    `;
    db.run(query, [tree_id, caretaker_name, action_type, notes], function (err) {
      callback(err, { id: this ? this.lastID : null, ...data });
    });
  }
};

module.exports = CareRecord;
