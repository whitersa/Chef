<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from './stores/theme';
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';

const themeStore = useThemeStore();

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
</script>

<template>
  <el-config-provider :size="elementSize" :locale="zhCn">
    <router-view />
  </el-config-provider>
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
