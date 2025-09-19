import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';

export interface ReviewApp {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
}

export interface CreateReviewAppDto {
  rating: number;
  comment: string;
  reviewerId: string;
}

export interface UpdateReviewAppDto {
  rating?: number;
  comment?: string;
}

export interface ReviewTool {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  toolId: string;
  bookingId: string;
  reviewer: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  reviewee: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  tool: {
    id: string;
    name: string;
    description: string;
  };
  booking: {
    id: string;
    startDate: string;
    endDate: string;
  };
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  editedAt?: string;
}

export interface CreateReviewToolDto {
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  toolId: string;
  bookingId: string;
}

export interface UpdateReviewToolDto {
  rating?: number;
  comment?: string;
}

class ReviewsService {
  // Get all app reviews
  async getAppReviews(): Promise<ReviewApp[]> {
    try {
      console.log('📝 Fetching app reviews...');
      const response = await api.get<ApiResponse<ReviewApp[]>>('/reviews/app');
      console.log('📝 App reviews fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error fetching app reviews:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch app reviews');
    }
  }

  // Get latest app reviews (limited to most recent)
  async getLatestAppReviews(limit: number = 6): Promise<ReviewApp[]> {
    try {
      console.log('📝 Fetching latest app reviews...');
      const allReviews = await this.getAppReviews();
      const latestReviews = allReviews.slice(0, limit);
      console.log('📝 Latest app reviews fetched:', latestReviews);
      return latestReviews;
    } catch (error: any) {
      console.error('📝 Error fetching latest app reviews:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch latest app reviews');
    }
  }

  // Get app review by ID
  async getAppReview(id: string): Promise<ReviewApp> {
    try {
      console.log('📝 Fetching app review by ID:', id);
      const response = await api.get<ApiResponse<ReviewApp>>(`/reviews/app/${id}`);
      console.log('📝 App review fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error fetching app review:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch app review');
    }
  }

  // Get app reviews by user ID
  async getAppReviewsByUserId(userId: string): Promise<ReviewApp[]> {
    try {
      console.log('📝 Fetching app reviews by user ID:', userId);
      const response = await api.get<ApiResponse<ReviewApp[]>>(`/reviews/app/user/${userId}`);
      console.log('📝 App reviews by user fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error fetching app reviews by user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch app reviews by user');
    }
  }

  // Check if user has already reviewed the app
  async checkUserAppReview(userId: string): Promise<{ hasReviewed: boolean; review?: ReviewApp }> {
    try {
      console.log('📝 Checking if user has reviewed the app:', userId);
      const response = await api.get<ApiResponse<{ hasReviewed: boolean; review?: ReviewApp }>>(`/reviews/app/check/${userId}`);
      console.log('📝 User app review check result:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error checking user app review:', error);
      throw new Error(error.response?.data?.message || 'Failed to check user app review');
    }
  }

  // Create app review
  async createAppReview(reviewData: CreateReviewAppDto): Promise<ReviewApp> {
    try {
      console.log('📝 Creating app review:', reviewData);
      const response = await api.post<ApiResponse<ReviewApp>>('/reviews/app', reviewData);
      console.log('📝 App review created successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error creating app review:', error);
      throw new Error(error.response?.data?.message || 'Failed to create app review');
    }
  }

  // Update app review
  async updateAppReview(id: string, reviewData: UpdateReviewAppDto): Promise<ReviewApp> {
    try {
      console.log('📝 Updating app review:', id, reviewData);
      const response = await api.patch<ApiResponse<ReviewApp>>(`/reviews/app/${id}`, reviewData);
      console.log('📝 App review updated successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('📝 Error updating app review:', error);
      throw new Error(error.response?.data?.message || 'Failed to update app review');
    }
  }

  // Delete app review
  async deleteAppReview(id: string): Promise<void> {
    try {
      console.log('📝 Deleting app review:', id);
      await api.delete(`/reviews/app/${id}`);
      console.log('📝 App review deleted successfully');
    } catch (error: any) {
      console.error('📝 Error deleting app review:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete app review');
    }
  }

  // Tool Review Methods
  
  // Get all tool reviews
  async getToolReviews(): Promise<ReviewTool[]> {
    try {
      console.log('🔧 Fetching tool reviews...');
      const response = await api.get<ApiResponse<ReviewTool[]>>('/reviews/tools');
      console.log('🔧 Tool reviews fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error fetching tool reviews:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews');
    }
  }

  // Get tool review by ID
  async getToolReview(id: string): Promise<ReviewTool> {
    try {
      console.log('🔧 Fetching tool review by ID:', id);
      const response = await api.get<ApiResponse<ReviewTool>>(`/reviews/tools/${id}`);
      console.log('🔧 Tool review fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error fetching tool review:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tool review');
    }
  }

  // Get tool reviews by tool ID
  async getToolReviewsByToolId(toolId: string): Promise<ReviewTool[]> {
    try {
      console.log('🔧 Fetching tool reviews by tool ID:', toolId);
      const response = await api.get<ApiResponse<ReviewTool[]>>(`/reviews/tools/tool/${toolId}`);
      console.log('🔧 Tool reviews by tool fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error fetching tool reviews by tool:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews by tool');
    }
  }

  // Get tool reviews by user ID
  async getToolReviewsByUserId(userId: string): Promise<ReviewTool[]> {
    try {
      console.log('🔧 Fetching tool reviews by user ID:', userId);
      const response = await api.get<ApiResponse<ReviewTool[]>>(`/reviews/tools/user/${userId}`);
      console.log('🔧 Tool reviews by user fetched successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error fetching tool reviews by user:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews by user');
    }
  }

  // Create tool review
  async createToolReview(reviewData: CreateReviewToolDto): Promise<ReviewTool> {
    try {
      console.log('🔧 Creating tool review:', reviewData);
      const response = await api.post<ApiResponse<ReviewTool>>('/reviews/tools', reviewData);
      console.log('🔧 Tool review created successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error creating tool review:', error);
      throw new Error(error.response?.data?.message || 'Failed to create tool review');
    }
  }

  // Update tool review
  async updateToolReview(id: string, reviewData: UpdateReviewToolDto): Promise<ReviewTool> {
    try {
      console.log('🔧 Updating tool review:', id, reviewData);
      const response = await api.patch<ApiResponse<ReviewTool>>(`/reviews/tools/${id}`, reviewData);
      console.log('🔧 Tool review updated successfully:', response.data.data);
      return response.data.data;
    } catch (error: any) {
      console.error('🔧 Error updating tool review:', error);
      throw new Error(error.response?.data?.message || 'Failed to update tool review');
    }
  }

  // Delete tool review
  async deleteToolReview(id: string): Promise<void> {
    try {
      console.log('🔧 Deleting tool review:', id);
      await api.delete(`/reviews/tools/${id}`);
      console.log('🔧 Tool review deleted successfully');
    } catch (error: any) {
      console.error('🔧 Error deleting tool review:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete tool review');
    }
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;