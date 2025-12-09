import { api as apiClient } from '../api-client';

export interface PluginConfig {
  baseFontFamily: string;
  titleFontFamily: string;
  titleColor: string;
  accentColor: string;
  secondaryColor: string;
}

export const getPluginConfig = () => {
  return apiClient.get<PluginConfig>('/plugins/config');
};

export const updatePluginConfig = (data: PluginConfig) => {
  return apiClient.put('/plugins/config', data);
};
