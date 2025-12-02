<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useProcessingStore } from '../../stores/processing';
import { Delete, Plus } from '@element-plus/icons-vue';

const store = useProcessingStore();
const dialogVisible = ref(false);
const form = ref({
  name: '',
  description: '',
});

onMounted(() => {
  store.fetchMethods();
});

function handleCreate() {
  dialogVisible.value = true;
  form.value = { name: '', description: '' };
}

async function submitForm() {
  if (!form.value.name) return;
  await store.createMethod(form.value.name, form.value.description);
  dialogVisible.value = false;
}

function handleDelete(id: string) {
  store.removeMethod(id);
}
</script>

<template>
  <ListLayout>
    <template #toolbar>
      <div class="toolbar-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">新增流程</el-button>
      </div>
    </template>

    <el-table :data="store.methods" v-loading="store.loading" style="width: 100%" border>
      <el-table-column prop="name" label="名称" width="180" />
      <el-table-column prop="description" label="描述模板" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="danger" :icon="Delete" circle @click="handleDelete(row.id)" />
        </template>
      </el-table-column>
    </el-table>

    <template #extra>
      <el-dialog v-model="dialogVisible" title="新增预处理流程" width="500px">
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" placeholder="例如：焯水" />
          </el-form-item>
          <el-form-item label="描述模板">
            <el-input
              v-model="form.description"
              type="textarea"
              placeholder="例如：将{ingredient}放入沸水中焯烫{time}秒"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="submitForm">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<style scoped>
/* Styles removed as they are handled by ListLayout */
</style>
