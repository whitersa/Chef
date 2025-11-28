<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSalesMenuStore } from '../../stores/sales-menu';
import { useRecipeStore } from '../../stores/recipe';
import draggable from 'vuedraggable';
import { Delete } from '@element-plus/icons-vue';

const route = useRoute();
const router = useRouter();
const store = useSalesMenuStore();
const recipeStore = useRecipeStore();

const categories = ['前菜', '主菜', '汤品', '甜点', '饮料', '套餐'];

onMounted(async () => {
  recipeStore.fetchRecipes();
  if (route.params.id) {
    await store.fetchMenu(route.params.id as string);
  } else {
    store.resetEditor();
  }
});

function handleRecipeAdd(evt: any) {
  if (evt.added) {
    const recipe = evt.added.element;
    // Calculate suggested price based on cost per portion if available
    // We need to fetch detailed recipe info to get cost, but for now we use a placeholder or fetch on demand
    // For simplicity, let's just add it with 0 price and let user edit

    store.addItem({
      recipeId: recipe.id,
      name: recipe.name,
      price: 0,
      category: '主菜',
      order: store.currentMenu.items?.length || 0,
    });
  }
}

async function handleSave() {
  try {
    await store.saveMenu();
    router.push('/sales-menu/list');
  } catch (error) {
    // Error handled in store
  }
}

function handleCancel() {
  router.back();
}
</script>

<template>
  <div class="editor-container">
    <!-- Left Panel: Recipe Library -->
    <div class="panel left-panel">
      <h3>菜谱库</h3>
      <div class="search-box">
        <el-input
          v-model="recipeStore.search"
          placeholder="搜索菜谱..."
          size="small"
          @input="recipeStore.setSearch"
        />
      </div>
      <draggable
        :list="recipeStore.recipes"
        :group="{ name: 'recipes', pull: 'clone', put: false }"
        :sort="false"
        item-key="id"
        class="recipe-list"
      >
        <template #item="{ element }">
          <div class="recipe-source-item">
            <span>{{ element.name }}</span>
          </div>
        </template>
      </draggable>
    </div>

    <!-- Center Panel: Menu Editor -->
    <div class="panel center-panel">
      <div class="panel-header">
        <div class="title-input">
          <el-input
            v-model="store.currentMenu.name"
            placeholder="请输入菜单名称 (如: 午市套餐)"
            style="width: 300px"
          />
          <el-switch
            v-model="store.currentMenu.active"
            active-text="启用"
            inactive-text="禁用"
            style="margin-left: 20px"
          />
        </div>
        <div class="actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="store.loading"
            >保存菜单</el-button
          >
        </div>
      </div>

      <div class="menu-meta">
        <el-input
          v-model="store.currentMenu.description"
          type="textarea"
          :rows="2"
          placeholder="菜单描述 (可选)"
        />
      </div>

      <div class="menu-canvas">
        <h3>菜单内容</h3>
        <div class="menu-items-header">
          <span class="col-name">菜品名称</span>
          <span class="col-category">分类</span>
          <span class="col-price">售价 (¥)</span>
          <span class="col-action">操作</span>
        </div>

        <draggable
          :list="store.currentMenu.items"
          group="recipes"
          item-key="id"
          class="menu-items-list"
          handle=".drag-handle"
          @change="handleRecipeAdd"
        >
          <template #item="{ element, index }">
            <div class="menu-item-row">
              <div class="drag-handle">⋮⋮</div>
              <div class="col-name">
                <el-input v-model="element.name" size="small" />
              </div>
              <div class="col-category">
                <el-select v-model="element.category" size="small" placeholder="选择分类">
                  <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                </el-select>
              </div>
              <div class="col-price">
                <el-input-number
                  v-model="element.price"
                  :min="0"
                  :precision="2"
                  :step="1"
                  size="small"
                  style="width: 100%"
                />
              </div>
              <div class="col-action">
                <el-button
                  type="danger"
                  circle
                  size="small"
                  :icon="Delete"
                  @click="store.removeItem(index)"
                />
              </div>
            </div>
          </template>
        </draggable>

        <div v-if="!store.currentMenu.items?.length" class="empty-placeholder">
          从左侧拖拽菜谱到此处添加
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  height: 100%;
  background-color: transparent;
  gap: 6px;
}

.panel {
  padding: 10px;
  background: white;
  border-radius: 2px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.panel h3 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  border-left: 3px solid #409eff;
  padding-left: 8px;
}

.left-panel {
  width: 220px;
}

.center-panel {
  flex: 1;
}

.search-box {
  margin-bottom: 10px;
}

.recipe-list {
  flex: 1;
  overflow-y: auto;
}

.recipe-source-item {
  padding: 8px;
  margin-bottom: 6px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  cursor: move;
  font-size: 12px;
  color: #606266;
}

.recipe-source-item:hover {
  background-color: #ecf5ff;
  border-color: #c6e2ff;
  color: #409eff;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.title-input {
  display: flex;
  align-items: center;
}

.menu-meta {
  margin-bottom: 20px;
}

.menu-canvas {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.menu-items-header {
  display: flex;
  padding: 0 10px 10px 30px; /* 30px left padding for drag handle alignment */
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
  font-weight: 600;
}

.menu-items-list {
  flex: 1;
  overflow-y: auto;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 2px;
  padding: 5px;
}

.menu-item-row {
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 10px;
  margin-bottom: 5px;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.drag-handle {
  width: 20px;
  cursor: move;
  color: #c0c4cc;
  font-size: 14px;
  margin-right: 10px;
}

.col-name {
  flex: 2;
  margin-right: 10px;
}
.col-category {
  width: 120px;
  margin-right: 10px;
}
.col-price {
  width: 120px;
  margin-right: 10px;
}
.col-action {
  width: 50px;
  text-align: center;
}

.empty-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px;
  font-size: 13px;
}
</style>
