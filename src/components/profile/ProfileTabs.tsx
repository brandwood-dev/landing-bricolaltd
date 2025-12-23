import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, DollarSign, MessageSquare, Calendar, Edit, Heart } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ProfileInfo from './ProfileInfo';
import Wallet from './Wallet';
import Requests from './Requests';
import Reservations from './Reservations';
import MyAds from './MyAds';
import MyFavorites from './MyFavorites';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ProfileTabs = ({ activeTab, setActiveTab }: ProfileTabsProps) => {
  const { t, language } = useLanguage();
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <TabsList className="w-full h-auto p-0 bg-transparent">
          <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full ${language === 'ar' ? '[direction:rtl]' : ''}`}>
            <TabsTrigger 
              value="profile" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <User className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.profile')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.wallet')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="requests" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.requests')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reservations" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.reservations')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="ads" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <Edit className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.ads')}</span>
            </TabsTrigger>
            <TabsTrigger 
              value="favorites" 
              className="flex flex-col items-center gap-1 sm:gap-2 py-3 sm:py-4 px-2 sm:px-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5"
            >
              <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-xs sm:text-sm font-medium">{t('profile.favorites')}</span>
            </TabsTrigger>
          </div>
        </TabsList>
      </div>

      {/* Tab contents */}
      <TabsContent value="profile" className="space-y-6">
        <ProfileInfo />
      </TabsContent>

      <TabsContent value="wallet" className="space-y-6">
        <Wallet />
      </TabsContent>

      <TabsContent value="requests" className="space-y-6">
        <Requests />
      </TabsContent>

      <TabsContent value="reservations" className="space-y-6">
        <Reservations />
      </TabsContent>

      <TabsContent value="ads" className="space-y-6">
        <MyAds />
      </TabsContent>

      <TabsContent value="favorites" className="space-y-6">
        <MyFavorites />
      </TabsContent>
    </Tabs>
  );
};

export default ProfileTabs;
