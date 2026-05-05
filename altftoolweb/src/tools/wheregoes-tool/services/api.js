import axios from 'axios';

// ✅ Next.js compatible — process.env.NEXT_PUBLIC_* is injected at build time.
// Falls back to the deployed production URL.
const API_URL =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHEREGOES_API_URL) ||
  'https://wheregoes-t1wo.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function checkUrl(url) {
  try {
    const response = await api.post('/check', { url });
    return { data: response.data, error: null };
  } catch (err) {
    if (err.code === 'ECONNABORTED') {
      return { data: null, error: 'Request timed out. Please try again.' };
    }
    if (!err.response) {
      return { data: null, error: 'Cannot connect to the WhereGoes backend. Please try again.' };
    }
    const message = err.response?.data?.error || 'An unknown error occurred.';
    return { data: null, error: message };
  }
}

export default api;
