import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MessageSquare, Calendar, User, Clock, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RequestsAndReservationsFilters from './RequestsAndReservationsFilters';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

// Import refactored components and utilities
import { Request, StatusOption } from './requests/types';
import { getStatusColor, getStatusText, handleDownloadContract, statusOptions } from './requests/utils';
import { bookingService, Booking } from '@/services/bookingService';
import RefusalDialog from './requests/RefusalDialog';
import ReportDialog from './requests/ReportDialog';
import ContactDialog from './requests/ContactDialog';
import ConfirmRecoveryDialog from './requests/ConfirmRecoveryDialog';
import ReviewDialog from './requests/ReviewDialog';
import ClaimDialog from './requests/ClaimDialog';
import CancellationDetailsDialog from './requests/CancellationDetailsDialog';
import { useLanguage } from '@/contexts/LanguageContext';

const Requests = () => {
  const [validationCode, setValidationCode] = useState('');
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState('');
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const { toast } = useToast();

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const { t, language } = useLanguage();

  // Load bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const ownerBookings = await bookingService.getOwnerBookings({ limit: 50 });
        // Convert bookings to requests format
        const convertedRequests: Request[] = ownerBookings.data.map((booking: Booking) => ({
          id: booking.id,
          toolName: booking.tool?.title || 'Outil inconnu',
          renterName: `${booking.renterInfo.firstName} ${booking.renterInfo.lastName}`,
          startDate: booking.startDate,
          endDate: booking.endDate,
          totalPrice: booking.totalAmount,
          status: booking.status.toLowerCase() as any,
          message: booking.message || '',
          createdAt: booking.createdAt,
          paymentStatus: booking.paymentStatus.toLowerCase() as any
        }));
        setRequests(convertedRequests);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleAcceptRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, status: 'accepted' } : req
    ));
    toast({
      title: t('request.accepted.title'),
      description: t('request.accepted.message'),
    });
  };

  const handleDeclineRequest = (requestId: string, reason: string, message: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { 
        ...req, 
        status: 'declined', 
        refusalReason: reason, 
        refusalMessage: message 
      } as Request : req
    ));
    
    toast({
      title: t('request.refuse'),
      description: t('request.refuse.message'),
    });
  };

  const handleValidationCode = (requestId: string) => {
    if (validationCode === '1234') {
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'ongoing' } : req
      ));
      toast({
        title: t('request.validation_code_accepted'),
        description: t('request.validation_code_accepted_message'),
      });
      setValidationCode('');
    } else {
      toast({
        title: t('request.validation_code_rejected'),
        description: t('request.validation_code_rejected_message'),
        variant: "destructive"
      });
    }
  };

  const handleToolRecovery = (requestId: string) => {
    setSelectedRequestId(requestId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmRecovery = () => {
    setIsConfirmDialogOpen(false);
    setIsReviewDialogOpen(true);
  };

  const handleOpenClaim = () => {
    setIsConfirmDialogOpen(false);
    setIsClaimDialogOpen(true);
  };

  const handleSubmitReview = (rating: number, comment: string) => {
    setRequests(prev => prev.map(req => 
      req.id === selectedRequestId ? { ...req, status: 'completed' } : req
    ));
    
    toast({
      title: t('review.popuptitle'),
      description: t('review.modalmsg'),
    });
    
    setIsReviewDialogOpen(false);
    setSelectedRequestId('');
  };

  const handleSubmitClaim = (claimType: string, claimDescription: string) => {
    // Mark the request as having an active claim
    setRequests(prev => prev.map(req => 
      req.id === selectedRequestId ? { ...req, hasActiveClaim: true } : req
    ));
    
    toast({
      title: t('claim.sent'),
      description: t('claim.sent_message'),
    });
    
    setIsClaimDialogOpen(false);
    setSelectedRequestId('');
  };

  const handleReportSubmit = (requestId: string) => {
    // Mark the request as having an active claim when reported
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, hasActiveClaim: true } : req
    ));
  };

  const simulateRenterReturn = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId ? { ...req, renterHasReturned: true } : req
    ));
    toast({
      title: "Simulation",
      description: "Le locataire a confirmé avoir rendu l'outil.",
    });
  };


  // Données à paginer
  const dataToDisplay = filteredRequests.length > 0 ? filteredRequests : requests;
  
  // Calcul de la pagination
  const totalPages = Math.ceil(dataToDisplay.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRequests = dataToDisplay.slice(startIndex, endIndex);

  // Gestion du changement de page
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset de la page quand les filtres changent
  const handleFilteredDataChange = (data: Request[]) => {
    setFilteredRequests(data);
    setCurrentPage(1); // Retour à la première page lors d'un changement de filtre
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des demandes...</span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {t('request.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filtres */}
        <RequestsAndReservationsFilters 
          data={requests}
          onFilteredDataChange={handleFilteredDataChange}
          searchPlaceholder={t('request.search')}
          statusOptions={statusOptions}
        />
        
        <div className="space-y-4">
          {paginatedRequests.map((request) => (
            <div key={request.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {/* Tool image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <img 
                      src={request.toolImage} 
                      alt={request.toolName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold">{request.toolName}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {request.isOwnerView ? request.renterName : request.owner}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'ar'
                        ? `${request.referenceId} : ${t('general.reference')}`
                        : `${t('general.reference')}: ${request.referenceId}`
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(request.status)}>
                    {t(`request.${request.status}`)}
                  </Badge>
                  {(request.status === 'ongoing' || request.status === 'accepted') && request.hasActiveClaim && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                      {t('claim.in_progress')}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {t('request.from')} {request.startDate} {t('request.to')} {request.endDate}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {t('request.pickup_time')} : {request.pickupTime}
                </div>
                <div className="font-semibold text-primary">
                  {request.totalPrice}€
                </div>
              </div>

              {request.message && (
                <div className="bg-muted/50 p-3 rounded text-sm">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p>{request.message}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 flex-wrap">
                {/* Contract download for accepted and ongoing requests */}
                {request.isOwnerView && ['accepted', 'ongoing'].includes(request.status) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownloadContract(request, toast,t)}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    {t('request.download_contract')}
                  </Button>
                )}

                {/* Actions pour les propriétaires */}
                {request.isOwnerView && request.status === 'pending' && (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="default" size="sm">
                          {t('request.accept')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader className="!flex !flex-col !space-y-3">
                          <AlertDialogTitle className={"text-lg font-semibold "+ (language === 'ar' ? "text-right" : "")}>
                            {t('request.confirm_acceptence')}
                          </AlertDialogTitle>
                          <AlertDialogDescription className={"text-sm text-muted-foreground "+ (language === 'ar' ? "text-right" : "")}>
                            {t('request.confirm_acceptence_message')}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleAcceptRequest(request.id)}>
                            {t('action.confirm')}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <RefusalDialog 
                      onDecline={handleDeclineRequest}
                      requestId={request.id}
                    />
                  </>
                )}

                {/* Contact pour les demandes acceptées */}
                {request.isOwnerView && request.status === 'accepted' && (
                  <>
                    <ContactDialog request={request as any} />
                    <ReportDialog requestId={request.id} onReportSubmit={handleReportSubmit} />
                  </>
                )}

                {/* Actions pour les demandes en cours */}
                {request.isOwnerView && request.status === 'ongoing' && (
                  <>
                    <ContactDialog request={request as any} />
                    <ReportDialog requestId={request.id} onReportSubmit={handleReportSubmit} />

                    <Button 
                      variant={request.renterHasReturned ? "default" : "outline"}
                      size="sm"
                      disabled={!request.renterHasReturned}
                      onClick={() => handleToolRecovery(request.id)}
                    >
                      {t('request.pickup_confirm_button')}
                    </Button>

                    {!request.renterHasReturned && (
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => simulateRenterReturn(request.id)}
                      >
                        [Simuler] Locataire a rendu
                      </Button>
                    )}
                  </>
                )}

                {/* Code de validation pour les demandes acceptées */}
                {request.isOwnerView && request.status === 'accepted' && (
                  <div className="w-full mt-3 p-3 bg-blue-50 rounded border">
                    <p className="text-sm font-medium mb-2">{t('request.validation_code')}</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder={t('request.enter_code')}
                        value={validationCode}
                        onChange={(e) => setValidationCode(e.target.value)}
                        className={"flex-1" + (language === 'ar' ? " text-right" : "")}
                      />
                      <Button onClick={() => handleValidationCode(request.id)}>
                        {t('action.confirm')}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Bouton pour voir les détails d'annulation */}
                {request.status === 'cancelled' && (
                  <CancellationDetailsDialog request={request} />
                )}

                {/* Contact général pour les autres statuts */}
                {!request.isOwnerView && !['cancelled', 'declined'].includes(request.status) && (
                  <Button variant="outline" size="sm">
                    Contacter
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination>
              <PaginationContent className={language === 'ar' ? "[direction:ltr]" : ''}>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, index) => {
                  const pageNumber = index + 1;
                  const isCurrentPage = pageNumber === currentPage;
                  
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNumber);
                        }}
                        isActive={isCurrentPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Refactored Dialogs */}
        <ConfirmRecoveryDialog
          isOpen={isConfirmDialogOpen}
          onOpenChange={setIsConfirmDialogOpen}
          onConfirm={handleConfirmRecovery}
          onClaim={handleOpenClaim}
        />

        <ReviewDialog
          isOpen={isReviewDialogOpen}
          onOpenChange={setIsReviewDialogOpen}
          onSubmit={handleSubmitReview}
        />

        <ClaimDialog
          isOpen={isClaimDialogOpen}
          onOpenChange={setIsClaimDialogOpen}
          onSubmit={handleSubmitClaim}
        />
      </CardContent>
    </Card>
  );
};

export default Requests;
