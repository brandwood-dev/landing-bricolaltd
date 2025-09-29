// Common types used across the application

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  message: string;
  success?: boolean;
}

// Pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Paginated response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Base entity interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// File upload interface
export interface FileUpload {
  id: string;
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

// Photo interface
export interface Photo {
  id: string;
  url: string;
  isPrimary: boolean;
}

// Address interface
export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

// Contact information
export interface ContactInfo {
  phone?: string;
  phone_prefix?: string;
  email?: string;
}

// Money/Price interface
export interface Money {
  amount: number;
  currency: string;
}

// Date range interface
export interface DateRange {
  startDate: string;
  endDate: string;
}

// Filter base interface
export interface BaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Error response interface
export interface ErrorResponse {
  message: string;
  error?: string;
  statusCode?: number;
  timestamp?: string;
}