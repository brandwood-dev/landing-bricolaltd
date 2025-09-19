import React, { useState, useEffect, useRef } from 'react';
import { MapboxSearchBox, config } from '@mapbox/search-js-web';

// Déclaration des types pour l'élément HTML personnalisé
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mapbox-search-box': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        placeholder?: string;
        accessToken?: string;
        options?: any;
        value?: string;
      };
    }
  }
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelected?: (isSelected: boolean) => void;
  placeholder?: string;
  className?: string;
  selectedCountry?: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
  placeholder = "Entrez votre adresse...",
  className = "",
  selectedCountry = "FR"
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const searchBoxRef = useRef<MapboxSearchBox>(null);

  // Codes ISO des pays du Golfe (format ISO 3166-1 alpha-2)
  const gulfCountries = ['KW', 'SA', 'BH', 'OM', 'QA', 'AE'];
  
  // Mapping des codes de pays pour corriger les erreurs
  const countryCodeMapping: { [key: string]: string } = {
    'SAR': 'SA', // Arabie Saoudite
    'QAR': 'QA', // Qatar
    'KWR': 'KW', // Koweït
    'BHR': 'BH', // Bahreïn
    'OMR': 'OM', // Oman
    'ARE': 'AE'  // Émirats Arabes Unis
  };
  
  // Configuration spécifique par pays
  const countryConfig = {
    'KW': { bbox: [46.5, 28.5, 48.5, 30.1], proximity: [47.9, 29.3] }, // Koweït
    'SA': { bbox: [34.5, 16.0, 55.7, 32.2], proximity: [46.7, 24.7] }, // Arabie Saoudite
    'BH': { bbox: [50.3, 25.5, 50.8, 26.3], proximity: [50.6, 26.0] }, // Bahreïn
    'OM': { bbox: [51.8, 16.6, 59.8, 26.4], proximity: [58.4, 23.6] }, // Oman
    'QA': { bbox: [50.7, 24.4, 51.7, 26.2], proximity: [51.2, 25.3] }, // Qatar
    'AE': { bbox: [51.0, 22.6, 56.4, 26.1], proximity: [54.4, 24.4] }  // Émirats Arabes Unis
  };
  
  // Bounding box par défaut pour la région du Golfe
  const defaultGulfBoundingBox = [46.5, 22.0, 59.8, 30.1];
  const defaultProximity = [51.5, 25.3];

  useEffect(() => {
    const initializeMapbox = async () => {
      const apiKey = import.meta.env.VITE_MAPBOX_API_KEY;
      
      console.log('🔧 Initialisation AddressAutocomplete:', {
        apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : 'MANQUANTE',
        selectedCountry,
        searchBoxRef: !!searchBoxRef.current
      });
      
      if (!apiKey) {
        const errorMsg = 'Clé API Mapbox manquante. Mode saisie manuelle activé.';
        console.error('❌', errorMsg);
        setUseFallback(true);
        setError(errorMsg);
        return;
      }

      if (!searchBoxRef.current) {
        console.warn('⚠️ SearchBox ref non disponible, tentative ultérieure...');
        return;
      }

      setIsLoading(true);
      setError(null);
      setUseFallback(false);

      try {
      // Test de validité de la clé API
      console.log('🔑 Test de la clé API Mapbox...');
      
      // Configurer l'access token globalement
      config.accessToken = apiKey;

      // Déterminer la configuration selon le pays sélectionné
      const currentCountry = selectedCountry || '';
      // Corriger le code de pays si nécessaire
      const correctedCountry = countryCodeMapping[currentCountry] || currentCountry;
      const countrySettings = countryConfig[correctedCountry as keyof typeof countryConfig];
      const searchCountry = correctedCountry || gulfCountries.join(',');
      const searchBbox = countrySettings?.bbox || defaultGulfBoundingBox;
      const searchProximity = countrySettings?.proximity || defaultProximity;

      // Configurer les options du SearchBox
      const searchBox = searchBoxRef.current;
      searchBox.accessToken = apiKey;
      
      // Générer un session token unique pour le billing
      const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Configuration optimisée selon la documentation Mapbox
      const searchOptions = {
        language: 'en', // Utiliser l'anglais pour de meilleurs résultats
        limit: 8,
        types: ['address', 'poi', 'place', 'locality', 'neighborhood', 'street'], // Types étendus
        session_token: sessionToken // Requis pour le billing
      };
      
      // Ajouter les filtres géographiques seulement si un pays est sélectionné
      if (selectedCountry) {
        searchOptions.country = correctedCountry;
        if (countrySettings) {
          // Configurer bbox comme array de coordonnées
          if (Array.isArray(searchBbox) && searchBbox.length === 4) {
            searchOptions.bbox = searchBbox;
          }
          // Configurer proximity comme array [longitude, latitude]
          if (Array.isArray(searchProximity) && searchProximity.length === 2) {
            searchOptions.proximity = searchProximity;
          }
        }
      }
      
      searchBox.options = searchOptions;
      
      console.log('⚙️ Configuration Mapbox SearchBox:', {
        selectedCountry: currentCountry,
        correctedCountry: correctedCountry,
        options: searchOptions,
        countrySettings: countrySettings
      });

      // Test de la validité de la clé API avec l'API Search v1
      const testApiKey = async () => {
        try {
          // Utiliser l'API Search v1 comme le fait le SearchBox
          const testUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=test&access_token=${apiKey}&session_token=${sessionToken}&limit=1`;
          const testResponse = await fetch(testUrl);
          
          if (testResponse.ok) {
            const data = await testResponse.json();
            console.log('✅ Clé API Mapbox valide (Search v1):', {
              status: testResponse.status,
              suggestions_count: data.suggestions?.length || 0
            });
            setApiKeyValid(true);
            return true;
          } else {
            const errorText = await testResponse.text();
            console.error('❌ Clé API Mapbox invalide:', {
              status: testResponse.status,
              statusText: testResponse.statusText,
              error: errorText
            });
            setApiKeyValid(false);
            return false;
          }
        } catch (testErr: any) {
          console.error('❌ Erreur lors du test de la clé API:', testErr);
          setApiKeyValid(false);
          return false;
        }
      };

      // Tester la clé API avant de configurer le SearchBox
      const isApiValid = await testApiKey();
      if (!isApiValid) {
        console.warn('⚠️ Basculement vers le mode fallback (input texte simple)');
        setUseFallback(true);
        setError('API Mapbox indisponible. Mode saisie manuelle activé.');
        setIsLoading(false);
        return;
      }

      // Gérer les erreurs de l'API
      const handleError = (event: any) => {
        console.error('❌ Erreur Mapbox SearchBox:', {
          type: event.type,
          detail: event.detail,
          error: event.error,
          message: event.message
        });
        
        // Basculer vers le fallback en cas d'erreur persistante
        console.warn('⚠️ Basculement vers le mode fallback suite à une erreur API');
        setUseFallback(true);
        setError('Problème avec l\'autocomplétion. Mode saisie manuelle activé.');
        setIsLoading(false);
      };

      // Gérer la sélection d'une suggestion
      const handleRetrieve = (event: any) => {
        console.log('✅ Adresse sélectionnée:', event.detail);
        const feature = event.detail.features?.[0];
        if (feature && feature.properties) {
          const address = feature.properties.full_address || feature.properties.name || '';
          onChange(address);
          // Notifier que l'adresse a été sélectionnée depuis les suggestions
          if (onAddressSelected) {
            onAddressSelected(true);
          }
        }
      };



      // Gérer les suggestions reçues
      const handleSuggest = (event: any) => {
        const suggestions = event.detail?.suggestions || [];
        const query = event.detail?.query || '';
        
        console.log('💡 Suggestions reçues:', {
          count: suggestions.length,
          query: query,
          suggestions: suggestions.slice(0, 3).map(s => ({
            name: s.name,
            place_formatted: s.place_formatted,
            feature_type: s.feature_type
          })),
          raw_event: event.detail
        });
        
        // Log détaillé si aucune suggestion
        if (suggestions.length === 0 && query.length > 2) {
          console.warn('⚠️ Aucune suggestion pour la requête:', {
            query,
            country: correctedCountry,
            options: searchOptions
          });
        }
      };

      // Ajouter les event listeners
      searchBox.addEventListener('retrieve', handleRetrieve);
      searchBox.addEventListener('error', handleError);
      searchBox.addEventListener('suggest', handleSuggest);

      setIsLoading(false);
      console.log('✅ AddressAutocomplete initialisé avec succès');

      // Nettoyage
      return () => {
        searchBox.removeEventListener('retrieve', handleRetrieve);
        searchBox.removeEventListener('error', handleError);
        searchBox.removeEventListener('suggest', handleSuggest);
      };
      } catch (err: any) {
        console.error('❌ Erreur lors de l\'initialisation de Mapbox SearchBox:', {
          error: err,
          message: err?.message,
          stack: err?.stack,
          name: err?.name
        });
        console.warn('⚠️ Basculement vers le mode fallback suite à une erreur d\'initialisation');
        setUseFallback(true);
        setError('Erreur d\'initialisation. Mode saisie manuelle activé.');
        setIsLoading(false);
      }
    };

    initializeMapbox();
  }, [onChange, selectedCountry]);

  // Mettre à jour la valeur du SearchBox quand la prop value change
  useEffect(() => {
    if (searchBoxRef.current && value) {
      searchBoxRef.current.value = value;
    }
  }, [value]);

  // Fallback si l'API key n'est pas disponible
  if (!import.meta.env.VITE_MAPBOX_API_KEY) {
    return (
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        />
        <div className="mt-1 text-sm text-amber-600">
          ⚠️ Configuration Mapbox requise pour l'autocomplétion
        </div>
      </div>
    );
  }

  // Rendu du fallback (input texte simple)
  if (useFallback) {
    return (
      <div className={`relative ${className}`}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        {error && (
          <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </div>
        )}
        
        <div className="mt-1 text-xs text-gray-500">
          💡 Saisissez votre adresse manuellement
        </div>
      </div>
    );
  }

  // Rendu normal avec Mapbox SearchBox
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      <mapbox-search-box
        ref={searchBoxRef}
        access-token={import.meta.env.VITE_MAPBOX_API_KEY}
        placeholder={placeholder}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isLoading ? 'pr-10' : ''}`}
      />
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .mapbox-search-box {
            width: 100%;
          }
          
          .mapbox-search-box input {
            width: 100% !important;
            padding: 12px 16px !important;
            border: 1px solid #d1d5db !important;
            border-radius: 8px !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            transition: all 0.2s ease-in-out !important;
          }
          
          .mapbox-search-box input:focus {
            outline: none !important;
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
          }
        `
      }} />
    </div>
  );
};

export default AddressAutocomplete;