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
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'amount' | 'method' | 'details' | 'confirmation'>('amount');
  const [withdrawalData, setWithdrawalData] = useState<WithdrawalRequest>({
    amount: 0,
    paymentMethod: 'bank_transfer'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const minAmount = walletService.getMinimumWithdrawalAmount();
  const maxAmount = userBalance.availableForWithdrawal;

  const validateAmount = (amount: number) => {
    const validation = walletService.validateWithdrawalAmount(amount, maxAmount);
    if (!validation.isValid) {
      setErrors({ amount: validation.error! });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0;
    setWithdrawalData(prev => ({ ...prev, amount }));
    if (amount > 0) {
      validateAmount(amount);
    }
  };

  const handleMethodChange = (method: 'bank_transfer' | 'paypal' | 'stripe') => {
    setWithdrawalData(prev => ({ 
      ...prev, 
      paymentMethod: method,
      bankDetails: undefined,
      paypalEmail: undefined,
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
        newErrors.amount = 'Veuillez saisir un montant valide';
      } else if (!validateAmount(withdrawalData.amount)) {
        return false;
      }
    }

    if (step === 'details') {
      if (withdrawalData.paymentMethod === 'bank_transfer') {
        if (!withdrawalData.bankDetails?.iban) {
          newErrors.iban = 'IBAN requis';
        }
        if (!withdrawalData.bankDetails?.bic) {
          newErrors.bic = 'BIC requis';
        }
        if (!withdrawalData.bankDetails?.accountHolderName) {
          newErrors.accountHolderName = 'Nom du titulaire requis';
        }
      } else if (withdrawalData.paymentMethod === 'paypal') {
        if (!withdrawalData.paypalEmail) {
          newErrors.paypalEmail = 'Email PayPal requis';
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
      await walletService.createWithdrawal(userId, withdrawalData);
      toast({
        title: 'Demande de retrait créée',
        description: 'Votre demande de retrait a été soumise avec succès. Elle sera traitée sous 24-48h.',
      });
      onWithdrawalCreated?.();
      onOpenChange(false);
      // Reset form
      setStep('amount');
      setWithdrawalData({ amount: 0, paymentMethod: 'bank_transfer' });
      setErrors({});
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création de votre demande de retrait.',
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
        <h3 className="text-lg font-semibold mb-2">Montant du retrait</h3>
        <p className="text-sm text-gray-600">Solde disponible: {maxAmount}€</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Montant (€)</Label>
          <Input
            id="amount"
            type="number"
            min={minAmount}
            max={maxAmount}
            step="0.01"
            value={withdrawalData.amount || ''}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={`Minimum ${minAmount}€`}
            className={errors.amount ? 'border-red-500' : ''}
          />
          {errors.amount && (
            <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
          )}
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Montant minimum: {minAmount}€. Les retraits sont traités sous 24-48h ouvrées.
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
        <h3 className="text-lg font-semibold mb-2">Méthode de paiement</h3>
        <p className="text-sm text-gray-600">Choisissez comment recevoir vos fonds</p>
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
                <div className="font-medium">Virement bancaire</div>
                <div className="text-sm text-gray-500">Délai: 1-3 jours ouvrés</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all ${
            withdrawalData.paymentMethod === 'paypal' 
              ? 'ring-2 ring-primary border-primary' 
              : 'hover:border-gray-300'
          }`}
          onClick={() => handleMethodChange('paypal')}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium">PayPal</div>
                <div className="text-sm text-gray-500">Délai: Instantané</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="p-4 bg-purple-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <Building className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Informations de paiement</h3>
        <p className="text-sm text-gray-600">Saisissez vos coordonnées bancaires</p>
      </div>

      {withdrawalData.paymentMethod === 'bank_transfer' && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="accountHolderName">Nom du titulaire</Label>
            <Input
              id="accountHolderName"
              value={withdrawalData.bankDetails?.accountHolderName || ''}
              onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
              placeholder="Nom complet du titulaire du compte"
              className={errors.accountHolderName ? 'border-red-500' : ''}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-red-500 mt-1">{errors.accountHolderName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="iban">IBAN</Label>
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
            <Label htmlFor="bic">BIC/SWIFT</Label>
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

      {withdrawalData.paymentMethod === 'paypal' && (
        <div>
          <Label htmlFor="paypalEmail">Email PayPal</Label>
          <Input
            id="paypalEmail"
            type="email"
            value={withdrawalData.paypalEmail || ''}
            onChange={(e) => setWithdrawalData(prev => ({ ...prev, paypalEmail: e.target.value }))}
            placeholder="votre@email.com"
            className={errors.paypalEmail ? 'border-red-500' : ''}
          />
          {errors.paypalEmail && (
            <p className="text-sm text-red-500 mt-1">{errors.paypalEmail}</p>
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
        <h3 className="text-lg font-semibold mb-2">Confirmation</h3>
        <p className="text-sm text-gray-600">Vérifiez les détails de votre retrait</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Montant:</span>
            <span className="font-semibold">{withdrawalData.amount}€</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Méthode:</span>
            <span className="font-semibold">
              {withdrawalData.paymentMethod === 'bank_transfer' ? 'Virement bancaire' : 'PayPal'}
            </span>
          </div>
          {withdrawalData.paymentMethod === 'bank_transfer' && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Titulaire:</span>
                <span className="font-semibold">{withdrawalData.bankDetails?.accountHolderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">IBAN:</span>
                <span className="font-mono text-sm">{withdrawalData.bankDetails?.iban}</span>
              </div>
            </>
          )}
          {withdrawalData.paymentMethod === 'paypal' && (
            <div className="flex justify-between">
              <span className="text-gray-600">Email PayPal:</span>
              <span className="font-semibold">{withdrawalData.paypalEmail}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Votre demande sera traitée sous 24-48h ouvrées. Vous recevrez une confirmation par email.
        </AlertDescription>
      </Alert>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Retrait de fonds</DialogTitle>
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
              Retour
            </Button>
            
            {step === 'confirmation' ? (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Traitement...' : 'Confirmer le retrait'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={step === 'amount' && (!withdrawalData.amount || errors.amount)}
              >
                Suivant
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalDialog;