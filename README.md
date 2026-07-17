# 🎯 秋招投递助手

一个自用的秋招投递跟踪工具：记录投递岗位、公司信息、投递状态，查看 Offer 统计图表与近期面试提醒。

- **前端**：React + Vite + recharts
- **后端**：Node.js + Express + SQLite（better-sqlite3）
- **部署**：单端口托管（Express 同时提供 API 与前端静态文件），PM2 守护

## 目录结构

```
.
├── client/              # React 前端
│   └── src/
│       ├── api.js
│       ├── components/  # SearchBar / ApplicationTable / ApplicationForm
│       └── pages/       # Dashboard（图表 + 面试提醒）
├── server/              # Express 后端
│   ├── index.js         # 入口，静态托管前端与上传文件
│   ├── db.js            # SQLite schema
│   ├── routes/          # applications / stats / upload
│   ├── data/            # SQLite 数据库文件（git 忽略）
│   └── uploads/         # 简历文件（git 忽略）
├── ecosystem.config.js  # PM2 配置
└── deploy.sh            # 服务器一键部署脚本
```

## 本地开发（Windows）

需要先安装 [Node.js 18+](https://nodejs.org/)。

```powershell
# 1. 启动后端（端口 3001）
cd server
npm install
npm run dev

# 2. 另开一个终端启动前端（端口 5173，已代理 /api 到后端）
cd client
npm install
npm run dev
```

浏览器打开 http://localhost:5173

## 部署到 Linux 服务器

```bash
# 1. 安装 Node 20 LTS（推荐，better-sqlite3 有现成预编译包，无需本地编译）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 若安装依赖时 better-sqlite3 仍需源码编译，补装编译工具即可：
# sudo apt install -y build-essential python3

# 2. 安装 pm2
sudo npm install -g pm2

# 3. 拉取代码并部署
git clone <你的仓库地址> qiuzhao-tracker
cd qiuzhao-tracker
bash deploy.sh

# 4. 开机自启（按提示执行它输出的命令）
pm2 startup
```

之后每次更新代码，只需再次运行 `bash deploy.sh`。

访问 `http://<服务器IP>:3001`。

### 数据备份

投递数据在 `server/data/applications.db`，简历在 `server/uploads/`，定期复制这两个目录即可备份。

## ⚠️ 公网安全提醒

本项目为单用户设计、**没有登录鉴权**。若部署在公网 IP 上，任何人都能访问你的数据。建议二选一：

1. **只在内网 / VPN 访问**（最安全）；
2. **加 nginx Basic Auth 密码**（最简单），示例：

   ```nginx
   server {
       listen 80;
       server_name your.domain.com;
       location / {
           auth_basic "Restricted";
           auth_basic_user_file /etc/nginx/.htpasswd;
           proxy_pass http://127.0.0.1:3001;
       }
   }
   ```

   生成密码：`sudo htpasswd -c /etc/nginx/.htpasswd yourname`
