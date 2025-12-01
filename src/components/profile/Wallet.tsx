import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import {
  Wallet as WalletIcon,
  TrendingUp,
  Banknote,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Clock,
} from 'lucide-react'
import { PriceDisplay } from '@/components/PriceDisplay'
import { DateRange } from 'react-day-picker'
import { isWithinInterval, parseISO } from 'date-fns'
import TransactionFilters from './TransactionFilters'
import TransactionCard from './TransactionCard'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { walletService, Transaction, UserStats } from '@/services/walletService'
import { useToast } from '@/hooks/use-toast'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import WithdrawalDialog from './WithdrawalDialog'

const Wallet = () => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { toast } = useToast()
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [transactionType, setTransactionType] = useState('all')
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [totalTransactions, setTotalTransactions] = useState(0)
  const [stats, setStats] = useState<UserStats>({
    cumulativeBalance: 0,
    availableBalance: 0,
    successfulTransactionsCount: 0,
  })
  const itemsPerPage = 5
  // Fetch wallet data from backend
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!user) {
        return
      }

      try {
        setLoading(true)
        const [balanceData, transactionsData, statsData] = await Promise.all([
          walletService.getUserBalance(user.id),
          walletService.getUserTransactions(user.id, {
            page: currentPage,
            limit: itemsPerPage,
            type: transactionType === 'withdrawals' ? 'WITHDRAWAL' : undefined,
          }),
          walletService.getUserStats(user.id),
        ])

        const finalBalance = balanceData?.balance || 0
        const finalTransactions = Array.isArray(transactionsData?.data)
          ? transactionsData.data
          : []
        const finalTotal = transactionsData?.total || 0
        const finalStats = statsData || {
          cumulativeBalance: 0,
          availableBalance: 0,
          successfulTransactionsCount: 0,
        }

        setBalance(finalBalance)
        setTransactions(finalTransactions)
        setTotalTransactions(finalTotal)
        setStats(finalStats)
      } catch (error) {
        setTransactions([])
        setTotalTransactions(0)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les données du portefeuille',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchWalletData()
  }, [user, currentPage, transactionType])

  // Filter transactions by date range (type filtering is handled by API)
  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return []
    let base = transactions
    if (transactionType === 'withdrawals') {
      base = base.filter((t) => t.type === 'WITHDRAWAL')
    } else if (transactionType === 'receipts') {
      base = base.filter((t) => t.type !== 'WITHDRAWAL')
    }

    if (!dateRange?.from) return base

    return base.filter((transaction) => {
      const transactionDate = parseISO(transaction.createdAt)
      if (dateRange.to) {
        return isWithinInterval(transactionDate, {
          start: dateRange.from!,
          end: dateRange.to,
        })
      } else {
        return transactionDate >= dateRange.from!
      }
    })
  }, [transactions, transactionType, dateRange])

  // Pagination
  const totalPages = Math.ceil(totalTransactions / itemsPerPage)
  const price = 50
  // Calculate KPIs
  const availableBalance = balance
  const successfulTransactions = Array.isArray(transactions)
    ? transactions.filter((t) => t.status === 'COMPLETED')
    : []
  const successfulTransactionsCount = successfulTransactions.length
  const cumulativeBalance = balance // For now, same as available balance

  // Currency conversion (example rates)
  const gbpToEur = 1.159 // Example conversion rate
  const minWithdrawalGBP = 50
  const minWithdrawalEUR = Math.round(minWithdrawalGBP * gbpToEur * 100) / 100

  const canWithdraw = cumulativeBalance >= minWithdrawalEUR

  const handleResetFilters = () => {
    setDateRange(undefined)
    setTransactionType('all')
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  return (
    <>
      <div className='space-y-6'>
        <Card className='border-0 shadow-lg bg-gradient-to-br from-white to-gray-50'>
          <CardHeader className='pb-4'>
            <CardTitle className='flex items-center gap-3 text-2xl'>
              <div className='p-2 bg-primary/10 rounded-lg'>
                <WalletIcon className='h-6 w-6 text-primary' />
              </div>
              {t('wallet.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* KPI Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='p-2 bg-blue-500 rounded-lg'>
                    <TrendingUp className='h-5 w-5 text-white' />
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-blue-200 text-blue-800'
                  >
                    {t('wallet.total')}
                  </Badge>
                </div>
                <div className='text-sm text-blue-700 font-medium mb-1'>
                  {t('wallet.cumulative_balance')}
                </div>
                <div className='text-3xl font-bold text-blue-900'>
                  <OptimizedPriceDisplay
                    price={stats?.cumulativeBalance || 0}
                    baseCurrency='GBP'
                    size='lg'
                    cible='totalPrice'
                  />
                </div>
              </div>

              <div className='bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='p-2 bg-green-500 rounded-lg'>
                    <Banknote className='h-5 w-5 text-white' />
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-green-200 text-green-800'
                  >
                    {t('wallet.available')}
                  </Badge>
                </div>
                <div className='text-sm text-green-700 font-medium mb-1'>
                  {t('wallet.available_balance')}
                </div>
                <div className='text-3xl font-bold text-green-900'>
                  <OptimizedPriceDisplay
                    price={stats?.availableBalance || 0}
                    baseCurrency='GBP'
                    size='lg'
                    cible='totalPrice'
                  />
                </div>
              </div>

              <div className='bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='p-2 bg-orange-500 rounded-lg'>
                    <Clock className='h-5 w-5 text-white' />
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-orange-200 text-orange-800'
                  >
                    {t('wallet.pending')}
                  </Badge>
                </div>
                <div className='text-sm text-orange-700 font-medium mb-1'>
                  Balance en attente
                </div>
                <div className='text-3xl font-bold text-orange-900'>
                  <OptimizedPriceDisplay
                    price={stats?.pendingBalance || 0}
                    baseCurrency='GBP'
                    size='lg'
                    cible='totalPrice'
                  />
                </div>
              </div>

              <div className='bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='p-2 bg-purple-500 rounded-lg'>
                    <CheckCircle className='h-5 w-5 text-white' />
                  </div>
                  <Badge
                    variant='secondary'
                    className='bg-purple-200 text-purple-800'
                  >
                    {t('wallet.successful')}
                  </Badge>
                </div>
                <div className='text-sm text-purple-700 font-medium mb-1'>
                  {t('wallet.successful_transactions')}
                </div>
                <div className='text-3xl font-bold text-purple-900'>
                  {stats?.successfulTransactionsCount || 0}
                </div>
              </div>
            </div>

            {/* Withdrawal Button + Dialog */}
            <div className='flex justify-center'>
              <Button
                size='lg'
                className={`px-8 py-3 text-lg font-semibold ${
                  canWithdraw
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                disabled={!canWithdraw}
                onClick={() => setShowWithdrawDialog(true)}
              >
                <Banknote className='h-5 w-5 mr-2' />
                {t('wallet.withdraw_money')}
              </Button>
            </div>
            <WithdrawalDialog
              open={showWithdrawDialog}
              onOpenChange={setShowWithdrawDialog}
              userBalance={{
                balance: stats?.availableBalance || balance,
                cumulativeBalance: stats?.cumulativeBalance || 0,
                availableBalance: stats?.availableBalance || 0,
                pendingBalance: stats?.pendingBalance || 0,
              }}
              userId={user?.id}
              onWithdrawalCreated={() => {
                setShowWithdrawDialog(false)
              }}
            />

            {/* Information Note */}
            <div className='bg-amber-50 border border-amber-200 rounded-lg p-4'>
              <div className='flex items-start gap-3'>
                <Info className='h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0' />
                <div className='space-y-2'>
                  <p className='text-sm text-amber-800 font-medium'>
                    <OptimizedPriceDisplay
                      price={price || 0}
                      baseCurrency='GBP'
                      size='lg'
                      cible='minPrice'
                    />
                  </p>
                  
                  <p className='text-xs text-amber-600'>
                    {t('wallet.dynamic_conversion')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Section */}
        <Card className='border-0 shadow-lg'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between mb-6'>
              <h3 className='text-xl font-semibold text-gray-900'>
                {t('wallet.recent_transactions')}
              </h3>
            </div>

            {/* Filters */}
            <TransactionFilters
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              transactionType={transactionType}
              onTransactionTypeChange={setTransactionType}
              onReset={handleResetFilters}
            />

            {/* Transaction Cards */}
            <div className='space-y-4 mb-6'>
              {loading ? (
                <div className='text-center py-8 text-gray-500'>
                  <Loader2 className='h-6 w-6 animate-spin mx-auto mb-2' />
                  <p>Chargement des transactions...</p>
                </div>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={{
                      id: transaction.id,
                      type:
                        transaction.type === 'WITHDRAWAL'
                          ? 'withdrawal'
                          : 'receipt',
                      amount: transaction.amount,
                      date: transaction.createdAt,
                      status: transaction.status.toLowerCase() as
                        | 'completed'
                        | 'pending'
                        | 'failed',
                      withdrawalId:
                        transaction.type === 'WITHDRAWAL'
                          ? transaction.id
                          : undefined,
                      toolName: transaction.description,
                      reference: transaction.externalReference,
                    }}
                  />
                ))
              ) : (
                <div className='text-center py-8 text-gray-500'>
                  <p>
                    Aucune transaction trouvée pour les filtres sélectionnés.
                  </p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent
                  className={language === 'ar' ? '[direction:ltr]' : ''}
                >
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      className={
                        currentPage === 1
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className='cursor-pointer'
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      className={
                        currentPage === totalPages
                          ? 'pointer-events-none opacity-50'
                          : 'cursor-pointer'
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}

export default Wallet
