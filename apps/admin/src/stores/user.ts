import { defineStore } from 'pinia';
import { ref, reactive } from 'vue';
import { usersApi } from '../api/users';
import type { User } from '@chefos/types';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
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

  async function fetchUsers() {
    loading.value = true;
    try {
      const sortStr = pagination.sorts.map((s) => `${s.field}:${s.order}`).join(',');
      const { data, meta } = await usersApi.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: query.search,
        sort: sortStr || undefined,
      });
      users.value = data;
      pagination.total = meta.total;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loading.value = false;
    }
  }

  function setSearch(term: string) {
    query.search = term;
    pagination.page = 1;
    fetchUsers();
  }

  function setPage(page: number) {
    pagination.page = page;
    fetchUsers();
  }

  function setLimit(limit: number) {
    pagination.limit = limit;
    pagination.page = 1;
    fetchUsers();
  }

  function setSort(sorts: { field: string; order: 'ASC' | 'DESC' }[]) {
    pagination.sorts = sorts;
    fetchUsers();
  }
    pagination.limit = limit;
    pagination.page = 1;
    fetchUsers();
  }

  function setSort(field: string, order: 'ASC' | 'DESC') {
    query.sort = field;
    query.order = order;
    fetchUsers();
  }

  async function createUser(user: Partial<User>) {
    try {
      await usersApi.create(user);
      fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async function deleteUser(id: string) {
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  return {
    users,
    loading,
    pagination,
    fetchUsers,
    createUser,
    deleteUser,
    setSearch,
    setPage,
    setLimit,
    setSort,
  };
});
