// 后端接口封装（开发时经 Vite 代理，生产时同源）
const BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(url, options);
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
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
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
