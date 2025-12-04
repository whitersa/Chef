<template>
  <ListLayout>
    <!-- 查询区域 -->
    <template #search>
      <el-form :inline="true" class="search-form">
        <el-form-item label="食材名称">
          <el-input
            v-model="searchQuery"
            placeholder="请输入食材名称"
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

    <!-- 工具栏 -->
    <template #toolbar>
      <div class="toolbar-left">
        <!-- 预留左侧工具栏位置，如批量操作等 -->
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon class="el-icon--left"><Plus /></el-icon>添加食材
        </el-button>
      </div>
    </template>

    <!-- 列表区域 -->
    <el-table
      :data="ingredients"
      style="width: 100%; height: 100%"
      v-loading="loading"
      @sort-change="handleSortChange"
      border
    >
      <el-table-column prop="name" label="名称" width="180" sortable="custom" />
      <el-table-column prop="stockQuantity" label="库存" width="120">
        <template #default="scope">
          <el-tag :type="scope.row.stockQuantity > 0 ? 'success' : 'danger'">
            {{ scope.row.stockQuantity || 0 }} {{ scope.row.stockUnit || scope.row.unit }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价" width="180" sortable="custom">
        <template #default="scope"> ¥{{ scope.row.price }} </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100" />
      <el-table-column label="营养成分" width="100" align="center">
        <template #default="scope">
          <el-popover placement="top" width="220" trigger="hover" :show-arrow="false" offset="10">
            <template #reference>
              <el-tag class="nutrition-trigger" size="small" effect="plain" round>
                <el-icon><DataAnalysis /></el-icon>
                <span>营养</span>
              </el-tag>
            </template>
            <div class="nutrition-card">
              <div class="card-header">
                <span class="title">营养概览</span>
                <span class="subtitle">每单位含量</span>
              </div>
              <div class="card-body">
                <div class="nutrient-row">
                  <div class="nutrient-label">
                    <span class="dot protein"></span>
                    <span>蛋白质</span>
                  </div>
                  <span class="nutrient-value">{{ scope.row.nutrition?.protein || 0 }}</span>
                </div>
                <div class="nutrient-row">
                  <div class="nutrient-label">
                    <span class="dot fat"></span>
                    <span>脂肪</span>
                  </div>
                  <span class="nutrient-value">{{ scope.row.nutrition?.fat || 0 }}</span>
                </div>
                <div class="nutrient-row">
                  <div class="nutrient-label">
                    <span class="dot carbs"></span>
                    <span>碳水化合物</span>
                  </div>
                  <span class="nutrient-value">{{ scope.row.nutrition?.carbs || 0 }}</span>
                </div>
              </div>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)"
            >编辑</el-button
          >
          <el-popconfirm title="确定要删除吗?" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
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

    <!-- 弹窗 -->
    <template #extra>
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑食材' : '添加食材'"
        width="30%"
        @close="resetForm"
      >
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="单价">
            <el-input-number v-model="form.price" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="单位">
            <el-select v-model="form.unit" placeholder="请选择单位">
              <el-option label="kg" value="kg" />
              <el-option label="g" value="g" />
              <el-option label="L" value="L" />
              <el-option label="ml" value="ml" />
              <el-option label="个" value="个" />
            </el-select>
          </el-form-item>
          <el-divider content-position="left">营养成分</el-divider>
          <el-form-item label="蛋白质">
            <el-input-number v-model="form.nutrition.protein" :min="0" :precision="1" />
          </el-form-item>
          <el-form-item label="脂肪">
            <el-input-number v-model="form.nutrition.fat" :min="0" :precision="1" />
          </el-form-item>
          <el-form-item label="碳水">
            <el-input-number v-model="form.nutrition.carbs" :min="0" :precision="1" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useIngredientsStore, type Ingredient } from '@/stores/ingredients';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { useListFilter } from '@/composables/useListFilter';

const ingredientsStore = useIngredientsStore();
const { ingredients, loading, pagination } = storeToRefs(ingredientsStore);

const {
  searchQuery,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleSortChange,
} = useListFilter(ingredientsStore);

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');

const form = reactive({
  name: '',
  price: 0,
  unit: 'kg',
  nutrition: {
    protein: 0,
    fat: 0,
    carbs: 0,
  },
});

onMounted(() => {
  ingredientsStore.fetchIngredients();
});

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Ingredient) => {
  isEdit.value = true;
  currentId.value = row.id;
  form.name = row.name;
  form.price = row.price;
  form.unit = row.unit;
  form.nutrition = { ...row.nutrition };
  dialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  try {
    await ingredientsStore.deleteIngredient(id);
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

const handleSubmit = async () => {
  if (!form.name) {
    ElMessage.warning('请输入名称');
    return;
  }

  try {
    if (isEdit.value) {
      await ingredientsStore.updateIngredient(currentId.value, { ...form });
      ElMessage.success('更新成功');
    } else {
      await ingredientsStore.createIngredient({ ...form });
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
};

const resetForm = () => {
  form.name = '';
  form.price = 0;
  form.unit = 'kg';
  form.nutrition = {
    protein: 0,
    fat: 0,
    carbs: 0,
  };
};
</script>

<style scoped>
.nutrition-trigger {
  cursor: pointer;
  border: none;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
  height: 24px;
  padding: 0 12px;
}

.nutrition-trigger:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nutrition-card {
  padding: 4px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.card-header .title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.card-header .subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.nutrient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.nutrient-row:last-child {
  margin-bottom: 0;
}

.nutrient-label {
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
}

.nutrient-value {
  font-family: var(--el-font-family);
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  position: relative;
}

.dot::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  opacity: 0.2;
  background-color: inherit;
}

.dot.protein {
  background-color: #e6a23c;
}
.dot.fat {
  background-color: #f56c6c;
}
.dot.carbs {
  background-color: #409eff;
}
</style>
