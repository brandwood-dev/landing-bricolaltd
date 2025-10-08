
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, MapPin, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import MapView from './MapView';
import AddressAutocomplete from './AddressAutocomplete';

const HeroSection = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [errors, setErrors] = useState({ search: false, location: false });
  const [isLoading, setIsLoading] = useState(false);

  const validateFields = () => {
    const newErrors = {
      search: !searchQuery.trim(),
      location: !locationQuery.trim() && !selectedAddress
    };
    setErrors(newErrors);
    return !newErrors.search && !newErrors.location;
  };

  // Helper function to check if both fields are valid
  const isFormValid = () => {
    return searchQuery.trim() && (locationQuery.trim() || selectedAddress);
  };

  const handleSearch = async () => {
    if (!validateFields()) {
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

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setLocationQuery(address?.place_name || '');
    setErrors(prev => ({ ...prev, location: false }));
  };

  if (showMap) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Résultats de recherche pour "{searchQuery}"</h2>
            {selectedAddress && (
              <p className="text-gray-600 mb-2">Localisation: {selectedAddress.place_name}</p>
            )}
            <Button 
              variant="outline" 
              onClick={() => setShowMap(false)}
              className="mb-4"
            >
              ← Retour à la recherche
            </Button>
          </div>
          <MapView 
            searchQuery={searchQuery} 
            selectedAddress={selectedAddress}
            locationQuery={locationQuery}
          />
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

        {/* Search bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xl max-w-3xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder={`${t('hero.search.placeholder')} *`}
                className={`pl-10 h-12 border-0 bg-gray-50 focus:bg-white ${
                  errors.search ? 'ring-2 ring-red-500' : ''
                }`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.trim()) {
                    setErrors(prev => ({ ...prev, search: false }));
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              {errors.search && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Ce champ est obligatoire</span>
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 z-10" />
              <AddressAutocomplete
                value={locationQuery}
                onChange={(value) => {
                  setLocationQuery(value);
                  if (value.trim()) {
                    setErrors(prev => ({ ...prev, location: false }));
                  }
                }}
                onAddressSelected={(isSelected) => {
                  if (isSelected) {
                    setErrors(prev => ({ ...prev, location: false }));
                  }
                }}
                selectedCountry="KW"
                placeholder={`${t('hero.search.location')} *`}
                className={`pl-10 h-12 border-0 bg-gray-50 focus:bg-white ${
                  errors.location ? 'ring-2 ring-red-500' : ''
                }`}
              />
              {errors.location && (
                <div className="flex items-center gap-1 text-red-500 text-sm mt-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Veuillez sélectionner une adresse</span>
                </div>
              )}
            </div>
            <Button 
              size="lg" 
              className={`h-12 px-8 bg-accent hover:bg-accent/90 text-white ${
                !isFormValid() 
                  ? 'opacity-50 cursor-not-allowed' 
                  : ''
              }`}
              onClick={handleSearch}
              disabled={isLoading || !isFormValid()}
            >
              {isLoading ? 'Recherche...' : t('hero.search.button')}
            </Button>
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
