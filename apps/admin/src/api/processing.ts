import { api } from '../api-client';
import type { PaginatedResponse, PaginationQuery } from './common';

export interface ProcessingMethod {
  id: string;
  name: string;
  description?: string;
}

export const processingApi = {
  getAll: (query?: PaginationQuery) =>
    api.get<PaginatedResponse<ProcessingMethod>>('/processing-methods', { params: query }),
  create: (data: { name: string; description?: string }) => api.post('/processing-methods', data),
  delete: (id: string) => api.delete(`/processing-methods/${id}`),
};
