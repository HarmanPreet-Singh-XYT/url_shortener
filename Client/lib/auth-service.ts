import api, { tokenManager } from './api';
import { AuthRes, UserInfoReq } from './types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthRes> {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    
    const { accessToken, refreshToken } = response.data;
    tokenManager.setTokens(accessToken, refreshToken);
    
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthRes> {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    const { accessToken, refreshToken } = response.data;
    tokenManager.setTokens(accessToken, refreshToken);
    
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/user/logout');
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  async getProfile(): Promise<UserInfoReq> {
    const response = await api.post('/user/profile');
    return response.data;
  },

  async updateProfile(type: 'name' | 'email' | 'password', value: string): Promise<void> {
    await api.patch('/user/update', {
      type,
      value,
    });
  },

  isAuthenticated(): boolean {
    return Boolean(tokenManager.getAccessToken());
  },
};