import { api as apiClient } from '../api-client';

export interface PluginConfig {
  layout: {
    pageWidth: string;
    pageHeight: string;
  };
  typography: {
    baseFont: string;
    titleFont: string;
  };
  palette: {
    title: string;
    accent: string;
    secondary: string;
  };
  components: {
    cover: {
      image: string;
    };
    toc: {
      title: string;
    };
  };
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
