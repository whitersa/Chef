import { defineStore } from 'pinia';
import { ref } from 'vue';
import { dishesApi, type Dish } from '../api/dishes';
import { ElMessage } from 'element-plus';

export const useDishStore = defineStore('dish', () => {
  const dishes = ref<Dish[]>([]);
  const loading = ref(false);

  const fetchDishes = async () => {
    loading.value = true;
    try {
      dishes.value = await dishesApi.getAll();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to fetch dishes');
    } finally {
      loading.value = false;
    }
  };

  const createDish = async (data: Partial<Dish>) => {
    try {
      await dishesApi.create(data);
      ElMessage.success('Dish created successfully');
      await fetchDishes();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to create dish');
      throw error;
    }
  };

  const updateDish = async (id: string, data: Partial<Dish>) => {
    try {
      await dishesApi.update(id, data);
      ElMessage.success('Dish updated successfully');
      await fetchDishes();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to update dish');
      throw error;
    }
  };

  const deleteDish = async (id: string) => {
    try {
      await dishesApi.delete(id);
      ElMessage.success('Dish deleted successfully');
      await fetchDishes();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to delete dish');
    }
  };

  return {
    dishes,
    loading,
    fetchDishes,
    createDish,
    updateDish,
    deleteDish,
  };
});
