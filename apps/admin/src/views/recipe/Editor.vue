<script setup lang="ts">
import { useIngredientsStore } from '../../stores/ingredients';
import { useRecipeStore } from '../../stores/recipe';
import { useProcessingStore } from '../../stores/processing';
import draggable from 'vuedraggable';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { Delete } from '@element-plus/icons-vue';
import BaseChart from '../../components/BaseChart.vue';

const route = useRoute();
const ingredientsStore = useIngredientsStore();
const recipeStore = useRecipeStore();
const processingStore = useProcessingStore();

// Dialog state
const dialogVisible = ref(false);
const currentIngredient = ref<any>(null);
const selectedProcessingId = ref<string>('');

onMounted(() => {
  ingredientsStore.fetchIngredients();
  processingStore.fetchMethods();
  if (route.params.id) {
    recipeStore.fetchRecipe(route.params.id as string);
  } else {
    recipeStore.resetEditor();
  }
});

function handleIngredientAdd(evt: any) {
  if (evt.added) {
    const ingredient = evt.added.element;
    // Add to recipe items first
    recipeStore.addItem(ingredient);

    // Open dialog to ask for pre-processing
    currentIngredient.value = ingredient;
    selectedProcessingId.value = ''; // Reset selection
    dialogVisible.value = true;
  }
}

function confirmProcessing() {
  if (selectedProcessingId.value && currentIngredient.value) {
    const method = processingStore.methods.find((m) => m.id === selectedProcessingId.value);
    if (method) {
      // Generate step description
      let description = method.description || `${method.name} ${currentIngredient.value.name}`;
      // Simple template replacement if needed
      description = description.replace('{ingredient}', currentIngredient.value.name);
      description = description.replace('{time}', '___'); // Placeholder

      recipeStore.preProcessing.push(description);
    }
  }
  dialogVisible.value = false;
  currentIngredient.value = null;
}

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

      <div class="scroll-container">
        <div class="section">
          <h3>配方详情 (总成本: ¥{{ recipeStore.totalCost.toFixed(2) }})</h3>
          <draggable
            :list="recipeStore.items"
            group="ingredients"
            item-key="id"
            class="recipe-canvas"
            @change="handleIngredientAdd"
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
                  <el-button
                    type="danger"
                    circle
                    size="small"
                    @click="recipeStore.removeItem(index)"
                    >x</el-button
                  >
                </div>
              </div>
            </template>
          </draggable>
        </div>

        <div class="section">
          <h3>预处理</h3>
          <div class="steps-list">
            <div v-for="(_, index) in recipeStore.preProcessing" :key="index" class="step-item">
              <span class="step-index">{{ index + 1 }}.</span>
              <el-input
                v-model="recipeStore.preProcessing[index]"
                type="textarea"
                :rows="2"
                placeholder="请输入预处理步骤"
                class="step-input"
              />
              <el-button
                type="danger"
                circle
                size="small"
                @click="recipeStore.removePreProcessing(index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button
              class="add-step-btn"
              @click="recipeStore.addPreProcessing"
              style="width: 100%; margin-top: 10px"
            >
              + 添加预处理
            </el-button>
          </div>
        </div>

        <div class="section">
          <h3>制作步骤</h3>
          <div class="steps-list">
            <div v-for="(_, index) in recipeStore.steps" :key="index" class="step-item">
              <span class="step-index">{{ index + 1 }}.</span>
              <el-input
                v-model="recipeStore.steps[index]"
                type="textarea"
                :rows="2"
                placeholder="请输入步骤描述"
                class="step-input"
              />
              <el-button type="danger" circle size="small" @click="recipeStore.removeStep(index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button
              class="add-step-btn"
              @click="recipeStore.addStep"
              style="width: 100%; margin-top: 10px"
            >
              + 添加步骤
            </el-button>
          </div>
        </div>
      </div>
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

    <!-- Dialog for Pre-processing Selection -->
    <el-dialog v-model="dialogVisible" title="选择预处理流程" width="400px">
      <p v-if="currentIngredient">
        是否为 <b>{{ currentIngredient.name }}</b> 添加预处理步骤？
      </p>
      <el-select
        v-model="selectedProcessingId"
        placeholder="请选择预处理方式"
        style="width: 100%; margin-top: 10px"
      >
        <el-option label="不进行预处理" value="" />
        <el-option
          v-for="method in processingStore.methods"
          :key="method.id"
          :label="method.name"
          :value="method.id"
        />
      </el-select>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmProcessing">确定</el-button>
        </span>
      </template>
    </el-dialog>
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

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
}

.section {
  margin-bottom: 20px;
}

.recipe-canvas {
  min-height: 150px;
  background-color: #fafafa;
  border: 2px dashed #e4e7ed;
  border-radius: 4px;
  padding: 10px;
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

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}

.step-index {
  font-weight: bold;
  margin-top: 5px;
  width: 20px;
}

.step-input {
  flex: 1;
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
