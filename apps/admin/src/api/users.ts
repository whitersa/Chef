import { api } from '../api-client';
import type { User } from '@chefos/types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users'),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
