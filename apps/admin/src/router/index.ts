import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import BasicLayout from '../layout/BasicLayout.vue';
import LoginView from '../views/LoginView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Login', public: true },
  },
  {
    path: '/',
    component: BasicLayout,
    redirect: '/ingredient',
    children: [
      {
        path: 'ingredient',
        name: 'IngredientList',
        component: () => import('../views/ingredient/IngredientList.vue'),
        meta: { title: '食材管理' },
      },
      {
        path: 'units',
        name: 'UnitList',
        component: () => import('../views/unit/UnitList.vue'),
        meta: { title: '单位管理' },
      },
      {
        path: 'processing',
        name: 'ProcessingList',
        component: () => import('../views/processing/ProcessingList.vue'),
        meta: { title: '预处理管理' },
      },
      {
        path: 'cuisines',
        name: 'CuisineList',
        component: () => import('../views/cuisines/CuisineList.vue'),
        meta: { title: '菜系管理' },
      },
      {
        path: 'dishes',
        name: 'DishList',
        component: () => import('../views/dishes/DishList.vue'),
        meta: { title: '菜品管理' },
      },
      {
        path: 'recipe',
        meta: { title: '菜谱管理' },
        children: [
          {
            path: 'list',
            name: 'RecipeList',
            component: () => import('../views/recipe/RecipeList.vue'),
            meta: { title: '菜谱列表' },
          },
          {
            path: 'editor/:id?',
            name: 'RecipeEditor',
            component: () => import('../views/recipe/RecipeEditor.vue'),
            meta: { title: '可视化编辑器' },
          },
        ],
      },
      {
        path: 'sales-menu',
        meta: { title: '销售菜单' },
        children: [
          {
            path: 'list',
            name: 'SalesMenuList',
            component: () => import('../views/sales-menu/SalesMenuList.vue'),
            meta: { title: '菜单列表' },
          },
          {
            path: 'editor/:id?',
            name: 'SalesMenuEditor',
            component: () => import('../views/sales-menu/SalesMenuEditor.vue'),
            meta: { title: '菜单编辑' },
          },
        ],
      },
      {
        path: 'console',
        name: 'Console',
        component: () => import('../views/console/ConsoleView.vue'),
        meta: { title: '系统控制台' },
      },
      {
        path: 'procurement',
        name: 'Procurement',
        component: () => import('../views/procurement/ProcurementList.vue'),
        meta: { title: '采购清单' },
      },
      {
        path: 'publisher',
        meta: { title: '发布管理' },
        children: [
          {
            path: 'artifacts',
            name: 'RecipeArtifacts',
            component: () => import('../views/publisher/RecipeArtifacts.vue'),
            meta: { title: '菜谱产物' },
          },
        ],
      },
      {
        path: 'plugins',
        meta: { title: '插件管理' },
        children: [
          {
            path: '',
            name: 'PluginList',
            component: () => import('../views/plugin/PluginList.vue'),
            meta: { title: '插件列表' },
          },
          {
            path: ':name',
            name: 'PluginConfig',
            component: () => import('../views/plugin/PluginManager.vue'),
            meta: { title: '插件配置', hidden: true },
          },
        ],
      },
      {
        path: 'user',
        name: 'UserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { title: '人员管理' },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
  if (to.meta.public) {
    if (token && to.name === 'Login') {
      next('/');
    } else {
      next();
    }
  } else {
    if (token) {
      next();
    } else {
      next('/login');
    }
  }
});

export default router;
