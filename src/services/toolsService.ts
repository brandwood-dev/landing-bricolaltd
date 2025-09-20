import { api } from './api';
import { Tool, ToolPhoto, Category, Subcategory, CreateToolData, UpdateToolData, Review, CreateReviewData, ToolFilters } from '../types/bridge/tool.types';
import { ApiResponse, PaginatedResponse } from '../types/bridge/common.types';
import { ModerationStatus, ToolStatus } from '../types/bridge/enums';

export type { Tool, ToolPhoto, Category, Subcategory, CreateToolData, UpdateToolData,Review, CreateReviewData, ToolFilters };

// Tools service
export class ToolsService {
  // Get all tools with pagination and filters
  async getTools(filters?: ToolFilters): Promise<PaginatedResponse<Tool>> {
    const params = new URLSearchParams();
    
    if (filters) {
      if (filters.search) params.append('search', filters.search);
      if (filters.toolStatus) params.append('toolStatus', filters.toolStatus);
      if (filters.moderationStatus) params.append('moderationStatus', filters.moderationStatus);
    }
    
    const response = await api.get<ApiResponse<Tool[]>>(`/tools?${params.toString()}`);
    
    // Access the nested data structure: response.data.data.data
    let allTools = response.data.data?.data || response.data.data;
    
    // Ensure we have a valid array
    if (!Array.isArray(allTools)) {
      console.warn('Tools response is not an array:', allTools);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
    
    // Process tools to ensure numeric prices
    allTools = allTools.map(tool => ({
      ...tool,
      basePrice: typeof tool.basePrice === 'string' ? parseFloat(tool.basePrice) : tool.basePrice,
      depositAmount: typeof tool.depositAmount === 'string' ? parseFloat(tool.depositAmount) : tool.depositAmount,
    }));

    // Filter only confirmed and published tools for public display
    allTools = allTools.filter(tool => 
      tool.moderationStatus === ModerationStatus.CONFIRMED && 
      tool.toolStatus === ToolStatus.PUBLISHED
    );
    
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
    try {
      const response = await api.get<ApiResponse<Tool[]>>(`/tools/featured?limit=${limit}`);
      
      // Access the nested data structure: response.data.data.data
      const tools = response.data.data?.data || response.data.data;
      if (!Array.isArray(tools)) {
        console.warn('Featured tools response is not an array:', tools);
        return [];
      }
      
      // Process tools to ensure numeric prices - API already filters for confirmed/published tools
      return tools
        .map(tool => ({
          ...tool,
          basePrice: typeof tool.basePrice === 'string' ? parseFloat(tool.basePrice) : tool.basePrice,
          depositAmount: typeof tool.depositAmount === 'string' ? parseFloat(tool.depositAmount) : tool.depositAmount,
        }));
    } catch (error: any) {
      console.error('Error fetching featured tools:', error);
      return [];
    }
  }

  // Get single tool by ID
  async getTool(id: string): Promise<Tool> {
    try {
      const response = await api.get<ApiResponse<Tool>>(`/tools/${id}`);
      return response.data.data?.data || response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch tool');
    }
  }

  // Get tools by user ID
  async getToolsByUser(userId: string): Promise<Tool[]> {
    try {
      console.log('🔍 ToolsService.getToolsByUser - Fetching tools for user:', userId);
      const response = await api.get<ApiResponse<Tool[]>>(`/tools/user/${userId}`);
      const tools = response.data.data?.data || response.data.data;
      console.log('🔍 ToolsService.getToolsByUser - Raw API response:', response.data);
      console.log('🔍 ToolsService.getToolsByUser - Extracted tools:', tools);
      console.log('🔍 ToolsService.getToolsByUser - Tools with categories:', tools.map(tool => ({
        id: tool.id,
        title: tool.title,
        categoryId: tool.categoryId,
        category: tool.category,
        subcategoryId: tool.subcategoryId,
        subcategory: tool.subcategory
      })));
      return tools;
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
  async updateTool(id: string, updateData: UpdateToolData): Promise<Tool> {
    try {
      console.log('🔍 ToolsService.updateTool - Updating tool:', id, 'with data:', updateData);
      const response = await api.patch<ApiResponse<Tool>>(`/tools/${id}`, updateData);
      const updatedTool = response.data.data;
      console.log('🔍 ToolsService.updateTool - Updated tool response:', updatedTool);
      console.log('🔍 ToolsService.updateTool - Updated tool category info:', {
        id: updatedTool.id,
        title: updatedTool.title,
        categoryId: updatedTool.categoryId,
        category: updatedTool.category,
        subcategoryId: updatedTool.subcategoryId,
        subcategory: updatedTool.subcategory
      });
      return updatedTool;
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

  // Upload photos to tool
  async uploadPhotos(toolId: string, formData: FormData): Promise<ToolPhoto[]> {
    try {
      const response = await api.post<ApiResponse<ToolPhoto[]>>(`/tools/${toolId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload photos');
    }
  }

  // Add photo to tool
  async addToolPhoto(toolId: string, file: File, isPrimary: boolean = false): Promise<ToolPhoto> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('toolId', toolId);
      formData.append('isPrimary', isPrimary.toString());
      
      const response = await api.post<ApiResponse<ToolPhoto>>('/tool-photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to add photo');
    }
  }

  // Set photo as primary
  async setPhotoPrimary(photoId: string): Promise<ToolPhoto> {
    try {
      const response = await api.patch<ApiResponse<ToolPhoto>>(`/tool-photos/${photoId}/set-primary`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to set photo as primary');
    }
  }

  // Delete photo from tool
  async deletePhoto(toolId: string, photoId: string): Promise<void> {
    try {
      await api.delete(`/tool-photos/${photoId}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete photo');
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
      // Handle nested data structure: response.data.data.data or response.data.data
      const categories = response.data.data?.data || response.data.data;
      
      // Ensure we return an array
      if (!Array.isArray(categories)) {
        console.warn('Categories response is not an array:', categories);
        return [];
      }
      
      return categories;
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return []; // Return empty array instead of throwing to prevent component crashes
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