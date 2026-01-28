import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { salesMenusApi, type SalesMenu, type SalesMenuItem } from '../api/sales-menus';
import { ElMessage } from 'element-plus';

export const useSalesMenuStore = defineStore('salesMenu', () => {
  const menus = ref<SalesMenu[]>([]);
  const loading = ref(false);
  const pagination = reactive({
    page: 1,
    limit: 10,
    total: 0,
    sorts: [] as { field: string; order: 'ASC' | 'DESC' }[],
  });
  const query = reactive({
    search: '',
  });

  // Editor state
  const currentMenu = ref<Partial<SalesMenu>>({
    name: '',
    description: '',
    active: true,
    items: [],
  });

  async function fetchMenus() {
    loading.value = true;
    try {
      const sortStr = pagination.sorts.map((s) => `${s.field}:${s.order}`).join(',');
      const res = await salesMenusApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: query.search,
        sort: sortStr || undefined,
      });

      // Defensive check for response format
      if (!res || !Array.isArray(res.data) || !res.meta) {
        throw new Error('后端返回数据格式异常: 缺少分页数据');
      }

      menus.value = res.data;
      pagination.total = res.meta.total;
    } catch (error) {
      console.error('Failed to fetch sales menus:', error);
      ElMessage.error('获取菜单列表失败');
    } finally {
      loading.value = false;
    }
  }

  function setSearch(term: string) {
    query.search = term;
    pagination.page = 1;
    fetchMenus();
  }

  function setPage(page: number) {
    pagination.page = page;
    fetchMenus();
  }

  function setLimit(limit: number) {
    pagination.limit = limit;
    pagination.page = 1;
    fetchMenus();
  }

  function setSort(sorts: { field: string; order: 'ASC' | 'DESC' }[]) {
    pagination.sorts = sorts;
    fetchMenus();
  }

  function setSort(field: string, order: 'ASC' | 'DESC') {
    query.sort = field;
    query.order = order;
    fetchMenus();
  }

  async function fetchMenu(id: string) {
    loading.value = true;
    try {
      const menu = await salesMenusApi.getById(id);
      currentMenu.value = JSON.parse(JSON.stringify(menu)); // Deep copy
    } catch (error) {
      console.error('Failed to fetch sales menu:', error);
      ElMessage.error('获取菜单详情失败');
    } finally {
      loading.value = false;
    }
  }

  function resetEditor() {
    currentMenu.value = {
      name: '',
      description: '',
      active: true,
      items: [],
    };
  }

  function addItem(item: SalesMenuItem) {
    if (!currentMenu.value.items) {
      currentMenu.value.items = [];
    }
    currentMenu.value.items.push(item);
  }

  function removeItem(index: number) {
    if (currentMenu.value.items) {
      currentMenu.value.items.splice(index, 1);
    }
  }

  async function saveMenu() {
    if (!currentMenu.value.name) {
      ElMessage.warning('请输入菜单名称');
      return;
    }

    loading.value = true;
    try {
      const payload = {
        name: currentMenu.value.name!,
        description: currentMenu.value.description,
        active: currentMenu.value.active,
        items: currentMenu.value.items?.map((item) => ({
          recipeId: item.recipeId,
          name: item.name,
          price: Number(item.price),
          category: item.category,
          order: Number(item.order || 0),
        })),
      };

      if (currentMenu.value.id) {
        await salesMenusApi.update(currentMenu.value.id, payload);
        ElMessage.success('更新成功');
      } else {
        await salesMenusApi.create(payload);
        ElMessage.success('创建成功');
      }
      resetEditor();
    } catch (error) {
      console.error('Failed to save sales menu:', error);
      ElMessage.error('保存失败');
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function deleteMenu(id: string) {
    try {
      await salesMenusApi.delete(id);
      ElMessage.success('删除成功');
      await fetchMenus();
    } catch (error) {
      console.error('Failed to delete sales menu:', error);
      ElMessage.error('删除失败');
    }
  }

  return {
    menus,
    loading,
    pagination,
    currentMenu,
    fetchMenus,
    fetchMenu,
    resetEditor,
    addItem,
    removeItem,
    saveMenu,
    deleteMenu,
    setSearch,
    setPage,
    setLimit,
    setSort,
  };
});
