<template>
  <div class="page-container">
    <!-- Search Section -->
    <el-card
      v-if="$slots.search"
      class="search-card"
      shadow="never"
    >
      <slot name="search" />
    </el-card>

    <!-- List Section -->
    <el-card
      class="list-card"
      shadow="never"
    >
      <!-- Toolbar -->
      <div
        v-if="$slots.toolbar"
        class="toolbar"
      >
        <slot name="toolbar" />
      </div>

      <!-- Main Content (Table) -->
      <div class="table-wrapper">
        <slot />
      </div>

      <!-- Pagination -->
      <div
        v-if="$slots.pagination"
        class="pagination-container"
      >
        <slot name="pagination" />
      </div>
    </el-card>

    <!-- Dialogs etc -->
    <slot name="extra" />
  </div>
</template>

<script setup lang="ts">
// Generic List Layout Component
</script>

<style scoped>
.page-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-card {
  margin-bottom: var(--app-main-padding);
  flex-shrink: 0;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.table-wrapper {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: var(--app-gap);
  flex-shrink: 0;
}

:deep(.toolbar-left) {
  margin-right: auto;
}

.pagination-container {
  margin-top: var(--app-gap);
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* Helper styles for search form content */
:deep(.search-form) {
  display: flex;
  flex-wrap: wrap;
  gap: var(--app-padding);
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
  padding: var(--app-gap);
  flex: 1; /* Changed from height: 100% to flex: 1 */
  min-height: 0; /* Important for nested flex scrolling */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
</style>
