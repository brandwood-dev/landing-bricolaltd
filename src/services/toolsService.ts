import { api } from './api';
import { Tool, ToolPhoto, Category, Subcategory, CreateToolData, UpdateToolData, Review, CreateReviewData, ToolFilters } from '../types/bridge/tool.types';
import { ApiResponse, PaginatedResponse } from '../types/bridge/common.types';

export type { Tool, ToolPhoto, Category, Subcategory, CreateToolData, UpdateToolData,Review, CreateReviewData, ToolFilters };



// Tools service
export class ToolsService {
  // Get all tools with pagination and filters
  async getTools(filters?: ToolFilters): Promise<PaginatedResponse<Tool>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.isAvailable !== undefined) params.append('isAvailable', filters.isAvailable.toString());
      if (filters.toolStatus) params.append('toolStatus', filters.toolStatus);
    }
    
    const response = await api.get<ApiResponse<Tool[]>>(`/tools?${params.toString()}`);
    
    let allTools = response.data.data || [];
    
    // Process tools to ensure numeric prices, calculate isAvailable, and apply client-side filtering
    allTools = allTools.map(tool => ({
      ...tool,
      basePrice: typeof tool.basePrice === 'string' ? parseFloat(tool.basePrice) : tool.basePrice,
      depositAmount: typeof tool.depositAmount === 'string' ? parseFloat(tool.depositAmount) : tool.depositAmount,
      isAvailable: tool.availabilityStatus === '1' || tool.availabilityStatus === 1,
    }));
    
    // Apply client-side filters
    if (filters) {
      if (filters.categoryId && filters.categoryId !== 'all') {
        allTools = allTools.filter(tool => tool.categoryId === filters.categoryId);
      }
      if (filters.subcategoryId && filters.subcategoryId !== 'all') {
        allTools = allTools.filter(tool => tool.subcategoryId === filters.subcategoryId);
      }
      if (filters.minPrice !== undefined) {
        allTools = allTools.filter(tool => tool.basePrice >= filters.minPrice!);
      }
      if (filters.maxPrice !== undefined) {
        allTools = allTools.filter(tool => tool.basePrice <= filters.maxPrice!);
      }
      if (filters.location) {
        allTools = allTools.filter(tool => 
          tool.pickupAddress?.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.toolStatus) {
        allTools = allTools.filter(tool => tool.toolStatus === filters.toolStatus);
      }
    }
    
    // Apply sorting
    if (filters?.sortBy) {
      allTools.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (filters.sortBy) {
          case 'title':
            aValue = a.title?.toLowerCase() || '';
            bValue = b.title?.toLowerCase() || '';
            break;
          case 'basePrice':
            aValue = a.basePrice || 0;
            bValue = b.basePrice || 0;
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt || 0).getTime();
            bValue = new Date(b.createdAt || 0).getTime();
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1;
        if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }
    
    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTools = allTools.slice(startIndex, endIndex);
    
    return {
      data: paginatedTools,
      total: allTools.length,
      page: page,
      limit: limit,
      totalPages: Math.ceil(allTools.length / limit)
    };
  }

  // Get featured tools for homepage
  async getFeaturedTools(limit: number = 8): Promise<Tool[]> {
    const response = await api.get<ApiResponse<PaginatedResponse<Tool>>>(`/tools?limit=${limit}&isAvailable=true&sortBy=rating&sortOrder=desc`);
    // Calculate isAvailable from availabilityStatus for each tool
    return response.data.data.map(tool => ({
      ...tool,
      isAvailable: tool.availabilityStatus === '1' || tool.availabilityStatus === 1,
    }));
  }

  // Get single tool by ID
  async getTool(id: string): Promise<Tool> {
    try {
      const response = await api.get<ApiResponse<Tool>>(`/tools/${id}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tool');
    }
  }

  // Get tools by user ID
  async getToolsByUser(userId: string): Promise<Tool[]> {
    try {
      const response = await api.get<ApiResponse<Tool[]>>(`/tools/user/${userId}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user tools');
    }
  }

  // Create new tool
  async createTool(toolData: CreateToolData, files?: File[]): Promise<Tool> {
    try {
      const formData = new FormData();
      
      // Add tool data (excluding primaryPhotoIndex which is handled separately)
      Object.entries(toolData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'primaryPhotoIndex') {
          formData.append(key, value.toString());
        }
      });
      
      // Add files
      if (files && files.length > 0) {
        files.forEach((file, index) => {
          formData.append('files', file);
        });
      }
      
      // Add primary photo index if specified
      if (toolData.primaryPhotoIndex !== undefined) {
        formData.append('primaryPhotoIndex', toolData.primaryPhotoIndex.toString());
      }
      
      const response = await api.post<ApiResponse<Tool>>('/tools', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create tool');
    }
  }

  // Update tool
  async updateTool(id: string, toolData: Partial<UpdateToolData>, files?: File[]): Promise<Tool> {
    try {
      const formData = new FormData();
      
      // Add tool data
      Object.entries(toolData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      
      // Add files
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append('files', file);
        });
      }
      
      const response = await api.patch<ApiResponse<Tool>>(`/tools/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update tool');
    }
  }

  // Delete tool
  async deleteTool(id: string): Promise<void> {
    try {
      await api.delete(`/tools/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete tool');
    }
  }

  // Update tool availability
  async updateToolAvailability(id: string, isAvailable: boolean): Promise<Tool> {
    try {
      const response = await api.patch<ApiResponse<Tool>>(`/tools/${id}/availability`, { isAvailable });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update tool availability');
    }
  }

  // Check tool availability for specific dates
  async checkToolAvailability(id: string, startDate: string, endDate: string): Promise<{ available: boolean; message?: string }> {
    try {
      const response = await api.get<ApiResponse<{ available: boolean; message?: string }>>(`/tools/${id}/check-availability`, {
        params: { startDate, endDate }
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check tool availability');
    }
  }

  // Get tool photos
  async getToolPhotos(id: string): Promise<ToolPhoto[]> {
    try {
      const response = await api.get<ApiResponse<ToolPhoto[]>>(`/tools/${id}/photos`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tool photos');
    }
  }

  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      const response = await api.get<ApiResponse<Category[]>>('/categories');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  }

  // Get subcategories by category
  async getSubcategoriesByCategory(categoryId: string): Promise<Subcategory[]> {
    try {
      const response = await api.get<ApiResponse<Subcategory[]>>(`/categories/${categoryId}/subcategories`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch subcategories');
    }
  }

  // Search tools
  async searchTools(query: string, filters?: Omit<ToolFilters, 'search'>): Promise<PaginatedResponse<Tool>> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getTools(searchFilters);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search tools');
    }
  }

  // Get reviews for a tool
  async getToolReviews(toolId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Review>> {
    try {
      const response = await api.get<ApiResponse<Review[]>>(`/reviews/tools/tool/${toolId}`);
      // Since the backend doesn't support pagination for this endpoint, we'll simulate it
      const allReviews = response.data.data || [];
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedReviews = allReviews.slice(startIndex, endIndex);
      
      return {
        data: paginatedReviews,
        total: allReviews.length,
        page: page,
        limit: limit,
        totalPages: Math.ceil(allReviews.length / limit)
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }

  // Create a review for a tool
  async createReview(reviewData: CreateReviewData): Promise<Review> {
    try {
      const response = await api.post<ApiResponse<Review>>('/reviews', reviewData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create review');
    }
  }

  // Update a review
  async updateReview(reviewId: string, reviewData: Partial<CreateReviewData>): Promise<Review> {
    try {
      const response = await api.put<ApiResponse<Review>>(`/reviews/${reviewId}`, reviewData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await api.delete(`/reviews/${reviewId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  }

  // Check name uniqueness
  async checkNameUniqueness(name: string): Promise<{ isUnique: boolean }> {
    try {
      const response = await api.get<ApiResponse<{ isUnique: boolean }>>(`/tools/check-name/${encodeURIComponent(name)}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to check name uniqueness');
    }
  }
}

export const toolsService = new ToolsService();
export default toolsService;