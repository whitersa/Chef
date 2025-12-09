<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSalesMenuStore } from '@/stores/sales-menu';
import { useRecipeStore } from '@/stores/recipe';
import { recipesApi } from '@/api/recipes';
import draggable from 'vuedraggable';
import { Delete, InfoFilled } from '@element-plus/icons-vue';
import type { Recipe } from '@chefos/types';

const route = useRoute();
const router = useRouter();
const store = useSalesMenuStore();
const recipeStore = useRecipeStore();

const categories = ['前菜', '主菜', '汤品', '甜点', '饮料', '套餐'];
const recipeCosts = ref<Record<string, number>>({});

onMounted(async () => {
  recipeStore.fetchRecipes();
  if (route.params.id) {
    await store.fetchMenu(route.params.id as string);
    // Fetch costs for existing items
    if (store.currentMenu.items) {
      for (const item of store.currentMenu.items) {
        if (item.recipeId && !recipeCosts.value[item.recipeId]) {
          fetchCost(item.recipeId);
        }
      }
    }
  } else {
    store.resetEditor();
  }
});

async function fetchCost(recipeId: string) {
  try {
    const cost = await recipesApi.getCost(recipeId);
    recipeCosts.value[recipeId] = cost.perPortion;
  } catch (e) {
    console.error(e);
  }
}

interface DraggableEvent {
  added?: {
    element: Recipe;
    newIndex: number;
  };
}

function handleRecipeAdd(evt: DraggableEvent) {
  if (evt.added) {
    const recipe = evt.added.element;

    // Fetch cost immediately
    fetchCost(recipe.id);

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
    console.error(error);
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
          <el-button @click="handleCancel"> 取消 </el-button>
          <el-button type="primary" :loading="store.loading" @click="handleSave">
            保存菜单
          </el-button>
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
          <span class="drag-handle-header" />
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
                <el-input v-model="element.name" size="default" />
              </div>
              <div class="col-category">
                <el-select v-model="element.category" size="default" placeholder="选择分类">
                  <el-option v-for="c in categories" :key="c" :label="c" :value="c" />
                </el-select>
              </div>
              <div class="col-price">
                <div class="price-input-group">
                  <el-input-number
                    v-model="element.price"
                    :min="0"
                    :precision="2"
                    :step="1"
                    size="default"
                    style="width: 100%"
                  />
                  <div v-if="recipeCosts[element.recipeId]" class="cost-info">
                    <el-tooltip content="单份成本 (仅供参考)" placement="top">
                      <span class="cost-tag">
                        <el-icon><InfoFilled /></el-icon>
                        ¥{{ recipeCosts[element.recipeId]?.toFixed(2) }}
                      </span>
                    </el-tooltip>
                  </div>
                </div>
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

.search-box .el-input {
  width: 100%;
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
  padding: 0 22px 10px 22px; /* Match row padding + drag handle width approx */
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
  color: #909399;
  font-weight: 600;
  gap: 12px;
}

.drag-handle-header {
  width: 20px;
}

.menu-items-list {
  flex: 1;
  overflow-y: auto;
  background-color: #fafafa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.menu-item-row {
  display: flex;
  align-items: center;
  background: white;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  gap: 12px;
  transition: all 0.2s;
}

.menu-item-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border-color: #dcdfe6;
}

.drag-handle {
  width: 20px;
  cursor: move;
  color: #909399;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.col-name {
  flex: 2;
  min-width: 0;
}

.col-category {
  flex: 1;
  min-width: 120px;
}

.col-price {
  flex: 1;
  min-width: 140px;
}

.price-input-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cost-info {
  font-size: 12px;
  color: #909399;
  display: flex;
  justify-content: flex-end;
}

.cost-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f2f5;
  padding: 2px 6px;
  border-radius: 4px;
  cursor: help;
}

.col-action {
  width: 40px;
  display: flex;
  justify-content: center;
}

.empty-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px;
  font-size: 13px;
}
</style>
