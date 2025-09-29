import { api, ApiResponse } from './api';

export interface CreateDisputeData {
  userId: string;
  bookingId: string;
  reason: string;
  description?: string;
  reportReason: string;
  reportMessage: string;
  images?: string[];
}

export interface Dispute {
  id: string;
  reason: string;
  description: string;
  status: string;
  resolutionId?: number;
  resolutionNotes?: string;
  refundAmount?: number;
  initiatorId: string;
  respondentId: string;
  toolId: string;
  bookingId: string;
  moderatorId?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  evidence?: string[];
  images?: string[];
  reportReason?: string;
  reportMessage?: string;
  initiator?: any;
  respondent?: any;
  tool?: any;
  booking?: any;
  moderator?: any;
}

export interface DisputesResponse {
  items: Dispute[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

class DisputeService {
  private readonly baseUrl = '/disputes';

  async createDispute(disputeData: CreateDisputeData, images?: File[]): Promise<Dispute> {
    try {
      // If images are provided, use the multipart endpoint
      if (images && images.length > 0) {
        return await this.createDisputeWithImages(disputeData, images);
      }
      
      // Prepare data with correct field names for backend
      const backendData = {
        userId: disputeData.userId,
        bookingId: disputeData.bookingId,
        reason: disputeData.reason,
        description: disputeData.description,
        reportReason: disputeData.reason, // Map reason to reportReason
        reportMessage: disputeData.description || disputeData.reason // Map description to reportMessage
      };
      
      // Otherwise, use the regular JSON endpoint
      const response = await api.post<Dispute>(this.baseUrl, backendData);

      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async createDisputeWithImages(disputeData: CreateDisputeData, images: File[]): Promise<Dispute> {
    try {
      // Validate image sizes (max 1MB each)
      for (const image of images) {
        if (image.size > 1024 * 1024) {
          throw new Error(`Image ${image.name} is too large. Maximum size is 1MB.`);
        }
      }
      
      const formData = new FormData();
      
      // Add dispute data
      formData.append('userId', disputeData.userId);
      formData.append('bookingId', disputeData.bookingId);
      formData.append('reason', disputeData.reason);
      formData.append('reportReason', disputeData.reason); // Map reason to reportReason
      formData.append('reportMessage', disputeData.description || disputeData.reason); // Map description to reportMessage
      if (disputeData.description) {
        formData.append('description', disputeData.description);
      }
      
      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });
      
      const response = await api.post<Dispute>(`${this.baseUrl}/with-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getUserDisputes(userId: string): Promise<Dispute[]> {
    try {
      const response = await api.get<Dispute[]>(`${this.baseUrl}/user/${userId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getDisputeByBookingId(bookingId: string): Promise<Dispute> {
    try {
      const response = await api.get<Dispute>(`${this.baseUrl}/booking/${bookingId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getDispute(disputeId: string): Promise<Dispute> {
    try {
      const response = await api.get<Dispute>(`${this.baseUrl}/${disputeId}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllDisputes(
    page: number = 1,
    limit: number = 10,
    filters?: {
      search?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<DisputesResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.startDate && { startDate: filters.startDate }),
        ...(filters?.endDate && { endDate: filters.endDate }),
      });
      
      const response = await api.get<DisputesResponse>(`${this.baseUrl}?${params}`);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async updateDispute(disputeId: string, updateData: Partial<Dispute>): Promise<Dispute> {
    try {
      const response = await api.patch<Dispute>(`${this.baseUrl}/${disputeId}`, updateData);
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteDispute(disputeId: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${disputeId}`);
    } catch (error) {
      throw error;
    }
  }
}

export const disputeService = new DisputeService();
export default disputeService;