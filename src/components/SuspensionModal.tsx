import React from 'react';
import { X } from 'lucide-react';

interface SuspensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

const SuspensionModal: React.FC<SuspensionModalProps> = ({ isOpen, onClose, reason }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Compte Suspendu</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Votre accès au compte a été suspendu.
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Raison de la suspension :</p>
            <p className="text-red-700">{reason}</p>
          </div>
          <p className="text-gray-600 mt-4 text-sm">
            Vous ne pouvez pas accéder à l'application pour le moment. 
            Veuillez contacter le support si vous pensez qu'il s'agit d'une erreur.
          </p>
        </div>
        
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuspensionModal;