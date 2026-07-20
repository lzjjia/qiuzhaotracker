// 后端接口封装（开发时经 Vite 代理，生产时同源）
const BASE = '/api';
const TOKEN_KEY = 'qiuzhao_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// 给简历等直链附加 token（<a href> 无法带 Authorization 头，改用查询参数）
export function withToken(url) {
  if (!url) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}token=${encodeURIComponent(getToken())}`;
}

// 401 时触发的回调（由 App 注册，用于登出并回到登录页）
let onUnauthorized = null;
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    if (onUnauthorized) onUnauthorized();
    throw new Error('登录已过期，请重新登录');
  }
  if (!res.ok) {
    let msg = `请求失败 (${res.status})`;
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

// 登录：成功后保存 token
export async function login(password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) {
    let msg = '登录失败';
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const data = await res.json();
  setToken(data.token);
  return data;
}

export function listApplications(filters = {}) {
  const params = new URLSearchParams();
  if (filters.company) params.set('company', filters.company);
  if (filters.position) params.set('position', filters.position);
  if (filters.status) params.set('status', filters.status);
  const qs = params.toString();
  return request(`${BASE}/applications${qs ? `?${qs}` : ''}`);
}

export function createApplication(data) {
  return request(`${BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function updateApplication(id, data) {
  return request(`${BASE}/applications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export function deleteApplication(id) {
  return request(`${BASE}/applications/${id}`, { method: 'DELETE' });
}

export function getStatusOptions() {
  return request(`${BASE}/applications/status-options`);
}

export function getStats() {
  return request(`${BASE}/stats`);
}

export async function uploadResume(file) {
  const form = new FormData();
  form.append('resume', file);
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form, headers });
  if (res.status === 401) {
    clearToken();
    if (onUnauthorized) onUnauthorized();
    throw new Error('登录已过期，请重新登录');
  }
  if (!res.ok) {
    let msg = '上传失败';
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  return res.json();
}
