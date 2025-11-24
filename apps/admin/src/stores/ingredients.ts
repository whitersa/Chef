import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api';

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  unit: string;
  nutrition: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

export const useIngredientsStore = defineStore('ingredients', () => {
  const ingredients = ref<Ingredient[]>([]);
  const loading = ref(false);

  async function fetchIngredients() {
    loading.value = true;
    try {
      ingredients.value = await api.get<Ingredient[]>('/ingredients');
    } catch (error) {
      console.error('Failed to fetch ingredients:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createIngredient(ingredient: Omit<Ingredient, 'id'>) {
    try {
      const newIngredient = await api.post<Ingredient>('/ingredients', ingredient);
      ingredients.value.push(newIngredient);
    } catch (error) {
      console.error('Failed to create ingredient:', error);
      throw error;
    }
  }

  async function updateIngredient(id: string, ingredient: Partial<Ingredient>) {
    try {
      await api.patch(`/ingredients/${id}`, ingredient);
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
      await api.delete(`/ingredients/${id}`);
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
