import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { ElMessage } from 'element-plus';
import 'element-plus/dist/index.css'; // Keep styles or use unplugin-element-plus for on-demand styles too, but keeping this is safer for now
import 'element-plus/theme-chalk/dark/css-vars.css';
import './style.css';
import App from './App.vue';
import router from './router';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

const app = createApp(App);

// Global Error Handler
app.config.errorHandler = (err, _instance, info) => {
  console.error('Global Error:', err, info);
  ElMessage.error('系统发生错误，请查看控制台');
};

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);
// Element Plus is now auto-imported
app.mount('#app');
