<template>
  <div class="recipe-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>菜谱列表</span>
          <el-button type="primary" @click="$router.push('/recipe/editor')">新建菜谱</el-button>
        </div>
      </template>

      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="菜谱名称" width="200" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="cost" label="预估成本" width="120">
          <template #default="scope"> ¥{{ scope.row.cost.toFixed(2) }} </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="最后更新" />
        <el-table-column label="操作">
          <template #default>
            <el-button link type="primary" size="small" @click="$router.push('/recipe/editor')"
              >编辑</el-button
            >
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
    id: 1,
    name: '宫保鸡丁',
    category: '热菜',
    cost: 15.5,
    updatedAt: '2024-03-20 14:30',
  },
  {
    id: 2,
    name: '番茄炒蛋',
    category: '家常菜',
    cost: 5.2,
    updatedAt: '2024-03-19 09:15',
  },
  {
    id: 3,
    name: '鱼香肉丝',
    category: '热菜',
    cost: 18.8,
    updatedAt: '2024-03-18 16:45',
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
