import { api } from './api';
import { UserWallet } from '../types/bridge/user.types';
import { ApiResponse } from '../types/bridge/common.types';
import { Transaction, WithdrawalRequest, UserBalance } from '@/types/bridge/wallet.types';

export interface UserStats {
  cumulativeBalance: number;
  availableBalance: number;
  pendingBalance: number;
  successfulTransactionsCount: number;
}

export type { Transaction, WithdrawalRequest, UserBalance }

class WalletService {
  // Get user balance
  async getUserBalance(userId: string): Promise<UserBalance> {
    try {
      const response = await api.get<ApiResponse<UserBalance>>(`/wallets/user/${userId}/balance`);
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Get user wallet statistics
  async getUserStats(userId: string): Promise<UserStats> {
    try {
      const response = await api.get<ApiResponse<UserStats>>(`/wallets/user/${userId}/stats`);
      
      return response.data.data;
    } catch (error) {
      throw error;
    }
  }

  // Create withdrawal request
  async createWithdrawal(userId: string, withdrawalData: WithdrawalRequest): Promise<Transaction> {
    try {
      const accountDetails = {
        method: withdrawalData.paymentMethod === 'bank_transfer' ? 'wise' : 'stripe_connect',
        bankDetails: withdrawalData.bankDetails,
        stripeAccountId: withdrawalData.stripeAccountId,
        currency: withdrawalData.currency || 'GBP'
      };
      const response = await api.post<ApiResponse<Transaction>>(`/wallets/user/${userId}/withdraw`, {
        amount: withdrawalData.amount,
        accountDetails
      });
      return response.data.data;
    } catch (error) {
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
      const response = await api.get<ApiResponse<{
        data: Transaction[];
        total: number;
        page: number;
        limit: number;
      }>>('/users/me/transactions', { params });
      
      return response.data.data;
    } catch (error) {
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