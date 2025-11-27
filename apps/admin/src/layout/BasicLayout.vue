<template>
  <el-container class="layout-container">
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside-transition">
      <el-menu :default-active="activeMenu" class="el-menu-vertical" router :collapse="isCollapse">
        <div class="logo" :class="{ 'logo-collapsed': isCollapse }">
          <img src="/chef-logo.svg" alt="ChefOS Logo" class="logo-img" />
          <span v-show="!isCollapse">ChefOS Admin</span>
        </div>

        <template v-for="menu in menuStore.menus" :key="menu.id">
          <!-- Submenu -->
          <el-sub-menu v-if="menu.children && menu.children.length > 0" :index="menu.id">
            <template #title>
              <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
              <span>{{ menu.title }}</span>
            </template>
            <el-menu-item
              v-for="child in menu.children"
              :key="child.id"
              :index="child.path || child.id"
            >
              <el-icon v-if="child.icon"><component :is="child.icon" /></el-icon>
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- Single Menu Item -->
          <el-menu-item v-else :index="menu.path || menu.id">
            <el-icon v-if="menu.icon"><component :is="menu.icon" /></el-icon>
            <span>{{ menu.title }}</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header height="48px">
        <div class="header-content">
          <div class="left-section">
            <el-icon class="collapse-btn" @click="toggleCollapse">
              <component :is="isCollapse ? Expand : Fold" />
            </el-icon>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
              <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="user-info">
            <el-dropdown trigger="click">
              <el-button circle :icon="Setting" size="small" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item>
                    <div class="theme-switch">
                      <span>主题模式</span>
                      <el-switch
                        v-model="themeStore.theme"
                        active-value="dark"
                        inactive-value="light"
                        :active-icon="Moon"
                        :inactive-icon="Sunny"
                        inline-prompt
                      />
                    </div>
                  </el-dropdown-item>
                  <el-dropdown-item divided>
                    <div class="density-select">
                      <span>布局密度</span>
                      <el-radio-group v-model="themeStore.density" size="small">
                        <el-radio-button label="compact" value="compact">紧凑</el-radio-button>
                        <el-radio-button label="default" value="default">默认</el-radio-button>
                        <el-radio-button label="loose" value="loose">宽松</el-radio-button>
                      </el-radio-group>
                    </div>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <el-button type="primary" link @click="syncMenus">同步菜单</el-button>
            <el-avatar
              :size="24"
              src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
            />
            <span class="username">Admin</span>
          </div>
        </div>
      </el-header>
      <el-main>
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { menusApi } from '../api/menus';
import { ElMessage } from 'element-plus';
import { Fold, Expand, Setting, Moon, Sunny } from '@element-plus/icons-vue';
import { useThemeStore } from '../stores/theme';

const route = useRoute();
const menuStore = useMenuStore();
const themeStore = useThemeStore();
const activeMenu = computed(() => route.path);
const isCollapse = ref(false);

onMounted(() => {
  menuStore.fetchMenus();
});

function toggleCollapse() {
  isCollapse.value = !isCollapse.value;
}

async function syncMenus() {
  try {
    await menusApi.sync();
    ElMessage.success('菜单同步成功');
    await menuStore.fetchMenus();
  } catch (error) {
    console.error(error);
    ElMessage.error('菜单同步失败');
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100%;
  width: 100%;
}

.el-aside {
  background-color: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  transition: width 0.3s;
  overflow-x: hidden;

  .el-menu {
    border-right: none;
    width: 100%;
  }
}

.logo {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-primary);
  border-bottom: 1px solid var(--el-border-color-lighter);
  white-space: nowrap;
  overflow: hidden;

  .logo-img {
    width: 24px;
    height: 24px;
  }
}

.logo-collapsed {
  padding: 0;
  justify-content: center;
}

.el-header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
  padding: 0 12px;
  height: 48px;

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .left-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .collapse-btn {
    font-size: 18px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: color 0.3s;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .username {
      font-size: 12px;
      color: var(--el-text-color-regular);
    }
  }
}

.el-main {
  background-color: var(--el-bg-color-page);
  padding: var(--app-main-padding) !important;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.theme-switch,
.density-select {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 200px;
  padding: 4px 0;
}
</style>
