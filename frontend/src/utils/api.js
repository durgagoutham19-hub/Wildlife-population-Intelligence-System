/**
 * Safe API client utility for Wildlife Population Intelligence System
 * Handles empty responses, avoids abrupt redirects, and safely passes JWT auth headers.
 */

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Set Content-Type to JSON only if not sending FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers
  };

  try {
    const res = await fetch(url, config);

    // Handle 204 No Content
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
      const errorMsg = (data && typeof data === 'object' && data.detail)
        ? (typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail))
        : (typeof data === 'string' && data ? data : `Request failed with status ${res.status}`);
      return { ok: false, status: res.status, data, error: errorMsg };
    }

    return { ok: true, status: res.status, data };
  } catch (networkErr) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: networkErr.message || 'Network connection failed'
    };
  }
}
