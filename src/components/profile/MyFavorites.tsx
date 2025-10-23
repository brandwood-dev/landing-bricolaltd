
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Star, MapPin, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useToast } from '@/hooks/use-toast';
import { OptimizedPriceDisplay } from '../OptimizedPriceDisplay'
const MyFavorites = () => {
  const { favorites, removeFromFavorites, isLoading } = useFavorites();
  const { toast } = useToast();
  
  const handleRemoveFavorite = async (id: string) => {
    try {
      await removeFromFavorites(id);
      toast({
        title: "Retiré des favoris",
        description: "L'outil a été retiré de vos favoris.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression.",
        variant: "destructive",
      });
    }
  };
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Heart className='h-5 w-5 text-red-500' />
          {t('favorites.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='text-center py-8'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
            <p className='text-gray-600'>Chargement de vos favoris...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className='text-center py-8'>
            <Heart className='h-16 w-16 mx-auto text-gray-300 mb-4' />
            <p className='text-gray-600 mb-4'>{t('fav.nofav')}</p>
            <Link to='/search'>
              <Button>{t('fav.btnexplore')}</Button>
            </Link>
          </div>
        ) : (
          <div className='space-y-4'>
            {favorites.map((favorite) => (
              <div key={favorite.id} className='border rounded-lg p-4'>
                <div className='flex items-start gap-4'>
                  <img
                    src={
                      favorite.photos && favorite.photos.length > 0
                        ? favorite.photos.find((photo) => photo.isPrimary)
                            ?.url || favorite.photos[0]?.url
                        : '/placeholder.svg'
                    }
                    alt={favorite.title}
                    className='w-16 h-16 rounded-lg object-cover'
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg'
                    }}
                  />
                  <div className='flex-1 space-y-2'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <h3 className='font-semibold'>{favorite.title}</h3>
                        <p className='text-sm text-muted-foreground'>
                          {t('general.by')} {favorite.owner?.firstName}{' '}
                          {favorite.owner?.lastName}
                        </p>
                      </div>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveFavorite(favorite.id)}
                        className='text-red-500 hover:text-red-700'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>

                    <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                      <div className='flex items-center gap-1'>
                        <Star className='h-4 w-4 fill-yellow-400 text-yellow-400' />
                        {favorite.rating || favorite.averageRating || 0}
                      </div>
                      <div className='flex items-center gap-1'>
                        <MapPin className='h-4 w-4' />
                        {favorite.pickupAddress}
                      </div>
                    </div>

                    <div className='flex items-center justify-between'>
                      <div className='font-semibold text-primary'>
                        <OptimizedPriceDisplay
                          price={favorite.basePrice}
                          baseCurrency='GBP'
                          size='md'
                          cible='basePrice'
                        />
                      </div>
                      <Link to={`/tool/${favorite.id}`}>
                        <Button size='sm'>{t('general.view_details')}</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
};

export default MyFavorites;
