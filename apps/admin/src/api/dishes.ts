import { api } from '../api-client';
import type { Cuisine } from './cuisines';

export interface Dish {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  cuisineId?: string;
  cuisine?: Cuisine;
}

export const dishesApi = {
  getAll: () => api.get<Dish[]>('/dishes'),
  getOne: (id: string) => api.get<Dish>(`/dishes/${id}`),
  create: (data: Partial<Dish>) => api.post<Dish>('/dishes', data),
  update: (id: string, data: Partial<Dish>) => api.put<Dish>(`/dishes/${id}`, data),
  delete: (id: string) => api.delete(`/dishes/${id}`),
};
