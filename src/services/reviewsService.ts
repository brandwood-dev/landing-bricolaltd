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

      const response = await api.get<ApiResponse<ReviewApp[]>>('/reviews/app');

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch app reviews');
    }
  }

  // Get latest app reviews (limited to most recent)
  async getLatestAppReviews(limit: number = 6): Promise<ReviewApp[]> {
    try {

      const allReviews = await this.getAppReviews();
      const latestReviews = allReviews.slice(0, limit);

      return latestReviews;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch latest app reviews');
    }
  }

  // Get app review by ID
  async getAppReview(id: string): Promise<ReviewApp> {
    try {

      const response = await api.get<ApiResponse<ReviewApp>>(`/reviews/app/${id}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch app review');
    }
  }

  // Get app reviews by user ID
  async getAppReviewsByUserId(userId: string): Promise<ReviewApp[]> {
    try {

      const response = await api.get<ApiResponse<ReviewApp[]>>(`/reviews/app/user/${userId}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch app reviews by user');
    }
  }

  // Check if user has already reviewed the app
  async checkUserAppReview(userId: string): Promise<{ hasReviewed: boolean; review?: ReviewApp }> {
    try {

      const response = await api.get<ApiResponse<{ hasReviewed: boolean; review?: ReviewApp }>>(`/reviews/app/check/${userId}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to check user app review');
    }
  }

  // Create app review
  async createAppReview(reviewData: CreateReviewAppDto): Promise<ReviewApp> {
    try {

      const response = await api.post<ApiResponse<ReviewApp>>('/reviews/app', reviewData);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to create app review');
    }
  }

  // Update app review
  async updateAppReview(id: string, reviewData: UpdateReviewAppDto): Promise<ReviewApp> {
    try {

      const response = await api.patch<ApiResponse<ReviewApp>>(`/reviews/app/${id}`, reviewData);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to update app review');
    }
  }

  // Delete app review
  async deleteAppReview(id: string): Promise<void> {
    try {

      await api.delete(`/reviews/app/${id}`);

    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to delete app review');
    }
  }

  // Tool Review Methods
  
  // Get all tool reviews
  async getToolReviews(): Promise<ReviewTool[]> {
    try {

      const response = await api.get<ApiResponse<ReviewTool[]>>('/reviews/tools');

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews');
    }
  }

  // Get tool review by ID
  async getToolReview(id: string): Promise<ReviewTool> {
    try {

      const response = await api.get<ApiResponse<ReviewTool>>(`/reviews/tools/${id}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch tool review');
    }
  }

  // Get tool reviews by tool ID
  async getToolReviewsByToolId(toolId: string): Promise<ReviewTool[]> {
    try {

      const response = await api.get<ApiResponse<ReviewTool[]>>(`/reviews/tools/tool/${toolId}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews by tool');
    }
  }

  // Get tool reviews by user ID
  async getToolReviewsByUserId(userId: string): Promise<ReviewTool[]> {
    try {

      const response = await api.get<ApiResponse<ReviewTool[]>>(`/reviews/tools/user/${userId}`);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to fetch tool reviews by user');
    }
  }

  // Create tool review
  async createToolReview(reviewData: CreateReviewToolDto): Promise<ReviewTool> {
    try {

      const response = await api.post<ApiResponse<ReviewTool>>('/reviews/tools', reviewData);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to create tool review');
    }
  }

  // Update tool review
  async updateToolReview(id: string, reviewData: UpdateReviewToolDto): Promise<ReviewTool> {
    try {

      const response = await api.patch<ApiResponse<ReviewTool>>(`/reviews/tools/${id}`, reviewData);

      return response.data.data;
    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to update tool review');
    }
  }

  // Delete tool review
  async deleteToolReview(id: string): Promise<void> {
    try {

      await api.delete(`/reviews/tools/${id}`);

    } catch (error: any) {

      throw new Error(error.response?.data?.message || 'Failed to delete tool review');
    }
  }
}

export const reviewsService = new ReviewsService();
export default reviewsService;