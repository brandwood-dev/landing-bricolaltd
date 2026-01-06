
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapView from './MapView';

const HeroSection = () => {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateSearch = () => {
    const isValid = searchQuery.trim().length > 0;
    setSearchError(!isValid);
    return isValid;
  };

  const handleSearch = async () => {
    if (!validateSearch()) {
      return;
    }

    setIsLoading(true);
    try {
      setShowMap(true);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showMap) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {t('search_results')} "{searchQuery}"
            </h2>
          </div>
          {showMap && (
            <div className="mt-8">
              <MapView 
                searchQuery={searchQuery}
                user={user}
                isAuthenticated={isAuthenticated}
                setSearchQuery={setSearchQuery}
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section 
      className="hero-gradient py-20 px-4 relative bg-cover bg-center"
      style={{ 
        backgroundImage: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url("/lovable-uploads/hero.png")',
        backgroundPosition: "50% center"
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
          {t('hero.title')}
        </h1>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>

        {/* Search bar - Title only */}
        <div className="bg-white rounded-2xl p-4 shadow-xl max-w-2xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder={`${t('hero.search.placeholder')} *`}
                className={`pl-10 h-12 border-0 bg-gray-50 focus:bg-white ${
                  searchError ? 'ring-2 ring-red-500' : ''
                }`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setSearchError(false);
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {searchError && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{t('validation.required_field')}</span>
                </div>
              )}
            </div>
            <Button 
              size="lg" 
              className={`h-12 px-8 bg-accent hover:bg-accent/90 text-white ${
                !searchQuery.trim() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
            >
              {isLoading ? t('search.searching') : t('hero.search.button')}
            </Button>
          </div>
          
          {/* Info text about automatic location filtering */}
          <div className="mt-3 text-sm text-gray-600 text-center">
            {isAuthenticated 
              ? `Recherche dans votre pays (${user?.country?.name || 'votre région'})`
              : t('hero.search.gulf_countries')
            }
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 mt-16 text-white">
          <div>
            <div className="text-3xl font-bold">5000+</div>
            <div className="text-white/80">{t('hero.available_tools')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">2000+</div>
            <div className="text-white/80">{t('hero.active_users')}</div>
          </div>
          <div>
            <div className="text-3xl font-bold">50+</div>
            <div className="text-white/80">{t('hero.cities_covered')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
