import api, { tokenManager } from './api';
import { AuthRes, UserInfoReq } from './types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthRes> {
    console.log('📡 Calling register API...');
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
    });
    
    console.log('📡 Register response:', response.data);
    const { accessToken, refreshToken } = response.data;
    tokenManager.setTokens(accessToken, refreshToken);
    console.log('💾 Tokens stored');
    
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthRes> {
    console.log('📡 Calling login API...');
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    
    console.log('📡 Login response:', response.data);
    const { accessToken, refreshToken } = response.data;
    tokenManager.setTokens(accessToken, refreshToken);
    console.log('💾 Tokens stored');
    
    return response.data;
  },

  async logout(): Promise<void> {
    console.log('📡 Calling logout API...');
    try {
      await api.post('/user/logout');
      console.log('✅ Server logout successful');
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error('❌ Server logout error:', error);
    } finally {
      console.log('🧹 Clearing local tokens');
      tokenManager.clearTokens();
    }
  },

  async getProfile(): Promise<UserInfoReq> {
    console.log('📡 Calling profile API...');
    const response = await api.post('/user/profile');
    console.log('📡 Profile response:', response.data);
    return response.data;
  },

  async updateProfile(type: 'name' | 'email' | 'password', value: string): Promise<void> {
    console.log('📡 Calling update profile API...');
    await api.patch('/user/update', {
      type,
      value,
    });
    console.log('✅ Profile updated');
  },

  isAuthenticated(): boolean {
    const hasToken = !!tokenManager.getAccessToken();
    console.log('🔍 Checking authentication:', hasToken);
    return hasToken;
  },
};