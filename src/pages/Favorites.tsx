
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Star, MapPin, ArrowLeft, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay';

const Favorites = () => {
  const { favorites, removeFromFavorites, isLoading } = useFavorites();
  const { t,language } = useLanguage();
  const { toast } = useToast();

  const handleRemoveFavorite = async (toolId: string) => {
    try {
      await removeFromFavorites(toolId);
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {t('fav.backhome')}
              </Link>
            </div>
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4 mx-auto"></div>
              <p className="text-gray-600">Chargement de vos favoris...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-6">
              <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline">
                <ArrowLeft className="h-4 w-4" />
                {t('fav.backhome')}
              </Link>
            </div>
            <div className="text-center py-16">
              <Heart className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('fav.nofav')}</h1>
              <p className="text-gray-600 mb-6">{t('fav.text')}</p>
              <Link to="/search">
                <Button>{t('fav.btnexplore')}</Button>
              </Link>
            </div>
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
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" />
              {t('fav.backhome')}
            </Link>
          </div>
          
          <div className={"flex items-center gap-3 mb-8" + (language === 'ar' ? " justify-end" : " justify-start")}>
            {
              language === 'ar' ? (
                <>
                <span className="bg-accent text-white px-3 py-1 rounded-full text-sm">
              {favorites.length}{t('blog.subcategory.tools')}
            </span> 
            <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
            <Heart className="h-8 w-8 text-red-500" />
                </>
              ):(
                <>
                <Heart className="h-8 w-8 text-red-500" />
            <h1 className="text-3xl font-bold">{t('favorites.title')}</h1>
            <span className="bg-accent text-white px-3 py-1 rounded-full text-sm">
              {favorites.length} {t('blog.subcategory.tools')}
            </span>
                </>
              )
            }
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((tool) => (
              <Card key={tool.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={tool.photos && tool.photos.length > 0 ? (tool.photos.find(photo => photo.isPrimary)?.url || tool.photos[0]?.url) : '/placeholder.svg'} 
                    alt={tool.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFavorite(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{tool.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {t('general.by')} {tool.owner?.firstName} {tool.owner?.lastName}
                  </p>
                  <div className={"flex items-center gap-4 text-sm text-gray-600 mb-3" + (language === 'ar' ? " justify-end" : "")}>
                    <div className="flex items-center gap-1">
                      {language === 'ar' ? (
                        <>
                        <span>{tool.rating || 0}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                        </>
                      ):(
                        <>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                        <span>{tool.rating || 0}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {language === 'ar' ? (
                        <>
                        <span>{tool.pickupAddress}</span>
                        <MapPin className="h-4 w-4" />
                        </>
                      ):(
                        <>
                        <MapPin className="h-4 w-4" />
                        <span>{tool.pickupAddress}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-primary">
                      <OptimizedPriceDisplay
                          price={tool.basePrice}
                          baseCurrency='GBP'
                          size='md'
                          cible='basePrice'
                        />
                    </div>
                    <Link to={`/tool/${tool.id}`}>
                      <Button size="sm">{t('general.view_details')}</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
