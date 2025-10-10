import React, { useState, useEffect, useRef } from 'react'
import { MapboxSearchBox, config } from '@mapbox/search-js-web'
import { getMapboxCountryCodes, getMapboxBbox, getMapboxProximity } from '@/utils/countryCoordinates'

// Déclaration des types pour l'élément HTML personnalisé
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'mapbox-search-box': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        placeholder?: string
        accessToken?: string
        options?: any
        value?: string
      }
    }
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onAddressSelected?: (address: any) => void
  onCoordinatesSelected?: (coordinates: { lat: number; lng: number }) => void
  placeholder?: string
  className?: string
  selectedCountry?: string
  userCountry?: string // Nouveau prop pour le pays de l'utilisateur
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelected,
  onCoordinatesSelected,
  placeholder = 'Entrez votre adresse...',
  className = '',
  selectedCountry = 'FR',
  userCountry
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null)
  const searchBoxRef = useRef<MapboxSearchBox>(null)

  // Codes ISO des pays du Golfe (format ISO 3166-1 alpha-2)
  const gulfCountries = ['KW', 'SA', 'BH', 'OM', 'QA', 'AE']

  // Mapping des codes de pays pour corriger les erreurs
  const countryCodeMapping: { [key: string]: string } = {
    SAR: 'SA', // Arabie Saoudite
    QAR: 'QA', // Qatar
    KWR: 'KW', // Koweït
    BHR: 'BH', // Bahreïn
    OMR: 'OM', // Oman
    ARE: 'AE', // Émirats Arabes Unis
  }

  // Configuration spécifique par pays
  const countryConfig = {
    KW: { bbox: [46.5, 28.5, 48.5, 30.1], proximity: [47.9, 29.3] }, // Koweït
    SA: { bbox: [34.5, 16.0, 55.7, 32.2], proximity: [46.7, 24.7] }, // Arabie Saoudite
    BH: { bbox: [50.3, 25.5, 50.8, 26.3], proximity: [50.6, 26.0] }, // Bahreïn
    OM: { bbox: [51.8, 16.6, 59.8, 26.4], proximity: [58.4, 23.6] }, // Oman
    QA: { bbox: [50.7, 24.4, 51.7, 26.2], proximity: [51.2, 25.3] }, // Qatar
    AE: { bbox: [51.0, 22.6, 56.4, 26.1], proximity: [54.4, 24.4] }, // Émirats Arabes Unis
  }

  // Liste des codes pays autorisés (zone de travail)
  const allowedCountries = ['KW', 'SA', 'BH', 'OM', 'QA', 'AE']

  // Bounding box globale restrictive qui englobe uniquement les 6 pays autorisés
  // Coordonnées calculées pour couvrir précisément la zone du Golfe Persique
  const restrictedGulfBoundingBox = [34.5, 16.0, 59.8, 32.2] // [ouest, sud, est, nord]
  const defaultProximity = [51.5, 25.3] // Centre approximatif de la région

  useEffect(() => {
    const initializeMapbox = async () => {
      const apiKey = import.meta.env.VITE_MAPBOX_API_KEY

      console.log('🔧 Initialisation AddressAutocomplete:', {
        apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : 'MANQUANTE',
        selectedCountry,
        userCountry,
        searchBoxRef: !!searchBoxRef.current,
      })

      if (!apiKey) {
        const errorMsg =
          'Clé API Mapbox manquante. Mode saisie manuelle activé.'
        console.error('❌', errorMsg)
        setUseFallback(true)
        setError(errorMsg)
        return
      }

      if (!searchBoxRef.current) {
        console.warn('⚠️ SearchBox ref non disponible, tentative ultérieure...')
        return
      }

      setIsLoading(true)
      setError(null)
      setUseFallback(false)

      try {
        // Test de validité de la clé API
        console.log('🔑 Test de la clé API Mapbox...')

        // Configurer l'access token globalement
        config.accessToken = apiKey

        // Utiliser le pays de l'utilisateur en priorité, puis le pays sélectionné
        const primaryCountry = userCountry || selectedCountry
        
        // Déterminer la configuration selon le pays
        const currentCountry =
          typeof primaryCountry === 'string' ? primaryCountry.trim() : ''

        // Corriger le code de pays si nécessaire
        const correctedCountry =
          currentCountry && countryCodeMapping[currentCountry]
            ? countryCodeMapping[currentCountry]
            : currentCountry

        console.log('🌍 Configuration pays:', {
          userCountry,
          selectedCountry,
          primaryCountry,
          correctedCountry
        })

        // Configuration des options de recherche basée sur le pays de l'utilisateur
        const searchOptions = {
          language: 'fr',
          limit: 8,
          country: getMapboxCountryCodes(correctedCountry),
          proximity: getMapboxProximity(correctedCountry),
          bbox: getMapboxBbox(correctedCountry),
          types: 'address,poi,place,locality,neighborhood,street',
        }

        console.log('🔍 Options de recherche Mapbox:', searchOptions)

        // Configurer les options du SearchBox
        const searchBox = searchBoxRef.current
        searchBox.accessToken = apiKey

        // Générer un session token unique pour le billing
        const sessionToken = `session_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`

        // Configuration optimisée selon la documentation Mapbox
        const mapboxSearchOptions: any = {
          language: 'en', // Utiliser l'anglais pour de meilleurs résultats
          limit: 8,
          types: [
            'address',
            'poi',
            'place',
            'locality',
            'neighborhood',
            'street',
          ], // Types étendus
          session_token: sessionToken, // Requis pour le billing
          // Utiliser les nouvelles fonctions utilitaires
          country: getMapboxCountryCodes(correctedCountry),
          proximity: getMapboxProximity(correctedCountry),
          bbox: getMapboxBbox(correctedCountry),
        }

        searchBox.options = mapboxSearchOptions

        console.log('⚙️ Configuration Mapbox SearchBox:', {
          userCountry,
          selectedCountry,
          primaryCountry,
          correctedCountry,
          options: mapboxSearchOptions,
        })

        // Test de la validité de la clé API avec l'API Search v1
        const testApiKey = async () => {
          try {
            // Utiliser l'API Search v1 comme le fait le SearchBox
            const testUrl = `https://api.mapbox.com/search/searchbox/v1/suggest?q=test&access_token=${apiKey}&session_token=${sessionToken}&limit=1`
            const testResponse = await fetch(testUrl)

            if (testResponse.ok) {
              const data = await testResponse.json()
              console.log('✅ Clé API Mapbox valide (Search v1):', {
                status: testResponse.status,
                suggestions_count: data.suggestions?.length || 0,
              })
              setApiKeyValid(true)
              return true
            } else {
              const errorText = await testResponse.text()
              console.error('❌ Clé API Mapbox invalide:', {
                status: testResponse.status,
                statusText: testResponse.statusText,
                error: errorText,
              })
              setApiKeyValid(false)
              return false
            }
          } catch (testErr: any) {
            console.error('❌ Erreur lors du test de la clé API:', testErr)
            setApiKeyValid(false)
            return false
          }
        }

        // Tester la clé API avant de configurer le SearchBox
        const isApiValid = await testApiKey()
        if (!isApiValid) {
          console.warn(
            '⚠️ Basculement vers le mode fallback (input texte simple)'
          )
          setUseFallback(true)
          setError('API Mapbox indisponible. Mode saisie manuelle activé.')
          setIsLoading(false)
          return
        }

        // Gérer les erreurs de l'API
        const handleError = (event: any) => {
          console.error('❌ Erreur Mapbox SearchBox:', {
            type: event.type,
            detail: event.detail,
            error: event.error,
            message: event.message,
          })

          // Basculer vers le fallback en cas d'erreur persistante
          console.warn(
            '⚠️ Basculement vers le mode fallback suite à une erreur API'
          )
          setUseFallback(true)
          setError(
            "Problème avec l'autocomplétion. Mode saisie manuelle activé."
          )
          setIsLoading(false)
        }

        // Gérer la sélection d'une suggestion
        const handleRetrieve = (event: any) => {
          console.log('✅ Adresse sélectionnée:', event.detail)
          const feature = event.detail.features?.[0]
          if (feature && feature.properties) {
            const address =
              feature.properties.full_address || feature.properties.name || ''
            onChange(address)
            
            // Extraire les coordonnées si disponibles
            if (feature.geometry && feature.geometry.coordinates) {
              const [lng, lat] = feature.geometry.coordinates
              const coordinates = { lat, lng }
              console.log('📍 Coordonnées extraites:', coordinates)
              
              if (onCoordinatesSelected) {
                onCoordinatesSelected(coordinates)
              }
            }
            
            // Notifier que l'adresse a été sélectionnée depuis les suggestions
            if (onAddressSelected) {
              onAddressSelected(true)
            }
          }
        }

        // Gérer les suggestions reçues avec filtrage par pays autorisés
        const handleSuggest = (event: any) => {
          const suggestions = event.detail?.suggestions || []
          const query = event.detail?.query || ''

          // FILTRAGE DE SÉCURITÉ : S'assurer que toutes les suggestions proviennent des pays autorisés
          const filteredSuggestions = suggestions.filter((suggestion: any) => {
            const countryCode =
              suggestion.context?.country?.country_code ||
              suggestion.context?.country?.iso_3166_1 ||
              suggestion.place_formatted?.split(', ').pop()

            // Vérifier si le pays est dans la liste autorisée
            const isAllowed = allowedCountries.some(
              (allowed) =>
                countryCode === allowed ||
                countryCode === allowed.toLowerCase() ||
                suggestion.place_formatted?.includes(allowed)
            )

            if (!isAllowed) {
              console.warn('🚫 Suggestion filtrée (pays non autorisé):', {
                suggestion: suggestion.name,
                country: countryCode,
                place_formatted: suggestion.place_formatted,
              })
            }

            return isAllowed
          })

          // Remplacer les suggestions par la version filtrée
          if (filteredSuggestions.length !== suggestions.length) {
            event.detail.suggestions = filteredSuggestions
            console.log('🔒 Filtrage appliqué:', {
              original: suggestions.length,
              filtered: filteredSuggestions.length,
              removed: suggestions.length - filteredSuggestions.length,
            })
          }

          console.log('💡 Suggestions reçues (après filtrage):', {
            count: filteredSuggestions.length,
            query: query,
            suggestions: filteredSuggestions.slice(0, 3).map((s) => ({
              name: s.name,
              place_formatted: s.place_formatted,
              feature_type: s.feature_type,
              country: s.context?.country?.country_code,
            })),
            allowedCountries: allowedCountries,
          })

          // Log détaillé si aucune suggestion après filtrage
          if (filteredSuggestions.length === 0 && query.length > 2) {
            console.warn('⚠️ Aucune suggestion autorisée pour la requête:', {
              query,
              country: correctedCountry,
              options: searchOptions,
              originalCount: suggestions.length,
            })
          }
        }

        // Ajouter les event listeners
        searchBox.addEventListener('retrieve', handleRetrieve)
        searchBox.addEventListener('error', handleError)
        searchBox.addEventListener('suggest', handleSuggest)

        setIsLoading(false)
        console.log('✅ AddressAutocomplete initialisé avec succès')

        // Nettoyage
        return () => {
          searchBox.removeEventListener('retrieve', handleRetrieve)
          searchBox.removeEventListener('error', handleError)
          searchBox.removeEventListener('suggest', handleSuggest)
        }
      } catch (err: any) {
        console.error(
          "❌ Erreur lors de l'initialisation de Mapbox SearchBox:",
          {
            error: err,
            message: err?.message,
            stack: err?.stack,
            name: err?.name,
          }
        )
        console.warn(
          "⚠️ Basculement vers le mode fallback suite à une erreur d'initialisation"
        )
        setUseFallback(true)
        setError("Erreur d'initialisation. Mode saisie manuelle activé.")
        setIsLoading(false)
      }
    }

    initializeMapbox()
  }, [onChange, selectedCountry])

  // Mettre à jour la valeur du SearchBox quand la prop value change
  useEffect(() => {
    if (searchBoxRef.current && value) {
      searchBoxRef.current.value = value
    }
  }, [value])

  // Fallback si l'API key n'est pas disponible
  if (!import.meta.env.VITE_MAPBOX_API_KEY) {
    return (
      <div className='relative'>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 border-0 bg-gray-50 focus:bg-white ${className}`}
        />
        <div className='mt-1 text-sm text-amber-600'>
          ⚠️ Configuration Mapbox requise pour l'autocomplétion
        </div>
      </div>
    )
  }

  // Rendu du fallback (input texte simple)
  if (useFallback) {
    return (
      <div className={`relative ${className}`}>
        <input
          type='text'
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm pl-10 h-12 border-0 bg-gray-50 focus:bg-white'
        />

        {error && (
          <div className='mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded flex items-center'>
            <span className='mr-2'>⚠️</span>
            {error}
          </div>
        )}

        <div className='mt-1 text-xs text-gray-500'>
          💡 Saisissez votre adresse manuellement
        </div>
      </div>
    )
  }

  // Rendu normal avec Mapbox SearchBox
  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className='absolute right-3 top-1/2 transform -translate-y-1/2 z-10'>
          <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
        </div>
      )}

      <mapbox-search-box
        ref={searchBoxRef}
        access-token={import.meta.env.VITE_MAPBOX_API_KEY}
        placeholder={placeholder}
        className={`pl-10 h-12 border-0 bg-gray-50 focus:bg-white ${
          isLoading ? 'pr-10' : ''
        }`}
      />

      {error && (
        <div className='mt-2 text-sm text-red-600 bg-red-50 p-2 rounded'>
          {error}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          .mapbox-search-box {
            width: 100% !important;
          }
          
          .mapbox-search-box input,
          .mapbox-search-box input[type="text"],
          .mapbox-search-box input[type="search"] {
            display: flex !important;
            height: 48px !important;
            width: 100% !important;
            border-radius: 6px !important;
            border: 0 !important;
            background-color: #f9fafb !important;
            padding: 8px 12px 8px 40px !important;
            padding-left: 40px !important;
            padding-right: 12px !important;
            padding-top: 8px !important;
            padding-bottom: 8px !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            color: hsl(var(--foreground)) !important;
            transition: all 0.2s ease-in-out !important;
            box-shadow: none !important;
            outline: none !important;
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
          }
          
          .mapbox-search-box input::placeholder,
          .mapbox-search-box input[type="text"]::placeholder,
          .mapbox-search-box input[type="search"]::placeholder {
            color: hsl(var(--muted-foreground)) !important;
            opacity: 1 !important;
          }
          
          .mapbox-search-box input:focus,
          .mapbox-search-box input[type="text"]:focus,
          .mapbox-search-box input[type="search"]:focus {
            outline: none !important;
            background-color: white !important;
            box-shadow: 0 0 0 2px hsl(var(--ring)) !important;
            border: 0 !important;
            border-color: transparent !important;
          }
          
          .mapbox-search-box input:hover,
          .mapbox-search-box input[type="text"]:hover,
          .mapbox-search-box input[type="search"]:hover {
            background-color: white !important;
          }
          
          .mapbox-search-box input:disabled,
          .mapbox-search-box input[type="text"]:disabled,
          .mapbox-search-box input[type="search"]:disabled {
            cursor: not-allowed !important;
            opacity: 0.5 !important;
          }
          
          @media (min-width: 768px) {
            .mapbox-search-box input,
            .mapbox-search-box input[type="text"],
            .mapbox-search-box input[type="search"] {
              font-size: 14px !important;
            }
          }
        `,
        }}
      />
    </div>
  )
}

export default AddressAutocomplete