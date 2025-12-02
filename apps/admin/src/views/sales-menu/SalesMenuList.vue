<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSalesMenuStore } from '../../stores/sales-menu';
import { Edit, Delete, Plus } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const router = useRouter();
const store = useSalesMenuStore();

onMounted(() => {
  store.fetchMenus();
});

function handleEdit(id: string) {
  router.push(`/sales-menu/editor/${id}`);
}

function handleCreate() {
  router.push('/sales-menu/editor');
}

function handleDelete(id: string) {
  ElMessageBox.confirm('确定要删除这个菜单吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    store.deleteMenu(id);
  });
}
</script>

<template>
  <ListLayout>
    <template #toolbar>
      <div class="toolbar-right">
        <el-button type="primary" :icon="Plus" @click="handleCreate">新建菜单</el-button>
      </div>
    </template>

    <el-table :data="store.menus" v-loading="store.loading" style="width: 100%" border>
      <el-table-column prop="name" label="菜单名称" />
      <el-table-column prop="description" label="描述" />
      <el-table-column prop="active" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.active ? 'success' : 'info'">
            {{ row.active ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="包含菜品数">
        <template #default="{ row }">
          {{ row.items?.length || 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" :icon="Edit" @click="handleEdit(row.id)">编辑</el-button>
          <el-button size="small" type="danger" :icon="Delete" @click="handleDelete(row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </ListLayout>
</template>

<style scoped>
/* Styles removed as they are handled by ListLayout */
</style>
