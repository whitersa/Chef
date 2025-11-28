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
    sort: '',
    order: 'ASC' as 'ASC' | 'DESC',
  });
  const search = ref('');

  async function fetchIngredients() {
    loading.value = true;
    try {
      const response = await ingredientsApi.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        sort: pagination.value.sort,
        order: pagination.value.order,
      });
      ingredients.value = response.data;
      pagination.value.total = response.meta.total;
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      loading.value = false;
    }
  }

  function setPage(page: number) {
    pagination.value.page = page;
    fetchIngredients();
  }

  function setSort(sort: string, order: 'ASC' | 'DESC') {
    pagination.value.sort = sort;
    pagination.value.order = order;
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

  return {
    ingredients,
    loading,
    pagination,
    search,
    fetchIngredients,
    setPage,
    setSort,
    setSearch,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
});
