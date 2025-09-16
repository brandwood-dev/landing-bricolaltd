
import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toolsService, Tool } from '@/services/toolsService';
import { ModerationStatus } from '@/types/bridge/enums';
import MyAdsSearchAndFilters from './MyAdsSearchAndFilters';
import AdCard from './ads/AdCard';
import AdListItem from './ads/AdListItem';
import AdsPagination from './ads/AdsPagination';

// Transform Tool to Ad interface for compatibility
interface Ad {
  id: string;
  title: string;
  category: string;
  price: number;
  published: boolean;
  validationStatus: 'confirmed' | 'pending' | 'rejected';
  moderationStatus: string;
  rating: number;
  totalRentals: number;
  image: string;
}

const MyAds = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState('');
  const [validationFilter, setValidationFilter] = useState('all');
  const [publicationFilter, setPublicationFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Transform Tool to Ad for compatibility with existing components
  const transformToolToAd = (tool: Tool): Ad => {
    const getValidationStatus = (moderationStatus: string): 'confirmed' | 'pending' | 'rejected' => {
      switch (moderationStatus) {
        case ModerationStatus.CONFIRMED: return 'confirmed';
        case ModerationStatus.PENDING: return 'pending';
        case ModerationStatus.REJECTED: return 'rejected';
        default: return 'pending';
      }
    };

    return {
      id: tool.id,
      title: tool.title,
      category: tool.category?.displayName || tool.category?.name || 'Non catégorisé',
      price: tool.basePrice,
      published: tool.moderationStatus === ModerationStatus.CONFIRMED && tool.toolStatus === 'PUBLISHED' && tool.isAvailable,
      validationStatus: getValidationStatus(tool.moderationStatus),
      moderationStatus: tool.moderationStatus,
      rating: 0, // Rating would need to come from reviews/bookings data
      totalRentals: 0, // This would need to come from bookings data
      image: tool.photos?.[0]?.url || '/placeholder.svg'
    };
  };

  // Fetch user's tools from backend
  const fetchUserTools = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const tools = await toolsService.getToolsByUser(user.id);
      const transformedAds = tools.map(transformToolToAd);
      setAds(transformedAds);
    } catch (error) {
      console.error('Error fetching user tools:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos annonces",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh function that can be called externally
  const refreshAds = () => {
    fetchUserTools();
  };

  useEffect(() => {
    fetchUserTools();
  }, [user]);

  // Listen for storage events to refresh when a new tool is added
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'toolAdded') {
        refreshAds();
        localStorage.removeItem('toolAdded'); // Clean up
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on component mount in case we're in the same tab
    const toolAdded = localStorage.getItem('toolAdded');
    if (toolAdded) {
      refreshAds();
      localStorage.removeItem('toolAdded');
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filtrage des annonces
  const filteredAds = useMemo(() => {
    return ads.filter(ad => {
      const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ad.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesValidation = validationFilter === 'all' || ad.validationStatus === validationFilter;
      const matchesPublication = publicationFilter === 'all' || 
                                (publicationFilter === 'published' && ad.published) ||
                                (publicationFilter === 'unpublished' && !ad.published);
      const matchesCategory = categoryFilter === 'all' || ad.category === categoryFilter;
      
      return matchesSearch && matchesValidation && matchesPublication && matchesCategory;
    });
  }, [ads, searchTerm, validationFilter, publicationFilter, categoryFilter]);

  // Calculs de pagination
  const totalPages = Math.ceil(filteredAds.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAds = filteredAds.slice(startIndex, endIndex);

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, validationFilter, publicationFilter, categoryFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getValidationStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getValidationStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return t('tools.approved');
      case 'pending': return t('tools.pending');
      case 'rejected': return t('tools.rejected');
      default: return status;
    }
  };

  const handlePublishToggle = async (adId: string, published: boolean) => {
    try {
      await toolsService.updateToolAvailability(adId, published);
      setAds(prevAds => 
        prevAds.map(ad => 
          ad.id === adId ? { ...ad, published } : ad
        )
      );
      toast({
        title: t('message.success'),
        description: published ? 'Outil publié avec succès' : 'Outil retiré de la publication',
      });
    } catch (error) {
      console.error('Error updating tool availability:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de publication",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAd = async (adId: string) => {
    try {
      await toolsService.deleteTool(adId);
      setAds(prevAds => prevAds.filter(ad => ad.id !== adId));
      toast({
        title: t('message.success'),
        description: t('ads.delete.success'),
      });
    } catch (error) {
      console.error('Error deleting tool:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'annonce",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-5 w-5" />
          {t('tools.my_ads')}
        </CardTitle>
        <Link to="/add-tool">
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{t('tools.new_ad')}</span>
            <span className="sm:hidden">{t('tools.new_ad')}</span>
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <MyAdsSearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          validationFilter={validationFilter}
          onValidationFilterChange={setValidationFilter}
          publicationFilter={publicationFilter}
          onPublicationFilterChange={setPublicationFilter}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <div className={viewMode === 'grid' ? 'space-y-4' : 'space-y-2'}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>Chargement de vos annonces...</p>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {ads.length === 0 ? (
                <div>
                  <p className="mb-4">Vous n'avez pas encore d'annonces.</p>
                  <Link to="/add-tool">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer votre première annonce
                    </Button>
                  </Link>
                </div>
              ) : (
                "Aucune annonce trouvée pour les critères sélectionnés."
              )}
            </div>
          ) : (
            currentAds.map(ad => viewMode === 'grid' ? (
              <AdCard 
                key={ad.id}
                ad={ad}
                onPublishToggle={handlePublishToggle}
                onDeleteAd={handleDeleteAd}
                onRefresh={refreshAds}
                getValidationStatusColor={getValidationStatusColor}
                getValidationStatusText={getValidationStatusText}
              />
            ) : (
              <AdListItem 
                key={ad.id}
                ad={ad}
                onPublishToggle={handlePublishToggle}
                onDeleteAd={handleDeleteAd}
                onRefresh={refreshAds}
                getValidationStatusColor={getValidationStatusColor}
                getValidationStatusText={getValidationStatusText}
              />
            ))
          )}
        </div>
        
        <AdsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredAds.length}
        />
      </CardContent>
    </Card>
  );
};

export default MyAds;
