<template>
  <ListLayout>
    <!-- 查询区域 -->
    <template #search>
      <el-form :inline="true" class="search-form">
        <el-form-item label="食材名称">
          <el-input
            v-model="searchQuery"
            placeholder="请输入食材名称"
            clearable
            @input="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch(searchQuery)"> 查询 </el-button>
          <el-button @click="handleReset"> 重置 </el-button>
        </el-form-item>
      </el-form>
    </template>

    <!-- 工具栏 -->
    <template #toolbar>
      <div class="toolbar-left">
        <el-button type="warning" plain @click="handleOpenSync">
          <el-icon class="el-icon--left"><Refresh /></el-icon>同步 USDA 数据
        </el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" @click="handleAdd">
          <el-icon class="el-icon--left"> <Plus /> </el-icon>添加食材
        </el-button>
      </div>
    </template>

    <!-- 列表区域 -->
    <el-table
      v-loading="loading"
      :data="ingredients"
      style="width: 100%; height: 100%"
      border
      @sort-change="handleSortChange"
    >
      <el-table-column label="名称" min-width="180" sortable="custom" prop="name">
        <template #default="{ row }">
          <div>
            <div>{{ row.name }}</div>
            <div v-if="row.originalName" style="font-size: 12px; color: #909399">
              {{ row.originalName }}
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="stockQuantity" label="库存" width="120" sortable="custom">
        <template #default="scope">
          <el-tag :type="scope.row.stockQuantity > 0 ? 'success' : 'danger'">
            {{ scope.row.stockQuantity || 0 }} {{ scope.row.stockUnit || scope.row.unit }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="单价" width="180" sortable="custom">
        <template #default="scope"> ¥{{ scope.row.price }} </template>
      </el-table-column>
      <el-table-column prop="unit" label="单位" width="100" />
      <el-table-column label="营养成分" width="100" align="center">
        <template #default="scope">
          <el-popover placement="left" :width="580" trigger="hover" :show-arrow="true" :offset="25">
            <template #reference>
              <el-tag class="nutrition-trigger" size="small" effect="plain" round>
                <el-icon><DataAnalysis /></el-icon>
                <span>营养</span>
              </el-tag>
            </template>
            <div class="nutrition-card">
              <div class="card-header">
                <div class="title-wrapper">
                  <el-icon class="header-icon"><TrendCharts /></el-icon>
                  <span class="title">营养成分表</span>
                </div>
                <div class="subtitle-tag">每 100g 含量</div>
              </div>
              <div class="card-body">
                <!-- 固定主要元素区 -->
                <div class="nutrient-grid fixed-core">
                  <template
                    v-for="key in getSortedNutrients(scope.row.nutrition).filter((k) => isCore(k))"
                    :key="key"
                  >
                    <div class="nutrient-row is-core">
                      <div class="nutrient-label">
                        <span
                          class="dot"
                          :style="{
                            backgroundColor: getNutrientColor(translateNutrient(String(key))),
                          }"
                        />
                        <span class="label-text">{{ translateNutrient(String(key)) }}</span>
                      </div>
                      <div class="nutrient-value-container">
                        <span class="nutrient-value">
                          {{
                            (() => {
                              const val = scope.row.nutrition[key];
                              const amount =
                                val && typeof val === 'object'
                                  ? 'amount' in val
                                    ? val.amount
                                    : 'value' in val
                                      ? val.value
                                      : 0
                                  : val;
                              return Number(amount).toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              });
                            })()
                          }}
                        </span>
                        <span class="nutrient-unit">
                          {{
                            (scope.row.nutrition[key] &&
                            typeof scope.row.nutrition[key] === 'object' &&
                            'unit' in scope.row.nutrition[key]
                              ? scope.row.nutrition[key].unit
                              : 'g'
                            ).toLowerCase()
                          }}
                        </span>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- 滚动详细元素区 -->
                <div v-if="getSortedNutrients(scope.row.nutrition).some((k) => !isCore(k))">
                  <div class="nutrient-divider" />
                  <div class="scroll-wrapper">
                    <div class="nutrient-grid">
                      <template
                        v-for="key in getSortedNutrients(scope.row.nutrition).filter(
                          (k) => !isCore(k),
                        )"
                        :key="key"
                      >
                        <div class="nutrient-row">
                          <div class="nutrient-label">
                            <span
                              class="dot"
                              :style="{
                                backgroundColor: getNutrientColor(translateNutrient(String(key))),
                              }"
                            />
                            <span class="label-text">{{ translateNutrient(String(key)) }}</span>
                          </div>
                          <div class="nutrient-value-container">
                            <span class="nutrient-value">
                              {{
                                (() => {
                                  const val = scope.row.nutrition[key];
                                  const amount =
                                    val && typeof val === 'object'
                                      ? 'amount' in val
                                        ? val.amount
                                        : 'value' in val
                                          ? val.value
                                          : 0
                                      : val;
                                  return Number(amount).toLocaleString(undefined, {
                                    maximumFractionDigits: 2,
                                  });
                                })()
                              }}
                            </span>
                            <span class="nutrient-unit">
                              {{
                                (scope.row.nutrition[key] &&
                                typeof scope.row.nutrition[key] === 'object' &&
                                'unit' in scope.row.nutrition[key]
                                  ? scope.row.nutrition[key].unit
                                  : 'g'
                                ).toLowerCase()
                              }}
                            </span>
                          </div>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>

                <div
                  v-if="!scope.row.nutrition || Object.keys(scope.row.nutrition).length === 0"
                  class="no-data"
                >
                  暂无数据
                </div>
              </div>
            </div>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-popconfirm title="确定要删除吗?" @confirm="handleDelete(scope.row.id)">
            <template #reference>
              <el-button link type="danger" size="small"> 删除 </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <template #pagination>
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.limit"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </template>

    <!-- 弹窗 -->
    <template #extra>
      <el-dialog
        v-model="dialogVisible"
        :title="isEdit ? '编辑食材' : '添加食材'"
        width="30%"
        @close="resetForm"
      >
        <el-form :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="单价">
            <el-input-number v-model="form.price" :min="0" :precision="2" />
          </el-form-item>
          <el-form-item label="单位">
            <el-select
              v-model="form.unit"
              placeholder="请选择单位"
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
          </el-form-item>
          <el-divider content-position="left"> 营养成分 (每100g) </el-divider>
          <el-form-item label="蛋白质">
            <el-input-number v-model="form.nutrition['蛋白质'].amount" :min="0" :precision="1" />
            <span style="margin-left: 8px">g</span>
          </el-form-item>
          <el-form-item label="脂肪">
            <el-input-number v-model="form.nutrition['脂肪'].amount" :min="0" :precision="1" />
            <span style="margin-left: 8px">g</span>
          </el-form-item>
          <el-form-item label="碳水">
            <el-input-number
              v-model="form.nutrition['碳水化合物'].amount"
              :min="0"
              :precision="1"
            />
            <span style="margin-left: 8px">g</span>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSubmit">确定</el-button>
          </span>
        </template>
      </el-dialog>

      <!-- Sync Dialog -->
      <el-dialog v-model="syncDialogVisible" title="同步 USDA 数据" width="30%">
        <div style="margin-bottom: 20px">
          <p>USDA 数据量巨大，为了防止请求超时或触发限流，请按页码分批拉取。</p>
          <p style="color: #909399; font-size: 12px">每页约拉取 20 条最基础的食材数据。</p>
        </div>

        <el-form label-width="100px">
          <el-form-item label="拉取页码">
            <el-input-number v-model="syncPage" :min="1" />
          </el-form-item>
        </el-form>

        <template #footer>
          <span class="dialog-footer">
            <el-button @click="syncDialogVisible = false">取消</el-button>
            <el-button type="primary" :loading="syncLoading" @click="handleSync">
              开始同步
            </el-button>
          </span>
        </template>
      </el-dialog>
    </template>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useIngredientsStore, type Ingredient } from '@/stores/ingredients';
import { storeToRefs } from 'pinia';
import { ElMessage } from 'element-plus';
import { useListFilter } from '@/composables/useListFilter';
import { getUnits } from '@/api/units';
import type { Unit } from '@chefos/types';

interface NutrientValue {
  amount?: number | string;
  value?: number | string;
  unit?: string;
}

const ingredientsStore = useIngredientsStore();
const { ingredients, loading, pagination } = storeToRefs(ingredientsStore);

const {
  searchQuery,
  handleSearch,
  handleReset,
  handlePageChange,
  handleSizeChange,
  handleSortChange,
} = useListFilter(ingredientsStore);

const units = ref<Unit[]>([]);

const dialogVisible = ref(false);
const isEdit = ref(false);
const currentId = ref('');

const form = reactive({
  name: '',
  price: 0,
  unit: 'kg',
  nutrition: {
    蛋白质: { amount: 0, unit: 'g' },
    脂肪: { amount: 0, unit: 'g' },
    碳水化合物: { amount: 0, unit: 'g' },
  } as {
    蛋白质: { amount: number; unit: string };
    脂肪: { amount: number; unit: string };
    碳水化合物: { amount: number; unit: string };
  } & Record<string, { amount: number; unit: string }>,
});

onMounted(async () => {
  ingredientsStore.fetchIngredients();
  try {
    units.value = await getUnits();
  } catch (error) {
    console.error('Failed to fetch units:', error);
  }
});

const handleAdd = () => {
  isEdit.value = false;
  resetForm();
  dialogVisible.value = true;
};

const handleEdit = (row: Ingredient) => {
  isEdit.value = true;
  currentId.value = row.id;
  form.name = row.name;
  form.price = row.price;
  form.unit = row.unit;

  // Safe extraction for the main form fields
  const n = row.nutrition || {};
  const getVal = (keys: string[]) => {
    for (const k of keys) {
      if (n[k] !== undefined) {
        const v = n[k];
        return typeof v === 'object' ? (v.amount ?? v.value ?? 0) : v;
      }
    }
    return 0;
  };

  form.nutrition = {
    蛋白质: { amount: getVal(['蛋白质', 'Protein', 'protein']), unit: 'g' },
    脂肪: { amount: getVal(['脂肪', 'Fat', 'fat']), unit: 'g' },
    碳水化合物: {
      amount: getVal(['碳水化合物', 'Carbohydrates', 'carbs', 'Carbohydrate, by difference']),
      unit: 'g',
    },
  };
  dialogVisible.value = true;
};

const handleDelete = async (id: string) => {
  try {
    await ingredientsStore.deleteIngredient(id);
    ElMessage.success('删除成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('删除失败');
  }
};

const handleSubmit = async () => {
  if (!form.name) {
    ElMessage.warning('请输入名称');
    return;
  }

  try {
    if (isEdit.value) {
      await ingredientsStore.updateIngredient(currentId.value, { ...form });
      ElMessage.success('更新成功');
    } else {
      await ingredientsStore.createIngredient({ ...form });
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
  } catch (error) {
    console.error(error);
    ElMessage.error(isEdit.value ? '更新失败' : '添加失败');
  }
};

const resetForm = () => {
  form.name = '';
  form.price = 0;
  form.unit = 'kg';
  form.nutrition = {
    蛋白质: { amount: 0, unit: 'g' },
    脂肪: { amount: 0, unit: 'g' },
    碳水化合物: { amount: 0, unit: 'g' },
  };
};

const getNutrientColor = (key: string) => {
  const map: Record<string, string> = {
    蛋白质: '#409eff', // 蓝色
    'Total lipid (fat)': '#f56c6c',
    脂肪: '#f56c6c', // 红色
    '脂肪 (总计)': '#f56c6c',
    碳水化合物: '#e6a23c', // 橙色
    'Carbohydrate, by difference': '#e6a23c',
    '能量 (kcal)': '#67c23a', // 绿色
    '能量 (kJ)': '#67c23a',
    '能量 (常规)': '#67c23a',
    '能量 (特定)': '#67c23a',
    Energy: '#67c23a',
    能量: '#67c23a',
    膳食纤维: '#95d475',
    '糖 (总计)': '#eebe77',
    钠: '#909399',
    钙: '#a0cfff',
    铁: '#fab6b6',
  };
  // 模糊匹配
  if (map[key]) return map[key];
  if (key.includes('能量') || key.includes('Energy')) return '#67c23a';
  if (key.includes('脂肪') || key.includes('Fat')) return '#f56c6c';
  if (key.includes('蛋白质') || key.includes('Protein')) return '#409eff';
  if (key.includes('碳水') || key.includes('Carbohydrate')) return '#e6a23c';

  return '#c8c9cc';
};

const isNutrientValid = (value: number | NutrientValue | undefined | null) => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'object') {
    return Number(value.amount) > 0 || Number(value.value) > 0;
  }
  return false;
};

const NUTRIENT_TRANSLATIONS: Record<string, string> = {
  Protein: '蛋白质',
  'Total lipid (fat)': '脂肪',
  Fat: '脂肪',
  'Carbohydrate, by difference': '碳水化合物',
  Carbohydrates: '碳水化合物',
  Energy: '能量',
  'Energy (Atwater General Factors)': '能量 (常规)',
  'Energy (Atwater Specific Factors)': '能量 (特定)',
  'Fiber, total dietary': '膳食纤维',
  Fiber: '纤维',
  'Sugars, total including NLEA': '总量糖',
  Sugar: '糖',
  'Folate, total': '总叶酸',
  'Fatty acids, total saturated': '饱和脂肪',
  'Fatty acids, total monounsaturated': '单不饱和脂肪',
  'Fatty acids, total polyunsaturated': '多不饱和脂肪',
  'Sodium, Na': '钠',
  'Potassium, K': '钾',
  'Calcium, Ca': '钙',
  'Iron, Fe': '铁',
  'Magnesium, Mg': '镁',
  'Phosphorus, P': '磷',
  'Zinc, Zn': '锌',
  'Copper, Cu': '铜',
  'Manganese, Mn': '锰',
  'Selenium, Se': '硒',
  'Vitamin C, total ascorbic acid': '维生素 C',
  Thiamin: '维生素 B1',
  Riboflavin: '维生素 B2',
  Niacin: '维生素 B3',
  'Pantothenic acid': '维生素 B5',
  'Vitamin B-6': '维生素 B6',
  'Folate, DFE': '叶酸 (DFE)',
  'Vitamin B-12': '维生素 B12',
  'Vitamin A, RAE': '维生素 A (RAE)',
  'Vitamin E (alpha-tocopherol)': '维生素 E',
  'Vitamin D (D2 + D3)': '维生素 D',
  'Vitamin K (phylloquinone)': '维生素 K',
  Ash: '灰分',
  Water: '水分',
  Nitrogen: '氮',
  Biotin: '生物素',
  Cholesterol: '胆固醇',
  'Malic acid': '苹果酸',
  'Citric acid': '柠檬酸',
  'Tartaric acid': '酒石酸',
  'Quinic acid': '奎宁酸',
  'Oxalic acid': '草酸',
  Galactose: '半乳糖',
  Lactose: '乳糖',
  Maltose: '麦芽糖',
  Starch: '淀粉',
  'Total Sugars': '总糖',
  'Fatty acids, total trans': '反式脂肪',
  // 'Fatty acids, total saturated': '饱和脂肪', 已在上方定义
  Alanine: '丙氨酸',
  Arginine: '精氨酸',
  AsparticAcid: '天冬氨酸',
  Cysteine: '半胱氨酸',
  GlutamicAcid: '谷氨酸',
  Glycine: '甘氨酸',
  Histidine: '组氨酸',
  Isoleucine: '异亮氨酸',
  Leucine: '亮氨酸',
  Lysine: '赖氨酸',
  Methionine: '蛋氨酸',
  Phenylalanine: '苯丙氨酸',
  Proline: '脯氨酸',
  Serine: '丝氨酸',
  Threonine: '苏氨酸',
  Tryptophan: '色氨酸',
  Tyrosine: '酪氨酸',
  Valine: '缬氨酸',
};

const translateNutrient = (key: string) => {
  return NUTRIENT_TRANSLATIONS[key] || key;
};

const CORE_NUTRIENTS = [
  '能量 (kcal)',
  '能量 (kJ)',
  '能量 (常规)',
  '能量 (特定)',
  '蛋白质',
  '脂肪',
  '脂肪 (总计)',
  'Total lipid (fat)',
  '碳水化合物',
  'Carbohydrate, by difference',
  'Energy',
  'Protein',
  'Fat',
  'Carbohydrates',
];

const isCore = (key: string) => {
  return CORE_NUTRIENTS.includes(key) || CORE_NUTRIENTS.includes(translateNutrient(key));
};

const getSortedNutrients = (nutrition: Record<string, number | NutrientValue>) => {
  const keys = Object.keys(nutrition || {}).filter((k) => isNutrientValid(nutrition[k]));
  return keys.sort((a, b) => {
    const aName = translateNutrient(a);
    const bName = translateNutrient(b);
    const aIdx =
      CORE_NUTRIENTS.indexOf(aName) !== -1
        ? CORE_NUTRIENTS.indexOf(aName)
        : CORE_NUTRIENTS.indexOf(a);
    const bIdx =
      CORE_NUTRIENTS.indexOf(bName) !== -1
        ? CORE_NUTRIENTS.indexOf(bName)
        : CORE_NUTRIENTS.indexOf(b);

    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return aName.localeCompare(bName);
  });
};

// Sync USDA Logic
const syncDialogVisible = ref(false);
const syncPage = ref(1);
const syncLoading = ref(false);

const handleOpenSync = () => {
  syncDialogVisible.value = true;
};

const handleSync = async () => {
  if (syncPage.value < 1) {
    ElMessage.warning('页码必须大于0');
    return;
  }

  syncLoading.value = true;
  try {
    const res = await ingredientsStore.syncUsda(syncPage.value);
    ElMessage.success(`同步成功，共获取 ${res.count} 条数据`);
    syncDialogVisible.value = false;
    // Auto increment for next time
    syncPage.value++;
  } catch (error) {
    console.error(error);
    ElMessage.error('同步失败，请检查网络或 Key 配置');
  } finally {
    syncLoading.value = false;
  }
};
</script>

<style scoped>
.nutrition-trigger {
  cursor: pointer;
  border: none;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
  height: 24px;
  padding: 0 12px;
}

.nutrition-trigger:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nutrition-card {
  padding: 4px 2px;
}

.scroll-wrapper {
  max-height: 480px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 8px 12px 12px 10px;
  position: relative;
  scrollbar-width: thin;
}

.nutrient-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  column-gap: 32px;
  width: 100%;
  box-sizing: border-box;
  align-items: start;
  position: relative;
}

/* Vertical divider for the grid */
.nutrient-grid::after {
  content: '';
  position: absolute;
  top: 5px;
  bottom: 5px;
  left: 50%;
  width: 1px;
  background-color: var(--el-border-color-extra-light);
  transform: translateX(-50%);
  pointer-events: none;
  opacity: 0.6;
}

.fixed-core {
  margin-bottom: 2px;
  padding: 4px 12px;
  background-color: var(--el-fill-color-blank);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.fixed-core::after {
  display: none; /* No divider for the core section */
}

/* Custom Scrollbar for better look */
.scroll-wrapper::-webkit-scrollbar {
  width: 5px;
}
.scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--el-border-color-lighter);
  border-radius: 4px;
}

.no-data {
  text-align: center;
  padding: 24px 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -4px -2px 8px -2px;
  padding: 10px 16px;
  background-color: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-radius: 4px 4px 0 0;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}

.card-header .title {
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-size: 13px;
  letter-spacing: 0.5px;
}

.subtitle-tag {
  font-size: 10px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-blank);
  padding: 1px 8px;
  border-radius: 10px;
  border: 1px solid var(--el-border-color-lighter);
}

.nutrient-divider {
  height: 1px;
  background-color: var(--el-border-color-lighter);
  margin: 8px 0 12px 0;
  position: relative;
}

.nutrient-divider::before {
  content: '详细成分';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 0 10px;
  font-size: 10px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  letter-spacing: 1px;
}

.nutrient-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  gap: 8px;
  position: relative;
}

.nutrient-row:hover {
  background-color: var(--el-fill-color-light);
}

.nutrient-row.is-core {
  font-size: 13px;
  padding: 6px 12px;
  margin-bottom: 4px;
  grid-column: span 2;
  background-color: var(--el-fill-color-extra-light);
  border: none;
}

.nutrient-row.is-core:hover {
  background-color: var(--el-fill-color-light);
}

.nutrient-row.is-core .nutrient-label .label-text {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.nutrient-row.is-core .nutrient-value {
  color: var(--el-color-primary);
  font-size: 15px;
}

.nutrient-row.is-core .nutrient-unit {
  color: var(--el-text-color-regular);
}

.nutrient-row:last-child {
  margin-bottom: 0;
}

.nutrient-label {
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
  flex: 1;
  min-width: 0;
}

.label-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 400;
}

.nutrient-value-container {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  min-width: 85px;
  justify-content: flex-end;
}

.nutrient-value {
  font-family: inherit;
  font-weight: 600;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
}

.nutrient-unit {
  font-size: 10px;
  color: var(--el-text-color-placeholder);
  font-weight: 400;
  width: 25px;
  text-align: left;
}

.dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 8px;
  flex-shrink: 0;
  position: relative;
}

.dot::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 50%;
  opacity: 0.2;
  background-color: inherit;
}
</style>
