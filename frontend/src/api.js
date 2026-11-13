// Production can serve the frontend and API from the same origin. This avoids a
// hard-coded localhost URL after deployment. Set VITE_API_URL only for split hosting.
const DEFAULT_API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = localStorage.getItem('jamia_admin_token');
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers = { ...(options.body && !isFormData ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new Error('Cannot reach the API. Make sure the backend is running and VITE_API_URL is correct.');
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
  return data;
}
export const apiBaseUrl = API_URL;

// Resolve media URLs from the API server in local development and remain same-origin in production.
export function mediaAssetUrl(url) {
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url;
  const origin = API_URL.replace(/\/api\/?$/, '');
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

