<template>
  <ListLayout>
    <template #toolbar>
      <el-button type="primary" @click="handleCreate"> 新建菜系 </el-button>
    </template>

    <el-table v-loading="loading" :data="cuisines" border style="width: 100%">
      <el-table-column prop="name" label="菜系名称" width="180" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="handleEdit(scope.row)"> 编辑 </el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <template #extra>
      <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑菜系' : '新建菜系'" width="500px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" />
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
import { useCuisineStore } from '@/stores/cuisine';
import { storeToRefs } from 'pinia';
import { ElMessageBox } from 'element-plus';
import type { Cuisine } from '@/api/cuisines';
import ListLayout from '@/components/ListLayout.vue';

const cuisineStore = useCuisineStore();
const { cuisines, loading } = storeToRefs(cuisineStore);

const dialogVisible = ref(false);
const isEdit = ref(false);
const form = reactive({
  id: '',
  name: '',
  description: '',
});

onMounted(() => {
  cuisineStore.fetchCuisines();
});

const handleCreate = () => {
  isEdit.value = false;
  form.id = '';
  form.name = '';
  form.description = '';
  dialogVisible.value = true;
};

const handleEdit = (row: Cuisine) => {
  isEdit.value = true;
  form.id = row.id;
  form.name = row.name;
  form.description = row.description || '';
  dialogVisible.value = true;
};

const handleDelete = (row: Cuisine) => {
  ElMessageBox.confirm('确定要删除这个菜系吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    cuisineStore.deleteCuisine(row.id);
  });
};

const handleSubmit = async () => {
  if (isEdit.value) {
    await cuisineStore.updateCuisine(form.id, {
      name: form.name,
      description: form.description,
    });
  } else {
    await cuisineStore.createCuisine({
      name: form.name,
      description: form.description,
    });
  }
  dialogVisible.value = false;
};
</script>
