const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'urbantree',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

async function initDatabase() {
  try {
    const conn = await pool.getConnection();
    console.log(`✅ Đã kết nối MySQL database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
    conn.release();

    // ==============================================================
    // 1. NHÓM QUẢN TRỊ NGƯỜI DÙNG & PHÂN QUYỀN (users)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(191) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        role VARCHAR(20) NOT NULL CHECK(role IN ('ADMIN', 'STAFF')),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
        auth_provider VARCHAR(30) DEFAULT 'LOCAL',
        avatar_url TEXT,
        google_id VARCHAR(255),
        refresh_token TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 1b. NHÓM MÃ XÁC THỰC OTP (otp_codes)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS otp_codes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(191) NOT NULL,
        code VARCHAR(20) NOT NULL,
        expires_at DATETIME NOT NULL,
        is_verified TINYINT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_otp_email (email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 2. NHÓM QUẢN LÝ LOÀI CÂY (tree_types)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tree_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        scientific_name VARCHAR(255),
        description TEXT,
        care_guide TEXT,
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 3. NHÓM QUẢN LÝ CÂY XANH (trees)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tree_code VARCHAR(100) UNIQUE NOT NULL,
        tree_type_id INT,
        species VARCHAR(255) NOT NULL,
        location_name VARCHAR(255) NOT NULL,
        address TEXT,
        latitude DOUBLE NOT NULL,
        longitude DOUBLE NOT NULL,
        planted_date VARCHAR(50) NOT NULL,
        height_meter DOUBLE,
        diameter_cm DOUBLE,
        health_status VARCHAR(50) DEFAULT 'Tốt' CHECK(health_status IN ('Tốt', 'Bình thường', 'Cần chăm sóc', 'Sâu bệnh', 'Nguy hiểm')),
        status VARCHAR(20) DEFAULT 'ACTIVE' CHECK(status IN ('ACTIVE', 'INACTIVE', 'REMOVED')),
        qr_code_url LONGTEXT,
        image_url TEXT,
        data_hash VARCHAR(128),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tree_code (tree_code),
        FOREIGN KEY (tree_type_id) REFERENCES tree_types(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 4. NHÓM NHẬT KÝ CHĂM SÓC THỰC ĐỊA (care_records)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS care_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        care_code VARCHAR(100) UNIQUE,
        tree_id INT NOT NULL,
        staff_id INT,
        caretaker_name VARCHAR(255) NOT NULL,
        action_type VARCHAR(50) NOT NULL CHECK(action_type IN ('Tưới nước', 'Bón phân', 'Cắt tỉa', 'Trị sâu bệnh', 'Gia cố cọc')),
        service_cost DECIMAL(15,2) DEFAULT 0,
        health_before VARCHAR(100),
        health_after VARCHAR(100),
        notes TEXT,
        image_before_url TEXT,
        image_after_url TEXT,
        data_hash VARCHAR(128),
        anchor_status VARCHAR(20) DEFAULT 'PENDING' CHECK(anchor_status IN ('PENDING', 'CONFIRMED', 'FAILED')),
        action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE,
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 5. NHÓM TIẾP NHẬN SỰ CỐ (incidents)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tracking_code VARCHAR(100) UNIQUE,
        tree_id INT,
        reporter_name VARCHAR(255) NOT NULL,
        reporter_phone VARCHAR(30) NOT NULL,
        reporter_email VARCHAR(191),
        description TEXT NOT NULL,
        address TEXT,
        latitude DOUBLE,
        longitude DOUBLE,
        image_url TEXT,
        severity VARCHAR(30) DEFAULT 'Trung bình' CHECK(severity IN ('Thấp', 'Trung bình', 'Cao', 'Khẩn cấp')),
        status VARCHAR(50) DEFAULT 'Chờ xử lý' CHECK(status IN ('Chờ xử lý', 'Đã tiếp nhận', 'Đang xử lý', 'Đã giải quyết', 'Đã hoàn thành', 'Từ chối')),
        service_cost DECIMAL(15,2) DEFAULT 0,
        resolution_notes TEXT,
        assigned_staff_id INT,
        reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        resolved_at DATETIME,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 6. NHÓM LỊCH SỬ TIẾN ĐỘ SỰ CỐ (incident_updates)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incident_updates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        incident_id INT NOT NULL,
        actor_id INT,
        old_status VARCHAR(50),
        new_status VARCHAR(50) NOT NULL,
        notes TEXT,
        image_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
        FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 7. NHÓM KIỂM TOÁN VÀ NEO HASH BLOCKCHAIN (blockchain_audits)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS blockchain_audits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        record_type VARCHAR(50) NOT NULL CHECK(record_type IN ('TREE_PROFILE', 'CARE_LOG', 'INCIDENT_REPORT')),
        record_id VARCHAR(100) NOT NULL,
        data_hash VARCHAR(128) NOT NULL,
        payload_snapshot LONGTEXT,
        tx_hash VARCHAR(128),
        block_number INT,
        chain_id INT DEFAULT 11155111,
        contract_address VARCHAR(100),
        recorder_address VARCHAR(100),
        status VARCHAR(20) DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'FAILED')),
        retry_count INT DEFAULT 0,
        last_error TEXT,
        confirmed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_audit_record (record_type, record_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // ==============================================================
    // 8. NHÓM ĐÁNH GIÁ & DỰ ĐOÁN AI (ai_assessments)
    // ==============================================================
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tree_id INT NOT NULL,
        engine_type VARCHAR(50) NOT NULL CHECK(engine_type IN ('TREE_HEALTH', 'CLIMATE_MATCH', 'RISK_PREDICT', 'CARE_ADVISOR')),
        score DOUBLE,
        risk_level VARCHAR(20) CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
        result_json LONGTEXT NOT NULL,
        data_hash VARCHAR(128),
        blockchain_tx_hash VARCHAR(128),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_ai_tree (tree_id, engine_type),
        FOREIGN KEY (tree_id) REFERENCES trees(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Bổ sung cột mới cho bảng đã tồn tại (nếu cần)
    async function ensureColumn(table, column, definition) {
      const [cols] = await pool.query(
        'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
        [table, column]
      );
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
      }
    }

    await ensureColumn('care_records', 'service_cost', 'DECIMAL(15,2) DEFAULT 0');
    await ensureColumn('incidents', 'service_cost', 'DECIMAL(15,2) DEFAULT 0');
    await ensureColumn('incidents', 'resolution_notes', 'TEXT');
    await ensureColumn('blockchain_audits', 'payload_snapshot', 'LONGTEXT');

    // ==============================================================
    // CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
    // ==============================================================
    const [[userCount]] = await pool.query("SELECT COUNT(*) AS count FROM users");
    if (userCount.count === 0) {
      console.log('👤 Đang khởi tạo danh mục Người dùng mẫu...');
      const sampleUsers = [
        ['admin', 'admin@urbantree.vn', '$2b$10$hashedAdminPassword', 'Đặng Thế Thuận (Admin)', '0901234567', 'ADMIN', 'ACTIVE'],
        ['staff_lam', 'lam@urbantree.vn', '$2b$10$hashedLamPassword', 'Trần Quang Lâm (Kỹ sư Blockchain)', '0907654321', 'STAFF', 'ACTIVE'],
        ['staff_thuan', 'thuan@urbantree.vn', '$2b$10$hashedThuanPassword', 'Đặng Thế Thuận (Kỹ sư Backend)', '0901112233', 'STAFF', 'ACTIVE']
      ];
      await pool.query(
        "INSERT INTO users (username, email, password_hash, full_name, phone, role, status) VALUES ?",
        [sampleUsers]
      );
    }

    const [[typeCount]] = await pool.query("SELECT COUNT(*) AS count FROM tree_types");
    if (typeCount.count === 0) {
      console.log('🌿 Đang khởi tạo danh mục Loài cây đô thị...');
      const sampleTypes = [
        ['Cây Bàng Đài Loan', 'Terminalia mantaly', 'Cây thân gỗ nhỏ, tán tầng đẹp, rễ ăn sâu ít phá vỉa hè', 'Tưới nước định kỳ 2 lần/tuần, cắt tỉa cành la đầu mùa mưa', 'ACTIVE'],
        ['Cây Giáng Hương', 'Pterocarpus macrocarpus', 'Cây gỗ quý, hoa vàng thơm, tạo bóng mát công viên và vỉa hè rộng', 'Bón phân NPK đầu mùa mưa, phòng sâu đục thân hàng năm', 'ACTIVE'],
        ['Cây Lim Xẹt', 'Peltophorum pterocarpum', 'Cây hoa vàng rực rỡ, tán lá xanh quanh năm, chịu hạn tốt', 'Chăm sóc thường xuyên 3 năm đầu, sau đó tỉa cành định kỳ', 'ACTIVE'],
        ['Cây Sao Đen', 'Hopea odorata', 'Cây bóng mát đại mộc, thân thẳng tắp, tuổi thọ cao', 'Quản lý chiều cao, cắt tỉa cành mục trước mùa bão lũ', 'ACTIVE']
      ];
      await pool.query(
        "INSERT INTO tree_types (name, scientific_name, description, care_guide, status) VALUES ?",
        [sampleTypes]
      );
    }

    const [[treeCount]] = await pool.query("SELECT COUNT(*) AS count FROM trees");
    if (treeCount.count === 0) {
      console.log('🌱 Đang chèn dữ liệu mẫu cây xanh...');
      const sampleTrees = [
        ['TREE-001', 1, 'Cây Bàng Đài Loan', 'Công viên 23/9, Q.1, TP.HCM', 'Công viên 23/9, Đường Phạm Ngũ Lão, P. Phạm Ngũ Lão, Q.1', 10.7684, 106.6934, '2023-01-15', 5.2, 22.0, 'Tốt', 'ACTIVE'],
        ['TREE-002', 2, 'Cây Giáng Hương', 'Đường Nguyễn Huệ, Q.1, TP.HCM', 'Phố đi bộ Nguyễn Huệ, P. Bến Nghé, Q.1', 10.7745, 106.7032, '2022-08-20', 6.5, 30.5, 'Tốt', 'ACTIVE'],
        ['TREE-003', 3, 'Cây Lim Xẹt', 'Công viên Tao Đàn, Q.3, TP.HCM', 'Công viên Tao Đàn, Đường Trương Định, P. Bến Thành, Q.1', 10.7758, 106.6912, '2021-05-10', 8.0, 38.0, 'Cần chăm sóc', 'ACTIVE']
      ];
      await pool.query(
        "INSERT INTO trees (tree_code, tree_type_id, species, location_name, address, latitude, longitude, planted_date, height_meter, diameter_cm, health_status, status) VALUES ?",
        [sampleTrees]
      );
    }

    console.log('✅ Khởi tạo schema & dữ liệu mẫu MySQL hoàn tất.');
  } catch (err) {
    console.error('❌ Lỗi kết nối / khởi tạo MySQL database:', err.message);
    throw err;
  }
}

const ready = initDatabase();

function normalizeArgs(params, callback) {
  if (typeof params === 'function') {
    return { params: [], callback: params };
  }
  const safeParams = Array.isArray(params)
    ? params.map((v) => (v === undefined ? null : v))
    : [];
  return { params: safeParams, callback };
}

// Adapter giữ nguyên interface sqlite3 (db.all, db.get, db.run) để tương thích 100% với Models/Controllers hiện tại
const db = {
  pool,
  ready,

  all(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    ready
      .then(() => pool.query(sql, args.params))
      .then(([rows]) => {
        if (args.callback) args.callback(null, rows);
      })
      .catch((err) => {
        if (args.callback) args.callback(err);
      });
  },

  get(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    ready
      .then(() => pool.query(sql, args.params))
      .then(([rows]) => {
        if (args.callback) args.callback(null, rows[0]);
      })
      .catch((err) => {
        if (args.callback) args.callback(err);
      });
  },

  run(sql, params, callback) {
    const args = normalizeArgs(params, callback);
    ready
      .then(() => pool.query(sql, args.params))
      .then(([result]) => {
        if (args.callback) {
          args.callback.call(
            {
              lastID: result.insertId || 0,
              changes: result.affectedRows || 0,
            },
            null
          );
        }
      })
      .catch((err) => {
        if (args.callback) args.callback.call({}, err);
      });
  },
};

module.exports = db;
