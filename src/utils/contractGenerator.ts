
import { jsPDF } from 'jspdf';

interface ContractData {
  referenceId: string;
  toolName: string;
  toolDescription: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  renterName: string;
  renterEmail: string;
  renterPhone: string;
  startDate: string;
  endDate: string;
  pickupTime: string;
  totalPrice: number;
  dailyPrice: number;
}

export const generateRentalContract = (data: ContractData): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  let yPosition = 30;

  // Title
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('CONTRAT DE LOCATION D\'OUTIL', pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 15;
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Référence: ${data.referenceId}`, pageWidth / 2, yPosition, { align: 'center' });
  
  yPosition += 20;
  
  // Owner section
  doc.setFont(undefined, 'bold');
  doc.text('PROPRIÉTAIRE (Bailleur)', margin, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${data.ownerName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Email: ${data.ownerEmail}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Téléphone: ${data.ownerPhone}`, margin, yPosition);
  
  yPosition += 15;
  
  // Renter section
  doc.setFont(undefined, 'bold');
  doc.text('LOCATAIRE (Preneur)', margin, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${data.renterName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Email: ${data.renterEmail}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Téléphone: ${data.renterPhone}`, margin, yPosition);
  
  yPosition += 15;
  
  // Tool details
  doc.setFont(undefined, 'bold');
  doc.text('DÉTAILS DE L\'OUTIL', margin, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.text(`Nom: ${data.toolName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Description: ${data.toolDescription}`, margin, yPosition);
  
  yPosition += 15;
  
  // Rental details
  doc.setFont(undefined, 'bold');
  doc.text('DÉTAILS DE LA LOCATION', margin, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  doc.text(`Date de début: ${data.startDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Date de fin: ${data.endDate}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Heure de récupération: ${data.pickupTime}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Prix par jour: ${data.dailyPrice}€`, margin, yPosition);
  yPosition += 6;
  doc.text(`Prix total: ${data.totalPrice}€`, margin, yPosition);
  
  yPosition += 20;
  
  // Terms
  doc.setFont(undefined, 'bold');
  doc.text('CONDITIONS GÉNÉRALES', margin, yPosition);
  yPosition += 8;
  doc.setFont(undefined, 'normal');
  const terms = [
    '1. Le locataire s\'engage à utiliser l\'outil avec soin et dans les conditions prévues.',
    '2. Le locataire est responsable des dommages causés à l\'outil pendant la location.',
    '3. L\'outil doit être restitué à la date et l\'heure convenues.',
    '4. En cas de retard, des frais supplémentaires peuvent s\'appliquer.',
    '5. Le locataire doit signaler immédiatement tout problème ou dommage.'
  ];
  
  terms.forEach(term => {
    const splitText = doc.splitTextToSize(term, pageWidth - 2 * margin);
    doc.text(splitText, margin, yPosition);
    yPosition += splitText.length * 6;
  });
  
  yPosition += 20;
  
  // Signatures
  doc.text('Signature du propriétaire: _____________________', margin, yPosition);
  doc.text('Signature du locataire: _____________________', pageWidth - margin - 80, yPosition);
  
  yPosition += 15;
  doc.text(`Date: ${new Date().toLocaleDateString('fr-FR')}`, margin, yPosition);
  
  // Download the PDF
  doc.save(`contrat-location-${data.referenceId}.pdf`);
};
