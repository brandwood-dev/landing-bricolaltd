import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';

// Contact interfaces
export interface CreateContactData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  subject: string;
  category: 'technical' | 'payment' | 'account' | 'dispute' | 'suggestion' | 'other';
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
  category: 'technical' | 'payment' | 'account' | 'dispute' | 'suggestion' | 'other';
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
      const contact = response.data.data;
      
      // Send admin notification after successful contact creation
      await this.sendAdminNotification(contact);
      
      return contact;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send contact message');
    }
  }

  // Send admin notification for new contact
  private async sendAdminNotification(contact: Contact): Promise<void> {
    try {
      await api.post('/contact/admin-notification', {
        contactId: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        subject: contact.subject,
        category: contact.category,
        priority: contact.priority
      });
    } catch (error) {
      console.error('Failed to send admin notification:', error);
      // Don't throw error - notification failure shouldn't break the contact submission
    }
  }
}

// Export a singleton instance
export const contactService = new ContactService();