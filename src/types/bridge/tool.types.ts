// Tool types bridge - aligned with backend entities

import { BaseEntity, Photo, Address, BaseFilters } from './common.types';
import { ToolStatus, AvailabilityStatus, ToolCondition } from './enums';
import { UserProfile } from './user.types';

// Category interface
export interface Category extends BaseEntity {
  name: string;
  displayName: string;
  description?: string;
  icon?: string;
  subcategories?: Subcategory[];
}

// Subcategory interface
export interface Subcategory extends BaseEntity {
  name: string;
  displayName: string;
  description?: string;
  categoryId: string;
  icon?: string;
}

// Base Tool interface (aligned with backend Tool entity)
export interface Tool extends BaseEntity {
  title: string;
  description: string;
  basePrice: number;
  depositAmount: number;
  brand?: string;
  model?: string;
  year?: number;
  condition: ToolCondition;
  pickupAddress: string;
  latitude?: number;
  longitude?: number;
  ownerInstructions?: string;
  toolStatus: ToolStatus;
  availabilityStatus: AvailabilityStatus;
  isAvailable: boolean; // Computed field
  
  // Relations
  categoryId: string;
  subcategoryId: string;
  ownerId: string;
  
  // Nested objects
  category: Category;
  subcategory: Subcategory;
  owner: UserProfile;
  photos: ToolPhoto[];
  
  // Timestamps
  publishedAt?: string;
  moderatedAt?: string;
  
  // Statistics
  rating?: number;
  totalBookings?: number;
  totalReviews?: number;
}

// Tool photo interface
export interface ToolPhoto extends Photo {
  toolId: string;
}

// Tool summary for listings
export interface ToolSummary {
  id: string;
  title: string;
  basePrice: number;
  condition: ToolCondition;
  isAvailable: boolean;
  rating?: number;
  totalReviews?: number;
  primaryPhoto?: string;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  category: {
    id: string;
    name: string;
    displayName: string;
  };
  location: {
    city?: string;
    distance?: number; // in km
  };
}

// Tool filters interface
export interface ToolFilters extends BaseFilters {
  categoryId?: string;
  subcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ToolCondition[];
  location?: string;
  radius?: number; // in km
  isAvailable?: boolean;
  toolStatus?: ToolStatus;
  ownerId?: string;
  hasPhotos?: boolean;
  minRating?: number;
}

// Tool availability check
export interface ToolAvailability {
  toolId: string;
  isAvailable: boolean;
  availableFrom?: string;
  availableUntil?: string;
  blockedDates?: string[];
  reason?: string;
}

// Tool pricing calculation
export interface ToolPricing {
  toolId: string;
  basePrice: number;
  depositAmount: number;
  totalDays: number;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
  currency: string;
}

// Tool statistics
export interface ToolStats {
  totalViews: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  totalReviews: number;
  totalEarnings: number;
  occupancyRate: number; // percentage
}

// Tool creation/update DTOs
export interface CreateToolData {
  title: string;
  description: string;
  basePrice: number;
  depositAmount: number;
  brand?: string;
  model?: string;
  year?: number;
  condition: ToolCondition;
  pickupAddress: string;
  latitude?: number;
  longitude?: number;
  ownerInstructions?: string;
  categoryId: string;
  subcategoryId: string;
  photos?: File[];
}

export interface UpdateToolData extends Partial<CreateToolData> {
  toolStatus?: ToolStatus;
  availabilityStatus?: AvailabilityStatus;
}

// Review types
export interface Review extends BaseEntity {
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  toolId?: string;
  bookingId: string;
  isEdited: boolean;
  editedAt?: string;
  isReported: boolean;
  reportReason?: string;
  isHidden: boolean;
  
  // Relations (optional for populated data)
  reviewer?: UserProfile;
  reviewee?: UserProfile;
  tool?: Tool;
}

export interface CreateReviewData {
  userId: string;
  bookingId: string;
  rating: number;
  comment: string;
}



