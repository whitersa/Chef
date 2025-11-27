import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import BasicLayout from '../layout/BasicLayout.vue';
import Login from '../views/Login.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
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
        path: 'processing',
        name: 'ProcessingList',
        component: () => import('../views/processing/ProcessingList.vue'),
        meta: { title: '预处理管理' },
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
            component: () => import('../views/recipe/Editor.vue'),
            meta: { title: '可视化编辑器' },
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
