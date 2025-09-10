import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_BASE_URL ? `${import.meta.env.VITE_BASE_URL}/api` : 'http://localhost:4000/api';
const API_TIMEOUT = 60000; // 60 seconds for file uploads

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    console.log('🌐 API Request Interceptor:');
    console.log('🌐 - URL:', config.url);
    console.log('🌐 - Method:', config.method?.toUpperCase());
    console.log('🌐 - Base URL:', config.baseURL);
    console.log('🌐 - Full URL:', `${config.baseURL}${config.url}`);
    console.log('🌐 - Params:', config.params);
    console.log('🌐 - Data:', config.data);
    
    const token = localStorage.getItem('authToken');
    console.log('🌐 - Auth token exists:', !!token);
    console.log('🌐 - Auth token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'none');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 - Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('🌐 Request Interceptor Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('🌐 API Response Interceptor:');
    console.log('🌐 - Status:', response.status);
    console.log('🌐 - Status Text:', response.statusText);
    console.log('🌐 - URL:', response.config.url);
    console.log('🌐 - Method:', response.config.method?.toUpperCase());
    console.log('🌐 - Response Data:', response.data);
    console.log('🌐 - Response Headers:', response.headers);
    return response;
  },
  (error) => {
    console.error('🌐 API Response Error Interceptor:');
    console.error('🌐 - Error object:', error);
    console.error('🌐 - Error message:', error.message);
    console.error('🌐 - Error config:', error.config);
    console.error('🌐 - Error response:', error.response);
    console.error('🌐 - Error response status:', error.response?.status);
    console.error('🌐 - Error response data:', error.response?.data);
    
    // Handle 401 Unauthorized - redirect to login only if not already on login/register pages
    if (error.response?.status === 401) {
      console.log('🌐 - Handling 401 Unauthorized');
      const currentPath = window.location.pathname;
      const isOnAuthPage = currentPath === '/login' || currentPath === '/register' || currentPath === '/verify-email';
      console.log('🌐 - Current path:', currentPath);
      console.log('🌐 - Is on auth page:', isOnAuthPage);
      
      // Only clear localStorage and redirect if not on auth pages
      // This prevents page reload during login attempts with invalid credentials
      if (!isOnAuthPage) {
        console.log('🌐 - Clearing auth data and redirecting to login');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Generic API methods
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, config);
  },
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data, config);
  },
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data, config);
  },
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.patch(url, data, config);
  },
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url, config);
  },
};

// Export the axios instance for direct use if needed
export { apiClient };
export default apiClient;