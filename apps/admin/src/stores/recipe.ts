import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { recipesApi } from '../api/recipes';
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
  const recipes = ref<any[]>([]);
  const loading = ref(false);
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    sort: '',
    order: 'ASC' as 'ASC' | 'DESC',
  });
  const search = ref('');

  // Editor state
  const name = ref('');
  const items = ref<RecipeItem[]>([]);
  const steps = ref<string[]>([]);
  const preProcessing = ref<string[]>([]);

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

  async function fetchRecipes() {
    loading.value = true;
    try {
      const response = await recipesApi.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        search: search.value,
        sort: pagination.value.sort,
        order: pagination.value.order,
      });
      recipes.value = response.data;
      pagination.value.total = response.meta.total;
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    } finally {
      loading.value = false;
    }
  }

  function setPage(page: number) {
    pagination.value.page = page;
    fetchRecipes();
  }

  function setSort(sort: string, order: 'ASC' | 'DESC') {
    pagination.value.sort = sort;
    pagination.value.order = order;
    fetchRecipes();
  }

  function setSearch(term: string) {
    search.value = term;
    pagination.value.page = 1;
    fetchRecipes();
  }

  async function fetchRecipe(id: string) {
    loading.value = true;
    try {
      const recipe: any = await recipesApi.getById(id);
      name.value = recipe.name;
      steps.value = recipe.steps || [];
      preProcessing.value = recipe.preProcessing || [];
      items.value = recipe.items.map((item: any) => ({
        id: crypto.randomUUID(),
        ingredientId: item.ingredient?.id,
        name: item.ingredient?.name || 'Unknown',
        quantity: Number(item.quantity),
        unit: item.ingredient?.unit || '',
        price: Number(item.ingredient?.price || 0),
        yieldRate: Number(item.yieldRate),
        nutrition: item.ingredient?.nutrition || { protein: 0, fat: 0, carbs: 0 },
      }));
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      loading.value = false;
    }
  }

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

  function addStep() {
    steps.value.push('');
  }

  function removeStep(index: number) {
    steps.value.splice(index, 1);
  }

  function addPreProcessing() {
    preProcessing.value.push('');
  }

  function removePreProcessing(index: number) {
    preProcessing.value.splice(index, 1);
  }

  function resetEditor() {
    name.value = '';
    items.value = [];
    steps.value = [];
    preProcessing.value = [];
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
        steps: steps.value,
        preProcessing: preProcessing.value,
        items: items.value.map((item) => ({
          quantity: item.quantity,
          yieldRate: item.yieldRate,
          ingredientId: item.ingredientId,
        })),
      };

      await recipesApi.create(payload);
      ElMessage.success('保存成功');
      resetEditor();
    } catch (error) {
      console.error('Failed to save recipe:', error);
      ElMessage.error('保存失败');
    }
  }

  return {
    recipes,
    loading,
    pagination,
    search,
    name,
    items,
    steps,
    preProcessing,
    totalCost,
    totalNutrition,
    fetchRecipes,
    setPage,
    setSort,
    setSearch,
    fetchRecipe,
    addItem,
    removeItem,
    addStep,
    removeStep,
    addPreProcessing,
    removePreProcessing,
    saveRecipe,
    resetEditor,
  };
});
