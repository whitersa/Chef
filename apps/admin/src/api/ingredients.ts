import { api } from '../api-client';

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
  getAll: () => api.get<Ingredient[]>('/ingredients'),
  create: (data: Omit<Ingredient, 'id'>) => api.post<Ingredient>('/ingredients', data),
  update: (id: string, data: Partial<Ingredient>) => api.patch(`/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/ingredients/${id}`),
};
