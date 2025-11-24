import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface RecipeItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  yieldRate: number;
}

export const useRecipeStore = defineStore('recipe', () => {
  const items = ref<RecipeItem[]>([]);

  const totalCost = computed(() => {
    return items.value.reduce((sum, item) => {
      const cost = (item.price * item.quantity) / item.yieldRate;
      return sum + cost;
    }, 0);
  });

  function addItem(ingredient: any) {
    items.value.push({
      id: crypto.randomUUID(), // 临时 ID
      name: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
      price: ingredient.price,
      yieldRate: 1.0,
    });
  }

  function removeItem(index: number) {
    items.value.splice(index, 1);
  }

  return { items, totalCost, addItem, removeItem };
});
