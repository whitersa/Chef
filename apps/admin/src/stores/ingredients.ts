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

  return { ingredients, loading, fetchIngredients };
});
