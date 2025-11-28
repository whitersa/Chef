<template>
  <div class="recipe-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>菜谱列表</span>
            <el-input
              v-model="searchQuery"
              placeholder="搜索菜谱..."
              style="width: 200px; margin-left: 16px"
              @input="handleSearch"
              clearable
            />
          </div>
          <el-button type="primary" @click="handleCreate">新建菜谱</el-button>
        </div>
      </template>

      <el-table
        :data="recipes"
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
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

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :total="pagination.total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRecipeStore } from '../../stores/recipe';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';

const router = useRouter();
const recipeStore = useRecipeStore();
const { recipes, loading, pagination } = storeToRefs(recipeStore);
const searchQuery = ref('');

onMounted(() => {
  recipeStore.fetchRecipes();
});

function debounce(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce((val: string) => {
  recipeStore.setSearch(val);
}, 300);

const handlePageChange = (page: number) => {
  recipeStore.setPage(page);
};

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  if (!order) {
    recipeStore.setSort('', 'ASC');
    return;
  }
  const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
  recipeStore.setSort(prop, sortOrder);
};

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
.header-left {
  display: flex;
  align-items: center;
}
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
