import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DepositInfo {
  bookingId: string;
  amount: number;
  currency: string;
  dueDate: string;
  propertyTitle: string;
}

interface DepositModalContextType {
  isOpen: boolean;
  depositInfo: DepositInfo | null;
  openModal: (depositInfo: DepositInfo) => void;
  closeModal: () => void;
  hasDepositPending: boolean;
}

const DepositModalContext = createContext<DepositModalContextType | undefined>(undefined);

export const useDepositModal = () => {
  const context = useContext(DepositModalContext);
  if (context === undefined) {
    throw new Error('useDepositModal must be used within a DepositModalProvider');
  }
  return context;
};

interface DepositModalProviderProps {
  children: ReactNode;
}

const DEPOSIT_STORAGE_KEY = 'pendingDeposit';

export const DepositModalProvider: React.FC<DepositModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);

  // Charger les informations d'acompte depuis localStorage au démarrage
  useEffect(() => {
    const savedDeposit = localStorage.getItem(DEPOSIT_STORAGE_KEY);
    if (savedDeposit) {
      try {
        const parsedDeposit = JSON.parse(savedDeposit);
        setDepositInfo(parsedDeposit);
      } catch (error) {
        console.error('Erreur lors du parsing des données d\'acompte:', error);
        localStorage.removeItem(DEPOSIT_STORAGE_KEY);
      }
    }
  }, []);

  const openModal = (newDepositInfo: DepositInfo) => {
    setDepositInfo(newDepositInfo);
    setIsOpen(true);
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem(DEPOSIT_STORAGE_KEY, JSON.stringify(newDepositInfo));
  };

  const closeModal = () => {
    setIsOpen(false);
    // Ne pas supprimer les données immédiatement, au cas où l'utilisateur voudrait rouvrir
  };

  // Supprimer les données d'acompte après paiement réussi
  const clearDepositInfo = () => {
    setDepositInfo(null);
    localStorage.removeItem(DEPOSIT_STORAGE_KEY);
  };

  const hasDepositPending = depositInfo !== null;

  const value: DepositModalContextType = {
    isOpen,
    depositInfo,
    openModal,
    closeModal,
    hasDepositPending,
  };

  return (
    <DepositModalContext.Provider value={value}>
      {children}
    </DepositModalContext.Provider>
  );
};

// Hook utilitaire pour gérer le nettoyage après paiement
export const useClearDeposit = () => {
  const clearDepositInfo = () => {
    localStorage.removeItem(DEPOSIT_STORAGE_KEY);
  };
  
  return clearDepositInfo;
};