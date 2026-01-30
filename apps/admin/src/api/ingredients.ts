import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';
import type { Ingredient } from '@chefos/types';

export type { Ingredient };

export interface SyncStatus {
  isSyncing: boolean;
  totalSynced: number;
  totalIngredients?: number;
  currentPage: number;
  lastError: string | null;
  startTime: string | null;
  logs: string[];
}

export interface SyncIssue {
  id: number;
  fdcId: string;
  foodDescription?: string;
  errorMessage: string;
  rawData?: unknown;
  createdAt: string;
}

export const ingredientsApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<Ingredient>>('/ingredients', { params: query }),
  getTree: (search?: string) => api.get<Ingredient[]>('/ingredients/tree', { params: { search } }),
  create: (data: Omit<Ingredient, 'id'>) => api.post<Ingredient>('/ingredients', data),
  update: (id: string, data: Partial<Ingredient>) => api.patch(`/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/ingredients/${id}`),
  syncUsda: (page: number) =>
    api.post<{ count: number; message: string }>(`/ingredients/sync/usda?page=${page}`),
  getFullSyncStatus: () => api.get<SyncStatus>('/ingredients/sync/usda/status'),
  startFullSync: () => api.post('/ingredients/sync/usda/full'),
  stopSync: () => api.post('/ingredients/sync/usda/stop'),
  getSyncIssues: () => api.get<SyncIssue[]>('/ingredients/sync/usda/issues'),
  resetSyncData: () => api.post('/ingredients/sync/usda/reset'),
};
