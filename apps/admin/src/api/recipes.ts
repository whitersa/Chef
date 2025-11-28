import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';
import type { Ingredient } from './ingredients';

export interface RecipeItem {
  id: string;
  quantity: number;
  yieldRate: number;
  ingredient?: Ingredient;
  childRecipe?: Recipe;
  ingredientId?: string;
  childRecipeId?: string;
}

export interface Recipe {
  id: string;
  name: string;
  steps?: string[];
  preProcessing?: string[];
  items: RecipeItem[];
}

export interface CreateRecipeItemRequest {
  quantity: number;
  yieldRate?: number;
  ingredientId?: string;
  childRecipeId?: string;
}

export interface CreateRecipeRequest {
  name: string;
  steps?: string[];
  preProcessing?: string[];
  items?: CreateRecipeItemRequest[];
}

export interface Nutrition {
  totalWeight: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export const recipesApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<Recipe>>('/recipes', { params: query }),
  getById: (id: string) => api.get<Recipe>(`/recipes/${id}`),
  create: (data: CreateRecipeRequest) => api.post('/recipes', data),
  update: (id: string, data: Partial<CreateRecipeRequest>) => api.patch(`/recipes/${id}`, data),
  delete: (id: string) => api.delete(`/recipes/${id}`),
  getCost: (id: string) => api.get<number>(`/recipes/${id}/cost`),
  getNutrition: (id: string) => api.get<Nutrition>(`/recipes/${id}/nutrition`),
};
