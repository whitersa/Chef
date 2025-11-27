import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import { usersApi } from '../api/users';
import type { UserPreferences } from '@chefos/types';

export type Density = 'compact' | 'default' | 'loose';
export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  // Initialize from LocalStorage immediately to prevent FOUC (Flash of Unstyled Content)
  const density = ref<Density>((localStorage.getItem('app-density') as Density) || 'compact');
  const theme = ref<Theme>((localStorage.getItem('app-theme') as Theme) || 'light');
  const currentUserId = ref<string | null>(null); // Set this after login

  // Sync to LocalStorage & Server
  watch(
    [density, theme],
    async ([newDensity, newTheme]) => {
      // 1. Update DOM & LocalStorage (Instant)
      document.documentElement.setAttribute('data-density', newDensity);
      localStorage.setItem('app-density', newDensity);

      document.documentElement.setAttribute('data-theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('app-theme', newTheme);

      // 2. Sync to Server (Background)
      if (currentUserId.value) {
        try {
          await usersApi.update(currentUserId.value, {
            preferences: {
              theme: newTheme,
              density: newDensity,
            },
          });
        } catch (error) {
          console.error('Failed to sync theme preferences:', error);
        }
      }
    },
    { immediate: true },
  );

  /**
   * Call this after login/profile fetch to sync server preferences to local
   */
  function syncFromProfile(preferences?: UserPreferences, userId?: string) {
    if (userId) currentUserId.value = userId;

    if (preferences) {
      // Only update if different to avoid unnecessary DOM updates
      if (preferences.theme && preferences.theme !== theme.value) {
        theme.value = preferences.theme;
      }
      if (preferences.density && preferences.density !== density.value) {
        density.value = preferences.density;
      }
    }
  }

  return {
    density,
    theme,
    currentUserId,
    syncFromProfile,
  };
});
