import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useIngredientsStore = defineStore('ingredients', () => {
  // 模拟数据，后续替换为 API 调用
  const ingredients = ref([
    { id: '1', name: '番茄', price: 5.0, unit: 'kg' },
    { id: '2', name: '鸡蛋', price: 10.0, unit: 'kg' },
    { id: '3', name: '牛肉', price: 80.0, unit: 'kg' },
    { id: '4', name: '土豆', price: 3.0, unit: 'kg' },
  ]);

  return { ingredients };
});
