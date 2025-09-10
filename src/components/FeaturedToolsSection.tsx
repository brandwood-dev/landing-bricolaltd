
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Star, MapPin, Calendar, Heart, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toolsService, Tool } from '@/services/toolsService';
import { useToast } from '@/hooks/use-toast';

const FeaturedToolsSection = () => {
  const { t } = useLanguage();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { toast } = useToast();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured tools on component mount
  useEffect(() => {
    const fetchFeaturedTools = async () => {
      try {
        setLoading(true);
        setError(null);
        const featuredTools = await toolsService.getFeaturedTools(8);
        setTools(featuredTools);
      } catch (err: any) {
        console.error('Error fetching featured tools:', err);
        setError(err.message);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTools();
  }, []);

  const handleFavoriteToggle = async (tool: Tool) => {
    try {
      if (isFavorite(tool.id)) {
        await removeFromFavorites(tool.id);
        toast({
          title: "Retiré des favoris",
          description: `${tool.title} a été retiré de vos favoris.`,
        });
      } else {
        await addToFavorites(tool);
        toast({
          title: "Ajouté aux favoris",
          description: `${tool.title} a été ajouté à vos favoris.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la mise à jour des favoris.",
        variant: "destructive",
      });
    }
  };

  // Calculate display price with 5.4% fees
  const calculateDisplayPrice = (originalPrice: number | string) => {
    const price = typeof originalPrice === 'number' ? originalPrice : parseFloat(originalPrice) || 0;
    const feeRate = 0.054;
    const feeAmount = price * feeRate;
    return price + feeAmount;
  };

  // Get primary photo URL
  const getPrimaryPhotoUrl = (tool: Tool) => {
    const primaryPhoto = tool.photos?.find(photo => photo.isPrimary);
    return primaryPhoto?.url || tool.photos?.[0]?.url || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('tools.featured')}</h2>
            <p className="text-lg text-gray-600">{t('tools.description')}</p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Chargement des outils...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error && tools.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('tools.featured')}</h2>
            <p className="text-lg text-gray-600">{t('tools.description')}</p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-600">Impossible de charger les outils pour le moment.</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('tools.featured')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('tools.description')}
          </p>
        </div>

        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {tools.map((tool) => {
              const displayPrice = calculateDisplayPrice(tool.basePrice);
              return (
                <CarouselItem key={tool.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/4">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden card-hover h-full">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={getPrimaryPhotoUrl(tool)}
                    alt={tool.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                      {tool.category.displayName}
                    </Badge>
                    <Badge variant="outline" className="bg-white/90">
                      {tool.subcategory.displayName}
                    </Badge>
                  </div>
                  <button
                    onClick={() => handleFavoriteToggle(tool)}
                    className="absolute top-3 right-3 bg-white rounded-full p-1 hover:bg-gray-50"
                  >
                    <Heart 
                      className={`h-4 w-4 ${
                        isFavorite(tool.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'
                      }`} 
                    />
                  </button>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      {tool.rating} ({tool.reviewCount})
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {tool.title}
                  </h3>

                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    {tool.pickupAddress}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-lg font-bold text-primary">
                      {(typeof displayPrice === 'number' ? displayPrice : parseFloat(displayPrice) || 0).toFixed(1)}€<span className="text-sm font-normal text-gray-500">/{t('tools.day')}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {t('tools.by')} {tool.owner.firstName} {tool.owner.lastName.charAt(0)}.
                    </div>
                  </div>

                  <Link to={`/tool/${tool.id}`} className="w-full">
                    <Button size="sm" className="w-full">
                      {t('tools.rent')}
                    </Button>
                    </Link>
                  </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="text-center mt-10">
          <Link to="/search">
            <Button variant="outline" size="lg">
              {t('tools.display_all')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedToolsSection;
