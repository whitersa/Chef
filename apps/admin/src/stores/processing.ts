import { defineStore } from 'pinia';
import { ref } from 'vue';
import { processingApi, type ProcessingMethod } from '../api/processing';
import { ElMessage } from 'element-plus';

export const useProcessingStore = defineStore('processing', () => {
  const methods = ref<ProcessingMethod[]>([]);
  const loading = ref(false);

  async function fetchMethods() {
    loading.value = true;
    try {
      methods.value = await processingApi.getAll();
    } catch (error) {
      console.error('Failed to fetch processing methods:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createMethod(name: string, description?: string) {
    try {
      await processingApi.create({ name, description });
      ElMessage.success('创建成功');
      await fetchMethods();
    } catch (error) {
      console.error('Failed to create processing method:', error);
      ElMessage.error('创建失败');
    }
  }

  async function removeMethod(id: string) {
    try {
      await processingApi.delete(id);
      ElMessage.success('删除成功');
      await fetchMethods();
    } catch (error) {
      console.error('Failed to remove processing method:', error);
      ElMessage.error('删除失败');
    }
  }

  return {
    methods,
    loading,
    fetchMethods,
    createMethod,
    removeMethod,
  };
});
