import { api } from '../api-client';
import type { Unit } from '@chefos/types';

export const getUnits = () => {
  return api.get<Unit[]>('/units');
};

export const createUnit = (data: Partial<Unit>) => {
  return api.post<Unit>('/units', data);
};

export const updateUnit = (id: string, data: Partial<Unit>) => {
  return api.patch<Unit>(`/units/${id}`, data);
};

export const deleteUnit = (id: string) => {
  return api.delete(`/units/${id}`);
};
