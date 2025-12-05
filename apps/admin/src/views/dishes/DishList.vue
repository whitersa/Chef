<template>
  <ListLayout>
    <template #toolbar>
      <el-button type="primary" @click="handleCreate"> 新建菜品 </el-button>
    </template>

    <el-table v-loading="loading" :data="dishes" border style="width: 100%">
      <el-table-column prop="name" label="菜品名称" width="180" />
      <el-table-column prop="cuisine.name" label="所属菜系" width="120" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #extra>
      <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜品' : '新建菜品'" width="500px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="菜系">
            <el-select v-model="form.cuisineId" placeholder="选择菜系">
              <el-option
                v-for="item in cuisines"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false"> 取消 </el-button>
            <el-button type="primary" @click="handleSubmit"> 确定 </el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useDishStore } from '@/stores/dish';
import { useCuisineStore } from '@/stores/cuisine';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';
import type { Dish } from '@/api/dishes';
import ListLayout from '@/components/ListLayout.vue';

const dishStore = useDishStore();
const cuisineStore = useCuisineStore();
const { dishes, loading } = storeToRefs(dishStore);
const { cuisines } = storeToRefs(cuisineStore);

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: '',
  name: '',
  description: '',
  cuisineId: '',
});

onMounted(() => {
  dishStore.fetchDishes();
  cuisineStore.fetchCuisines();
});

const handleCreate = () => {
  isEdit.value = false;
  form.id = '';
  form.name = '';
  form.description = '';
  form.cuisineId = '';
  dialogVisible.value = true;
};

const handleEdit = (row: Dish) => {
  isEdit.value = true;
  form.id = row.id;
  form.name = row.name;
  form.description = row.description || '';
  form.cuisineId = row.cuisineId || '';
  dialogVisible.value = true;
};

const handleDelete = (row: Dish) => {
  ElMessageBox.confirm('确定要删除这个菜品吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    dishStore.deleteDish(row.id);
  });
};

const handleSubmit = async () => {
  if (isEdit.value) {
    await dishStore.updateDish(form.id, {
      name: form.name,
      description: form.description,
      cuisineId: form.cuisineId,
    });
  } else {
    await dishStore.createDish({
      name: form.name,
      description: form.description,
      cuisineId: form.cuisineId,
    });
  }
  dialogVisible.value = false;
};
</script>
