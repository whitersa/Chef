import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { processingApi, type ProcessingMethod } from '../api/processing';
import { ElMessage } from 'element-plus';

export const useProcessingStore = defineStore('processing', () => {
  const methods = ref<ProcessingMethod[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    sorts: [] as { field: string; order: 'ASC' | 'DESC' }[],
  });
  const query = reactive({
    search: '',
  });

  async function fetchMethods() {
    loading.value = true;
    try {
      const sortStr = pagination.sorts.map((s) => `${s.field}:${s.order}`).join(',');
      const { data, meta } = await processingApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: query.search,
        sort: sortStr || undefined,
      });
      methods.value = data;
      pagination.total = meta.total;
    } catch (error) {
      console.error('Failed to fetch processing methods:', error);
    } finally {
      loading.value = false;
    }
  }

  function setSearch(term: string) {
    query.search = term;
    pagination.page = 1;
    fetchMethods();
  }

  function setPage(page: number) {
    pagination.page = page;
    fetchMethods();
  }

  function setLimit(limit: number) {
    pagination.limit = limit;
    pagination.page = 1;
    fetchMethods();
  }

  function setSort(sorts: { field: string; order: 'ASC' | 'DESC' }[]) {
    pagination.sorts = sorts;
    fetchMethods();
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
    pagination,
    fetchMethods,
    createMethod,
    removeMethod,
    setSearch,
    setPage,
    setLimit,
    setSort,
  };
});
