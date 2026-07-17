const path = require('path');
const express = require('express');
const cors = require('cors');

const applicationsRouter = require('./routes/applications');
const statsRouter = require('./routes/stats');
const uploadRouter = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/applications', applicationsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/upload', uploadRouter);

// 简历文件静态托管
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
