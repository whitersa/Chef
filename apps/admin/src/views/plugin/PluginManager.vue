<template>
  <div class="page-container">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span>插件配置 ({{ pluginName }})</span>
          <el-button link @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-row :gutter="20" class="full-height-row">
        <!-- Configuration Form -->
        <el-col :span="12" class="left-panel">
          <div class="config-scroll-area">
            <el-form v-loading="loading" :model="config" label-position="top">
              <!-- Block 1: Page Settings -->
              <div class="config-block" @click="scrollToPreview('cover')">
                <div class="block-title">页面设置 (Page Settings)</div>
                <el-form-item label="页面尺寸 (Page Size)">
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-input v-model="config.layout.pageWidth" placeholder="Width (e.g. 210mm)">
                        <template #prepend>宽</template>
                      </el-input>
                    </el-col>
                    <el-col :span="12">
                      <el-input
                        v-model="config.layout.pageHeight"
                        placeholder="Height (e.g. 297mm)"
                      >
                        <template #prepend>高</template>
                      </el-input>
                    </el-col>
                  </el-row>
                </el-form-item>
              </div>

              <!-- Block 2: Cover Design -->
              <div class="config-block" @click="scrollToPreview('cover')">
                <div class="block-title">封面设计 (Cover Design)</div>
                <el-form-item label="封面图片 (Cover Image)">
                  <el-upload
                    class="cover-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handleCoverSuccess"
                    :before-upload="beforeCoverUpload"
                  >
                    <img
                      v-if="config.components.cover.image"
                      :src="coverImageUrl"
                      class="cover-image"
                    />
                    <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div v-if="config.components.cover.image" class="help-text">
                    已上传: {{ config.components.cover.image }}
                  </div>
                </el-form-item>

                <el-form-item label="标题字体 (Title Font)">
                  <el-select v-model="config.typography.titleFont" placeholder="Select font">
                    <el-option label="Sans (无衬线 - 推荐)" value="Sans" />
                    <el-option label="Serif (衬线)" value="Serif" />
                    <el-option label="SimHei (黑体)" value="SimHei" />
                    <el-option label="Microsoft YaHei (微软雅黑)" value="Microsoft YaHei" />
                  </el-select>
                </el-form-item>

                <el-form-item label="标题颜色 (Title Color)">
                  <el-color-picker v-model="config.palette.title" />
                  <span class="color-text">{{ config.palette.title }}</span>
                </el-form-item>
              </div>

              <!-- Block 3: TOC Design -->
              <div class="config-block" @click="scrollToPreview('toc')">
                <div class="block-title">目录设计 (TOC Design)</div>
                <el-form-item label="目录标题 (TOC Title)">
                  <el-input v-model="config.components.toc.title" placeholder="Default: 目录" />
                </el-form-item>
              </div>

              <!-- Block 4: Content Style -->
              <div class="config-block" @click="scrollToPreview('content')">
                <div class="block-title">正文样式 (Content Style)</div>
                <el-form-item label="正文字体 (Body Font)">
                  <el-select v-model="config.typography.baseFont" placeholder="Select font">
                    <el-option label="Serif (衬线 - 推荐)" value="Serif" />
                    <el-option label="Sans (无衬线)" value="Sans" />
                    <el-option label="SimSun (宋体)" value="SimSun" />
                  </el-select>
                </el-form-item>
              </div>

              <!-- Block 5: Component Colors -->
              <div class="config-block" @click="scrollToPreview('content')">
                <div class="block-title">组件配色 (Component Colors)</div>
                <el-form-item label="强调色 (Accent Color)">
                  <div class="help-text">用于标题下划线、配料表边框</div>
                  <el-color-picker v-model="config.palette.accent" />
                  <span class="color-text">{{ config.palette.accent }}</span>
                </el-form-item>

                <el-form-item label="次要色 (Secondary Color)">
                  <div class="help-text">用于准备工作边框</div>
                  <el-color-picker v-model="config.palette.secondary" />
                  <span class="color-text">{{ config.palette.secondary }}</span>
                </el-form-item>
              </div>
            </el-form>
          </div>

          <div class="config-footer">
            <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
            <el-button @click="fetchConfig">重置</el-button>
          </div>
        </el-col>

        <!-- Live Preview -->
        <el-col ref="rightPanelRef" :span="12" class="scrollable-col right-panel">
          <div class="preview-container" :style="designTokens">
            <!-- Page 1: Cover Preview -->
            <div class="preview-label">封面预览 (Cover Page)</div>
            <div id="preview-cover" class="preview-paper cover-page">
              <div class="cover-content">
                <div class="doc-title-large">
                  宫保鸡丁
                  <div class="doc-subtitle">Kung Pao Chicken</div>
                </div>
                <div v-if="config.components.cover.image" class="doc-cover-large">
                  <img :src="coverImageUrl" class="preview-cover-img-large" />
                </div>
                <div class="doc-footer">ChefOS Recipe Collection</div>
              </div>
            </div>

            <!-- Page 2: TOC Preview -->
            <div class="preview-label">目录预览 (Table of Contents)</div>
            <div id="preview-toc" class="preview-paper toc-page">
              <div class="page-header">Contents</div>
              <div class="doc-title">
                {{ config.components.toc.title || '目录' }}
              </div>
              <div class="toc-list">
                <div class="toc-item">
                  <span class="toc-text">Chapter 1: 宫保鸡丁</span>
                  <span class="toc-dots">................................................</span>
                  <span class="toc-page">1</span>
                </div>
                <div class="toc-item">
                  <span class="toc-text">Chapter 2: 麻婆豆腐</span>
                  <span class="toc-dots">................................................</span>
                  <span class="toc-page">3</span>
                </div>
              </div>
              <div class="page-footer">i</div>
            </div>

            <!-- Page 3: Content Preview -->
            <div class="preview-label">正文预览 (Content Page)</div>
            <div id="preview-content" class="preview-paper content-page">
              <!-- Header -->
              <div class="page-header">Chapter 1</div>

              <!-- Title -->
              <div class="doc-title">宫保鸡丁 (Kung Pao Chicken)</div>

              <!-- Task Body -->
              <div class="doc-body">
                <p>这是一道经典的川菜，以其独特的糊辣荔枝味闻名。</p>

                <!-- Prereq (Ingredients) -->
                <div class="doc-section doc-prereq">
                  <div class="section-title">配料 (Ingredients)</div>
                  <ul>
                    <li>鸡胸肉: 300g</li>
                    <li>花生米: 50g</li>
                    <li>干辣椒: 10g</li>
                  </ul>
                </div>

                <!-- Context (Preparation) -->
                <div class="doc-section doc-context">
                  <div class="section-title">准备工作 (Preparation)</div>
                  <p>1. 鸡肉切丁，加淀粉腌制。</p>
                  <p>2. 调制碗芡。</p>
                </div>

                <!-- Steps -->
                <div class="doc-steps">
                  <div class="step"><span class="cmd">1. 炒制花生:</span> 冷油下锅，炸至酥脆。</div>
                  <div class="step">
                    <span class="cmd">2. 炒香底料:</span> 放入花椒、干辣椒炒出香味。
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div class="page-footer">Page 1</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, type ComponentPublicInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { API_URL } from '@chefos/utils';
import { getPluginConfig, updatePluginConfig, type PluginConfig } from '../../api/plugins';

const route = useRoute();
const router = useRouter();
const pluginName = computed(() => route.params.name as string);

const loading = ref(false);
const saving = ref(false);

const config = ref<PluginConfig>({
  layout: {
    pageWidth: '297mm',
    pageHeight: '210mm',
  },
  typography: {
    baseFont: 'Serif',
    titleFont: 'Sans',
  },
  palette: {
    title: '#2c3e50',
    accent: '#e67e22',
    secondary: '#3498db',
  },
  components: {
    cover: {
      image: '',
    },
    toc: {
      title: '目录 (Table of Contents)',
    },
  },
});

const rightPanelRef = ref<ComponentPublicInstance | null>(null);

const scrollToPreview = (sectionId: string) => {
  const panel = rightPanelRef.value?.$el || document.querySelector('.right-panel');
  const target = document.getElementById(`preview-${sectionId}`);

  if (panel && target) {
    const top = target.offsetTop - panel.offsetTop - 20;
    panel.scrollTo({ top, behavior: 'smooth' });
  }
};

const uploadUrl = computed(() => `${API_URL}/api/plugins/${pluginName.value}/cover`);
const coverImageUrl = computed(() => {
  if (config.value.components.cover.image) {
    if (config.value.components.cover.image.startsWith('http'))
      return config.value.components.cover.image;
    return `${API_URL}/plugins-static/${pluginName.value}/cfg/common/artwork/${config.value.components.cover.image}`;
  }
  return `${API_URL}/static/default-cover.jpg`;
});
const handleCoverSuccess: UploadProps['onSuccess'] = (response) => {
  config.value.components.cover.image = response.url;
  ElMessage.success('Cover image uploaded successfully');
};

const beforeCoverUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('Cover image must be JPG or PNG format!');
    return false;
  } else if (rawFile.size / 1024 / 1024 > 2) {
    ElMessage.error('Cover image size can not exceed 2MB!');
    return false;
  }
  return true;
};

// Helper to parse length to mm
const parseLength = (val: string | undefined, defaultVal: number): number => {
  if (!val) return defaultVal;
  const num = parseFloat(val);
  if (isNaN(num)) return defaultVal;
  if (val.endsWith('in')) return num * 25.4;
  if (val.endsWith('cm')) return num * 10;
  if (val.endsWith('pt')) return num * 0.352778;
  if (val.endsWith('px')) return num * 0.264583;
  return num; // assume mm
};

// Helper to map logical fonts to CSS fonts
const getFontFamily = (logical: string) => {
  const map: Record<string, string> = {
    Sans: 'Arial, "Microsoft YaHei", sans-serif',
    Serif: '"Times New Roman", "SimSun", serif',
    SimHei: '"SimHei", sans-serif',
    SimSun: '"SimSun", serif',
    'Microsoft YaHei': '"Microsoft YaHei", sans-serif',
  };
  return map[logical] || 'serif';
};

// --- Design Tokens (CSS Variables) ---
// This is the bridge between Config and UI.
// In the future, the backend can generate a .css file with these same variables.
const designTokens = computed(() => {
  const c = config.value;
  return {
    '--doc-font-title': getFontFamily(c.typography.titleFont),
    '--doc-font-body': getFontFamily(c.typography.baseFont),
    '--doc-color-title': c.palette.title,
    '--doc-color-accent': c.palette.accent,
    '--doc-color-secondary': c.palette.secondary,
    // Layout tokens
    '--doc-page-ratio': `${parseLength(c.layout.pageWidth, 210)} / ${parseLength(c.layout.pageHeight, 297)}`,
  } as Record<string, string>;
});

const fetchConfig = async () => {
  if (!pluginName.value) return;
  loading.value = true;
  try {
    const res = await getPluginConfig(pluginName.value);
    config.value = res;
  } catch {
    ElMessage.error('Failed to load configuration');
  } finally {
    loading.value = false;
  }
};

const save = async () => {
  if (!pluginName.value) return;
  saving.value = true;
  try {
    await updatePluginConfig(pluginName.value, config.value);
    ElMessage.success('Configuration saved. It will be applied on next PDF export.');
  } catch {
    ElMessage.error('Failed to save configuration');
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  router.push('/plugins');
};

onMounted(() => {
  fetchConfig();
});
</script>

<style scoped>
.page-container {
  height: 100%;
  /* padding: 16px; Removed to avoid double padding with BasicLayout */
  box-sizing: border-box;
  /* background-color: var(--el-bg-color-page); Handled by BasicLayout */
  overflow: hidden; /* Disable main scroll */
}

.main-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-card__body) {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.full-height-row {
  flex: 1;
  overflow: hidden;
  display: flex; /* Ensure columns take full height */
}

.scrollable-col {
  height: 100%;
  overflow-y: auto;
  padding-bottom: 20px; /* Add some bottom padding for scrolling content */
}

.left-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.config-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
  padding-bottom: 20px;
}

.config-footer {
  padding: 16px 0;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-shrink: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.help-text {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}
.color-text {
  margin-left: 10px;
  color: #606266;
}

.preview-container {
  background-color: #525659; /* Acrobat Reader dark background */
  padding: 32px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  margin: 0 auto;
  gap: 24px; /* Space between pages */
}

.preview-label {
  color: #e0e0e0;
  font-size: 12px;
  margin-bottom: -16px; /* Pull closer to paper */
  z-index: 1;
}

.preview-paper {
  background-color: white;
  width: 400px; /* Fixed width for preview to control container size */
  max-width: 100%;
  padding: 32px; /* Standard margin */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  /* Use Design Tokens */
  aspect-ratio: var(--doc-page-ratio);
  font-family: var(--doc-font-body);
}

.toc-page {
  display: flex;
  flex-direction: column;
  font-family: monospace;
}

.toc-list {
  margin-top: 20px;
  flex: 1;
}

.toc-item {
  display: flex;
  align-items: baseline;
  margin-bottom: 12px;
  font-size: 14px;
}

.toc-text {
  font-weight: bold;
}

.toc-dots {
  flex: 1;
  border-bottom: 1px dotted #000;
  margin: 0 8px;
  opacity: 0.3;
  white-space: nowrap;
  overflow: hidden;
}

/* Config Blocks */
.config-block {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s;
}

.config-block:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.block-title {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 20px;
  color: #303133;
  display: flex;
  align-items: center;
}

.block-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: var(--el-color-primary);
  margin-right: 8px;
  border-radius: 2px;
}

/* Cover Page Styles */
.cover-page {
  text-align: center;
}

.cover-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.doc-title-large {
  font-size: 28px;
  line-height: 1.4;
  margin-top: 40px;

  /* Use Design Tokens */
  font-family: var(--doc-font-title);
  color: var(--doc-color-title);
}

.doc-subtitle {
  font-size: 16px;
  font-weight: normal;
  margin-top: 8px;
  opacity: 0.7;
}

.doc-cover-large {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin: 20px 0;
  overflow: hidden;
}

.preview-cover-img-large {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.doc-footer {
  font-size: 12px;
  color: #909399;
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  width: 60%;
}

/* Content Page Styles */
.page-header {
  font-size: 10px;
  color: #909399;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
  margin-bottom: 24px;
  text-align: right;
}

.page-footer {
  font-size: 10px;
  color: #909399;
  border-top: 1px solid #ebeef5;
  padding-top: 8px;
  margin-top: auto;
  text-align: center;
}

.doc-title {
  font-size: 20px;
  font-weight: bold;
  padding-bottom: 4px;
  margin-bottom: 20px;

  /* Use Design Tokens */
  font-family: var(--doc-font-title);
  color: var(--doc-color-title);
  border-bottom: 2px solid var(--doc-color-accent);
}

.doc-section {
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
}

.doc-prereq {
  border-left: 4px solid var(--doc-color-accent);
  background-color: #fdf2e9;
}

.doc-context {
  border-left: 4px solid var(--doc-color-secondary);
  background-color: #f4f6f7;
}

.section-title {
  font-weight: bold;
  margin-bottom: 8px;
  font-size: 13px;
}

.cover-uploader .cover-image {
  width: 148px;
  height: 148px;
  display: block;
  object-fit: contain;
}

.cover-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.cover-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.cover-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 148px;
  height: 148px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.doc-steps .step {
  margin-bottom: 10px;
}

.cmd {
  font-weight: bold;
}
</style>
