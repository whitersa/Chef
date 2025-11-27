import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api-client';
import { useThemeStore } from './theme';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(
    localStorage.getItem('access_token') || sessionStorage.getItem('access_token'),
  );
  const user = ref<any>(null);

  async function login(username: string, pass: string, remember: boolean = false) {
    try {
      const response = await api.post('/auth/login', { username, password: pass });
      const { access_token, user: userData } = response as any;

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
