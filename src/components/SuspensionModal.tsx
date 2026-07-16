import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

const SuspensionModal: React.FC<SuspensionModalProps> = ({ isOpen, onClose, reason }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">{t('suspension.title')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            {t('suspension.account_suspended')}
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">{t('suspension.reason_label')}</p>
            <p className="text-red-700">{reason}</p>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            {t('suspension.help_text')}
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {t('general.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspensionModal;
