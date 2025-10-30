import React from 'react';
import { Button } from '@/components/ui/button';
import { useDepositModal } from '@/contexts/DepositModalContext';
import { useToast } from '@/hooks/use-toast';
import { CreditCard } from 'lucide-react';

interface DepositNotificationProps {
  bookingId: string;
  amount: number;
  currency: string;
  propertyTitle: string;
  dueDate: string;
}

export const DepositNotification: React.FC<DepositNotificationProps> = ({
  bookingId,
  amount,
  currency,
  propertyTitle,
  dueDate
}) => {
  const { openModal } = useDepositModal();
  const { toast } = useToast();

  const handleOpenModal = () => {
    openModal({
      bookingId,
      amount,
      currency,
      dueDate,
      propertyTitle
    });
  };

  const showDepositToast = () => {
    toast({
      title: 'Acompte requis',
      description: (
        <div className="flex flex-col gap-2">
          <p>Votre acompte de {amount} {currency} doit être payé dans les 24 heures pour {propertyTitle}.</p>
          <Button 
            onClick={handleOpenModal}
            size="sm"
            className="w-fit"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payer l'acompte
          </Button>
        </div>
      ),
      className: 'bg-orange-50 border-orange-200 text-orange-800',
      duration: 10000, // 10 secondes pour laisser le temps de cliquer
    });
  };

  return { showDepositToast, handleOpenModal };
};

// Hook utilitaire pour utiliser les notifications d'acompte
export const useDepositNotification = () => {
  const { openModal } = useDepositModal();
  const { toast } = useToast();

  const showDepositToast = (depositInfo: {
    bookingId: string;
    amount: number;
    currency: string;
    propertyTitle: string;
    dueDate: string;
  }) => {
    const handleOpenModal = () => {
      openModal(depositInfo);
    };

    toast({
      title: 'Acompte requis',
      description: (
        <div className="flex flex-col gap-2">
          <p>Votre acompte de {depositInfo.amount} {depositInfo.currency} doit être payé dans les 24 heures pour {depositInfo.propertyTitle}.</p>
          <Button 
            onClick={handleOpenModal}
            size="sm"
            className="w-fit bg-orange-600 hover:bg-orange-700"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Payer l'acompte
          </Button>
        </div>
      ),
      className: 'bg-orange-50 border-orange-200 text-orange-800',
      duration: 10000, // 10 secondes pour laisser le temps de cliquer
    });
  };

  return { showDepositToast };
};