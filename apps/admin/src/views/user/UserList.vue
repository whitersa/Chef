<template>
  <ListLayout>
    <template #toolbar>
      <div class="toolbar-right">
        <el-button type="primary" @click="dialogVisible = true">添加员工</el-button>
      </div>
    </template>

    <el-table :data="users" style="width: 100%; height: 100%" v-loading="loading" border>
      <el-table-column prop="hireDate" label="入职日期" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.hireDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'Active' ? 'success' : 'info'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button link type="primary" size="small">编辑</el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

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

    <template #extra>
      <el-dialog v-model="dialogVisible" title="添加员工" width="30%">
        <el-form :model="form" label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="角色">
            <el-select v-model="form.role" placeholder="请选择角色">
              <el-option label="Head Chef" value="Head Chef" />
              <el-option label="Sous Chef" value="Sous Chef" />
              <el-option label="Chef de Partie" value="Chef de Partie" />
              <el-option label="Kitchen Porter" value="Kitchen Porter" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" placeholder="请选择状态">
              <el-option label="Active" value="Active" />
              <el-option label="Inactive" value="Inactive" />
              <el-option label="On Leave" value="On Leave" />
            </el-select>
          </el-form-item>
          <el-form-item label="入职日期">
            <el-date-picker
              v-model="form.hireDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleAddUser">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useUserStore } from '../../stores/user';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { useListFilter } from '@/composables/useListFilter';

const userStore = useUserStore();
const { users, loading, pagination } = storeToRefs(userStore);

const { handlePageChange, handleSizeChange } = useListFilter(userStore);

const dialogVisible = ref(false);
const form = reactive({
  name: '',
  role: '',
  status: 'Active',
  hireDate: '',
});

onMounted(() => {
  userStore.fetchUsers();
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString();
};

const handleAddUser = async () => {
  if (!form.name || !form.role || !form.hireDate) {
    ElMessage.warning('请填写完整信息');
    return;
  }
  try {
    await userStore.createUser({
      ...form,
      hireDate: new Date(form.hireDate).toISOString(),
    });
    ElMessage.success('添加成功');
    dialogVisible.value = false;
    // Reset form
    form.name = '';
    form.role = '';
    form.status = 'Active';
    form.hireDate = '';
  } catch (error) {
    ElMessage.error('添加失败');
  }
};

const handleDelete = async (id: string) => {
  try {
    await userStore.deleteUser(id);
    ElMessage.success('删除成功');
  } catch (error) {
    ElMessage.error('删除失败');
  }
};
</script>

<style scoped>
/* Styles removed as they are handled by ListLayout */
</style>
