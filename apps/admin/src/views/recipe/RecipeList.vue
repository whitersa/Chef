<template>
  <ListLayout>
    <template #search>
      <el-form :inline="true" class="search-form">
        <el-form-item label="菜谱名称">
          <el-input
            v-model="searchQuery"
            placeholder="搜索菜谱..."
            clearable
            @input="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(searchQuery)">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </template>

    <template #toolbar>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleCreate">新建菜谱</el-button>
      </div>
    </template>

    <el-table
      :data="recipes"
      style="width: 100%; height: 100%"
      v-loading="loading"
      @sort-change="handleSortChange"
      border
    >
      <el-table-column prop="name" label="菜谱名称" width="200" sortable="custom" />
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

    <template #pagination>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRecipeStore } from '../../stores/recipe';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useListFilter } from '@/composables/useListFilter';

const router = useRouter();
const recipeStore = useRecipeStore();
const { recipes, loading, pagination } = storeToRefs(recipeStore);

const {
  searchQuery,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleSortChange,
} = useListFilter(recipeStore);

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
/* Styles removed as they are handled by ListLayout */
</style>
