import { api } from '../api-client';

export interface ProcurementItemRequest {
  recipeId: string;
  quantity: number;
}

export interface SalesMenuRequest {
  menuId: string;
  quantity: number;
}

export interface CreateProcurementListRequest {
  items: ProcurementItemRequest[];
  salesMenus?: SalesMenuRequest[];
}

export interface ProcurementItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export const ProcurementStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type ProcurementStatus = (typeof ProcurementStatus)[keyof typeof ProcurementStatus];

export interface Procurement {
  id: string;
  status: ProcurementStatus;
  totalPrice: number;
  items: {
    id: string;
    ingredient: { id: string; name: string; unit: string };
    quantity: number;
    unit: string;
    cost: number;
  }[];
  createdAt: string;
}

export const procurementApi = {
  generateList: (data: CreateProcurementListRequest) =>
    api.post<ProcurementItem[]>('/procurement/generate', data),

  create: (data: CreateProcurementListRequest) => api.post<Procurement>('/procurement', data),

  getAll: () => api.get<Procurement[]>('/procurement'),

  getOne: (id: string) => api.get<Procurement>(`/procurement/${id}`),

  updateStatus: (id: string, status: ProcurementStatus) =>
    api.patch<Procurement>(`/procurement/${id}/status`, { status }),
};
