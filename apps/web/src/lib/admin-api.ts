import axios from 'axios';

export const adminApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: inject admin_token from cookie or localStorage
adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: unwrap { data, success, message } envelope, handle 401
adminApi.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token');
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  },
);

// Helper: set admin token in both localStorage and cookie
export function setAdminToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
    // Also set cookie for middleware (7 day expiry)
    document.cookie = `admin_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Strict`;
  }
}

// Helper: remove admin token from both localStorage and cookie
export function removeAdminToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    document.cookie = 'admin_token=; path=/; max-age=0';
  }
}

// Helper: check if admin is authenticated
export function isAdminAuthenticated(): boolean {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('admin_token');
  }
  return false;
}
