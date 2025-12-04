import { api } from '../api-client';
import type { User } from '@chefos/types';
import type { PaginatedResponse, PaginationQuery } from './common';

export const usersApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<User>>('/users', { params: query }),
  getOne: (id: string) => api.get<User>(`/users/${id}`),
  create: (data: Partial<User>) => api.post<User>('/users', data),
  update: (id: string, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
};
