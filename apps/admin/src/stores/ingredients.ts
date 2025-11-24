import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIngredientsStore = defineStore('ingredients', () => {
  // 模拟数据，后续替换为 API 调用
  const ingredients = ref([
    {
      id: '1',
      name: '番茄',
      price: 5.0,
      unit: 'kg',
      nutrition: { protein: 0.9, fat: 0.2, carbs: 3.9 }, // per 100g or unit? Let's assume per unit (kg) for simplicity or handle unit conversion later.
      // Actually, usually nutrition is per 100g. But for this demo, let's assume these values are "per unit" or just abstract units to sum up.
      // Let's stick to standard: per 100g.
      // But to keep it simple for the "Visual Editor" demo, let's assume these are "Nutrition points per unit quantity".
    },
    {
      id: '2',
      name: '鸡蛋',
      price: 10.0,
      unit: 'kg',
      nutrition: { protein: 13, fat: 10, carbs: 1 },
    },
    {
      id: '3',
      name: '牛肉',
      price: 80.0,
      unit: 'kg',
      nutrition: { protein: 26, fat: 15, carbs: 0 },
    },
    {
      id: '4',
      name: '土豆',
      price: 3.0,
      unit: 'kg',
      nutrition: { protein: 2, fat: 0.1, carbs: 17 },
    },
  ]);

  return { ingredients };
});
