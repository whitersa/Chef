import { api } from '../api-client';

export const publisherApi = {
  downloadRecipePdf: async (recipeId: string, recipeName: string) => {
    const blob = await api.post<Blob>(
      `/publisher/recipe/${recipeId}/pdf`,
      {},
      {
        responseType: 'blob',
      },
    );

    // Create a blob link to download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recipe-${recipeName}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
