<template>
  <ListLayout>
    <template #toolbar>
      <div class="toolbar-right">
        <el-button @click="fetchPlugins">
          <el-icon class="el-icon--left"><Refresh /></el-icon>刷新
        </el-button>
      </div>
    </template>

    <el-table v-loading="loading" :data="plugins" style="width: 100%" border>
      <el-table-column prop="name" label="插件名称 (Plugin Name)" />
      <el-table-column label="操作 (Actions)" width="150" align="center">
        <template #default="scope">
          <el-button type="primary" link @click="configure(scope.row.name)">
            配置 (Configure)
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getPlugins } from '../../api/plugins';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const plugins = ref<{ name: string }[]>([]);

const fetchPlugins = async () => {
  loading.value = true;
  try {
    const res = await getPlugins();
    // API returns string[], map to object for table
    plugins.value = (res as unknown as string[]).map((name) => ({ name }));
  } catch {
    ElMessage.error('Failed to load plugins');
  } finally {
    loading.value = false;
  }
};

const configure = (name: string) => {
  router.push(`/plugins/${name}`);
};

onMounted(() => {
  fetchPlugins();
});
</script>

<style scoped>
.toolbar-right {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>
