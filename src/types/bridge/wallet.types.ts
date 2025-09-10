// Wallet and transaction types aligned with backend API
import { TransactionType, TransactionStatus, PaymentMethod } from './enums';

export type { TransactionType, TransactionStatus, PaymentMethod };

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description?: string;
  externalReference?: string;
  paymentMethod?: PaymentMethod;
  senderId: string;
  recipientId: string;
  walletId: string;
  bookingId?: string;
  disputeId?: string;
  feeAmount?: number;
  createdAt: string;
  processedAt?: string;
  // Relations (optional for frontend)
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipient?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface WithdrawalRequest {
  amount: number;
  accountDetails?: {
    accountNumber?: string;
    routingNumber?: string;
    bankName?: string;
    accountHolderName?: string;
    iban?: string;
    bic?: string;
  };
}

export interface UserBalance {
  balance: number;
  cumulativeBalance?: number;
  availableBalance?: number;
  successfulTransactionsCount?: number;
}

export interface WalletStats {
  cumulativeBalance: number;
  availableBalance: number;
  successfulTransactionsCount: number;
}