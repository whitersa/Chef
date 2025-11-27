<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <el-menu :default-active="activeMenu" class="el-menu-vertical" router :collapse="false">
        <div class="logo">
          <img src="/chef-logo.svg" alt="ChefOS Logo" class="logo-img" />
          <span>ChefOS Admin</span>
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
      <el-header>
        <div class="header-content">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
          <div class="user-info">
            <el-button type="primary" link @click="syncMenus">同步菜单</el-button>
            <el-avatar
              :size="32"
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
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useMenuStore } from '../stores/menu';
import { menusApi } from '../api/menus';
import { ElMessage } from 'element-plus';

const route = useRoute();
const menuStore = useMenuStore();
const activeMenu = computed(() => route.path);

onMounted(() => {
  menuStore.fetchMenus();
});

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
  background-color: #fff;
  border-right: 1px solid #e6e6e6;

  .el-menu {
    border-right: none;
  }
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  border-bottom: 1px solid #e6e6e6;

  .logo-img {
    width: 32px;
    height: 32px;
  }
}

.el-header {
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  padding: 0 20px;

  .header-content {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .username {
      font-size: 14px;
      color: #606266;
    }
  }
}

.el-main {
  background-color: #f5f7fa;
  padding: 20px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
