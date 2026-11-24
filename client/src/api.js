// Centralized resilient API client for JIMS Campus Maintenance Platform

// In development (port 3000): use local backend
// In production: use VITE_API_URL env variable or fallback to relative /api
const isDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '3000';
export const API_BASE = isDev
  ? `http://${window.location.hostname}:5005/api`
  : (import.meta.env.VITE_API_URL || 'https://campus-maintenance-backend-production.up.railway.app/api');

export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/api') 
    ? endpoint.replace(/^\/api/, '') 
    : endpoint;
  
  const url = cleanEndpoint.startsWith('http') 
    ? cleanEndpoint 
    : `${API_BASE}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

  // Set 12-second timeout to prevent indefinite loading in UI
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: options.signal || controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    let data;
    
    if (contentType.includes('application/json')) {
      try {
        data = await res.json();
      } catch (e) {
        data = { message: 'Failed to parse JSON response' };
      }
    } else {
      const text = await res.text();
      data = { message: text || `HTTP Status ${res.status}` };
    }

    if (!res.ok) {
      const errorMsg = data?.message || data?.error || `Request failed with HTTP status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Server request timed out. Please check your network and try again.');
    }
    throw err;
  }
}
