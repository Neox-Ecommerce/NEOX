// ============================================
// TIPOS RELACIONADOS À API
// ============================================

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
}

export interface ApiError {
  message: string;
  status: number;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiPaginationParams {
  skip?: number;
  limit?: number;
  page?: number;
  pageSize?: number;
}

