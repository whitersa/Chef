export interface PluginThemeConfig {
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
      image?: string;
    };
    toc: {
      title: string;
    };
  };
}

export const DEFAULT_THEME_CONFIG: PluginThemeConfig = {
  layout: {
    pageWidth: '210mm',
    pageHeight: '297mm',
  },
  typography: {
    baseFont: 'Serif',
    titleFont: 'Sans',
  },
  palette: {
    title: '#2c3e50',
    accent: '#e67e22',
    secondary: '#3498db',
  },
  components: {
    cover: {},
    toc: {
      title: 'Table of Contents',
    },
  },
};
