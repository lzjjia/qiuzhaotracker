const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 登录密码：从环境变量读取，未设置时用默认值并告警
const PASSWORD = process.env.AUTH_PASSWORD || 'admin123';
if (!process.env.AUTH_PASSWORD) {
  console.warn('[安全告警] 未设置 AUTH_PASSWORD，正在使用默认密码 "admin123"，请尽快修改！');
}

// 签名密钥：优先环境变量，否则在 data 目录持久化一个随机密钥（重启后 token 仍有效）
function loadSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  const secretFile = path.join(dataDir, '.auth_secret');
  if (fs.existsSync(secretFile)) return fs.readFileSync(secretFile, 'utf8').trim();
  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretFile, secret, { mode: 0o600 });
  return secret;
}
const SECRET = loadSecret();

const TOKEN_TTL = 7 * 24 * 60 * 60 * 1000; // 7 天

function sign(data) {
  return crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
}

// 生成 token：body(base64url).签名
function createToken() {
  const body = Buffer.from(JSON.stringify({ exp: Date.now() + TOKEN_TTL })).toString('base64url');
  return `${body}.${sign(body)}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return false;
  const [body, sig] = token.split('.');
  if (!body || !sig) return false;

  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;

  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof exp === 'number' && exp > Date.now();
  } catch {
    return false;
  }
}

// 密码校验（定长时间比较，防时序攻击）
function checkPassword(input) {
  const a = Buffer.from(String(input || ''));
  const b = Buffer.from(PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// 鉴权中间件：token 可来自 Authorization 头，或 URL 查询参数（供简历文件直链使用）
function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const bearer = header.startsWith('Bearer ') ? header.slice(7) : null;
  const token = bearer || req.query.token;
  if (verifyToken(token)) return next();
  res.status(401).json({ error: '未授权，请先登录' });
}

module.exports = { createToken, checkPassword, authMiddleware };
