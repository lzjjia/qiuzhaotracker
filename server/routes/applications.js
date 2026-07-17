const express = require('express');
const { db, STATUS_OPTIONS } = require('../db');

const router = express.Router();

// 允许写入的字段白名单
const FIELDS = [
  'company_name',
  'company_size',
  'industry',
  'base_location',
  'position',
  'status',
  'resume_file',
  'applied_date',
  'interview_date',
  'notes',
];

// 获取状态枚举
router.get('/status-options', (req, res) => {
  res.json(STATUS_OPTIONS);
});

// 列表 + 搜索过滤：company / position / status
router.get('/', (req, res) => {
  const { company, position, status } = req.query;
  const where = [];
  const params = {};

  if (company) {
    where.push('company_name LIKE @company');
    params.company = `%${company}%`;
  }
  if (position) {
    where.push('position LIKE @position');
    params.position = `%${position}%`;
  }
  if (status) {
    where.push('status = @status');
    params.status = status;
  }

  const sql =
    'SELECT * FROM applications' +
    (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
    ' ORDER BY datetime(created_at) DESC';

  const rows = db.prepare(sql).all(params);
  res.json(rows);
});

// 单条
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: '记录不存在' });
  res.json(row);
});

// 新增
router.post('/', (req, res) => {
  const body = req.body || {};
  if (!body.company_name || !String(body.company_name).trim()) {
    return res.status(400).json({ error: '公司名不能为空' });
  }

  const cols = FIELDS.filter((f) => body[f] !== undefined);
  const insertCols = cols.length ? cols : ['company_name'];
  const placeholders = insertCols.map((c) => `@${c}`).join(', ');
  const values = {};
  insertCols.forEach((c) => (values[c] = body[c] ?? null));

  const info = db
    .prepare(`INSERT INTO applications (${insertCols.join(', ')}) VALUES (${placeholders})`)
    .run(values);

  const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// 编辑
router.put('/:id', (req, res) => {
  const exists = db.prepare('SELECT id FROM applications WHERE id = ?').get(req.params.id);
  if (!exists) return res.status(404).json({ error: '记录不存在' });

  const body = req.body || {};
  const cols = FIELDS.filter((f) => body[f] !== undefined);
  if (!cols.length) return res.status(400).json({ error: '没有可更新的字段' });

  const setClause = cols.map((c) => `${c} = @${c}`).join(', ');
  const values = { id: req.params.id };
  cols.forEach((c) => (values[c] = body[c] ?? null));

  db.prepare(
    `UPDATE applications SET ${setClause}, updated_at = datetime('now', 'localtime') WHERE id = @id`
  ).run(values);

  const row = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
  res.json(row);
});

// 删除
router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM applications WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: '记录不存在' });
  res.json({ success: true });
});

module.exports = router;
