<script setup lang="ts">
import { useIngredientsStore } from '../../stores/ingredients';
import { useRecipeStore, type RecipeItem } from '../../stores/recipe';
import { useProcessingStore } from '../../stores/processing';
import { getUnits } from '../../api/units';
import type { Unit } from '@chefos/types';
import type { EChartsOption } from 'echarts';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseChart from '../../components/BaseChart.vue';
import IconTrash from '../../components/icons/IconTrash.vue';

const route = useRoute();
const ingredientsStore = useIngredientsStore();
const recipeStore = useRecipeStore();
const processingStore = useProcessingStore();

const activeTab = ref('ingredients');
const units = ref<Unit[]>([]);

// Dialog state
const dialogVisible = ref(false);
const currentIngredient = ref<RecipeItem | null>(null);
const selectedProcessingId = ref<string>('');

onMounted(async () => {
  ingredientsStore.fetchIngredients();
  processingStore.fetchMethods();
  try {
    units.value = await getUnits();
  } catch (error) {
    console.error('Failed to fetch units:', error);
  }

  if (route.params.id) {
    recipeStore.fetchRecipe(route.params.id as string);
  } else {
    recipeStore.resetEditor();
  }
});

interface DraggableChangeEvent {
  added?: {
    element: {
      id: string;
      name: string;
      unit: string;
      price: number;
      nutrition?: Record<string, { amount: number; unit: string }>;
      items?: unknown[];
    };
    newIndex: number;
  };
}

function handleIngredientAdd(evt: DraggableChangeEvent) {
  if (evt.added) {
    const { element, newIndex } = evt.added;
    const isRecipe = element.items !== undefined;

    // Construct the new item based on store logic
    const newItem = {
      id: crypto.randomUUID(),
      ingredientId: isRecipe ? undefined : element.id,
      childRecipeId: isRecipe ? element.id : undefined,
      name: element.name,
      quantity: 1,
      unit: isRecipe ? 'batch' : element.unit,
      price: isRecipe ? 0 : element.price,
      yieldRate: 1.0,
      nutrition: element.nutrition || {},
    };

    // Replace the raw item with the initialized item
    recipeStore.items[newIndex] = newItem;

    if (!isRecipe) {
      // Open dialog to ask for pre-processing
      currentIngredient.value = newItem;
      selectedProcessingId.value = ''; // Reset selection
      dialogVisible.value = true;
    }
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

      recipeStore.preProcessing.push({
        description,
        type: 'mandatory',
      });
    }
  }
  dialogVisible.value = false;
  currentIngredient.value = null;
}

const nutritionOptions = computed<EChartsOption>(() => {
  const nutrition = recipeStore.totalNutrition;
  const keys = Object.keys(nutrition);
  const hasData = keys.some((k) => nutrition[k] > 0);

  const data = keys
    .map((key) => ({
      value: parseFloat(nutrition[key].toFixed(2)),
      name: key,
      itemStyle: { color: getNutrientColorInChart(key) },
    }))
    .filter((d) => d.value > 0);

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}g ({d}%)',
    },
    legend: {
      top: '0%',
      left: 'center',
      icon: 'circle',
      type: 'scroll',
    },
    series: [
      {
        name: 'Nutrition',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '60%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 5,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: hasData ? data : [{ value: 0, name: '无数据', itemStyle: { color: '#f4f4f5' } }], // Zinc 100
      },
    ],
  };
});

function getNutrientColorInChart(key: string) {
  const map: Record<string, string> = {
    Protein: '#e6a23c', // Orange
    Fat: '#f56c6c', // Red
    Carbohydrates: '#409eff', // Blue
    Energy: '#67c23a', // Green
    Fiber: '#a0cfff',
    Sugar: '#f3d19e',
    Sodium: '#d9d9d9',
  };
  if (map[key]) return map[key];

  // Hash string to color for others
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = key.charCodeAt(i) + ((hash << 5) - hash);
  }
  const c = (hash & 0x00ffffff).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
}
</script>

<template>
  <div class="editor-container">
    <div class="main-area">
      <!-- 左侧：食材库 -->
      <div class="panel left-panel">
        <el-tabs v-model="activeTab" class="left-tabs">
          <el-tab-pane label="食材库" name="ingredients">
            <div class="search-box">
              <el-input
                v-model="ingredientsStore.search"
                placeholder="搜索食材..."
                size="small"
                @input="ingredientsStore.setSearch"
              />
            </div>
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
          </el-tab-pane>
          <el-tab-pane label="菜谱库" name="recipes">
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
              :group="{ name: 'ingredients', pull: 'clone', put: false }"
              :sort="false"
              item-key="id"
              class="ingredient-list"
            >
              <template #item="{ element }">
                <div class="ingredient-item recipe-source">
                  <span>{{ element.name }}</span>
                  <span class="tag">半成品</span>
                </div>
              </template>
            </draggable>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 中间：配方画布 -->
      <div class="panel center-panel">
        <div class="scroll-container">
          <div class="section">
            <h3>基本信息</h3>
            <div class="form-row">
              <div class="form-item">
                <label>出品数量</label>
                <el-input-number
                  v-model="recipeStore.yieldQuantity"
                  :min="0.1"
                  :step="1"
                  size="default"
                  style="width: 120px"
                />
              </div>
              <div class="form-item">
                <label>单位</label>
                <el-select
                  v-model="recipeStore.yieldUnit"
                  placeholder="份/kg"
                  size="default"
                  style="width: 100px"
                  filterable
                  allow-create
                  default-first-option
                >
                  <el-option
                    v-for="item in units"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </div>
              <div class="form-item">
                <label>预估人工(¥)</label>
                <el-input-number
                  v-model="recipeStore.laborCost"
                  :min="0"
                  :step="1"
                  size="default"
                  style="width: 120px"
                />
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-header">
              <h3>配方详情</h3>
              <div class="cost-summary">
                <el-tag type="info" effect="plain">
                  总成本: ¥{{ recipeStore.totalCost.toFixed(2) }}
                </el-tag>
                <el-tag type="success" effect="plain">
                  单份: ¥{{ recipeStore.costPerPortion.toFixed(2) }}
                </el-tag>
              </div>
            </div>
            <draggable
              :list="recipeStore.items"
              group="ingredients"
              item-key="id"
              class="recipe-canvas"
              handle=".drag-handle"
              @change="handleIngredientAdd"
            >
              <template #item="{ element, index }">
                <div class="recipe-item">
                  <div class="drag-handle">⋮⋮</div>
                  <div class="info">
                    <span class="name">{{ element.name }}</span>
                    <span class="cost">单价: ¥{{ element.price }}</span>
                  </div>
                  <div class="controls">
                    <div class="control-group">
                      <span class="label">用量</span>
                      <el-input-number
                        v-model="element.quantity"
                        :min="0"
                        :step="0.1"
                        size="small"
                        style="width: 100px"
                      />
                      <span class="unit-text">{{ element.unit }}</span>
                    </div>
                    <div class="control-group">
                      <span class="label">出品率</span>
                      <el-input-number
                        v-model="element.yieldRate"
                        :min="0.1"
                        :max="1"
                        :step="0.1"
                        size="small"
                        placeholder="出品率"
                        style="width: 90px"
                      />
                    </div>
                    <el-button
                      link
                      size="small"
                      :icon="IconTrash"
                      class="delete-btn"
                      @click="recipeStore.removeItem(index)"
                    />
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <div class="section">
            <h3>预处理</h3>
            <div class="steps-list">
              <div
                v-for="(step, index) in recipeStore.preProcessing"
                :key="index"
                class="step-item"
              >
                <span class="step-index">{{ index + 1 }}.</span>
                <div
                  class="step-content"
                  style="flex: 1; display: flex; flex-direction: column; gap: 8px"
                >
                  <el-input
                    v-model="step.description"
                    type="textarea"
                    :rows="2"
                    placeholder="请输入预处理步骤"
                  />
                  <el-radio-group v-model="step.type" size="small">
                    <el-radio-button label="mandatory">必要</el-radio-button>
                    <el-radio-button label="recommended">推荐</el-radio-button>
                    <el-radio-button label="optional">可选</el-radio-button>
                  </el-radio-group>
                </div>
                <el-button
                  link
                  size="small"
                  class="delete-btn"
                  @click="recipeStore.removePreProcessing(index)"
                >
                  <el-icon><IconTrash /></el-icon>
                </el-button>
              </div>
              <el-button
                class="add-step-btn"
                style="width: 100%; margin-top: 10px"
                @click="recipeStore.addPreProcessing"
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
                <el-button
                  link
                  size="small"
                  class="delete-btn"
                  @click="recipeStore.removeStep(index)"
                >
                  <el-icon><IconTrash /></el-icon>
                </el-button>
              </div>
              <el-button
                class="add-step-btn"
                style="width: 100%; margin-top: 10px"
                @click="recipeStore.addStep"
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
        <div v-if="recipeStore.items.length > 0" class="nutrition-summary">
          <p v-for="(value, key) in recipeStore.totalNutrition" :key="key">
            <span v-if="value > 0">{{ key }}: {{ value.toFixed(1) }}g</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 底部固定栏 -->
    <div class="bottom-bar">
      <div class="bar-left">
        <el-input v-model="recipeStore.name" placeholder="请输入菜谱名称" style="width: 200px" />
      </div>
      <div class="bar-right">
        <el-button type="primary" @click="recipeStore.saveRecipe"> 保存菜谱 </el-button>
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
  flex-direction: column;
  height: 100%;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.panel {
  padding: 15px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.left-panel {
  width: 240px;
  border-right: 1px solid #ebeef5;
  background-color: #fcfcfc;
}

.center-panel {
  flex: 1;
  padding: 0; /* Scroll container handles padding */
  position: relative;
}

.right-panel {
  width: 280px;
  border-left: 1px solid #ebeef5;
  background-color: #fcfcfc;
}

.bottom-bar {
  height: 60px;
  border-top: 1px solid #ebeef5;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  z-index: 10;
  gap: 20px;
}

.bar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  font-size: 14px;
  color: #606266;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  height: 100%;
}

.ingredient-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0; /* Allow flex item to shrink */
}

.ingredient-item {
  padding: 8px 10px;
  margin-bottom: 8px;
  background-color: white;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  cursor: move;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: all 0.2s;
}

.ingredient-item:hover {
  background-color: var(--el-fill-color-light);
  border-color: var(--el-border-color);
  color: var(--el-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.ingredient-item .price {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.search-box {
  margin-bottom: 10px;
  padding: 0 5px;
}

.search-box .el-input {
  width: 100%;
  max-width: none; /* Override global restriction */
}

/* Remove old panel styles */
.panel h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 10px;
  line-height: 1.2;
}

.section {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.section-header h3 {
  margin: 0;
  border: none;
  padding: 0;
}

.cost-summary {
  display: flex;
  gap: 8px;
}

.recipe-canvas {
  min-height: 150px;
  background-color: var(--el-fill-color-lighter);
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  padding: 10px;
}

.recipe-item {
  padding: 12px;
  margin-bottom: 8px;
  background-color: white;
  border-left: 3px solid var(--el-color-primary);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  transition: all 0.2s;
}

.recipe-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.drag-handle {
  cursor: move;
  color: var(--el-text-color-placeholder);
  margin-right: 12px;
  font-size: 14px;
  line-height: 1;
}

.recipe-item .info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.recipe-item .name {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 14px;
}

.recipe-item .cost {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.form-row {
  display: flex;
  gap: 20px;
  align-items: center;
  background-color: var(--el-fill-color-light);
  padding: 15px;
  border-radius: 4px;
}

.form-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.form-item label {
  font-size: 13px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  white-space: nowrap;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  background: var(--el-fill-color-lighter);
  padding: 10px;
  border-radius: 4px;
}

.step-index {
  font-weight: 700;
  margin-top: 6px;
  width: 24px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.step-input {
  flex: 1;
}

.controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.control-group .label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.unit-text {
  color: var(--el-text-color-regular);
  font-size: 12px;
  width: 30px;
}

.delete-btn {
  margin-left: 8px;
  color: var(--el-text-color-placeholder) !important;
  transition: color 0.2s;
}

.delete-btn:hover {
  color: var(--el-color-danger) !important;
  background-color: transparent !important;
}

/* Hide textarea resize handle */
:deep(.el-textarea__inner) {
  resize: none;
}

.chart-wrapper {
  height: 260px;
  width: 100%;
}

.nutrition-summary {
  margin-top: 12px;
  padding: 8px;
  background-color: var(--el-fill-color-light);
  border-radius: 2px;
  border: 1px solid var(--el-border-color);
}

.nutrition-summary p {
  margin: 4px 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}

.el-input-number {
  max-width: 120px;
}

/* Remove global max-width for el-input to fix search box */
/* .el-input { max-width: 100px; } */

.form-row .el-input {
  max-width: 100px;
}
</style>
