<script setup lang="ts">
import { useIngredientsStore } from '../../stores/ingredients';
import { useRecipeStore } from '../../stores/recipe';
import draggable from 'vuedraggable';

const ingredientsStore = useIngredientsStore();
const recipeStore = useRecipeStore();
</script>

<template>
  <div class="editor-container">
    <!-- 左侧：食材库 -->
    <div class="panel left-panel">
      <h3>食材库</h3>
      <draggable
        :list="ingredientsStore.ingredients"
        :group="{ name: 'ingredients', pull: 'clone', put: false }"
        :sort="false"
        item-key="id"
        class="ingredient-list"
      >
        <template #item="{ element }">
          <div class="ingredient-item">
            <span>{{ element.name }}</span>
            <span class="price">¥{{ element.price }}/{{ element.unit }}</span>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 中间：配方画布 -->
    <div class="panel center-panel">
      <h3>配方详情 (总成本: ¥{{ recipeStore.totalCost.toFixed(2) }})</h3>
      <draggable
        :list="recipeStore.items"
        group="ingredients"
        item-key="id"
        class="recipe-canvas"
        @change="
          (evt: any) => {
            if (evt.added) recipeStore.addItem(evt.added.element);
          }
        "
      >
        <template #item="{ element, index }">
          <div class="recipe-item">
            <div class="info">
              <span class="name">{{ element.name }}</span>
              <span class="cost">单价: ¥{{ element.price }}</span>
            </div>
            <div class="controls">
              <el-input-number v-model="element.quantity" :min="0" :step="0.1" size="small" />
              <span class="unit">{{ element.unit }}</span>
              <el-input-number
                v-model="element.yieldRate"
                :min="0.1"
                :max="1"
                :step="0.1"
                size="small"
                placeholder="出品率"
              />
              <el-button type="danger" circle size="small" @click="recipeStore.removeItem(index)"
                >x</el-button
              >
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <!-- 右侧：属性 (暂时留空) -->
    <div class="panel right-panel">
      <h3>属性设置</h3>
      <p>选中配方项以编辑详细属性...</p>
    </div>
  </div>
</template>

<style scoped>
.editor-container {
  display: flex;
  height: calc(100vh - 100px);
  background-color: #f5f7fa;
}

.panel {
  padding: 20px;
  background: white;
  margin: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.left-panel {
  width: 250px;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.right-panel {
  width: 300px;
}

.ingredient-list {
  min-height: 200px;
}

.ingredient-item {
  padding: 10px;
  margin-bottom: 10px;
  background-color: #ecf5ff;
  border: 1px solid #d9ecff;
  border-radius: 4px;
  cursor: move;
  display: flex;
  justify-content: space-between;
}

.recipe-canvas {
  flex: 1;
  background-color: #fafafa;
  border: 2px dashed #e4e7ed;
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}

.recipe-item {
  padding: 15px;
  margin-bottom: 10px;
  background-color: white;
  border-left: 4px solid #409eff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}
</style>
