import React, { useState } from 'react'
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
import { Trash2, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { accountDeletionService, AccountDeletionValidation } from '@/services/accountDeletionService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import authService from '@/services/authService'

interface DeleteAccountButtonProps {
  userId: string
  isAccountDeletionPending: boolean
  onAccountDeletion: () => void
}

const DeleteAccountButton = ({
  userId,
  isAccountDeletionPending,
  onAccountDeletion,
}: DeleteAccountButtonProps) => {
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
      const validation = await accountDeletionService.validateAccountDeletion(userId);
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

  // Render different content based on deletion step
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

  // Transform blocking issues into displayable issues
  const getDisplayableIssues = () => {
    if (!validationResult || !validationResult.blockingIssues) return [];

    const issues = [];
    const { blockingIssues } = validationResult;

    // Pending bookings
    if (blockingIssues.pendingBookings > 0) {
      issues.push({
        title:
          language === 'fr'
            ? 'Réservations en attente'
            : language === 'ar'
            ? 'حجوزات معلقة'
            : 'Pending Bookings',
        description:
          language === 'fr'
            ? `Vous avez ${blockingIssues.pendingBookings} réservation(s) en attente. Vous devez les annuler ou attendre qu'elles soient traitées.`
            : language === 'ar'
            ? `لديك ${blockingIssues.pendingBookings} حجز(ات) معلقة. يجب إلغاؤها أو انتظار معالجتها.`
            : `You have ${blockingIssues.pendingBookings} pending booking(s). You must cancel them or wait for them to be processed.`,
        action:
          language === 'fr'
            ? 'Voir mes réservations'
            : language === 'ar'
            ? 'عرض حجوزاتي'
            : 'View My Bookings',
        actionUrl: '/profile?tab=reservations',
      })
    }

    // Confirmed reservations
    if (blockingIssues.confirmedReservations > 0) {
      issues.push({
        title:
          language === 'fr'
            ? 'Réservations confirmées'
            : language === 'ar'
            ? 'حجوزات مؤكدة'
            : 'Confirmed Reservations',
        description:
          language === 'fr'
            ? `Vous avez ${blockingIssues.confirmedReservations} réservation(s) confirmée(s) pour vos outils. Vous devez attendre qu'elles se terminent.`
            : language === 'ar'
            ? `لديك ${blockingIssues.confirmedReservations} حجز(ات) مؤكدة لأدواتك. يجب انتظار انتهائها.`
            : `You have ${blockingIssues.confirmedReservations} confirmed reservation(s) for your tools. You must wait for them to complete.`,
        action:
          language === 'fr'
            ? 'Voir mes outils loués'
            : language === 'ar'
            ? 'عرض أدواتي المؤجرة'
            : 'View My Rented Tools',
        actionUrl: '/profile?tab=requests',
      })
    }

    // Ongoing disputes
    if (blockingIssues.ongoingDisputes > 0) {
      issues.push({
        title: language === 'fr' ? 'Litiges en cours' :
               language === 'ar' ? 'نزاعات جارية' :
               'Ongoing Disputes',
        description: language === 'fr' ? 
          `Vous avez ${blockingIssues.ongoingDisputes} litige(s) en cours. Vous devez les résoudre avant de supprimer votre compte.` :
          language === 'ar' ? 
          `لديك ${blockingIssues.ongoingDisputes} نزاع(ات) جارية. يجب حلها قبل حذف حسابك.` :
          `You have ${blockingIssues.ongoingDisputes} ongoing dispute(s). You must resolve them before deleting your account.`,
        action: language === 'fr' ? 'Voir mes litiges' :
               language === 'ar' ? 'عرض نزاعاتي' :
               'View My Disputes',
        actionUrl: '/profile'
      });
    }

    // Unreturned tools
    if (blockingIssues.unreturnedTools > 0) {
      issues.push({
        title:
          language === 'fr'
            ? 'Outils non retournés'
            : language === 'ar'
            ? 'أدوات غير مُعادة'
            : 'Unreturned Tools',
        description:
          language === 'fr'
            ? `Vous avez ${blockingIssues.unreturnedTools} outil(s) que vous devez encore retourner. Vous devez les retourner avant de supprimer votre compte.`
            : language === 'ar'
            ? `لديك ${blockingIssues.unreturnedTools} أداة/أدوات يجب إعادتها. يجب إعادتها قبل حذف حسابك.`
            : `You have ${blockingIssues.unreturnedTools} tool(s) that you need to return. You must return them before deleting your account.`,
        action:
          language === 'fr'
            ? 'Voir mes locations'
            : language === 'ar'
            ? 'عرض إيجاراتي'
            : 'View My Rentals',
        actionUrl: '/profile?tab=reservations',
      })
    }

    return issues;
  };

  // Render validation step
  const renderValidationStep = () => {
    if (!validationResult) return null;

    if (validationResult.canDelete) {
      return renderConfirmationStep();
    }

    const displayableIssues = getDisplayableIssues();

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
          {displayableIssues.map((issue, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
              <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-orange-800">{issue.title}</div>
                <div className="text-orange-700 mt-1">{issue.description}</div>
                {issue.action && (
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-orange-700 border-orange-300 hover:bg-orange-100"
                      onClick={() => {
                        // Handle action click - could navigate to relevant page
                        if (issue.actionUrl) {
                          navigate(issue.actionUrl);
                        }
                      }}
                    >
                      {issue.action}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>
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
          <AlertDialogCancel>
            {language === 'fr' ? 'Annuler' :
             language === 'ar' ? 'إلغاء' :
             'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => setDeletionStep('password')}
            className="bg-destructive hover:bg-destructive/90"
          >
            {language === 'fr' ? 'Continuer' :
             language === 'ar' ? 'متابعة' :
             'Continue'}
          </AlertDialogAction>
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
            className="mt-2"
            placeholder={
              language === 'fr' ? 'Saisissez votre mot de passe' :
              language === 'ar' ? 'أدخل كلمة المرور' :
              'Enter your password'
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
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
          <AlertDialogAction
            onClick={handlePasswordSubmit}
            disabled={isLoading || !password.trim()}
            className="bg-destructive hover:bg-destructive/90"
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
          </AlertDialogAction>
        </AlertDialogFooter>
      </>
    );
  };

  return (
    <div className='flex justify-center'>
      <AlertDialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <AlertDialogTrigger asChild>
          <Button
            variant='outline'
            size='sm'
            className='text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground'
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
            {t('profile.delete_account')}
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
  )
}

export default DeleteAccountButton