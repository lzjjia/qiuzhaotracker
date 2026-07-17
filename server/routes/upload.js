const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // 用时间戳 + 随机数避免重名；保留原扩展名
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^\w\u4e00-\u9fa5.-]/g, '_');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${base}-${unique}${ext}`);
  },
});

const ALLOWED = ['.pdf', '.doc', '.docx'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ALLOWED.includes(ext)) return cb(null, true);
    cb(new Error('只允许上传 PDF / Word 文件'));
  },
});

// 上传简历，返回可访问的相对路径
router.post('/', (req, res) => {
  upload.single('resume')(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: '未收到文件' });
    res.json({
      filename: req.file.filename,
      originalname: req.file.originalname,
      url: `/uploads/${req.file.filename}`,
    });
  });
});

module.exports = router;
