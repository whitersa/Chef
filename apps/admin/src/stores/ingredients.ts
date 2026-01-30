import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ingredientsApi, type Ingredient } from '../api/ingredients';

export type { Ingredient };

export const useIngredientsStore = defineStore('ingredients', () => {
  const ingredients = ref<Ingredient[]>([]);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    sorts: [] as { field: string; order: 'ASC' | 'DESC' }[],
  });
  const search = ref('');
  const isTreeView = ref(false);

  async function fetchIngredients() {
    if (isTreeView.value) {
      return fetchTree();
    }
    loading.value = true;
    try {
      const sort = pagination.value.sorts.map((s) => `${s.field}:${s.order}`).join(',');
      const response = await ingredientsApi.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        sort: sort || undefined,
      });
      ingredients.value = response.data;
      pagination.value.total = response.meta.total;
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTree() {
    loading.value = true;
    try {
      const response = await ingredientsApi.getTree(search.value);
      ingredients.value = response; // Tree data matches the structure needed for el-table tree-props
      pagination.value.total = response.length;
    } catch (error) {
      console.error('Failed to fetch ingredient tree:', error);
    } finally {
      loading.value = false;
    }
  }

  function setTreeView(value: boolean) {
    isTreeView.value = value;
    fetchIngredients();
  }

  function setPage(page: number) {
    pagination.value.page = page;
    fetchIngredients();
  }

  function setLimit(limit: number) {
    pagination.value.limit = limit;
    pagination.value.page = 1;
    fetchIngredients();
  }

  function setSort(sorts: { field: string; order: 'ASC' | 'DESC' }[]) {
    pagination.value.sorts = sorts;
    fetchIngredients();
  }

  function setSearch(term: string) {
    search.value = term;
    pagination.value.page = 1; // Reset to first page on search
    fetchIngredients();
  }

  async function createIngredient(ingredient: Omit<Ingredient, 'id'>) {
    try {
      await ingredientsApi.create(ingredient);
      fetchIngredients(); // Refresh list
    } catch (error) {
      console.error('Failed to create ingredient:', error);
      throw error;
    }
  }

  async function updateIngredient(id: string, ingredient: Partial<Ingredient>) {
    try {
      await ingredientsApi.update(id, ingredient);
      const index = ingredients.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        ingredients.value[index] = { ...ingredients.value[index], ...ingredient } as Ingredient;
      }
    } catch (error) {
      console.error('Failed to update ingredient:', error);
      throw error;
    }
  }

  async function deleteIngredient(id: string) {
    try {
      await ingredientsApi.delete(id);
      ingredients.value = ingredients.value.filter((i) => i.id !== id);
    } catch (error) {
      console.error('Failed to delete ingredient:', error);
      throw error;
    }
  }

  async function syncUsda(page: number) {
    try {
      const result = await ingredientsApi.syncUsda(page);
      fetchIngredients(); // Refresh list to show new items
      return result;
    } catch (error) {
      console.error('Failed to sync USDA:', error);
      throw error;
    }
  }

  return {
    ingredients,
    loading,
    pagination,
    search,
    fetchIngredients,
    setPage,
    setLimit,
    setSort,
    setSearch,
    createIngredient,
    updateIngredient,
    deleteIngredient,
    syncUsda,
    isTreeView,
    setTreeView,
    search,
  };
});
