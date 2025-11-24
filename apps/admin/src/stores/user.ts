import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../api';
import type { User } from '@chefos/types';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);

  async function fetchUsers() {
    loading.value = true;
    try {
      users.value = await api.get<User[]>('/users');
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createUser(user: Partial<User>) {
    try {
      const newUser = await api.post<User>('/users', user);
      users.value.push(newUser);
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  }

  async function deleteUser(id: string) {
    try {
      await api.delete(`/users/${id}`);
      users.value = users.value.filter((u) => u.id !== id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  }

  return { users, loading, fetchUsers, createUser, deleteUser };
});
