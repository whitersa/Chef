<template>
  <div ref="chartRef" class="chart-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type PropType } from 'vue';
import * as echarts from 'echarts';

const props = defineProps({
  options: {
    type: Object as PropType<echarts.EChartsOption>,
    required: true,
  },
});

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const initChart = () => {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
    chartInstance.setOption(props.options);
  }
};

const resizeHandler = () => {
  chartInstance?.resize();
};

watch(
  () => props.options,
  (newOptions) => {
    chartInstance?.setOption(newOptions);
  },
  { deep: true },
);

onMounted(() => {
  initChart();
  window.addEventListener('resize', resizeHandler);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeHandler);
  chartInstance?.dispose();
});
</script>

<style scoped>
.chart-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
