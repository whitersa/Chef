<template>
  <ListLayout>
    <!-- Search Area -->
    <template #search>
      <el-form :inline="true" class="search-form">
        <el-form-item label="单位名称">
          <el-input
            v-model="searchQuery"
            placeholder="请输入单位名称"
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

    <!-- Toolbar -->
    <template #toolbar>
      <div class="toolbar-left"></div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon class="el-icon--left">
            <Plus />
          </el-icon>
          添加单位
        </el-button>
      </div>
    </template>

    <!-- List Area -->
    <el-table v-loading="loading" :data="filteredUnits" style="width: 100%; height: 100%" border>
      <el-table-column prop="name" label="名称" width="180" sortable />
      <el-table-column prop="abbreviation" label="缩写" width="120" />
      <el-table-column prop="description" label="描述" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- Dialog -->
    <template #dialog>
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑单位' : '添加单位'"
        width="500px"
        destroy-on-close
      >
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称" required>
            <el-input v-model="form.name" placeholder="例如：千克" />
          </el-form-item>
          <el-form-item label="缩写">
            <el-input v-model="form.abbreviation" placeholder="例如：kg" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="form.description" type="textarea" placeholder="单位描述说明" />
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
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import ListLayout from '@/components/ListLayout.vue';
import { getUnits, createUnit, updateUnit, deleteUnit } from '@/api/units';
import type { Unit } from '@chefos/types';

const loading = ref(false);
const units = ref<Unit[]>([]);
const searchQuery = ref('');

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');

const form = reactive({
  name: '',
  abbreviation: '',
  description: '',
});

const fetchUnits = async () => {
  loading.value = true;
  try {
    units.value = await getUnits();
  } catch (error) {
    console.error('Failed to fetch units:', error);
    ElMessage.error('获取单位列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchUnits();
});

const filteredUnits = computed(() => {
  if (!searchQuery.value) return units.value;
  const query = searchQuery.value.toLowerCase();
  return units.value.filter(
    (unit) =>
      unit.name.toLowerCase().includes(query) ||
      (unit.abbreviation && unit.abbreviation.toLowerCase().includes(query)),
  );
});

const handleSearch = () => {
  // Client-side filtering is handled by computed property
};

const handleReset = () => {
  searchQuery.value = '';
};

const resetForm = () => {
  form.name = '';
  form.abbreviation = '';
  form.description = '';
};

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Unit) => {
  isEdit.value = true;
  currentId.value = row.id;
  form.name = row.name;
  form.abbreviation = row.abbreviation || '';
  form.description = row.description || '';
  dialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  try {
    await deleteUnit(id);
    ElMessage.success('删除成功');
    fetchUnits();
  } catch (error) {
    console.error(error);
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
      await updateUnit(currentId.value, { ...form });
      ElMessage.success('更新成功');
    } else {
      await createUnit({ ...form });
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    fetchUnits();
  } catch (error) {
    console.error(error);
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
};
</script>
