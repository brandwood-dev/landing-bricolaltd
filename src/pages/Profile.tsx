
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { authService } from '@/services/authService';
import { userService, UserStats } from '@/services/userService';
import { walletService } from '@/services/walletService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import DeleteAccountButton from '@/components/profile/DeleteAccountButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Profile = () => {
  const { t } = useLanguage();
  const { currency, refreshRates } = useCurrency();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Valid tabs
  const validTabs = ['profile', 'wallet', 'requests', 'reservations', 'ads', 'favorites'];
  
  // Get active tab from URL or default to 'profile'
  const getActiveTabFromUrl = () => {
    const tabParam = searchParams.get('tab');
    return validTabs.includes(tabParam || '') ? tabParam : 'profile';
  };
  
  const [activeTab, setActiveTabState] = useState(getActiveTabFromUrl());
  const [isAccountDeletionPending, setIsAccountDeletionPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeAds: 0,
    totalRentals: 0,
    rating: 0
  });
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  // Function to update active tab and URL
  const setActiveTab = (tab: string) => {
    if (validTabs.includes(tab)) {
      setActiveTabState(tab);
      setSearchParams({ tab });
    }
  };

  // Fetch user profile and stats
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Profile - Fetching user stats for current user');
        
        // Fetch user statistics from backend
        const userStatsData = await userService.getUserStats();
        
        console.log('Profile - User stats received:', userStatsData);
        
        setUserStats(userStatsData.data);
        
        // Transform backend data to match ProfileHeader expectations
        const transformedStats = {
          totalEarnings: userStatsData?.totalEarnings || 0,
          activeAds: userStatsData?.activeAds || 0,
          completedRentals: userStatsData?.completedRentals || 0,
          averageRating: userStatsData?.averageRating || 0
        };
        
        console.log('Profile - Transformed stats:', transformedStats);
        console.log('Profile - UserStatsData details:', {
          totalEarnings: userStatsData.totalEarnings,
          activeAds: userStatsData.activeAds,
          completedRentals: userStatsData.completedRentals,
          averageRating: userStatsData.averageRating
        });
        
        setStats(transformedStats);
      } catch (err: any) {
        console.error('Failed to fetch profile data:', err);
        setError(err.message || 'Failed to load profile data');
        
        // Fallback to basic stats if API fails
        setStats({
          totalEarnings: 0,
          activeAds: 0,
          totalRentals: 0,
          rating: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [isAuthenticated, user]);

  // Sync activeTab with URL changes (browser back/forward buttons)
  useEffect(() => {
    const newActiveTab = getActiveTabFromUrl();
    if (newActiveTab !== activeTab) {
      setActiveTabState(newActiveTab);
    }
  }, [searchParams]);

  // Force refresh of exchange rates when currency changes
  useEffect(() => {
    const refreshCurrencyRates = async () => {
      if (currency && isAuthenticated) {
        console.log(`🔄 [Profile] Currency changed to ${currency.code}, refreshing exchange rates`);
        try {
          await refreshRates('currency_change');
          console.log(`✅ [Profile] Exchange rates refreshed for ${currency.code}`);
        } catch (error) {
          console.error('❌ [Profile] Failed to refresh exchange rates:', error);
        }
      }
    };

    refreshCurrencyRates();
  }, [currency.code, refreshRates, isAuthenticated]);

  // Transform user data for ProfileHeader component
  const userInfo = user ? {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    verified: user.verifiedEmail,
    memberSince: user.createdAt,
    phoneNumber: user.phoneNumber,
    phone_prefix: user.phone_prefix,
    profilePicture: user.profilePicture
    
  } : null;

  const handleAccountDeletion = () => {
    setIsAccountDeletionPending(true);
    toast({
      title: "Demande de suppression enregistrée",
      description: "Votre demande de suppression de compte a été enregistrée et sera traitée sous 72 heures.",
      variant: "default",
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">{t('general.loading')}</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show profile if user data is available
  if (!userInfo) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <Alert>
              <AlertDescription>Aucune donnée utilisateur disponible.</AlertDescription>
            </Alert>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <ProfileHeader 
            userInfo={userInfo}
            stats={stats}
          />
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Delete Account Button - affiché seulement si ?tab=profile */}
          <div className="mt-8 pt-8 border-t border-border">
            {activeTab === 'profile' && (
              <DeleteAccountButton
                userId={user?.id || ''}
                isAccountDeletionPending={isAccountDeletionPending}
                onAccountDeletion={handleAccountDeletion}
              />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
