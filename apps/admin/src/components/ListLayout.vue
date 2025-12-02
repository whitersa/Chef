<template>
  <div class="page-container">
    <!-- Search Section -->
    <el-card v-if="$slots.search" class="search-card" shadow="never">
      <slot name="search"></slot>
    </el-card>

    <!-- List Section -->
    <el-card class="list-card" shadow="never">
      <!-- Toolbar -->
      <div v-if="$slots.toolbar" class="toolbar">
        <slot name="toolbar"></slot>
      </div>

      <!-- Main Content (Table) -->
      <slot></slot>

      <!-- Pagination -->
      <div v-if="$slots.pagination" class="pagination-container">
        <slot name="pagination"></slot>
      </div>
    </el-card>

    <!-- Dialogs etc -->
    <slot name="extra"></slot>
  </div>
</template>

<script setup lang="ts">
// Generic List Layout Component
</script>

<style scoped>
.search-card {
  margin-bottom: 8px;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
}

:deep(.toolbar-left) {
  margin-right: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* Helper styles for search form content */
:deep(.search-form) {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

:deep(.search-form .el-form-item__label) {
  font-weight: 700;
  color: var(--el-text-color-primary);
}

:deep(.search-form .el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

:deep(.search-form .el-form-item:last-child) {
  margin-left: auto;
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
