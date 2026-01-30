<template>
  <ListLayout>
    <template #toolbar>
      <div class="header-toolbar">
        <div class="header-left">
          <span class="title">USDA 核心数据控制台 (V2)</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>系统集成</el-breadcrumb-item>
            <el-breadcrumb-item>USDA 数据工厂</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </template>

    <div v-if="!loading && status" class="dashboard-container">
      <!-- 紧凑型顶部控制栏：合并指标、进度和操作 -->
      <el-card shadow="never" class="compact-control-bar">
        <div class="control-bar-content">
          <!-- 左侧：核心指标 -->
          <div class="metrics-block">
            <div class="metric-item">
              <span class="metric-label">已同步</span>
              <span class="metric-value">{{ status.totalSynced }} <small>条</small></span>
            </div>
            <el-divider direction="vertical" />
            <div class="metric-item">
              <span class="metric-label">总数</span>
              <span class="metric-value"
                >{{ status.totalIngredients || '--' }} <small>条</small></span
              >
            </div>
            <el-divider direction="vertical" />
            <div class="metric-item">
              <span class="metric-label">当前进度</span>
              <span class="metric-value">第 {{ status.currentPage }} 页</span>
            </div>
            <el-divider direction="vertical" />
            <div class="metric-item">
              <span class="metric-label">耗时</span>
              <span class="metric-value">{{ elapsedDisplay || '--' }}</span>
            </div>
            <el-divider direction="vertical" />
            <div class="metric-item">
              <span class="metric-label">状态</span>
              <el-tag
                :type="status.isSyncing ? 'warning' : 'success'"
                size="small"
                effect="dark"
                round
              >
                {{ status.isSyncing ? '正在同步' : '队列空闲' }}
              </el-tag>
            </div>
          </div>

          <!-- 中间：进度条 -->
          <div class="progress-block">
            <div class="progress-info">
              <span class="label">任务完成度</span>
              <span class="percentage">{{ progressPercent }}%</span>
            </div>
            <el-progress
              :percentage="progressPercent"
              :stroke-width="10"
              :color="progressColors"
              :show-text="false"
              class="custom-progress"
            />
          </div>

          <!-- 右侧：按钮组 -->
          <div class="actions-block">
            <el-button
              type="primary"
              :icon="Promotion"
              :loading="status.isSyncing"
              round
              class="action-btn main-action"
              @click="handleStartSync"
            >
              {{ status.isSyncing ? '同步中' : '开始同步' }}
            </el-button>
            <el-button
              v-if="status.isSyncing"
              type="danger"
              :icon="CircleClose"
              round
              class="action-btn"
              @click="handleStopSync"
            >
              停止
            </el-button>
            <el-button
              type="info"
              plain
              :icon="Delete"
              :disabled="status.isSyncing"
              round
              class="action-btn"
              @click="handleResetData"
            >
              重置
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 第二行：终端日志 & 异常记录 -->
      <el-row :gutter="16" class="main-content-row">
        <el-col :span="16">
          <div class="terminal-window">
            <div class="terminal-header">
              <div class="window-controls">
                <span class="dot red"></span>
                <span class="dot yellow"></span>
                <span class="dot green"></span>
              </div>
              <div class="window-title">
                <el-icon><Monitor /></el-icon>
                <span>SYNC_WORKER_OUTPUT</span>
              </div>
              <div class="header-actions">
                <el-tooltip content="清空当前所有日志" placement="top">
                  <div class="terminal-action" @click="handleClearLogs">
                    <el-icon><Delete /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </div>

            <div class="terminal-container">
              <div ref="logContainer" class="terminal-body">
                <div v-for="(log, index) in status.logs" :key="index" class="terminal-line">
                  <span
                    :class="[
                      'terminal-text',
                      log.includes('ERR') ||
                      log.includes('Error') ||
                      log.includes('失败') ||
                      log.includes('⚠️')
                        ? 'is-error'
                        : log.includes('SUCCESS') || log.includes('成功') || log.includes('✅')
                          ? 'is-success'
                          : 'is-info',
                    ]"
                  >
                    <span class="log-prefix">❯</span>
                    {{ log }}
                  </span>
                </div>
                <div v-if="!status.logs || status.logs.length === 0" class="terminal-placeholder">
                  等待任务信号接入...
                </div>
              </div>
            </div>
          </div>
        </el-col>

        <el-col :span="8">
          <el-card shadow="never" class="issues-card">
            <template #header>
              <div class="card-header">
                <div class="header-title">
                  <el-icon class="icon-warning"><WarningFilled /></el-icon>
                  <span>同步异常看板</span>
                  <el-badge v-if="issues.length > 0" :value="issues.length" class="issue-count" />
                </div>
                <el-tooltip content="刷新异常记录" placement="top">
                  <div class="refresh-btn" @click="fetchIssues">
                    <el-icon :class="{ 'icon-spin': loadingIssues }"><Refresh /></el-icon>
                  </div>
                </el-tooltip>
              </div>
            </template>
            <div class="issues-list">
              <div v-for="issue in issues" :key="issue.id" class="issue-item">
                <div class="issue-header">
                  <el-tag size="small" type="info" effect="plain" class="fdc-tag">
                    ID: {{ issue.fdcId }}
                  </el-tag>
                  <span class="issue-time">{{ formatTime(issue.createdAt) }}</span>
                </div>
                <div class="issue-content">
                  <div class="issue-title">{{ issue.foodDescription }}</div>
                  <div class="issue-reason">
                    <el-icon size="12"><CircleCloseFilled /></el-icon>
                    {{ issue.errorMessage }}
                  </div>
                </div>
              </div>
              <div v-if="issues.length === 0" class="empty-issues">
                <el-icon size="40" color="#e4e7ed"><Checked /></el-icon>
                <p>当前同步任务暂无异常反馈</p>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div v-else-if="loading" class="loading-state">
      <el-skeleton :rows="10" animated />
    </div>
  </ListLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Promotion,
  Monitor,
  Delete,
  CircleClose,
  WarningFilled,
  Refresh,
  CircleCloseFilled,
  Checked,
} from '@element-plus/icons-vue';
import ListLayout from '../../components/ListLayout.vue';
import { ingredientsApi, type SyncStatus, type SyncIssue } from '../../api/ingredients';
import { API_URL } from '@chefos/utils';

const progressColors = [
  { color: '#909399', percentage: 20 },
  { color: '#e6a23c', percentage: 40 },
  { color: '#1989fa', percentage: 80 },
  { color: '#5cb87a', percentage: 100 },
];

const status = ref<SyncStatus>({
  totalSynced: 0,
  totalIngredients: 0,
  currentPage: 0,
  isSyncing: false,
  logs: [],
  startTime: null,
  lastError: null,
});
const issues = ref<SyncIssue[]>([]);
const loading = ref(true);
const loadingIssues = ref(false);
const elapsedDisplay = ref('');
const logContainer = ref<HTMLElement | null>(null);
let eventSource: EventSource | null = null;
let timerId: ReturnType<typeof setInterval> | null = null;

const progressPercent = computed(() => {
  if (!status.value.totalIngredients || !status.value.totalSynced) return 0;
  return Math.min(
    100,
    Math.round((status.value.totalSynced / status.value.totalIngredients) * 100),
  );
});

const scrollToBottom = () => {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
};

const updateElapsed = () => {
  if (!status.value.startTime) {
    elapsedDisplay.value = '';
    return;
  }
  const start = new Date(status.value.startTime).getTime();
  const now = new Date().getTime();
  const diff = Math.floor((now - start) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  elapsedDisplay.value = `${m}分${s}秒`;
};

watch(
  () => status.value.isSyncing,
  (syncing) => {
    if (syncing) {
      if (!timerId) timerId = setInterval(updateElapsed, 1000);
    } else {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    }
  },
  { immediate: true },
);

const fetchIssues = async () => {
  loadingIssues.value = true;
  try {
    const res = await ingredientsApi.getSyncIssues();
    issues.value = res;
  } catch {
    // Error handled by api-client or ignored
  } finally {
    setTimeout(() => {
      loadingIssues.value = false;
    }, 500);
  }
};

const fetchStatus = async () => {
  try {
    const res = await ingredientsApi.getFullSyncStatus();
    status.value = { ...status.value, ...res };
    loading.value = false;
  } catch {
    loading.value = false;
  }
};

const setupSSE = () => {
  if (eventSource) eventSource.close();

  const sseUrl = `${API_URL}/api/ingredients/sync/usda/events`;
  eventSource = new EventSource(sseUrl);

  eventSource.onmessage = (event) => {
    try {
      const rawData = JSON.parse(event.data);
      let data = rawData.data || rawData;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          // Ignore parse errors for nested strings
        }
      }

      if (data && typeof data === 'object') {
        const oldLogCount = status.value.logs?.length || 0;
        status.value = { ...status.value, ...data };

        if (loading.value) loading.value = false;
        if (status.value.logs?.length !== oldLogCount) scrollToBottom();
      }
    } catch {
      // JSON parse or structural error
    }
  };

  eventSource.onerror = () => {
    loading.value = false;
  };
};

const handleClearLogs = () => {
  status.value.logs = [];
};

const localLog = (msg: string) => {
  const time = new Date().toLocaleTimeString();
  if (!status.value.logs) status.value.logs = [];
  status.value.logs.push(`[${time}] ${msg}`);
  scrollToBottom();
};

const handleStartSync = async () => {
  try {
    await ingredientsApi.startFullSync();
    status.value.isSyncing = true; // 乐观更新
    ElMessage.success('同步已启动');
    localLog('已下发启动指令');
  } catch {
    ElMessage.error('启动失败');
  }
};

const handleStopSync = async () => {
  try {
    await ingredientsApi.stopSync();
    status.value.isSyncing = false; // 乐观更新
    ElMessage.warning('正在尝试停止');
  } catch {
    ElMessage.error('停止失败');
  }
};

const handleResetData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有已同步的 USDA 食材和同步日志吗？此操作不可撤销。',
      '重置确认',
      {
        confirmButtonText: '确定重置',
        cancelButtonText: '取消',
        type: 'warning',
      },
    );

    await ingredientsApi.resetSyncData();
    ElMessage.success('重置成功');
    fetchStatus();
    fetchIssues();
  } catch (err: unknown) {
    if (err !== 'cancel') {
      console.error('Reset failed', err);
      ElMessage.error('重置失败');
    }
  }
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString();
};

onMounted(() => {
  fetchStatus();
  setupSSE();
  fetchIssues();
});

onUnmounted(() => {
  if (eventSource) eventSource.close();
  if (timerId) clearInterval(timerId);
});
</script>

<style scoped>
.header-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}
.title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2d3d;
}

.dashboard-container {
  padding: 12px;
  background-color: #f0f2f5;
}

/* 紧凑型控制栏 */
.compact-control-bar {
  margin-bottom: 16px;
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
:deep(.el-card__body) {
  padding: 12px 20px !important;
}
.control-bar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.metrics-block {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.metric-item {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.metric-label {
  font-size: 11px;
  color: #909399;
  margin-bottom: 2px;
}
.metric-value {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.metric-value small {
  font-size: 10px;
  color: #999;
  font-weight: normal;
  margin-left: 2px;
}

.progress-block {
  flex: 1;
  min-width: 150px;
}
.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  font-size: 11px;
}
.progress-info .label {
  color: #909399;
}
.progress-info .percentage {
  color: #409eff;
  font-weight: bold;
}
.custom-progress {
  margin-top: 4px;
}

.actions-block {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
  align-items: center;
}
.action-btn {
  padding: 8px 16px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.main-action {
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}
.main-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

/* 主内容区 */
.terminal-window {
  background: #1e1e1e;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.terminal-header {
  background: #323232;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.window-controls {
  display: flex;
  gap: 6px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}
.red {
  background: #ff5f56;
}
.yellow {
  background: #ffbd2e;
}
.green {
  background: #27c93f;
}

.window-title {
  color: #aaa;
  font-size: 11px;
  font-family: 'PingFang SC', sans-serif;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  opacity: 0.8;
}

.terminal-action {
  color: #888;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.terminal-action:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.terminal-body {
  height: 360px;
  padding: 10px;
  overflow-y: auto;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  background: #1e1e1e;
}

/* 漂亮的滚动条样式 */
.terminal-body::-webkit-scrollbar,
.issues-list::-webkit-scrollbar {
  width: 6px;
}

.terminal-body::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 3px;
}

.terminal-body::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.terminal-body::-webkit-scrollbar-track {
  background: #1e1e1e;
}

.issues-list::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.issues-list::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.issues-list::-webkit-scrollbar-track {
  background: #f9f9f9;
}

.terminal-line {
  margin-bottom: 2px;
  line-height: 1.4;
}
.log-prefix {
  color: #569cd6;
  margin-right: 8px;
}
.terminal-text.is-info {
  color: #d4d4d4;
}
.terminal-text.is-success {
  color: #4ec9b0;
}
.terminal-text.is-error {
  color: #ce9178;
}

.issues-card {
  height: 410px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #303133;
}
.icon-warning {
  color: #f56c6c;
}
.issue-count {
  margin-left: 4px;
}
:deep(.issue-count .el-badge__content) {
  height: 16px;
  line-height: 16px;
  padding: 0 4px;
}

.refresh-btn {
  color: #909399;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}
.refresh-btn:hover {
  background: #f5f7fa;
  color: #409eff;
}

.issues-list {
  height: 330px;
  overflow-y: auto;
}
.issue-item {
  padding: 12px 8px;
  border-bottom: 1px solid #f2f6fc;
  transition: background 0.2s;
}
.issue-item:hover {
  background: #fafafa;
}
.issue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.fdc-tag {
  font-family: monospace !important;
  font-weight: 600;
}
.issue-time {
  font-size: 11px;
  color: #c0c4cc;
}
.issue-title {
  font-weight: 500;
  font-size: 13px;
  color: #303133;
  margin-bottom: 4px;
}
.issue-reason {
  font-size: 12px;
  color: #f56c6c;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  line-height: 1.4;
}

.empty-issues {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 80px;
  color: #c0c4cc;
}
.empty-issues p {
  margin-top: 12px;
  font-size: 13px;
}

.icon-spin {
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
