const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data && data.error ? data.error : 'API error');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const getLinks = () => request('/api/links');
export const createLink = (payload) => request('/api/links', { method: 'POST', body: JSON.stringify(payload) });
export const getLink = (code) => request(`/api/links/${encodeURIComponent(code)}`);
export const deleteLink = (code) => request(`/api/links/${encodeURIComponent(code)}`, { method: 'DELETE' });
export const health = () => request('/healthz');
