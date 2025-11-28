import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';

export interface Ingredient {
  id: string;
  name: string;
  price: number;
  unit: string;
  nutrition: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

export const ingredientsApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<Ingredient>>('/ingredients', { params: query }),
  create: (data: Omit<Ingredient, 'id'>) => api.post<Ingredient>('/ingredients', data),
  update: (id: string, data: Partial<Ingredient>) => api.patch(`/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/ingredients/${id}`),
};
