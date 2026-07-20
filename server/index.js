const path = require('path');
const express = require('express');
const cors = require('cors');

const applicationsRouter = require('./routes/applications');
const statsRouter = require('./routes/stats');
const uploadRouter = require('./routes/upload');
const { createToken, checkPassword, authMiddleware } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 登录：校验密码，成功返回 token（此接口不需要鉴权）
app.post('/api/login', (req, res) => {
  const { password } = req.body || {};
  if (!checkPassword(password)) return res.status(401).json({ error: '密码错误' });
  res.json({ token: createToken() });
});

// 以下 API 路由需要登录
app.use('/api/applications', authMiddleware, applicationsRouter);
app.use('/api/stats', authMiddleware, statsRouter);
app.use('/api/upload', authMiddleware, uploadRouter);

// 简历文件静态托管（同样需要鉴权，token 可通过 ?token= 传入）
app.use('/uploads', authMiddleware, express.static(path.join(__dirname, 'uploads')));

// 生产环境托管前端构建产物
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA 回退（非 API 请求返回 index.html）
app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) res.status(404).send('前端尚未构建，请先运行 client 的 build');
  });
});

app.listen(PORT, () => {
  console.log(`秋招投递助手后端已启动: http://localhost:${PORT}`);
});
