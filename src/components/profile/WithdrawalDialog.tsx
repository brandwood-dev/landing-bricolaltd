import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Banknote, CreditCard, Building, AlertCircle, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { walletService } from '@/services/walletService';
import { WithdrawalRequest, UserBalance } from '@/types/bridge/wallet.types';
import { useToast } from '@/hooks/use-toast';

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userBalance: UserBalance;
  userId: string;
  onWithdrawalCreated?: () => void;
}

const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  open,
  onOpenChange,
  userBalance,
  userId,
  onWithdrawalCreated
}) => {
  const { t } = useLanguage();
  const { currency, convertInstantly, formatInstantPrice } = useCurrency();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'confirmation'>('amount');
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalRequest>({
    amount: 0,
    paymentMethod: 'bank_transfer',
    currency: 'GBP'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minAmountGBP = walletService.getMinimumWithdrawalAmount();
  const maxAmountGBP = (userBalance as any).availableBalance ?? userBalance.balance ?? 0;
  const minAmountInSelected = convertInstantly(minAmountGBP, 'GBP', currency.code) || minAmountGBP;
  const maxAmountInSelected = convertInstantly(maxAmountGBP, 'GBP', currency.code) || maxAmountGBP;

  const validateAmount = (amountSelected: number) => {
    const amountGBP = convertInstantly(amountSelected, currency.code, 'GBP') || amountSelected;
    const validation = walletService.validateWithdrawalAmount(amountGBP, maxAmountGBP);
    if (!validation.isValid) {
      if (validation.error === '1') {
        setErrors({ amount: t('wallet.dialog.amount_step.error.min') });
      } else if (validation.error === '2') {
        setErrors({ amount: t('wallet.dialog.amount_step.error.max') });
      }
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAmountChange = (value: string) => {
    const amountSelected = parseFloat(value) || 0;
    setWithdrawalData(prev => ({ ...prev, amount: amountSelected }));
    if (amountSelected > 0) {
      validateAmount(amountSelected);
    }
  };

  const handleMethodChange = (method: 'bank_transfer' | 'stripe_connect' | 'card_payout') => {
    setWithdrawalData(prev => ({ 
      ...prev, 
      paymentMethod: method,
      bankDetails: undefined,
      stripeAccountId: undefined
    }));
  };

  const handleBankDetailsChange = (field: string, value: string) => {
    setWithdrawalData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [field]: value
      }
    }));
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (step === 'amount') {
      if (!withdrawalData.amount || withdrawalData.amount <= 0) {
        newErrors.amount = t('wallet.dialog.errors.invalid_amount');
      } else if (!validateAmount(withdrawalData.amount)) {
        return false;
      }
    }

    if (step === 'details') {
      if (withdrawalData.paymentMethod === 'bank_transfer') {
        if (!withdrawalData.bankDetails?.iban) {
          newErrors.iban = t('wallet.dialog.errors.iban_required');
        }
        if (!withdrawalData.bankDetails?.bic) {
          newErrors.bic = t('wallet.dialog.errors.bic_required');
        }
        if (!withdrawalData.bankDetails?.accountHolderName) {
          newErrors.accountHolderName = t('wallet.dialog.errors.name_required');
        }
      } else if (withdrawalData.paymentMethod === 'paypal') {
        if (!withdrawalData.paypalEmail) {
          newErrors.paypalEmail = t('wallet.dialog.errors.paypal_required');
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      if (step === 'amount') setStep('method');
      else if (step === 'method') setStep('details');
      else if (step === 'details') setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'method') setStep('amount');
    else if (step === 'details') setStep('method');
    else if (step === 'confirmation') setStep('details');
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    try {
      const amountGBP = convertInstantly(withdrawalData.amount || 0, currency.code, 'GBP') || (withdrawalData.amount || 0);
      const payload = {
        ...withdrawalData,
        amount: amountGBP,
        currency: 'GBP'
      };
      console.log('[WithdrawalDialog] Submitting withdrawal', { selectedCurrency: currency.code, enteredAmount: withdrawalData.amount, amountGBP, method: withdrawalData.paymentMethod, bankDetails: withdrawalData.bankDetails })
      await walletService.createWithdrawal(userId, payload as any);
      console.log('[WithdrawalDialog] Withdrawal created successfully')
      toast({
        title: t('wallet.dialog.success.title'),
        description: t('wallet.dialog.success.desc'),
      });
      onWithdrawalCreated?.();
      onOpenChange(false);
      // Reset form
      setStep('amount');
      setWithdrawalData({ amount: 0, paymentMethod: 'bank_transfer', currency: 'GBP' });
      setErrors({});
    } catch (error) {
      console.error('[WithdrawalDialog] Withdrawal creation failed', error)
      toast({
        title: t('wallet.dialog.error.title'),
        description: t('wallet.dialog.errors.creation_failed'),
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const renderAmountStep = () => (
    <div className="space-y-6">
            <div className="text-center">
              <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Banknote className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('wallet.dialog.amount_step.title')}</h3>
              <p className="text-sm text-gray-600">{t('wallet.dialog.amount_step.subtitle').replace('{amount}', formatInstantPrice(maxAmountGBP, 'GBP', currency.code))}</p>
            </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">{t('wallet.dialog.amount_step.label').replace('{symbol}', currency.symbol)}</Label>
          <Input
            id="amount"
            type="number"
            min={minAmountInSelected}
            max={maxAmountInSelected}
            step="0.01"
            value={withdrawalData.amount || ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={t('wallet.dialog.amount_step.placeholder').replace('{amount}', formatInstantPrice(minAmountGBP, 'GBP', currency.code))}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('wallet.dialog.amount_step.alert').replace('{amount}', formatInstantPrice(minAmountGBP, 'GBP', currency.code))}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );

  const renderMethodStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CreditCard className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('wallet.dialog.method_step.title')}</h3>
        <p className="text-sm text-gray-600">{t('wallet.dialog.method_step.subtitle')}</p>
      </div>

      <div className="space-y-3">
        <Card 
          className={`cursor-pointer transition-all ${
            withdrawalData.paymentMethod === 'bank_transfer' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-gray-300'
          }`}
          onClick={() => handleMethodChange('bank_transfer')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium">{t('wallet.dialog.method_step.bank_transfer')}</div>
                <div className="text-sm text-gray-500">{t('wallet.dialog.method_step.bank_delay')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card 
          className={`cursor-pointer transition-all ${
            withdrawalData.paymentMethod === 'stripe_connect' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-gray-300'
          }`}
          onClick={() => handleMethodChange('stripe_connect')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">{t('wallet.dialog.method_step.stripe')}</div>
                <div className="text-sm text-gray-500">{t('wallet.dialog.method_step.stripe_delay')}</div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Building className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('wallet.dialog.details_step.title')}</h3>
        <p className="text-sm text-gray-600">{t('wallet.dialog.details_step.subtitle')}</p>
      </div>

      {withdrawalData.paymentMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="accountHolderName">{t('wallet.dialog.details_step.account_name')}</Label>
            <Input
              id="accountHolderName"
              value={withdrawalData.bankDetails?.accountHolderName || ''}
              onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
              placeholder={t('wallet.dialog.details_step.account_name_placeholder')}
              className={errors.accountHolderName ? 'border-red-500' : ''}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-red-500 mt-1">{errors.accountHolderName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="iban">{t('wallet.dialog.details_step.iban')}</Label>
            <Input
              id="iban"
              value={withdrawalData.bankDetails?.iban || ''}
              onChange={(e) => handleBankDetailsChange('iban', e.target.value.toUpperCase())}
              placeholder="FR76 1234 5678 9012 3456 7890 123"
              className={errors.iban ? 'border-red-500' : ''}
            />
            {errors.iban && (
              <p className="text-sm text-red-500 mt-1">{errors.iban}</p>
            )}
          </div>

          <div>
            <Label htmlFor="bic">{t('wallet.dialog.details_step.bic')}</Label>
            <Input
              id="bic"
              value={withdrawalData.bankDetails?.bic || ''}
              onChange={(e) => handleBankDetailsChange('bic', e.target.value.toUpperCase())}
              placeholder="BNPAFRPP"
              className={errors.bic ? 'border-red-500' : ''}
            />
            {errors.bic && (
              <p className="text-sm text-red-500 mt-1">{errors.bic}</p>
            )}
          </div>
        </div>
      )}

      {withdrawalData.paymentMethod === 'stripe_connect' && (
        <div>
          <Label htmlFor="stripeAccountId">{t('wallet.dialog.details_step.stripe_account')}</Label>
          <Input
            id="stripeAccountId"
            value={withdrawalData.stripeAccountId || ''}
            onChange={(e) => setWithdrawalData(prev => ({ ...prev, stripeAccountId: e.target.value }))}
            placeholder="acct_..."
            className={errors.stripeAccountId ? 'border-red-500' : ''}
          />
          {errors.stripeAccountId && (
            <p className="text-sm text-red-500 mt-1">{errors.stripeAccountId}</p>
          )}
        </div>
      )}
    </div>
  );

  const renderConfirmationStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t('wallet.dialog.confirm_step.title')}</h3>
        <p className="text-sm text-gray-600">{t('wallet.dialog.confirm_step.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('wallet.dialog.confirm_step.summary')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('wallet.dialog.confirm_step.amount')}</span>
            <span className="font-semibold">{withdrawalData.amount}{currency.symbol}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('wallet.dialog.confirm_step.method')}</span>
            <span className="font-semibold">
              {withdrawalData.paymentMethod === 'bank_transfer' ? t('wallet.dialog.method_step.bank_transfer') : t('wallet.dialog.method_step.stripe')}
            </span>
          </div>
          {withdrawalData.paymentMethod === 'bank_transfer' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('wallet.dialog.confirm_step.holder')}</span>
                <span className="font-semibold">{withdrawalData.bankDetails?.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('wallet.dialog.details_step.iban')}:</span>
                <span className="font-mono text-sm">{withdrawalData.bankDetails?.iban}</span>
              </div>
            </>
          )}
          {withdrawalData.paymentMethod === 'stripe_connect' && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('wallet.dialog.confirm_step.stripe_account')}</span>
              <span className="font-semibold">{withdrawalData.stripeAccountId}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {t('wallet.dialog.confirm_step.alert')}
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('wallet.dialog.title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            {['amount', 'method', 'details', 'confirmation'].map((stepName, index) => (
              <div
                key={stepName}
                className={`w-3 h-3 rounded-full ${
                  step === stepName
                    ? 'bg-primary'
                    : ['amount', 'method', 'details', 'confirmation'].indexOf(step) > index
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Step content */}
          {step === 'amount' && renderAmountStep()}
          {step === 'method' && renderMethodStep()}
          {step === 'details' && renderDetailsStep()}
          {step === 'confirmation' && renderConfirmationStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 'amount'}
            >
              {t('wallet.dialog.buttons.back')}
            </Button>
            
            {step === 'confirmation' ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? t('wallet.dialog.buttons.processing') : t('wallet.dialog.buttons.confirm')}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={step === 'amount' && (!withdrawalData.amount || errors.amount)}
              >
                {t('wallet.dialog.buttons.next')}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;