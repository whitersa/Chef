import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';
import type { Ingredient } from '@chefos/types';

export type { Ingredient };

export const ingredientsApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<Ingredient>>('/ingredients', { params: query }),
  create: (data: Omit<Ingredient, 'id'>) => api.post<Ingredient>('/ingredients', data),
  update: (id: string, data: Partial<Ingredient>) => api.patch(`/ingredients/${id}`, data),
  delete: (id: string) => api.delete(`/ingredients/${id}`),
  syncUsda: (page: number) =>
    api.post<{ count: number; message: string }>(`/ingredients/sync/usda?page=${page}`),
  getFullSyncStatus: () =>
    api.get<{
      isSyncing: boolean;
      totalSynced: number;
      currentPage: number;
      lastError: string | null;
      startTime: string | null;
    }>('/ingredients/sync/usda/status'),
  startFullSync: () => api.post('/ingredients/sync/usda/full'),
  stopSync: () => api.post('/ingredients/sync/usda/stop'),
  getSyncIssues: () => api.get<any[]>('/ingredients/sync/usda/issues'),
  resetSyncData: () => api.post('/ingredients/sync/usda/reset'),
};
