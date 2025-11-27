import { api } from '../api-client';

export interface Menu {
  id: string;
  title: string;
  path?: string;
  icon?: string;
  children?: Menu[];
}

export const menusApi = {
  getAll: () => api.get<Menu[]>('/menus'),
  sync: () => api.post('/menus/sync'),
};
