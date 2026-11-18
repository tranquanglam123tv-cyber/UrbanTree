const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const apiRoutes = require('./routes/api');
const treeRoutes = require('./routes/treeRoutes');
const incidentRoutes = require('./routes/incidentRoutes');
const careRoutes = require('./routes/careRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const registryRoutes = require('./registry');
const blockchainRoutes = require('./routes/blockchainRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const distPath = path.resolve(__dirname, '../../dist');
const distIndex = path.join(distPath, 'index.html');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 1. Đăng ký toàn bộ API Routes (Backend + MySQL + Sepolia)
app.use('/api/trees', treeRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/care-records', careRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', apiRoutes);
app.use('/api', registryRoutes);
app.use('/api/blockchain', blockchainRoutes);

// Endpoint kiểm tra trạng thái JSON API
app.get('/api/info', (req, res) => {
  res.json({
    project: 'UrbanTree Unified Platform (React + Express + MySQL + Sepolia)',
    status: 'Running',
    version: '2.0.0',
    endpoints: {
      dashboard: '/api/dashboard/stats',
      trees: '/api/trees',
      incidents: '/api/incidents',
      careRecords: '/api/care-records',
      blockchain: {
        status: '/api/blockchain/status',
        anchor: '/api/blockchain/anchor',
        verify: '/api/blockchain/verify/:recordId',
        explorer: '/api/blockchain/explorer',
        record: '/api/blockchain/record/:recordId'
      }
    }
  });
});

// 2. Giữ các trang HTML gọn nhẹ dự phòng tại /legacy/*
app.get('/legacy/verifier', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verifier.html'));
});
app.get('/legacy/citizen', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'citizen.html'));
});
app.get('/legacy/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 3. Phục vụ giao diện React hợp nhất (dist/) ngay trên cổng 5001
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}
app.use(express.static(path.join(__dirname, 'public')));

// SPA Fallback: mọi đường dẫn giao diện (/, /verifier, /admin, /citizen, /trees...) mở thẳng React App
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.status(503).send('Chưa build Frontend (dist/). Hãy chạy "npm run build" ở thư mục gốc trước.');
});

// Khởi chạy server nếu chạy trực tiếp
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🌳 UrbanTree Unified Server (1 Cổng Duy Nhất) đang chạy tại:`);
    console.log(`👉 Giao diện Web + API: http://localhost:${PORT}`);
    console.log(`👉 Trang Kiểm toán:     http://localhost:${PORT}/verifier`);
    console.log(`👉 Trang Sự cố/Dân:     http://localhost:${PORT}/citizen`);
    console.log(`👉 API Status:          http://localhost:${PORT}/api/blockchain/status`);
    console.log(`====================================================`);
  });
}

module.exports = app;
