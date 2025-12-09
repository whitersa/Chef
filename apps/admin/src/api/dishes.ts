import { api } from '../api-client';
import type { Dish } from '@chefos/types';

export type { Dish };

export const dishesApi = {
  getAll: () => api.get<Dish[]>('/dishes'),
  getOne: (id: string) => api.get<Dish>(`/dishes/${id}`),
  create: (data: Partial<Dish>) => api.post<Dish>('/dishes', data),
  update: (id: string, data: Partial<Dish>) => api.put<Dish>(`/dishes/${id}`, data),
  delete: (id: string) => api.delete(`/dishes/${id}`),
};
