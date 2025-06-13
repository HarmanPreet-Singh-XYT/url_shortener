import axios, { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';
import Cookies from 'js-cookie';
// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    return Cookies.get('accessToken') || null;
  },

  getRefreshToken: (): string | null => {
    return Cookies.get('refreshToken') || null;
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    // Cookies will persist across tabs and sessions (set expiration to e.g. 7 days)
    Cookies.set('accessToken', accessToken, { expires: 7, sameSite: 'Strict' });
    Cookies.set('refreshToken', refreshToken, { expires: 7, sameSite: 'Strict' });
  },

  clearTokens: () => {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
  },
};

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', response.status, response.config?.url);
    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Error:', error.response?.status, error.config?.url);
    
    const originalRequest = error.config as any;
    
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      console.log('🔄 Token expired, attempting refresh...');
      originalRequest._retry = true;
      
      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) {
          console.log('❌ No refresh token available');
          throw new Error('No refresh token available');
        }
        
        console.log('📡 Calling token refresh...');
        const response = await axios.post(`${API_BASE_URL}/auth/token/renew`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        tokenManager.setTokens(accessToken, newRefreshToken);
        console.log('✅ Token refresh successful');
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api.request(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        tokenManager.clearTokens();
        if (typeof window !== 'undefined') {
          console.log('🚪 Redirecting to login...');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;