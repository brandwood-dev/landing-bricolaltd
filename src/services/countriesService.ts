import { api } from './api';
import { ApiResponse } from '../types/bridge/common.types';

// Country interface for frontend
export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  phonePrefix: string;
  continent: string;
  isActive: boolean;
}

// Countries service for frontend
export class CountriesService {
  // Get all active countries
  async getActiveCountries(): Promise<Country[]> {
    try {
      const response = await api.get<ApiResponse<Country[]>>('/countries/active');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch countries');
    }
  }

  // Get countries by continent
  async getCountriesByContinent(continent: string): Promise<Country[]> {
    try {
      const response = await api.get<ApiResponse<Country[]>>(`/countries/continent/${continent}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch countries by continent');
    }
  }

  // Get country by code
  async getCountryByCode(code: string): Promise<Country> {
    try {
      const response = await api.get<ApiResponse<Country>>(`/countries/code/${code}`);
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch country');
    }
  }

  // Get all countries (including inactive)
  async getAllCountries(): Promise<Country[]> {
    try {
      const response = await api.get<ApiResponse<Country[]>>('/countries');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch all countries');
    }
  }
}

// Export a singleton instance
export const countriesService = new CountriesService();