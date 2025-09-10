import { api } from './api';
import { UserWallet } from '../types/bridge/user.types';
import { ApiResponse } from '../types/bridge/common.types';
import { Transaction, WithdrawalRequest, UserBalance } from '@/types/bridge/wallet.types';

export interface UserStats {
  cumulativeBalance: number;
  availableBalance: number;
  successfulTransactionsCount: number;
}

export type { Transaction, WithdrawalRequest, UserBalance }

class WalletService {
  // Get user balance
  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      console.log('🔗 WalletService.getUserBalance called with userId:', userId);
      console.log('🔗 Making GET request to:', `/wallets/user/${userId}/balance`);
      
      const response = await api.get<ApiResponse<UserBalance>>(`/wallets/user/${userId}/balance`);
      
      console.log('🔗 Balance API response status:', response.status);
      console.log('🔗 Balance API response data:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('🔗 Error fetching user balance:');
      console.error('🔗 Error object:', error);
      console.error('🔗 Error response:', error?.response);
      console.error('🔗 Error response data:', error?.response?.data);
      console.error('🔗 Error status:', error?.response?.status);
      throw error;
    }
  }

  // Get user wallet statistics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      console.log('🔗 WalletService.getUserStats called with userId:', userId);
      console.log('🔗 Making GET request to:', `/wallets/user/${userId}/stats`);
      
      const response = await api.get<ApiResponse<UserStats>>(`/wallets/user/${userId}/stats`);
      
      console.log('🔗 Stats API response status:', response.status);
      console.log('🔗 Stats API response data:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('🔗 Error fetching user stats:');
      console.error('🔗 Error object:', error);
      console.error('🔗 Error response:', error?.response);
      console.error('🔗 Error response data:', error?.response?.data);
      console.error('🔗 Error status:', error?.response?.status);
      throw error;
    }
  }

  // Create withdrawal request
  async createWithdrawal(userId: string, withdrawalData: WithdrawalRequest): Promise<Transaction> {
    try {
      const response = await api.post<ApiResponse<Transaction>>(`/wallets/user/${userId}/withdraw`, {
        amount: withdrawalData.amount,
        accountDetails: withdrawalData
      });
      return response.data.data;
    } catch (error) {
      console.error('Error creating withdrawal request:', error);
      throw error;
    }
  }

  // Get user transactions
  async getUserTransactions(userId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
  }): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      console.log('🔗 WalletService.getUserTransactions called with:');
      console.log('🔗 - userId:', userId);
      console.log('🔗 - params:', params);
      console.log('🔗 Making GET request to: /users/me/transactions');
      
      const response = await api.get<ApiResponse<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
      }>>('/users/me/transactions', { params });
      
      console.log('🔗 Transactions API response status:', response.status);
      console.log('🔗 Transactions API response data:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('🔗 Error fetching user transactions:');
      console.error('🔗 Error object:', error);
      console.error('🔗 Error response:', error?.response);
      console.error('🔗 Error response data:', error?.response?.data);
      console.error('🔗 Error status:', error?.response?.status);
      throw error;
    }
  }

  // Get withdrawal history
  async getWithdrawalHistory(userId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    data: Transaction[];
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const response = await api.get<ApiResponse<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
      }>>(`/users/me/transactions`, {
        params: {
          ...params,
          type: 'WITHDRAWAL'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
      throw error;
    }
  }

  // Check minimum withdrawal threshold
  getMinimumWithdrawalAmount(): number {
    return 50; // 50€ minimum
  }

  // Validate withdrawal amount
  validateWithdrawalAmount(amount: number, availableBalance: number): {
    isValid: boolean;
    error?: string;
  } {
    const minAmount = this.getMinimumWithdrawalAmount();
    
    if (amount < minAmount) {
      return {
        isValid: false,
        error: `Le montant minimum de retrait est de ${minAmount}€`
      };
    }
    
    if (amount > availableBalance) {
      return {
        isValid: false,
        error: 'Montant supérieur au solde disponible'
      };
    }
    
    return { isValid: true };
  }
}

export const walletService = new WalletService();