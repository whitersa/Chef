import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { api } from '../api';
import { ElMessage } from 'element-plus';

export interface RecipeItem {
  id: string; // temporary UI ID
  ingredientId?: string; // ID from ingredient store
  name: string;
  quantity: number;
  unit: string;
  price: number;
  yieldRate: number;
  nutrition: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

export const useRecipeStore = defineStore('recipe', () => {
  const name = ref('');
  const items = ref<RecipeItem[]>([]);

  const totalCost = computed(() => {
    return items.value.reduce((sum, item) => {
      const cost = (item.price * item.quantity) / item.yieldRate;
      return sum + cost;
    }, 0);
  });

  const totalNutrition = computed(() => {
    return items.value.reduce(
      (acc, item) => {
        return {
          protein: acc.protein + item.nutrition.protein * item.quantity,
          fat: acc.fat + item.nutrition.fat * item.quantity,
          carbs: acc.carbs + item.nutrition.carbs * item.quantity,
        };
      },
      { protein: 0, fat: 0, carbs: 0 },
    );
  });

  function addItem(ingredient: any) {
    items.value.push({
      id: crypto.randomUUID(), // 临时 ID
      ingredientId: ingredient.id,
      name: ingredient.name,
      quantity: 1,
      unit: ingredient.unit,
      price: ingredient.price,
      yieldRate: 1.0,
      nutrition: ingredient.nutrition || { protein: 0, fat: 0, carbs: 0 },
    });
  }

  function removeItem(index: number) {
    items.value.splice(index, 1);
  }

  async function saveRecipe() {
    if (!name.value) {
      ElMessage.warning('请输入菜谱名称');
      return;
    }
    if (items.value.length === 0) {
      ElMessage.warning('请添加食材');
      return;
    }

    try {
      const payload = {
        name: name.value,
        items: items.value.map((item) => ({
          quantity: item.quantity,
          yieldRate: item.yieldRate,
          ingredient: { id: item.ingredientId },
        })),
      };

      await api.post('/recipes', payload);
      ElMessage.success('保存成功');
      // Reset
      name.value = '';
      items.value = [];
    } catch (error) {
      console.error('Failed to save recipe:', error);
      ElMessage.error('保存失败');
    }
  }

  return { name, items, totalCost, totalNutrition, addItem, removeItem, saveRecipe };
});
