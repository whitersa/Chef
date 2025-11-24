<template>
  <div class="user-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员管理</span>
          <el-button type="primary">添加员工</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="入职日期" width="180" />
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
          <template #default>
            <el-button link type="primary" size="small">编辑</el-button>
            <el-button link type="danger" size="small">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  {
    date: '2024-01-01',
    name: 'Chef John',
    role: 'Head Chef',
    status: 'Active',
  },
  {
    date: '2024-02-15',
    name: 'Sous Chef Mike',
    role: 'Sous Chef',
    status: 'Active',
  },
  {
    date: '2024-03-01',
    name: 'Helper Sarah',
    role: 'Kitchen Porter',
    status: 'On Leave',
  },
];
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
