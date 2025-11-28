import { api } from '../api-client';

export interface SalesMenuItem {
  id?: string;
  recipeId?: string;
  name: string;
  price: number;
  category?: string;
  order?: number;
  recipe?: {
    id: string;
    name: string;
  };
}

export interface SalesMenu {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  items: SalesMenuItem[];
}

export interface CreateSalesMenuItemRequest {
  recipeId?: string;
  name: string;
  price: number;
  category?: string;
  order?: number;
}

export interface CreateSalesMenuRequest {
  name: string;
  description?: string;
  active?: boolean;
  items?: CreateSalesMenuItemRequest[];
}

export interface UpdateSalesMenuRequest extends Partial<CreateSalesMenuRequest> {}

export const salesMenusApi = {
  getAll: () => api.get<SalesMenu[]>('/sales-menus'),
  getById: (id: string) => api.get<SalesMenu>(`/sales-menus/${id}`),
  create: (data: CreateSalesMenuRequest) => api.post<SalesMenu>('/sales-menus', data),
  update: (id: string, data: UpdateSalesMenuRequest) =>
    api.patch<SalesMenu>(`/sales-menus/${id}`, data),
  delete: (id: string) => api.delete(`/sales-menus/${id}`),
};
