const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// 数据库文件放在 server/data 目录，便于备份与 .gitignore
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'applications.db'));
db.pragma('journal_mode = WAL');

// 建表
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name  TEXT NOT NULL,
    company_size  TEXT,
    industry      TEXT,
    base_location TEXT,
    position      TEXT,
    status        TEXT NOT NULL DEFAULT '已投递',
    resume_file   TEXT,
    applied_date  TEXT,
    interview_date TEXT,
    notes         TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );
`);

// 投递状态枚举（供前端下拉使用）
const STATUS_OPTIONS = [
  '已投递',
  '笔试',
  '一面',
  '二面',
  '三面',
  'HR面',
  '已offer',
  '已拒',
  '已接受',
];

// 视为“拿到 offer”的状态，用于统计 offer 率
const OFFER_STATUSES = ['已offer', '已接受'];

module.exports = { db, STATUS_OPTIONS, OFFER_STATUSES };
