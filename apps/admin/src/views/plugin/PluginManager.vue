<template>
  <div class="page-container">
    <el-card shadow="never" class="main-card">
      <template #header>
        <div class="card-header">
          <span>插件配置 ({{ pluginName }})</span>
          <el-button link @click="goBack">返回列表</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <!-- Configuration Form -->
        <el-col :span="8">
          <el-form v-loading="loading" :model="config" label-position="top">
            <el-collapse v-model="activeNames">
              <!-- Cover / Title Section -->
              <el-collapse-item title="封面与标题 (Cover & Title)" name="cover">
                <el-form-item label="页面尺寸 (Page Size)">
                  <el-row :gutter="10">
                    <el-col :span="12">
                      <el-input v-model="config.pageWidth" placeholder="Width (e.g. 210mm)">
                        <template #prepend>宽</template>
                      </el-input>
                    </el-col>
                    <el-col :span="12">
                      <el-input v-model="config.pageHeight" placeholder="Height (e.g. 297mm)">
                        <template #prepend>高</template>
                      </el-input>
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-form-item label="封面图片 (Cover Image)">
                  <el-upload
                    class="cover-uploader"
                    :action="uploadUrl"
                    :show-file-list="false"
                    :on-success="handleCoverSuccess"
                    :before-upload="beforeCoverUpload"
                  >
                    <img v-if="config.coverImage" :src="coverImageUrl" class="cover-image" />
                    <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                  </el-upload>
                  <div v-if="config.coverImage" class="help-text">
                    已上传: {{ config.coverImage }}
                  </div>
                </el-form-item>

                <el-form-item label="标题字体 (Title Font)">
                  <el-select v-model="config.titleFontFamily" placeholder="Select font">
                    <el-option label="Sans (无衬线 - 推荐)" value="Sans" />
                    <el-option label="Serif (衬线)" value="Serif" />
                    <el-option label="SimHei (黑体)" value="SimHei" />
                    <el-option label="Microsoft YaHei (微软雅黑)" value="Microsoft YaHei" />
                  </el-select>
                </el-form-item>

                <el-form-item label="标题颜色 (Title Color)">
                  <el-color-picker v-model="config.titleColor" />
                  <span class="color-text">{{ config.titleColor }}</span>
                </el-form-item>
              </el-collapse-item>

              <!-- Paragraph / Body Section -->
              <el-collapse-item title="正文与段落 (Body & Paragraph)" name="body">
                <el-form-item label="正文字体 (Body Font)">
                  <el-select v-model="config.baseFontFamily" placeholder="Select font">
                    <el-option label="Serif (衬线 - 推荐)" value="Serif" />
                    <el-option label="Sans (无衬线)" value="Sans" />
                    <el-option label="SimSun (宋体)" value="SimSun" />
                  </el-select>
                </el-form-item>
              </el-collapse-item>

              <!-- List / Table Section -->
              <el-collapse-item title="列表与表格 (List & Table)" name="components">
                <el-form-item label="强调色 (Accent Color)">
                  <div class="help-text">用于标题下划线、配料表边框</div>
                  <el-color-picker v-model="config.accentColor" />
                  <span class="color-text">{{ config.accentColor }}</span>
                </el-form-item>

                <el-form-item label="次要色 (Secondary Color)">
                  <div class="help-text">用于准备工作边框</div>
                  <el-color-picker v-model="config.secondaryColor" />
                  <span class="color-text">{{ config.secondaryColor }}</span>
                </el-form-item>
              </el-collapse-item>
            </el-collapse>

            <div class="form-actions">
              <el-button type="primary" :loading="saving" @click="save">保存配置</el-button>
              <el-button @click="fetchConfig">重置</el-button>
            </div>
          </el-form>
        </el-col>

        <!-- Live Preview -->
        <el-col :span="16">
          <div class="preview-container">
            <div class="preview-header">实时预览 (近似效果)</div>
            <div class="preview-paper" :style="paperStyle">
              <!-- Title -->
              <div class="doc-title" :style="titleStyle">宫保鸡丁 (Kung Pao Chicken)</div>

              <!-- Task Body -->
              <div class="doc-body">
                <p>这是一道经典的川菜，以其独特的糊辣荔枝味闻名。</p>

                <!-- Prereq (Ingredients) -->
                <div class="doc-section doc-prereq" :style="prereqStyle">
                  <div class="section-title">配料 (Ingredients)</div>
                  <ul>
                    <li>鸡胸肉: 300g</li>
                    <li>花生米: 50g</li>
                    <li>干辣椒: 10g</li>
                  </ul>
                </div>

                <!-- Context (Preparation) -->
                <div class="doc-section doc-context" :style="contextStyle">
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
                  <div class="step"><span class="cmd">3. 爆炒鸡丁:</span> 放入鸡丁快速滑散。</div>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, type UploadProps } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { API_URL } from '@chefos/utils';
import { getPluginConfig, updatePluginConfig, type PluginConfig } from '../../api/plugins';

const route = useRoute();
const router = useRouter();
const pluginName = computed(() => route.params.name as string);

const activeNames = ref(['cover', 'body', 'components']);
const loading = ref(false);
const saving = ref(false);

const config = ref<PluginConfig>({
  baseFontFamily: 'Serif',
  titleFontFamily: 'Sans',
  titleColor: '#2c3e50',
  accentColor: '#e67e22',
  secondaryColor: '#3498db',
  pageWidth: '297mm',
  pageHeight: '210mm',
  coverImage: '',
});

const uploadUrl = computed(() => `${API_URL}/api/plugins/${pluginName.value}/cover`);
const coverImageUrl = computed(() => {
  if (config.value.coverImage) {
    if (config.value.coverImage.startsWith('http')) return config.value.coverImage;
    return `${API_URL}/plugins-static/${pluginName.value}/cfg/common/artwork/${config.value.coverImage}`;
  }
  return `${API_URL}/static/default-cover.jpg`;
});
const handleCoverSuccess: UploadProps['onSuccess'] = (response) => {
  config.value.coverImage = response.url;
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

// Computed Styles for Preview
const paperStyle = computed(() => {
  const w = parseLength(config.value.pageWidth, 210);
  const h = parseLength(config.value.pageHeight, 297);
  return {
    fontFamily: getFontFamily(config.value.baseFontFamily),
    width: '100%', // Scale to container
    aspectRatio: `${w}/${h}`,
  };
});

const titleStyle = computed(() => ({
  fontFamily: getFontFamily(config.value.titleFontFamily),
  color: config.value.titleColor,
  borderBottom: `2px solid ${config.value.accentColor}`,
}));

const prereqStyle = computed(() => ({
  borderLeft: `4px solid ${config.value.accentColor}`,
  backgroundColor: '#fdf2e9', // Fixed in XSLT for now, but could be dynamic
}));

const contextStyle = computed(() => ({
  borderLeft: `4px solid ${config.value.secondaryColor}`,
  backgroundColor: '#f4f6f7',
}));

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
  overflow: auto;
}

.main-card {
  min-height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
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
  padding: 20px;
  border-radius: 4px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-header {
  color: #fff;
  margin-bottom: 10px;
  font-size: 14px;
}

.preview-paper {
  background-color: white;
  width: 100%;
  max-width: 595px; /* A4 width approx */
  min-height: 842px; /* A4 height approx */
  padding: 40px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}

.doc-title {
  font-size: 24px;
  font-weight: bold;
  padding-bottom: 4px;
  margin-bottom: 24px;
}

.doc-section {
  padding: 10px;
  margin-bottom: 15px;
}

.section-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.doc-steps .step {
  margin-bottom: 10px;
}

.cmd {
  font-weight: bold;
}
</style>
