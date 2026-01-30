<template>
  <ListLayout>
    <template #toolbar>
      <div class="header-toolbar">
        <div class="header-left">
          <span class="title">USDA 数据同步中心</span>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>集成管理</el-breadcrumb-item>
            <el-breadcrumb-item>数据工厂</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </template>

    <div v-if="!loading && status" class="dashboard-container">
      <!-- 第一行：核心指标卡片 -->
      <el-row :gutter="16" class="metrics-row">
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon synced">
              <el-icon><Finished /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">已同步食材</div>
              <div class="metric-value">{{ status.totalSynced }} <span class="unit">条</span></div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon page">
              <el-icon><Operation /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">当前处理进度</div>
              <div class="metric-value">
                第 {{ status.currentPage }} <span class="unit">页</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon speed">
              <el-icon><Cpu /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">Worker 状态</div>
              <div class="metric-value">
                <el-tag :type="status.isSyncing ? 'warning' : 'success'" size="small">
                  {{ status.isSyncing ? '执行中' : '空闲' }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="metric-card">
            <div class="metric-icon time">
              <el-icon><RefreshRight /></el-icon>
            </div>
            <div class="metric-info">
              <div class="metric-label">最近成功耗时</div>
              <div class="metric-value">
                {{ elapsedDisplay || '--' }}
              </div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行：主控制面板 & 进度条 -->
      <el-card shadow="never" class="control-panel">
        <div class="panel-content">
          <div class="progress-section">
            <div class="progress-header">
              <span class="label">任务总进度</span>
              <span class="percent">{{ progressPercent }}%</span>
            </div>
            <el-progress
              :percentage="progressPercent"
              :stroke-width="12"
              :color="progressColors"
              :format="() => ''"
            />
          </div>
          <div class="action-section">
            <el-button
              type="primary"
              :icon="Promotion"
              :loading="status.isSyncing"
              :disabled="status.isSyncing"
              @click="handleStartSync"
            >
              开始同步
            </el-button>
            <el-button
              type="danger"
              :icon="CircleClose"
              :disabled="!status.isSyncing"
              @click="handleStopSync"
            >
              停止任务
            </el-button>
            <el-button
              type="info"
              plain
              :icon="Delete"
              :disabled="status.isSyncing"
              @click="handleResetData"
            >
              重置
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 第三行：终端日志 & 异常记录 -->
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
  Finished,
  Operation,
  Cpu,
  RefreshRight,
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
  } catch (e) {
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
  } catch (err) {
    loading.value = false;
  }
};

const setupSSE = () => {
  if (eventSource) eventSource.close();

  const sseUrl = `${API_URL}/api/ingredients/sync/usda/events`;
  eventSource = new EventSource(sseUrl);

  eventSource.onmessage = (event) => {
    try {
      let rawData = JSON.parse(event.data);
      let data = rawData.data || rawData;

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {}
      }

      if (data && typeof data === 'object') {
        const oldLogCount = status.value.logs?.length || 0;
        status.value = { ...status.value, ...data };

        if (loading.value) loading.value = false;
        if (status.value.logs?.length !== oldLogCount) scrollToBottom();
      }
    } catch (err) {
      console.error('SSE error', err);
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
  } catch (err: unknown) {
    ElMessage.error('启动失败');
  }
};

const handleStopSync = async () => {
  try {
    await ingredientsApi.stopSync();
    status.value.isSyncing = false; // 乐观更新
    ElMessage.warning('正在尝试停止');
  } catch (err: unknown) {
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

/* 指标卡片 */
.metrics-row {
  margin-bottom: 12px;
}
.metric-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 1px 4px 0 rgba(0, 0, 0, 0.05);
}
.metric-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.metric-icon.synced {
  background: #e8f4ff;
  color: #1890ff;
}
.metric-icon.page {
  background: #fff7e6;
  color: #fa8c16;
}
.metric-icon.speed {
  background: #f6ffed;
  color: #52c41a;
}
.metric-icon.time {
  background: #f9f0ff;
  color: #722ed1;
}

.metric-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}
.metric-value {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}
.metric-value .unit {
  font-size: 12px;
  font-weight: normal;
  color: #999;
  margin-left: 4px;
}

/* 控制面板 */
.control-panel {
  margin-bottom: 12px;
  border: none;
}
:deep(.el-card__body) {
  padding: 8px 12px !important;
}
.panel-content {
  display: flex;
  align-items: center;
  gap: 16px;
}
.progress-section {
  flex: 1;
  background: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}
.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 12px;
}
.progress-header .label {
  color: #909399;
}
.progress-header .percent {
  font-weight: 600;
  color: #409eff;
}

.action-section {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
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
