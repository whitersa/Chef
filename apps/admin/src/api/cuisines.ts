import { api } from '../api-client';
import type { Cuisine } from '@chefos/types';

export type { Cuisine };

export const cuisinesApi = {
  getAll: () => api.get<Cuisine[]>('/cuisines'),
  getOne: (id: string) => api.get<Cuisine>(`/cuisines/${id}`),
  create: (data: Partial<Cuisine>) => api.post<Cuisine>('/cuisines', data),
  update: (id: string, data: Partial<Cuisine>) => api.put<Cuisine>(`/cuisines/${id}`, data),
  delete: (id: string) => api.delete(`/cuisines/${id}`),
};
