
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { userService, UserStats } from '@/services/userService';
import { walletService } from '@/services/walletService';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
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
        
        // Fetch user statistics from backend
        const [userStatsData, walletBalance] = await Promise.all([
          userService.getUserStats(user.id),
          walletService.getUserBalance(user.id).catch(() => ({ balance: 0 })) // Fallback if wallet doesn't exist
        ]);
        
        setUserStats(userStatsData);
        
        // Transform backend data to match ProfileHeader expectations
        const transformedStats = {
          totalEarnings: walletBalance.balance || 0,
          activeAds: userStatsData.activeTools,
          totalRentals: userStatsData.completedBookings,
          rating: userStatsData.averageRating
        };
        
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

  // Transform user data for ProfileHeader component
  const userInfo = user ? {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    verified: user.verifiedEmail,
    memberSince: userStats?.memberSince || user.createdAt,
    accountType: user.userType === 'individual' ? 'Particulier' : 'Entreprise'
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
              <span className="ml-2">Chargement du profil...</span>
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
            isAccountDeletionPending={isAccountDeletionPending}
            onAccountDeletion={handleAccountDeletion}
          />
          <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
