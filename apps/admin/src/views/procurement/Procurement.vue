<template>
  <div class="procurement-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>采购清单生成</span>
          <div class="header-actions">
            <el-button @click="showHistory">
              历史记录
            </el-button>
            <el-button
              type="primary"
              :loading="loading"
              @click="generateList"
            >
              生成清单
            </el-button>
          </div>
        </div>
      </template>

      <div class="input-section">
        <el-tabs
          v-model="activeTab"
          class="demo-tabs"
        >
          <el-tab-pane
            label="按菜谱添加"
            name="recipe"
          >
            <el-form :inline="true">
              <el-form-item label="添加菜谱">
                <el-select
                  v-model="selectedRecipeId"
                  filterable
                  remote
                  placeholder="搜索菜谱"
                  :remote-method="searchRecipes"
                  :loading="searchLoading"
                  style="width: 300px"
                >
                  <el-option
                    v-for="item in recipeOptions"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  :disabled="!selectedRecipeId"
                  @click="addRecipe"
                >
                  添加
                </el-button>
              </el-form-item>
            </el-form>

            <el-table
              :data="requestItems"
              style="width: 100%; margin-bottom: 20px"
              border
            >
              <el-table-column
                prop="recipeName"
                label="菜谱名称"
              />
              <el-table-column
                label="数量 (批次)"
                width="200"
              >
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.quantity"
                    :min="0.1"
                    :step="0.5"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
              >
                <template #default="scope">
                  <el-button
                    type="danger"
                    link
                    @click="removeRecipe(scope.$index)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>

          <el-tab-pane
            label="按销售菜单添加"
            name="menu"
          >
            <el-form :inline="true">
              <el-form-item label="添加菜单">
                <el-select
                  v-model="selectedMenuId"
                  filterable
                  placeholder="选择销售菜单"
                  style="width: 300px"
                >
                  <el-option
                    v-for="item in salesMenuStore.menus"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id"
                  />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  :disabled="!selectedMenuId"
                  @click="addMenu"
                >
                  添加
                </el-button>
              </el-form-item>
            </el-form>

            <el-table
              :data="menuRequestItems"
              style="width: 100%; margin-bottom: 20px"
              border
            >
              <el-table-column
                prop="menuName"
                label="菜单名称"
              />
              <el-table-column
                label="数量 (份)"
                width="200"
              >
                <template #default="scope">
                  <el-input-number
                    v-model="scope.row.quantity"
                    :min="1"
                    :step="1"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                width="100"
              >
                <template #default="scope">
                  <el-button
                    type="danger"
                    link
                    @click="removeMenu(scope.$index)"
                  >
                    移除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div
        v-if="resultList.length > 0"
        class="result-section"
      >
        <div class="result-header">
          <el-divider content-position="left">
            采购清单结果
          </el-divider>
          <el-button
            type="success"
            :loading="saving"
            @click="saveProcurement"
          >
            保存采购单
          </el-button>
        </div>
        <el-table
          :data="resultList"
          border
          show-summary
          sum-text="总计"
        >
          <el-table-column
            prop="name"
            label="食材名称"
          />
          <el-table-column
            prop="quantity"
            label="需求数量"
          >
            <template #default="scope">
              {{ scope.row.quantity }} {{ scope.row.unit }}
            </template>
          </el-table-column>
          <el-table-column
            prop="estimatedCost"
            label="预估成本"
            sortable
          >
            <template #default="scope">
              ¥{{ scope.row.estimatedCost }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <!-- History Dialog -->
    <el-dialog
      v-model="historyVisible"
      title="采购历史"
      width="900px"
    >
      <el-table
        v-loading="historyLoading"
        :data="historyList"
        border
        stripe
      >
        <el-table-column
          prop="createdAt"
          label="创建时间"
          width="180"
        >
          <template #default="{ row }">
            {{ new Date(row.createdAt).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column
          prop="totalPrice"
          label="总金额"
        >
          <template #default="{ row }">
            ¥{{ row.totalPrice }}
          </template>
        </el-table-column>
        <el-table-column
          prop="status"
          label="状态"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="200"
        >
          <template #default="{ row }">
            <el-button
              size="small"
              @click="viewDetail(row)"
            >
              详情
            </el-button>
            <el-popconfirm
              v-if="row.status === 'PENDING'"
              title="确认完成采购？这将更新库存。"
              @confirm="completeProcurement(row)"
            >
              <template #reference>
                <el-button
                  size="small"
                  type="success"
                >
                  完成
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailVisible"
      title="采购单详情"
      width="700px"
    >
      <el-table
        :data="currentDetail?.items || []"
        border
        show-summary
      >
        <el-table-column
          prop="ingredient.name"
          label="食材"
        />
        <el-table-column
          prop="quantity"
          label="数量"
        >
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        <el-table-column
          prop="cost"
          label="成本"
        >
          <template #default="{ row }">
            ¥{{ row.cost }}
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { recipesApi, type Recipe } from '@/api/recipes';
import {
  procurementApi,
  type ProcurementItem,
  type Procurement,
  ProcurementStatus,
} from '@/api/procurement';
import { useSalesMenuStore } from '@/stores/sales-menu';
import { ElMessage } from 'element-plus';

interface RequestItem {
  recipeId: string;
  recipeName: string;
  quantity: number;
}

interface MenuRequestItem {
  menuId: string;
  menuName: string;
  quantity: number;
}

const loading = ref(false);
const saving = ref(false);
const searchLoading = ref(false);
const activeTab = ref('recipe');

// Recipe Tab State
const selectedRecipeId = ref('');
const recipeOptions = ref<Recipe[]>([]);
const requestItems = ref<RequestItem[]>([]);

// Menu Tab State
const salesMenuStore = useSalesMenuStore();
const selectedMenuId = ref('');
const menuRequestItems = ref<MenuRequestItem[]>([]);

const resultList = ref<ProcurementItem[]>([]);

// History State
const historyVisible = ref(false);
const historyLoading = ref(false);
const historyList = ref<Procurement[]>([]);
const detailVisible = ref(false);
const currentDetail = ref<Procurement | null>(null);

onMounted(() => {
  salesMenuStore.fetchMenus();
});

const searchRecipes = async (query: string) => {
  if (query) {
    searchLoading.value = true;
    try {
      const res = await recipesApi.getAll({ search: query, limit: 20 });
      recipeOptions.value = res.data;
    } finally {
      searchLoading.value = false;
    }
  } else {
    recipeOptions.value = [];
  }
};

const addRecipe = () => {
  const recipe = recipeOptions.value.find((r) => r.id === selectedRecipeId.value);
  if (recipe) {
    // Check if already exists
    const exists = requestItems.value.find((i) => i.recipeId === recipe.id);
    if (exists) {
      exists.quantity += 1;
    } else {
      requestItems.value.push({
        recipeId: recipe.id,
        recipeName: recipe.name,
        quantity: 1,
      });
    }
    selectedRecipeId.value = '';
  }
};

const removeRecipe = (index: number) => {
  requestItems.value.splice(index, 1);
};

const addMenu = () => {
  const menu = salesMenuStore.menus.find((m) => m.id === selectedMenuId.value);
  if (menu) {
    const exists = menuRequestItems.value.find((i) => i.menuId === menu.id);
    if (exists) {
      exists.quantity += 1;
    } else {
      menuRequestItems.value.push({
        menuId: menu.id,
        menuName: menu.name,
        quantity: 1,
      });
    }
    selectedMenuId.value = '';
  }
};

const removeMenu = (index: number) => {
  menuRequestItems.value.splice(index, 1);
};

const generateList = async () => {
  if (requestItems.value.length === 0 && menuRequestItems.value.length === 0) {
    ElMessage.warning('请先添加菜谱或销售菜单');
    return;
  }

  loading.value = true;
  try {
    const res = await procurementApi.generateList({
      items: requestItems.value.map((i) => ({
        recipeId: i.recipeId,
        quantity: i.quantity,
      })),
      salesMenus: menuRequestItems.value.map((i) => ({
        menuId: i.menuId,
        quantity: i.quantity,
      })),
    });
    resultList.value = res;
    ElMessage.success('清单生成成功');
  } catch (error) {
    console.error(error);
    ElMessage.error('生成失败');
  } finally {
    loading.value = false;
  }
};

const saveProcurement = async () => {
  if (resultList.value.length === 0) return;

  saving.value = true;
  try {
    await procurementApi.create({
      items: requestItems.value.map((i) => ({
        recipeId: i.recipeId,
        quantity: i.quantity,
      })),
      salesMenus: menuRequestItems.value.map((i) => ({
        menuId: i.menuId,
        quantity: i.quantity,
      })),
    });
    ElMessage.success('采购单保存成功');
    // Clear inputs
    requestItems.value = [];
    menuRequestItems.value = [];
    resultList.value = [];
  } catch (error) {
    console.error(error);
    ElMessage.error('保存失败');
  } finally {
    saving.value = false;
  }
};

const showHistory = async () => {
  historyVisible.value = true;
  historyLoading.value = true;
  try {
    const res = await procurementApi.getAll();
    if (!Array.isArray(res)) {
      throw new Error('后端返回数据格式异常: 期望数组');
    }
    historyList.value = res;
  } catch (error: any) {
    console.error(error);
    ElMessage.error(error.message || '获取历史记录失败');
  } finally {
    historyLoading.value = false;
  }
};

const viewDetail = (procurement: Procurement) => {
  currentDetail.value = procurement;
  detailVisible.value = true;
};

const completeProcurement = async (procurement: Procurement) => {
  try {
    await procurementApi.updateStatus(procurement.id, ProcurementStatus.COMPLETED);
    ElMessage.success('采购已完成，库存已更新');
    // Refresh list
    const res = await procurementApi.getAll();
    historyList.value = res;
  } catch (error) {
    console.error(error);
    ElMessage.error('操作失败');
  }
};

const getStatusType = (status: ProcurementStatus) => {
  switch (status) {
    case ProcurementStatus.COMPLETED:
      return 'success';
    case ProcurementStatus.PENDING:
      return 'warning';
    case ProcurementStatus.CANCELLED:
      return 'info';
    default:
      return '';
  }
};
</script>

<style scoped>
.procurement-container {
  /* padding: 20px; */
  /* max-width: 1200px; */
  /* margin: 0 auto; */
}

.box-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.input-section {
  padding: 0 10px;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.demo-tabs :deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #dcdfe6;
}

.result-section {
  animation: fadeIn 0.5s ease-in-out;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.result-header :deep(.el-divider__text) {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

:deep(.el-card__body) {
  padding: 10px;
}
</style>
