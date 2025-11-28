import { api } from '../api-client';

export interface ProcurementItemRequest {
  recipeId: string;
  quantity: number;
}

export interface CreateProcurementListRequest {
  items: ProcurementItemRequest[];
}

export interface ProcurementItem {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
}

export const procurementApi = {
  generateList: (data: CreateProcurementListRequest) =>
    api.post<ProcurementItem[]>('/procurement/generate', data),
};
