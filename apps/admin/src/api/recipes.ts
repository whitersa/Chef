import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';
import type { Recipe, RecipeItem, ProcessingStep } from '@chefos/types';

export type { Recipe, RecipeItem };

export interface CreateRecipeItemRequest {
  quantity: number;
  yieldRate?: number;
  ingredientId?: string;
  childRecipeId?: string;
}

export interface CreateRecipeRequest {
  name: string;
  steps?: string[];
  preProcessing?: ProcessingStep[];
  items?: CreateRecipeItemRequest[];
}

export type Nutrition = Record<string, number>;

export interface CostBreakdown {
  total: number;
  perPortion: number;
}

export const recipesApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<Recipe>>('/recipes', { params: query }),
  getById: (id: string) => api.get<Recipe>(`/recipes/${id}`),
  create: (data: CreateRecipeRequest) => api.post('/recipes', data),
  update: (id: string, data: Partial<CreateRecipeRequest>) => api.patch(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
  getCost: (id: string) => api.get<CostBreakdown>(`/recipes/${id}/cost`),
  getNutrition: (id: string) => api.get<Nutrition>(`/recipes/${id}/nutrition`),
};
