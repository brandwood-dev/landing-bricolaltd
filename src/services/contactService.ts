import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';

// Contact interfaces
export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  category: 'general' | 'technical' | 'billing' | 'account' | 'booking' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  response?: string;
  createdAt: string;
  updatedAt: string;
  respondedAt?: string;
}

// Contact service for frontend
export class ContactService {
  // Create a new contact message
  async createContact(contactData: CreateContactData): Promise<Contact> {
    try {
      const response = await api.post<ApiResponse<Contact>>('/contact', contactData);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send contact message');
    }
  }
}

// Export a singleton instance
export const contactService = new ContactService();