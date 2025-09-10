import React from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Shield, Building2, UserCircle, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfileHeaderProps {
  userInfo: {
    firstName: string;
    lastName: string;
    email: string;
    verified: boolean;
    memberSince: string;
    accountType: string;
  };
  stats: {
    totalEarnings: number;
    activeAds: number;
    totalRentals: number;
    rating: number;
  };
  isAccountDeletionPending: boolean;
  onAccountDeletion: () => void;
}

const ProfileHeader = ({ userInfo, stats, isAccountDeletionPending, onAccountDeletion }: ProfileHeaderProps) => {
  const { t, language } = useLanguage();

  // Map accountType to translation key
  const accountTypeLabel = userInfo.accountType === 'Entreprise' || userInfo.accountType === t('profile.account_type_company')
    ? t('profile.account_type_company')
    : t('profile.account_type_individual');

  // Format memberSince date based on language
  const formattedMemberSince = language === 'fr' ? 'janvier 2024' : language === 'ar' ? 'يناير 2024' : 'January 2024';

  return (
    <>
      {/* Back button */}
      <div className="mb-6">
        <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" />
          {t('profile.back_home')}
        </Link>
      </div>

      {/* Profile header */}
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8">
        <div className="flex !flex-col gap-6">
          {/* Profile info section */}
          <div className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${language == "ar" ? "[direction:ltr]": ''}`}>
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="text-xl sm:text-2xl">
                {userInfo.firstName[0]}{userInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {/* User details */}
            <div className="flex-1 text-center sm:text-left w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {userInfo.firstName} {userInfo.lastName}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                  {userInfo.verified && (
                    <Badge variant="default" className="flex items-center gap-1 text-xs">
                      <Shield className="h-3 w-3" />
                      {t('profile.verified')}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs">
                    {accountTypeLabel === t('profile.account_type_company') ? (
                      <Building2 className="h-3 w-3" />
                    ) : (
                      <UserCircle className="h-3 w-3" />
                    )}
                    {accountTypeLabel}
                  </Badge>
                </div>
              </div>
              {isAccountDeletionPending && (
                <Badge variant="destructive" className="mb-2 text-xs">
                  {t('profile.account_deletion_pending')}
                </Badge>
              )}
              <p className={`text-gray-600 mb-4 text-sm sm:text-base ${language === 'ar' ? 'text-right sm:text-right' : ''}`}>
                {t('profile.member_since').replace('{date}', formattedMemberSince)}
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.totalEarnings}€</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.total_earnings')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.activeAds}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.active_ads')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.totalRentals}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.rentals_completed')}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-primary">{stats.rating}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">{t('profile.average_rating')}</div>
            </div>
          </div>

          {/* Delete account button */}
          {/* <div className="flex justify-center sm:justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="sm:hidden">{t('profile.delete_account')}</span>
                  <span className="hidden sm:inline">{t('profile.delete_account')}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader className={"flex flex-row flex-wrap items-center " + (language === 'ar' ? 'justify-end' : '')}>
                  <AlertDialogTitle>{t('profile.delete_confirm')}</AlertDialogTitle>
                  <AlertDialogDescription className={"text-left space-y-2" + (language === 'ar' ? ' text-right' : '')}>
                    <div>{t('profile.delete_description')}</div>
                    <div>{t('profile.delete_processing')}</div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={onAccountDeletion}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('action.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;