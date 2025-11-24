<template>
  <div class="recipe-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜谱列表</span>
          <el-button type="primary" @click="handleCreate">新建菜谱</el-button>
        </div>
      </template>

      <el-table :data="recipes" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="菜谱名称" width="200" />
        <el-table-column label="预估成本" width="120">
          <template #default>
            <!-- Cost calculation might be complex if not returned by API directly. 
                 For now let's assume API returns it or we calculate it. 
                 Actually the API calculateCost endpoint exists but list endpoint might not return it.
                 Let's just show '查看详情' or fetch it if possible. 
                 Or maybe the backend list endpoint should return cost.
                 For now, let's just show name. -->
            -
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row.id)"
              >编辑</el-button
            >
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRecipeStore } from '../../stores/recipe';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const { recipes, loading } = storeToRefs(recipeStore);

onMounted(() => {
  recipeStore.fetchRecipes();
});

const handleCreate = () => {
  recipeStore.resetEditor();
  router.push('/recipe/editor');
};

const handleEdit = (id: string) => {
  router.push(`/recipe/editor/${id}`);
};
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
