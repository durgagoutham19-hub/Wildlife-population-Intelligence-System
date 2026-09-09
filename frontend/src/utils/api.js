/**
 * Safe API client utility for Wildlife Population Intelligence System
 * Handles authentication, JSON/FormData requests, and API errors.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8000' : '');

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  try {
    const res = await fetch(fullUrl, config);

    if (res.status === 204) {
      return { ok: true, status: 204, data: null };
    }

    const text = await res.text();
    let data = null;

    if (text && text.trim().length > 0) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!res.ok) {
      const errorMsg =
        data && typeof data === 'object' && data.detail
          ? typeof data.detail === 'string'
            ? data.detail
            : JSON.stringify(data.detail)
          : typeof data === 'string' && data
            ? data
            : `Request failed with status ${res.status}`;

      return {
        ok: false,
        status: res.status,
        data,
        error: errorMsg,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (networkErr) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: networkErr.message || 'Cannot connect to backend server. Make sure the backend is running on http://127.0.0.1:8000',
    };
  }
}