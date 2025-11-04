
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Transaction } from '@/types/bridge/wallet.types';
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay';

interface TransactionCardProps {
  transaction: Transaction & {
    // Additional UI-specific properties if needed
    toolName?: string;
    userName?: string;
    reference?: string;
    withdrawalId?: string;
  };
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const { t } = useLanguage(); 
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return t('wallet.completed');
      case 'pending':
        return t('wallet.pending');
      case 'failed':
        return t('wallet.failed');
      default:
        return status;
    }
  };

  if (transaction.type === 'receipt') {
    return (
      <div className="group hover:bg-gray-50 transition-colors rounded-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600 group-hover:bg-green-200">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 mb-1">{transaction.toolName}</div>
              <div className="text-sm text-gray-600 mb-1">{transaction.userName}</div>
              <div className="text-xs text-gray-500">{transaction.reference}</div>
              <div className="text-sm text-gray-500">
                {new Date(transaction.date).toLocaleString(undefined, {
                  year: '2-digit',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).replace(/\//g, '/')}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-lg mb-1 text-green-600">
              +<OptimizedPriceDisplay price={transaction.amount} baseCurrency="GBP" size="md" cible='totalPrice' />
            </div>
            <Badge className={getStatusColor(transaction.status)}>
              {getStatusLabel(transaction.status)}
            </Badge>
          </div>
        </div>
      </div>
    );
  }

  // Withdrawal card
  return (
    <div className="group hover:bg-gray-50 transition-colors rounded-lg p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600 group-hover:bg-blue-200">
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 mb-1">{t('wallet.withdrawal')}</div>
            <div className="text-sm text-gray-600 mb-1">{transaction.withdrawalId}</div>
            <div className="text-sm text-gray-500">
              {new Date(transaction.date).toLocaleString(undefined, {
                year: '2-digit',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              }).replace(/\//g, '/')}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-lg mb-1 text-blue-600">
            -<OptimizedPriceDisplay price={transaction.amount} baseCurrency="GBP" size="md" cible='totalPrice' />
          </div>
          <Badge className={getStatusColor(transaction.status)}>
            {getStatusLabel(transaction.status)}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
