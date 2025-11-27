import { api } from '../api-client';

export const recipesApi = {
  getAll: () => api.get<any[]>('/recipes'),
  getById: (id: string) => api.get<any>(`/recipes/${id}`),
  create: (data: any) => api.post('/recipes', data),
  update: (id: string, data: any) => api.patch(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
  getCost: (id: string) => api.get<number>(`/recipes/${id}/cost`),
};
