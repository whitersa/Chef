import { defineStore } from 'pinia';
import { ref } from 'vue';
import { menusApi, type Menu } from '../api/menus';

export const useMenuStore = defineStore('menu', () => {
  const menus = ref<Menu[]>([]);
  const loading = ref(false);

  async function fetchMenus() {
    loading.value = true;
    try {
      menus.value = await menusApi.getAll();
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    menus,
    loading,
    fetchMenus,
  };
});
