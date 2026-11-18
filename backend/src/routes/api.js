const express = require('express');
const router = express.Router();

const db = require('../config/db');
const treeController = require('../controllers/treeController');
const incidentController = require('../controllers/incidentController');
const careController = require('../controllers/careController');
const dashboardController = require('../controllers/dashboardController');

// ==========================================
// 👥 DANH MỤC LOÀI CÂY, NGƯỜI DÙNG & LỊCH SỬ SỰ CỐ
// ==========================================
router.get('/tree-types', (req, res) => {
  db.all("SELECT * FROM tree_types WHERE status = 'ACTIVE' ORDER BY id ASC", (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

router.get('/users', (req, res) => {
  db.all('SELECT id, username, email, full_name, phone, role, status, avatar_url FROM users ORDER BY id ASC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

router.get('/incident-updates', (req, res) => {
  const { incident_id } = req.query;
  const sql = incident_id
    ? `SELECT iu.*, u.full_name AS actor_name FROM incident_updates iu LEFT JOIN users u ON iu.actor_id = u.id WHERE iu.incident_id = ? ORDER BY iu.created_at ASC`
    : `SELECT iu.*, u.full_name AS actor_name FROM incident_updates iu LEFT JOIN users u ON iu.actor_id = u.id ORDER BY iu.created_at ASC`;
  db.all(sql, incident_id ? [incident_id] : [], (err, rows) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: rows });
  });
});

// ==========================================
// 📊 ROUTE THỐNG KÊ DASHBOARD (Figma A04)
// ==========================================
router.get('/dashboard/stats', dashboardController.getDashboardStats);

// ==========================================
// 🌳 ROUTES CÂY XANH (Người 2 - Bạn Thuận)
// ==========================================
router.get('/trees', treeController.getAllTrees);
router.get('/trees/nearby', treeController.getNearbyTrees);
router.get('/trees/:id', treeController.getTreeById);
router.post('/trees', treeController.createTree);
router.put('/trees/:id', treeController.updateTree);
router.delete('/trees/:id', treeController.deleteTree);
router.get('/trees/:id/qr', treeController.generateQrCode);

// ==========================================
// ⚠️ ROUTES SỰ CỐ (Người 2 - Bạn Thuận)
// ==========================================
router.get('/incidents', incidentController.getAllIncidents);
router.get('/incidents/:id', incidentController.getIncidentById);
router.post('/incidents', incidentController.reportIncident);
router.patch('/incidents/:id/status', incidentController.updateIncidentStatus);

// ==========================================
// 💧 ROUTES CHĂM SÓC (Người 2 - Bạn Thuận)
// ==========================================
router.get('/care-records', careController.getAllCareRecords);
router.get('/care-records/:id', careController.getCareRecordById);
router.post('/care-records', careController.addCareRecord);

// ==========================================
// ⛓️ ROUTE BLOCKCHAIN (Người 1 - Bạn Lâm)
// Các endpoint /api/record, /api/record/:id, /api/verify/:id được xử lý trực tiếp bởi registry.js
// ==========================================

module.exports = router;
