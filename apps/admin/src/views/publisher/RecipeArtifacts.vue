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
          <el-button type="primary" @click="handleSearch"> 查询 </el-button>
          <el-button @click="handleReset"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </template>

    <el-table
      v-loading="loading"
      :data="recipes"
      style="width: 100%; height: 100%"
      border
      @sort-change="handleSortChange"
    >
      <el-table-column prop="name" label="菜谱名称" min-width="200" sortable="custom" />
      <el-table-column prop="variantName" label="变体名称" width="150" />
      <el-table-column prop="updatedAt" label="最后更新" width="180" sortable="custom">
        <template #default="{ row }">
          {{ formatDate(row.updatedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            :loading="downloadingId === row.id"
            @click="handleDownloadPdf(row)"
          >
            <el-icon class="el-icon--left"><Download /></el-icon>
            导出 PDF
          </el-button>
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
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { Download } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import ListLayout from '../../components/ListLayout.vue';
import { useRecipeStore } from '../../stores/recipe';
import { publisherApi } from '../../api/publisher';
import type { Recipe } from '@chefos/types';

const recipeStore = useRecipeStore();
const { recipes, loading, pagination } = storeToRefs(recipeStore);

const searchQuery = ref('');
const downloadingId = ref<string | null>(null);

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString();
};

const fetchRecipes = () => {
  recipeStore.fetchRecipes();
};

const handleSearch = () => {
  recipeStore.setSearch(searchQuery.value);
};

const handleReset = () => {
  searchQuery.value = '';
  recipeStore.setSearch('');
};

const handlePageChange = (page: number) => {
  recipeStore.setPage(page);
};

const handleSizeChange = (limit: number) => {
  recipeStore.setLimit(limit);
};

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (!order) {
    recipeStore.setSort([]);
    return;
  }
  const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
  recipeStore.setSort([{ field: prop, order: sortOrder }]);
};

const handleDownloadPdf = async (recipe: Recipe) => {
  downloadingId.value = recipe.id;
  try {
    await publisherApi.downloadRecipePdf(recipe.id, recipe.name);
    ElMessage.success('PDF 导出成功');
  } catch (error) {
    console.error('Failed to download PDF:', error);
    ElMessage.error('PDF 导出失败');
  } finally {
    downloadingId.value = null;
  }
};

onMounted(() => {
  fetchRecipes();
});
</script>

<style scoped>
.search-form {
  display: flex;
  flex-wrap: wrap;
}
</style>
