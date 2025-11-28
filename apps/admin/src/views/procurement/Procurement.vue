<template>
  <div class="procurement-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>采购清单生成</span>
          <el-button type="primary" @click="generateList" :loading="loading">生成清单</el-button>
        </div>
      </template>

      <div class="input-section">
        <el-form :inline="true">
          <el-form-item label="添加菜谱">
            <el-select
              v-model="selectedRecipeId"
              filterable
              remote
              placeholder="搜索菜谱"
              :remote-method="searchRecipes"
              :loading="searchLoading"
              style="width: 300px"
            >
              <el-option
                v-for="item in recipeOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="addRecipe" :disabled="!selectedRecipeId">添加</el-button>
          </el-form-item>
        </el-form>

        <el-table :data="requestItems" style="width: 100%; margin-bottom: 20px" border>
          <el-table-column prop="recipeName" label="菜谱名称" />
          <el-table-column label="数量 (批次)" width="200">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity" :min="0.1" :step="0.5" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="scope">
              <el-button type="danger" link @click="removeRecipe(scope.$index)">移除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-if="resultList.length > 0" class="result-section">
        <el-divider content-position="left">采购清单结果</el-divider>
        <el-table :data="resultList" border show-summary sum-text="总计">
          <el-table-column prop="name" label="食材名称" />
          <el-table-column prop="quantity" label="需求数量">
            <template #default="scope"> {{ scope.row.quantity }} {{ scope.row.unit }} </template>
          </el-table-column>
          <el-table-column prop="estimatedCost" label="预估成本" sortable>
            <template #default="scope"> ¥{{ scope.row.estimatedCost }} </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { recipesApi, type Recipe } from '../../api/recipes';
import { procurementApi, type ProcurementItem } from '../../api/procurement';
import { ElMessage } from 'element-plus';

interface RequestItem {
  recipeId: string;
  recipeName: string;
  quantity: number;
}

const loading = ref(false);
const searchLoading = ref(false);
const selectedRecipeId = ref('');
const recipeOptions = ref<Recipe[]>([]);
const requestItems = ref<RequestItem[]>([]);
const resultList = ref<ProcurementItem[]>([]);

const searchRecipes = async (query: string) => {
  if (query) {
    searchLoading.value = true;
    try {
      const res = await recipesApi.getAll({ search: query, limit: 20 });
      recipeOptions.value = res.data;
    } finally {
      searchLoading.value = false;
    }
  } else {
    recipeOptions.value = [];
  }
};

const addRecipe = () => {
  const recipe = recipeOptions.value.find((r) => r.id === selectedRecipeId.value);
  if (recipe) {
    // Check if already exists
    const exists = requestItems.value.find((i) => i.recipeId === recipe.id);
    if (exists) {
      exists.quantity += 1;
    } else {
      requestItems.value.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        quantity: 1,
      });
    }
    selectedRecipeId.value = '';
  }
};

const removeRecipe = (index: number) => {
  requestItems.value.splice(index, 1);
};

const generateList = async () => {
  if (requestItems.value.length === 0) {
    ElMessage.warning('请先添加菜谱');
    return;
  }

  loading.value = true;
  try {
    const res = await procurementApi.generateList({
      items: requestItems.value.map((i) => ({
        recipeId: i.recipeId,
        quantity: i.quantity,
      })),
    });
    resultList.value = res;
    ElMessage.success('清单生成成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('生成失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.input-section {
  margin-bottom: 20px;
}
</style>
