import { defineStore } from 'pinia';
import { ref } from 'vue';
import { cuisinesApi, type Cuisine } from '../api/cuisines';
import { ElMessage } from 'element-plus';

export const useCuisineStore = defineStore('cuisine', () => {
  const cuisines = ref<Cuisine[]>([]);
  const loading = ref(false);

  const fetchCuisines = async () => {
    loading.value = true;
    try {
      cuisines.value = await cuisinesApi.getAll();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to fetch cuisines');
    } finally {
      loading.value = false;
    }
  };

  const createCuisine = async (data: Partial<Cuisine>) => {
    try {
      await cuisinesApi.create(data);
      ElMessage.success('Cuisine created successfully');
      await fetchCuisines();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to create cuisine');
      throw error;
    }
  };

  const updateCuisine = async (id: string, data: Partial<Cuisine>) => {
    try {
      await cuisinesApi.update(id, data);
      ElMessage.success('Cuisine updated successfully');
      await fetchCuisines();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to update cuisine');
      throw error;
    }
  };

  const deleteCuisine = async (id: string) => {
    try {
      await cuisinesApi.delete(id);
      ElMessage.success('Cuisine deleted successfully');
      await fetchCuisines();
    } catch (error) {
      const err = error as Error;
      ElMessage.error(err.message || 'Failed to delete cuisine');
    }
  };

  return {
    cuisines,
    loading,
    fetchCuisines,
    createCuisine,
    updateCuisine,
    deleteCuisine,
  };
});
