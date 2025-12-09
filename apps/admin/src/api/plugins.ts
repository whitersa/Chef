import { api as apiClient } from '../api-client';

export interface PluginConfig {
  baseFontFamily: string;
  titleFontFamily: string;
  titleColor: string;
  accentColor: string;
  secondaryColor: string;
}

export const getPlugins = () => {
  return apiClient.get<string[]>('/plugins');
};

export const getPluginConfig = (name: string) => {
  return apiClient.get<PluginConfig>(`/plugins/${name}/config`);
};

export const updatePluginConfig = (name: string, data: PluginConfig) => {
  return apiClient.put(`/plugins/${name}/config`, data);
};
