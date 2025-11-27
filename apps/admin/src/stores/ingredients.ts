import { defineStore } from 'pinia';
import { ref } from 'vue';
import { ingredientsApi, type Ingredient } from '../api/ingredients';

export type { Ingredient };

export const useIngredientsStore = defineStore('ingredients', () => {
  const ingredients = ref<Ingredient[]>([]);
  const loading = ref(false);

  async function fetchIngredients() {
    loading.value = true;
    try {
      ingredients.value = await ingredientsApi.getAll();
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createIngredient(ingredient: Omit<Ingredient, 'id'>) {
    try {
      const newIngredient = await ingredientsApi.create(ingredient);
      ingredients.value.push(newIngredient);
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
    fetchIngredients,
    createIngredient,
    updateIngredient,
    deleteIngredient,
  };
});
