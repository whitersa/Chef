import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export type Density = 'compact' | 'default' | 'loose';
export type Theme = 'light' | 'dark';

export const useThemeStore = defineStore('theme', () => {
  const density = ref<Density>((localStorage.getItem('app-density') as Density) || 'compact');
  const theme = ref<Theme>((localStorage.getItem('app-theme') as Theme) || 'light');

  watch(
    density,
    (val) => {
      document.documentElement.setAttribute('data-density', val);
      localStorage.setItem('app-density', val);
    },
    { immediate: true },
  );

  watch(
    theme,
    (val) => {
      document.documentElement.setAttribute('data-theme', val);
      if (val === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('app-theme', val);
    },
    { immediate: true },
  );

  return {
    density,
    theme,
  };
});
