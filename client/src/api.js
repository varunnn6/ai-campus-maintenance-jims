// Centralized resilient API client for JIMS Campus Maintenance Platform

export const API_BASE = (typeof window !== 'undefined' && window.location.port === '3000')
  ? `http://${window.location.hostname}:5005/api`
  : '/api';

export async function apiRequest(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/api') 
    ? endpoint.replace(/^\/api/, '') 
    : endpoint;
  
  const url = cleanEndpoint.startsWith('http') 
    ? cleanEndpoint 
    : `${API_BASE}${cleanEndpoint.startsWith('/') ? '' : '/'}${cleanEndpoint}`;

  const res = await fetch(url, options);

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
}
