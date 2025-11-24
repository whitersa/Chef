<script setup lang="ts">
import { useIngredientsStore } from '../../stores/ingredients';
import { useRecipeStore } from '../../stores/recipe';
import draggable from 'vuedraggable';
import { computed, onMounted } from 'vue';
import BaseChart from '../../components/BaseChart.vue';

const ingredientsStore = useIngredientsStore();
const recipeStore = useRecipeStore();

onMounted(() => {
  ingredientsStore.fetchIngredients();
});

const nutritionOptions = computed(() => {
  const { protein, fat, carbs } = recipeStore.totalNutrition;
  // 如果没有数据，显示默认值避免空图表
  const hasData = protein > 0 || fat > 0 || carbs > 0;

  return {
    title: {
      text: '营养成分占比',
      left: 'center',
    },
    tooltip: {
      trigger: 'item' as const,
      formatter: '{a} <br/>{b} : {c} ({d}%)',
    },
    legend: {
      orient: 'vertical' as const,
      left: 'left',
      top: 'bottom',
    },
    series: [
      {
        name: 'Nutrition',
        type: 'pie' as const,
        radius: '50%',
        data: hasData
          ? [
              { value: parseFloat(protein.toFixed(2)), name: '蛋白质' },
              { value: parseFloat(fat.toFixed(2)), name: '脂肪' },
              { value: parseFloat(carbs.toFixed(2)), name: '碳水' },
            ]
          : [{ value: 0, name: '无数据' }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  };
});
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
      <div class="panel-header">
        <el-input
          v-model="recipeStore.name"
          placeholder="请输入菜谱名称"
          style="width: 200px; margin-right: 10px"
        />
        <el-button type="primary" @click="recipeStore.saveRecipe">保存菜谱</el-button>
      </div>
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
      <h3>数据分析</h3>
      <div class="chart-wrapper">
        <BaseChart :options="nutritionOptions" />
      </div>
      <div class="nutrition-summary" v-if="recipeStore.items.length > 0">
        <p>蛋白质: {{ recipeStore.totalNutrition.protein.toFixed(1) }}g</p>
        <p>脂肪: {{ recipeStore.totalNutrition.fat.toFixed(1) }}g</p>
        <p>碳水: {{ recipeStore.totalNutrition.carbs.toFixed(1) }}g</p>
      </div>
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

.panel-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
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

.chart-wrapper {
  height: 300px;
  width: 100%;
}

.nutrition-summary {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f9eb;
  border-radius: 4px;
  border: 1px solid #e1f3d8;
}

.nutrition-summary p {
  margin: 8px 0;
  font-size: 14px;
  color: #67c23a;
  font-weight: bold;
}
</style>
