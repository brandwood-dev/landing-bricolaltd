import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';
import { News, NewsCategory, NewsFilters } from '../types/bridge/news.types';

export type { News, NewsCategory, NewsFilters }

export interface PaginatedNews {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// News service for frontend (public-facing)
export class NewsService {
  // Get public news with pagination and filters
  async getPublicNews(filters?: NewsFilters): Promise<PaginatedNews> {
    try {
      const params = new URLSearchParams();
      
      // Always filter for public news only
      params.append('isPublic', 'true');
      
      if (filters) {
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString());
        if (filters.sortBy) params.append('sortBy', filters.sortBy);
        if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
      }
      
      const response = await api.get<ApiResponse<PaginatedNews>>(`/news?${params.toString()}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news');
    }
  }

  // Get featured news for homepage
  async getFeaturedNews(limit: number = 3): Promise<News[]> {
    try {
      const response = await api.get<ApiResponse<News[]>>(`/news/featured?limit=${limit}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch featured news');
    }
  }

  // Get single news article by ID
  async getNewsById(id: string): Promise<News> {
    try {
      const response = await api.get<ApiResponse<News>>(`/news/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news article');
    }
  }

  // Get news by category
  async getNewsByCategory(category: string, filters?: Omit<NewsFilters, 'category'>): Promise<PaginatedNews> {
    try {
      const categoryFilters = { ...filters, category };
      return await this.getPublicNews(categoryFilters);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch news by category');
    }
  }

  // Search news articles
  async searchNews(query: string, filters?: Omit<NewsFilters, 'search'>): Promise<PaginatedNews> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getPublicNews(searchFilters);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search news');
    }
  }

  // Get related articles (by category, excluding current article)
  async getRelatedNews(currentId: string, category?: string, limit: number = 4): Promise<News[]> {
    try {
      const params = new URLSearchParams();
      params.append('isPublic', 'true');
      params.append('limit', (limit + 1).toString()); // Get one extra to exclude current
      
      if (category) {
        params.append('category', category);
      }
      
      const response = await api.get<ApiResponse<PaginatedNews>>(`/news?${params.toString()}`);
      // Filter out current article and limit results
      const filteredNews = response.data.data.data.filter(article => article.id !== currentId).slice(0, limit);
      return filteredNews;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch related news');
    }
  }

  // Get news categories (if available)
  async getNewsCategories(): Promise<NewsCategory[]> {
    try {
      const response = await api.get<ApiResponse<NewsCategory[]>>('/categories');
      return response.data.data || [];
    } catch (error: any) {
      // Return empty array if categories endpoint doesn't exist yet
      console.warn('News categories endpoint not available:', error.message);
      return [];
    }
  }

  // Get latest news for homepage or sidebar
  async getLatestNews(limit: number = 5): Promise<News[]> {
    try {
      const response = await api.get<ApiResponse<News[]>>(`/news/latest?limit=${limit}&isPublic=true`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch latest news');
    }
  }
}

export const newsService = new NewsService();
export default newsService;