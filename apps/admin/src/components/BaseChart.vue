<template>
  <div ref="chartRef" class="chart-container" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, type PropType } from 'vue';
import type { EChartsOption } from 'echarts';
// Import ECharts core
import * as echarts from 'echarts/core';
// Import charts
import { PieChart, BarChart, LineChart } from 'echarts/charts';
// Import components
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
// Import renderer
import { CanvasRenderer } from 'echarts/renderers';

// Register the required components
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  PieChart,
  BarChart,
  LineChart,
  CanvasRenderer,
]);

const props = defineProps({
  options: {
    type: Object as PropType<EChartsOption>,
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
}
</style>
