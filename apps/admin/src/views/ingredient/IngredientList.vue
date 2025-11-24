<template>
  <div class="ingredient-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>食材管理</span>
          <el-button type="primary" @click="handleAdd">添加食材</el-button>
        </div>
      </template>

      <el-table :data="ingredients" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="price" label="单价" width="180">
          <template #default="scope"> ¥{{ scope.row.price }} </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column label="营养成分 (每单位)">
          <template #default="scope">
            <el-tag size="small" type="info" class="mr-2">
              蛋白质: {{ scope.row.nutrition?.protein || 0 }}
            </el-tag>
            <el-tag size="small" type="info" class="mr-2">
              脂肪: {{ scope.row.nutrition?.fat || 0 }}
            </el-tag>
            <el-tag size="small" type="info"> 碳水: {{ scope.row.nutrition?.carbs || 0 }} </el-tag>
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
const { ingredients, loading } = storeToRefs(ingredientsStore);

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
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mr-2 {
  margin-right: 8px;
}
</style>
