import { api } from '../api-client';

export interface ProcessingMethod {
  id: string;
  name: string;
  description?: string;
}

export const processingApi = {
  getAll: () => api.get<ProcessingMethod[]>('/processing-methods'),
  create: (data: { name: string; description?: string }) => api.post('/processing-methods', data),
  delete: (id: string) => api.delete(`/processing-methods/${id}`),
};
