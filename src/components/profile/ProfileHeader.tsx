import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ArrowLeft, Shield, Building2, UserCircle, Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { accountDeletionService, AccountDeletionValidation } from '@/services/accountDeletionService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import authService from '@/services/authService'

interface ProfileHeaderProps {
  userInfo: {
    id: string
    firstName: string
    lastName: string
    email: string
    verified: boolean
    memberSince: string
    accountType: string
    profilePicture?: string
  }
  stats: {
    totalEarnings: number
    activeAds: number
    totalRentals: number
    rating: number
  }
  isAccountDeletionPending: boolean
  onAccountDeletion: () => void
}

const ProfileHeader = ({
  userInfo,
  stats,
  isAccountDeletionPending,
  onAccountDeletion,
}: ProfileHeaderProps) => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  
  // State management for deletion process
  const [deletionStep, setDeletionStep] = useState<'initial' | 'validation' | 'confirmation' | 'password'>('initial')
  const [validationResult, setValidationResult] = useState<AccountDeletionValidation | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Handle delete account button click
  const handleDeleteAccountClick = async () => {
    setIsLoading(true);
    setDeletionStep('validation');
    
    try {
      const validation = await accountDeletionService.validateAccountDeletion(userInfo.id);
      setValidationResult(validation);
      
      if (validation.canDelete) {
        setDeletionStep('confirmation');
      } else {
        setDeletionStep('validation');
      }
    } catch (error: any) {
      toast.error(
        language === 'fr' ? 'Erreur lors de la validation' :
        language === 'ar' ? 'خطأ في التحقق' :
        'Validation error'
      );
      setIsDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password validation and account deletion
  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      toast.error(
        language === 'fr' ? 'Veuillez saisir votre mot de passe' :
        language === 'ar' ? 'يرجى إدخال كلمة المرور' :
        'Please enter your password'
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // Validate password
      const isValidPassword = await accountDeletionService.validatePassword(password);
      
      if (!isValidPassword) {
        toast.error(
          language === 'fr' ? 'Mot de passe incorrect' :
          language === 'ar' ? 'كلمة مرور خاطئة' :
          'Incorrect password'
        );
        return;
      }

      // Delete account
      await accountDeletionService.deleteAccount();

      // Show success message
      toast.success(
        language === 'fr' ? 'Compte supprimé avec succès' :
        language === 'ar' ? 'تم حذف الحساب بنجاح' :
        'Account deleted successfully'
      );

      // Close dialog and redirect
      setIsDialogOpen(false);
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    
      //auth logout
      await authService.logout();


    } catch (error: any) {
      toast.error(
        error.message ||
        (language === 'fr' ? 'Erreur lors de la suppression' :
         language === 'ar' ? 'خطأ في الحذف' :
         'Deletion failed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Reset dialog state when closed
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setDeletionStep('initial');
      setValidationResult(null);
      setPassword('');
      setIsLoading(false);
    }
    setIsDialogOpen(open);
  };

  // Render deletion dialog content based on current step
  const renderDeletionContent = () => {
    switch (deletionStep) {
      case 'validation':
        return renderValidationStep();
      case 'confirmation':
        return renderConfirmationStep();
      case 'password':
        return renderPasswordStep();
      default:
        return null;
    }
  };

  // Render validation step
  const renderValidationStep = () => {
    if (!validationResult) {
      return (
        <div className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">
            {language === 'fr' ? 'Validation en cours...' :
             language === 'ar' ? 'جاري التحقق...' :
             'Validating...'}
          </span>
        </div>
      );
    }

    if (validationResult.canDelete) {
      return renderConfirmationStep();
    }

    const { blockingIssues } = validationResult;
    const hasIssues = blockingIssues && Object.values(blockingIssues).some(count => count > 0);

    // Safe access to blockingIssues properties with default values
    const safeBlockingIssues = {
      pendingBookings: blockingIssues?.pendingBookings || 0,
      confirmedReservations: blockingIssues?.confirmedReservations || 0,
      ongoingDisputes: blockingIssues?.ongoingDisputes || 0,
      unreturnedTools: blockingIssues?.unreturnedTools || 0
    };

    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {language === 'fr' ? 'Suppression impossible' :
             language === 'ar' ? 'لا يمكن الحذف' :
             'Cannot Delete Account'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'fr' ? 'Vous devez résoudre les problèmes suivants avant de supprimer votre compte :' :
             language === 'ar' ? 'يجب حل المشاكل التالية قبل حذف حسابك:' :
             'You must resolve the following issues before deleting your account:'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-3 py-4">
          {safeBlockingIssues.pendingBookings > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              {language === 'fr' ? `${safeBlockingIssues.pendingBookings} réservation(s) en attente` :
               language === 'ar' ? `${safeBlockingIssues.pendingBookings} حجز في الانتظار` :
               `${safeBlockingIssues.pendingBookings} pending booking(s)`}
            </div>
          )}
          
          {safeBlockingIssues.confirmedReservations > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              {language === 'fr' ? `${safeBlockingIssues.confirmedReservations} réservation(s) confirmée(s)` :
               language === 'ar' ? `${safeBlockingIssues.confirmedReservations} حجز مؤكد` :
               `${safeBlockingIssues.confirmedReservations} confirmed reservation(s)`}
            </div>
          )}
          
          {safeBlockingIssues.ongoingDisputes > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              {language === 'fr' ? `${safeBlockingIssues.ongoingDisputes} litige(s) en cours` :
               language === 'ar' ? `${safeBlockingIssues.ongoingDisputes} نزاع جاري` :
               `${safeBlockingIssues.ongoingDisputes} ongoing dispute(s)`}
            </div>
          )}
          
          {safeBlockingIssues.unreturnedTools > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              {language === 'fr' ? `${safeBlockingIssues.unreturnedTools} outil(s) non retourné(s)` :
               language === 'ar' ? `${safeBlockingIssues.unreturnedTools} أداة غير مُعادة` :
               `${safeBlockingIssues.unreturnedTools} unreturned tool(s)`}
            </div>
          )}
        </div>
        
        <div className="bg-blue-50 p-3 rounded-md">
          <p className="text-sm text-blue-800">
            {language === 'fr' ? 'Veuillez annuler vos réservations, résoudre vos litiges et retourner tous les outils avant de supprimer votre compte.' :
             language === 'ar' ? 'يرجى إلغاء حجوزاتك وحل نزاعاتك وإعادة جميع الأدوات قبل حذف حسابك.' :
             'Please cancel your bookings, resolve disputes, and return all tools before deleting your account.'}
          </p>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
            {language === 'fr' ? 'Fermer' :
             language === 'ar' ? 'إغلاق' :
             'Close'}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </>
    );
  };

  // Render confirmation step
  const renderConfirmationStep = () => {
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            {language === 'fr' ? 'Confirmer la suppression' :
             language === 'ar' ? 'تأكيد الحذف' :
             'Confirm Deletion'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'fr' ? 'Votre compte peut être supprimé. Cette action est irréversible et supprimera définitivement toutes vos données.' :
             language === 'ar' ? 'يمكن حذف حسابك. هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع بياناتك نهائياً.' :
             'Your account can be deleted. This action is irreversible and will permanently delete all your data.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
            {language === 'fr' ? 'Annuler' :
             language === 'ar' ? 'إلغاء' :
             'Cancel'}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={() => setDeletionStep('password')}
          >
            {language === 'fr' ? 'Confirmer la suppression' :
             language === 'ar' ? 'تأكيد الحذف' :
             'Confirm Delete'}
          </Button>
        </AlertDialogFooter>
      </>
    );
  };

  // Render password verification step
  const renderPasswordStep = () => {
    return (
      <>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {language === 'fr' ? 'Vérification du mot de passe' :
             language === 'ar' ? 'التحقق من كلمة المرور' :
             'Password Verification'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {language === 'fr' ? 'Veuillez saisir votre mot de passe pour confirmer la suppression de votre compte.' :
             language === 'ar' ? 'يرجى إدخال كلمة المرور لتأكيد حذف حسابك.' :
             'Please enter your password to confirm account deletion.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="password">
            {language === 'fr' ? 'Mot de passe' :
             language === 'ar' ? 'كلمة المرور' :
             'Password'}
          </Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={language === 'fr' ? 'Saisissez votre mot de passe' :
                        language === 'ar' ? 'أدخل كلمة المرور' :
                        'Enter your password'}
            className="mt-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handlePasswordSubmit();
              }
            }}
          />
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setDeletionStep('confirmation')}>
            {language === 'fr' ? 'Retour' :
             language === 'ar' ? 'رجوع' :
             'Back'}
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handlePasswordSubmit}
            disabled={isLoading || !password.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {language === 'fr' ? 'Suppression...' :
                 language === 'ar' ? 'جاري الحذف...' :
                 'Deleting...'}
              </>
            ) : (
              language === 'fr' ? 'Supprimer définitivement' :
              language === 'ar' ? 'حذف نهائياً' :
              'Delete Permanently'
            )}
          </Button>
        </AlertDialogFooter>
      </>
    );
  };

  // Log all user information
  console.log('ProfileHeader - User Info:', userInfo)

  // Map accountType to translation key
  const accountTypeLabel =
    userInfo.accountType === 'Entreprise' ||
    userInfo.accountType === t('profile.account_type_company')
      ? t('profile.account_type_company')
      : t('profile.account_type_individual')

  // Format memberSince date based on language
  const formatMemberSinceDate = (dateString: string, lang: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth()

    const monthNames = {
      fr: [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ],
      ar: [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ],
      en: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    }

    const monthName =
      monthNames[lang as keyof typeof monthNames]?.[month] ||
      monthNames.en[month]
    return `${monthName} ${year}`
  }

  const formattedMemberSince = formatMemberSinceDate(
    userInfo.memberSince,
    language
  )

  return (
    <>
      {/* Back button */}
      <div className='mb-6'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-accent hover:underline'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('profile.back_home')}
        </Link>
      </div>

      {/* Profile header */}
      <div className='bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8'>
        <div className='flex !flex-col gap-6'>
          {/* Profile info section */}
          <div
            className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${
              language == 'ar' ? '[direction:ltr]' : ''
            }`}
          >
            <Avatar className='h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0'>
              <AvatarImage src={userInfo.profilePicture || ''} />
              <AvatarFallback className='text-xl sm:text-2xl'>
                {userInfo.firstName[0]}
                {userInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {/* User details */}
            <div className='flex-1 text-center sm:text-left w-full'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
                <h1 className='text-2xl sm:text-3xl font-bold'>
                  {userInfo.firstName} {userInfo.lastName}
                </h1>
                <div className='flex flex-wrap justify-center sm:justify-start gap-2'>
                  {userInfo.verified && (
                    <Badge
                      variant='default'
                      className='flex items-center gap-1 text-xs'
                    >
                      <Shield className='h-3 w-3' />
                      {t('profile.verified')}
                    </Badge>
                  )}
                  <Badge
                    variant='secondary'
                    className='flex items-center gap-1 text-xs'
                  >
                    {accountTypeLabel === t('profile.account_type_company') ? (
                      <Building2 className='h-3 w-3' />
                    ) : (
                      <UserCircle className='h-3 w-3' />
                    )}
                    {accountTypeLabel}
                  </Badge>
                </div>
              </div>
              {isAccountDeletionPending && (
                <Badge variant='destructive' className='mb-2 text-xs'>
                  {t('profile.account_deletion_pending')}
                </Badge>
              )}
              <p
                className={`text-gray-600 mb-4 text-sm sm:text-base ${
                  language === 'ar' ? 'text-right sm:text-right' : ''
                }`}
              >
                {t('profile.member_since').replace(
                  '{date}',
                  formattedMemberSince
                )}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats.totalEarnings}€
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.total_earnings')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats.activeAds}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.active_ads')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats.totalRentals}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.rentals_completed')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats.rating}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.average_rating')}
              </div>
            </div>
          </div>

          {/* Delete account button  */}
          <div className='flex justify-center sm:justify-end'>
            <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
              <AlertDialogTrigger asChild>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto'
                  disabled={isAccountDeletionPending || isLoading}
                   onClick={() => {
                     setIsDialogOpen(true);
                     handleDeleteAccountClick();
                   }}
                >
                  {isLoading ? (
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  ) : (
                    <Trash2 className='h-4 w-4 mr-2' />
                  )}
                  <span className='sm:hidden'>
                    {t('profile.delete_account')}
                  </span>
                  <span className='hidden sm:inline'>
                    {t('profile.delete_account')}
                  </span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='max-w-md'>
                <AlertDialogTitle className="sr-only">
                  {t('profile.delete_account')}
                </AlertDialogTitle>
                {renderDeletionContent()}
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileHeader
