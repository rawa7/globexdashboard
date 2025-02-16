import { api } from '@/lib/axios';

export interface Article {
  id: string;
  title: {
    en: string;
    ar: string;
    cbk: string;
  };
  content: {
    en: string;
    ar: string;
    cbk: string;
  };
  is_premium: boolean;
  created_at: string;
  importance_rating: number;
  thumbnail_url: string;
}

export const articleService = {
  getAll: async () => {
    const { data } = await api.get<Article[]>('/articles');
    return data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<Article[]>(`/articles?id=eq.${id}`);
    return data[0];
  },

  create: async (articleData: Omit<Article, 'id' | 'created_at'>) => {
    const { data } = await api.post<Article[]>('/articles', articleData);
    return data[0];
  },

  update: async ({ id, ...articleData }: Partial<Article> & { id: string }) => {
    const { data } = await api.patch<Article[]>(`/articles?id=eq.${id}`, articleData);
    return data[0];
  },

  delete: async (id: string) => {
    await api.delete(`/articles?id=eq.${id}`);
  },
}; 