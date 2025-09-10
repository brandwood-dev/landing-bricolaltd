// News types aligned with backend API

export interface News {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  additionalImages?: string[];
  isPublic: boolean;
  isFeatured: boolean;
  summary?: string;
  categoryId?: string;
  adminId?: string;
  createdAt: Date;
  updatedAt: Date;
  // Relations (optional for frontend)
  admin?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface NewsCategory {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsFilters {
  search?: string;
  isPublic?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  isFeatured?: boolean;
}

export interface CreateNewsDto {
  title: string;
  content: string;
  imageUrl?: string;
  additionalImages?: string[];
  files?: File[];
  isPublic?: boolean;
  isFeatured?: boolean;
  summary?: string;
  categoryId?: string;
}

export interface UpdateNewsDto {
  title?: string;
  content?: string;
  imageUrl?: string;
  additionalImages?: string[];
  files?: File[];
  isPublic?: boolean;
  isFeatured?: boolean;
  summary?: string;
  categoryId?: string;
  replaceMainImage?: boolean;
}