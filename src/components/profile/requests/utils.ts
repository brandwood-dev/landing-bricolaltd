import { generateRentalContract } from '@/utils/contractGenerator';
import { Request } from './types';
import { useLanguage } from '@/contexts/LanguageContext';

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING': return 'bg-yellow-100 text-yellow-800';
    case 'ACCEPTED': return 'bg-green-100 text-green-800';
    case 'DECLINED': return 'bg-red-100 text-red-800';
    case 'CANCELLED': return 'bg-gray-100 text-gray-800';
    case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
    case 'ONGOING': return 'bg-purple-100 text-purple-800';
    case 'COMPLETED': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'accepted': return 'Acceptée';
    case 'declined': return 'Refusée';
    case 'cancelled': return 'Annulée';
    case 'confirmed': return 'Confirmée';
    case 'ongoing': return 'En cours';
    case 'completed': return 'Terminé';
    default: return status;
  }
};

export const handleDownloadContract = (request: Request, toast: any, t: (key: string) => string) => {
  
  if (request.isOwnerView && request.renterName) {
    const contractData = {
      referenceId: request.referenceId,
      toolName: request.toolName,
      toolDescription: request.toolDescription,
      ownerName: request.owner,
      ownerEmail: request.ownerEmail!,
      ownerPhone: request.ownerPhone!,
      renterName: request.renterName,
      renterEmail: request.renterEmail!,
      renterPhone: request.renterPhone!,
      startDate: request.startDate,
      endDate: request.endDate,
      pickupTime: request.pickupTime,
      totalPrice: request.totalPrice,
      dailyPrice: request.dailyPrice
    };
    
    generateRentalContract(contractData);
    
    toast({
      title: t('download.report.title'),
      description: t('download.report.description'),
    });
  }
};

export const handleCall = (phone: string) => {
  window.location.href = `tel:${phone}`;
};

export const handleEmail = (email: string) => {
  window.location.href = `mailto:${email}`;
};

export const statusOptions = [
  { value: 'pending', label: 'En attente' },
  { value: 'accepted', label: 'Acceptée' },
  { value: 'declined', label: 'Refusée' },
  { value: 'cancelled', label: 'Annulée' },
  { value: 'ongoing', label: 'En cours' }
];