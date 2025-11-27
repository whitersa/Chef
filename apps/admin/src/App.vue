<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useThemeStore } from './stores/theme';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const themeStore = useThemeStore();
const isReady = ref(false);

const elementSize = computed(() => {
  switch (themeStore.density) {
    case 'compact':
      return 'small';
    case 'loose':
      return 'large';
    default:
      return 'default';
  }
});

onMounted(async () => {
  // 模拟应用初始化逻辑
  // 1. 如果本地已有配置，立即渲染 (Fast Path)
  const hasLocalPrefs = localStorage.getItem('app-density');
  if (hasLocalPrefs) {
    isReady.value = true;
    // 后台静默同步...
  } else {
    // 2. 如果是新设备，先显示 Loading，等获取到用户偏好后再渲染 (Slow Path - Prevent Flash)
    // 这里模拟一个 API 请求延迟
    // const user = await userApi.getProfile();
    // themeStore.syncFromProfile(user.preferences);
    setTimeout(() => {
      isReady.value = true;
    }, 500);
  }
});
</script>

<template>
  <el-config-provider :size="elementSize" :locale="zhCn">
    <div v-if="!isReady" class="app-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">ChefOS Loading...</div>
    </div>
    <router-view v-else />
  </el-config-provider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.app-loading {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e6e6e6;
  border-top-color: #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  color: #606266;
  font-size: 14px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
