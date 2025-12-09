import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api-client';
import { useThemeStore } from './theme';
import router from '../router';
import CryptoJS from 'crypto-js';
import type { User } from '@chefos/types';

interface LoginResponse {
  access_token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token'),
  );
  const user = ref<User | null>(null);

  async function login(username: string, pass: string, remember: boolean = false) {
    try {
      // Hash password with MD5 before sending
      const hashedPassword = CryptoJS.MD5(pass).toString();
      const response = await api.post<LoginResponse>('/auth/login', {
        username,
        password: hashedPassword,
      });
      const { access_token, user: userData } = response;

      token.value = access_token;
      user.value = userData;

      if (remember) {
        localStorage.setItem('access_token', access_token);
      } else {
        sessionStorage.setItem('access_token', access_token);
      }

      // Sync theme preferences
      const themeStore = useThemeStore();
      themeStore.syncFromProfile(userData.preferences, userData.id);

      router.push('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('access_token');
    sessionStorage.removeItem('access_token');
    router.push('/login');
  }

  return { token, user, login, logout };
});
