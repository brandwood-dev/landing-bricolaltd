import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { walletService, UserStats } from '../services/walletService';
import { Transaction, WithdrawalRequest, UserBalance } from '../types/bridge/wallet.types';
import { TransactionType, TransactionStatus } from '../types/bridge/enums';
import { toast } from 'sonner';
import { 
  Wallet as WalletIcon, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  CreditCard,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Plus
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [showWithdrawalForm, setShowWithdrawalForm] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  // Withdrawal form data
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalRequest>({
    amount: 0,
    accountDetails: {
      accountHolderName: '',
      iban: '',
      bic: '',
      bankName: ''
    }
  });

  useEffect(() => {
    if (user) {
      loadWalletData();
      loadTransactions();
    }
  }, [user, currentPage, filterType, filterStatus]);

  const loadWalletData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const [balanceData, statsData] = await Promise.all([
        walletService.getUserBalance(user.id),
        walletService.getUserStats(user.id)
      ]);
      
      setBalance(balanceData);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données du portefeuille:', error);
      toast.error('Erreur lors du chargement des données du portefeuille');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      setTransactionLoading(true);
      const response = await walletService.getUserTransactions(user.id, {
        page: currentPage,
        limit: 10,
        type: filterType || undefined,
        status: filterStatus || undefined
      });
      
      setTransactions(response.data);
      setTotalPages(Math.ceil(response.total / 10));
    } catch (error) {
      console.error('Erreur lors du chargement des transactions:', error);
      toast.error('Erreur lors du chargement des transactions');
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !balance) return;

    const amount = parseFloat(withdrawalAmount);
    const validation = walletService.validateWithdrawalAmount(amount, balance.availableBalance || 0);
    
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    try {
      setWithdrawalLoading(true);
      
      const withdrawalRequest: WithdrawalRequest = {
        amount,
        accountDetails: withdrawalData.accountDetails
      };

      await walletService.createWithdrawal(user.id, withdrawalRequest);
      
      toast.success('Demande de retrait créée avec succès');
      setShowWithdrawalForm(false);
      setWithdrawalAmount('');
      setWithdrawalData({
        amount: 0,
        accountDetails: {
          accountHolderName: '',
          iban: '',
          bic: '',
          bankName: ''
        }
      });
      
      // Recharger les données
      loadWalletData();
      loadTransactions();
    } catch (error) {
      console.error('Erreur lors de la création de la demande de retrait:', error);
      toast.error('Erreur lors de la création de la demande de retrait');
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
      case TransactionType.RENTAL_INCOME:
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case TransactionType.WITHDRAWAL:
      case TransactionType.PAYMENT:
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case TransactionType.REFUND:
        return <ArrowDownLeft className="w-4 h-4 text-blue-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
      case TransactionStatus.CONFIRMED:
      case TransactionStatus.PAID:
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case TransactionStatus.PENDING:
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case TransactionStatus.FAILED:
      case TransactionStatus.CANCELLED:
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTransactionTypeLabel = (type: TransactionType) => {
    const labels = {
      [TransactionType.DEPOSIT]: 'Dépôt',
      [TransactionType.WITHDRAWAL]: 'Retrait',
      [TransactionType.PAYMENT]: 'Paiement',
      [TransactionType.REFUND]: 'Remboursement',
      [TransactionType.FEE]: 'Frais',
      [TransactionType.TRANSFER]: 'Transfert',
      [TransactionType.DISPUTE]: 'Litige',
      [TransactionType.RENTAL_INCOME]: 'Revenus de location'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status: TransactionStatus) => {
    const labels = {
      [TransactionStatus.PENDING]: 'En attente',
      [TransactionStatus.COMPLETED]: 'Terminé',
      [TransactionStatus.FAILED]: 'Échoué',
      [TransactionStatus.CANCELLED]: 'Annulé',
      [TransactionStatus.CONFIRMED]: 'Confirmé',
      [TransactionStatus.REFUNDED]: 'Remboursé',
      [TransactionStatus.PAID]: 'Payé'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <WalletIcon className="w-8 h-8 text-blue-600" />
                Mon Portefeuille
              </h1>
              <p className="text-gray-600 mt-2">Gérez vos finances et suivez vos transactions</p>
            </div>
            <button
              onClick={() => setShowWithdrawalForm(true)}
              disabled={!balance?.availableBalance || balance.availableBalance < walletService.getMinimumWithdrawalAmount()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Demander un retrait
            </button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde disponible</p>
                <p className="text-3xl font-bold text-green-600">
                  €{balance?.availableBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Solde cumulé</p>
                <p className="text-3xl font-bold text-blue-600">
                  €{stats?.cumulativeBalance?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <WalletIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions réussies</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats?.successfulTransactionsCount || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Historique des transactions</h2>
              <div className="flex items-center gap-4">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tous les types</option>
                  <option value="DEPOSIT">Dépôts</option>
                  <option value="WITHDRAWAL">Retraits</option>
                  <option value="PAYMENT">Paiements</option>
                  <option value="RENTAL_INCOME">Revenus</option>
                  <option value="REFUND">Remboursements</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => {
                    setFilterStatus(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="COMPLETED">Terminé</option>
                  <option value="FAILED">Échoué</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {transactionLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-gray-100 rounded-full">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900">
                            {getTransactionTypeLabel(transaction.type)}
                          </p>
                          {getStatusIcon(transaction.status)}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === TransactionStatus.COMPLETED || 
                            transaction.status === TransactionStatus.CONFIRMED ||
                            transaction.status === TransactionStatus.PAID
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === TransactionStatus.PENDING
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getStatusLabel(transaction.status)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {transaction.description || 'Aucune description'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === TransactionType.DEPOSIT || 
                        transaction.type === TransactionType.RENTAL_INCOME ||
                        transaction.type === TransactionType.REFUND
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {transaction.type === TransactionType.DEPOSIT || 
                         transaction.type === TransactionType.RENTAL_INCOME ||
                         transaction.type === TransactionType.REFUND ? '+' : '-'}
                        €{transaction.amount.toFixed(2)}
                      </p>
                      {transaction.feeAmount && transaction.feeAmount > 0 && (
                        <p className="text-xs text-gray-500">
                          Frais: €{transaction.feeAmount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <WalletIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune transaction trouvée</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Précédent
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Demande de retrait</h3>
              <button
                onClick={() => setShowWithdrawalForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleWithdrawal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à retirer
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min={walletService.getMinimumWithdrawalAmount()}
                    max={balance?.availableBalance || 0}
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-8"
                    placeholder="0.00"
                    required
                  />
                  <span className="absolute right-3 top-3 text-gray-500">€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum: €{walletService.getMinimumWithdrawalAmount()} - 
                  Disponible: €{balance?.availableBalance?.toFixed(2) || '0.00'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du titulaire du compte
                </label>
                <input
                  type="text"
                  value={withdrawalData.accountDetails?.accountHolderName || ''}
                  onChange={(e) => setWithdrawalData(prev => ({
                    ...prev,
                    accountDetails: {
                      ...prev.accountDetails,
                      accountHolderName: e.target.value
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={withdrawalData.accountDetails?.iban || ''}
                  onChange={(e) => setWithdrawalData(prev => ({
                    ...prev,
                    accountDetails: {
                      ...prev.accountDetails,
                      iban: e.target.value
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BIC/SWIFT
                </label>
                <input
                  type="text"
                  value={withdrawalData.accountDetails?.bic || ''}
                  onChange={(e) => setWithdrawalData(prev => ({
                    ...prev,
                    accountDetails: {
                      ...prev.accountDetails,
                      bic: e.target.value
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  placeholder="BNPAFRPP"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la banque
                </label>
                <input
                  type="text"
                  value={withdrawalData.accountDetails?.bankName || ''}
                  onChange={(e) => setWithdrawalData(prev => ({
                    ...prev,
                    accountDetails: {
                      ...prev.accountDetails,
                      bankName: e.target.value
                    }
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowWithdrawalForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={withdrawalLoading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {withdrawalLoading ? 'Traitement...' : 'Confirmer le retrait'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;