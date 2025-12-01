<template>
  <div class="ingredient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span>食材管理</span>
            <el-input
              v-model="searchQuery"
              placeholder="搜索食材..."
              style="width: 200px; margin-left: 16px"
              @input="handleSearch"
              clearable
            />
          </div>
          <el-button type="primary" @click="handleAdd">添加食材</el-button>
        </div>
      </template>

      <el-table
        :data="ingredients"
        style="width: 100%"
        v-loading="loading"
        @sort-change="handleSortChange"
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
        <el-table-column label="营养成分 (每单位)">
          <template #default="scope">
            <div class="nutrition-tags">
              <el-tag size="small" type="info" effect="plain">
                蛋白质: {{ scope.row.nutrition?.protein || 0 }}
              </el-tag>
              <el-tag size="small" type="info" effect="plain">
                脂肪: {{ scope.row.nutrition?.fat || 0 }}
              </el-tag>
              <el-tag size="small" type="info" effect="plain">
                碳水: {{ scope.row.nutrition?.carbs || 0 }}
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useIngredientsStore, type Ingredient } from '../../stores/ingredients';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';

const ingredientsStore = useIngredientsStore();
const { ingredients, loading, pagination } = storeToRefs(ingredientsStore);

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');
const searchQuery = ref('');

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

function debounce(fn: Function, delay: number) {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

const handleSearch = debounce((val: string) => {
  ingredientsStore.setSearch(val);
}, 300);

const handlePageChange = (page: number) => {
  ingredientsStore.setPage(page);
};

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  if (!order) {
    ingredientsStore.setSort('', 'ASC');
    return;
  }
  const sortOrder = order === 'ascending' ? 'ASC' : 'DESC';
  ingredientsStore.setSort(prop, sortOrder);
};

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
.ingredient-list {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left span {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.nutrition-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.mr-2 {
  margin-right: 8px;
}
</style>
