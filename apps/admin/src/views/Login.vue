<template>
  <div class="login-wrapper">
    <!-- Left Side: Brand & Visuals -->
    <div class="login-visual">
      <div class="visual-content">
        <div class="brand">
          <div class="brand-logo-icon">C</div>
          <span class="brand-text">ChefOS</span>
        </div>
        <div class="slogan">
          <h1>智能后厨<br />数字化管理专家</h1>
          <p>Smart Kitchen Operating System</p>
        </div>
      </div>
      <div class="visual-bg" />
    </div>

    <!-- Right Side: Login Form -->
    <div class="login-form-container">
      <div class="form-content">
        <div class="form-header">
          <h2>欢迎回来</h2>
          <p class="sub-text">请输入您的账号密码以继续</p>
        </div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          class="custom-form"
          size="large"
          @submit.prevent
        >
          <el-form-item prop="username">
            <el-input
              v-model="form.username"
              placeholder="用户名 / 邮箱"
              class="custom-input"
              :prefix-icon="User"
            />
          </el-form-item>

          <el-form-item prop="password">
            <el-input
              v-model="form.password"
              type="password"
              placeholder="密码"
              class="custom-input"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <div class="form-actions">
            <el-checkbox v-model="rememberMe"> 记住我 </el-checkbox>
          </div>

          <el-button type="primary" class="submit-btn" :loading="loading" @click="handleLogin">
            登 录
          </el-button>
        </el-form>

        <div class="form-footer">
          <p>© 2024 ChefOS Inc. All Rights Reserved.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { useAuthStore } from '../stores/auth';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';

const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const rememberMe = ref(false);

const form = reactive({
  username: '',
  password: '',
});

const rules = reactive<FormRules>({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

async function handleLogin() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await authStore.login(form.username, form.password, rememberMe.value);
        ElMessage.success('登录成功');
      } catch (error) {
        ElMessage.error('登录失败，请检查用户名或密码');
      } finally {
        loading.value = false;
      }
    }
  });
}
</script>

<style scoped lang="scss">
.login-wrapper {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #fff;
}

/* Left Side */
.login-visual {
  flex: 1.618; /* Golden ratio for better proportion */
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 60px;
  color: #fff;
  background-color: #1a1a1a;
  overflow: hidden;

  .visual-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    opacity: 0.6;
    z-index: 0;
    transition: transform 10s ease;
  }

  &:hover .visual-bg {
    transform: scale(1.05);
  }

  .visual-content {
    position: relative;
    z-index: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;

    .brand-logo-icon {
      width: 40px;
      height: 40px;
      background: #18181b;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 700;
      font-size: 24px;
    }

    .brand-text {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: 1px;
    }
  }

  .slogan {
    margin-bottom: 100px;

    h1 {
      font-size: 48px;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 16px;
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
    }

    p {
      font-size: 18px;
      opacity: 0.9;
      font-weight: 300;
      letter-spacing: 2px;
      text-transform: uppercase;
    }
  }
}

/* Right Side */
.login-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  padding: 40px;

  .form-content {
    width: 100%;
    max-width: 280px; /* Significantly reduced width */
    animation: slideUp 0.6s ease-out;
  }

  .form-header {
    margin-bottom: 24px; /* Reduced margin */

    h2 {
      font-size: 24px; /* Smaller title */
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 6px;
    }

    .sub-text {
      color: #8c8c8c;
      font-size: 13px;
    }
  }

  .custom-form {
    .el-form-item {
      margin-bottom: 12px; /* Reduced spacing */
    }

    :deep(.el-input__wrapper) {
      box-shadow: none;
      border-bottom: 1px solid #e0e0e0;
      border-radius: 0;
      padding-left: 0;
      transition: border-color 0.3s;
      background: transparent;

      &.is-focus {
        box-shadow: none;
        border-bottom-color: #1a1a1a;
      }
    }

    :deep(.el-input__inner) {
      height: 36px; /* Reduced height */
      font-size: 14px;
      color: #1a1a1a;

      &::placeholder {
        color: #bfbfbf;
      }
    }

    :deep(.el-input__prefix) {
      color: #bfbfbf;
      margin-right: 12px;
    }

    /* Override browser autofill background */
    :deep(input:-webkit-autofill),
    :deep(input:-webkit-autofill:hover),
    :deep(input:-webkit-autofill:focus),
    :deep(input:-webkit-autofill:active) {
      -webkit-box-shadow: 0 0 0 30px white inset !important;
      -webkit-text-fill-color: #1a1a1a !important;
      transition: background-color 5000s ease-in-out 0s;
    }
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px; /* Reduced margin */

    .forgot-pwd {
      color: #666;
      font-size: 13px;
      text-decoration: none;
      transition: color 0.3s;

      &:hover {
        color: #1a1a1a;
      }
    }
  }

  .submit-btn {
    width: 100%;
    height: 44px; /* Reduced height */
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 2px;
    background: #1a1a1a;
    border: none;
    border-radius: 4px; /* Small border radius */
    transition: all 0.3s;

    &:hover {
      background: #333;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .form-footer {
    margin-top: 40px; /* Reduced margin */
    text-align: center;
    color: #bfbfbf;
    font-size: 12px;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 900px) {
  .login-visual {
    display: none;
  }

  .login-form-container {
    flex: 1;
    padding: 20px;
  }

  .form-content {
    max-width: 320px;
  }

  .form-header h2 {
    font-size: 24px;
  }
}
</style>
