<template>
  <el-container class="layout-container">
    <el-aside width="220px">
      <el-menu :default-active="activeMenu" class="el-menu-vertical" router :collapse="false">
        <div class="logo">
          <img src="/chef-logo.svg" alt="ChefOS Logo" class="logo-img" />
          <span>ChefOS Admin</span>
        </div>

        <el-sub-menu index="kitchen">
          <template #title>
            <el-icon><Food /></el-icon>
            <span>后厨管理</span>
          </template>

          <el-menu-item index="/ingredient">
            <el-icon><Apple /></el-icon>
            <span>食材管理</span>
          </el-menu-item>

          <el-menu-item index="/recipe/list">
            <el-icon><Notebook /></el-icon>
            <span>菜谱管理</span>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="organization">
          <template #title>
            <el-icon><Shop /></el-icon>
            <span>组织管理</span>
          </template>
          <el-menu-item index="/user">
            <el-icon><Avatar /></el-icon>
            <span>人员列表</span>
          </el-menu-item>
        </el-sub-menu>
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { Food, Shop, Apple, Notebook, Avatar } from '@element-plus/icons-vue';

const route = useRoute();
const activeMenu = computed(() => route.path);
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
