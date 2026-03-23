import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, RotateCcw, AlertCircle } from 'lucide-react'
import 'mapbox-gl/dist/mapbox-gl.css'
import { getCountryCoordinates } from '@/utils/countryCoordinates'
import { useLanguage } from '@/contexts/LanguageContext'

interface MapboxLocationPickerProps {
  coordinates?: { lat: number; lng: number }
  onCoordinatesChange: (coordinates: { lat: number; lng: number }) => void
  onAddressChange?: (address: string) => void
  className?: string
  height?: string
  userCountry?: string // Nouveau prop pour le pays de l'utilisateur
  language?: string
}

const MapboxLocationPicker: React.FC<MapboxLocationPickerProps> = ({
  coordinates,
  onCoordinatesChange,
  onAddressChange,
  className = '',
  height = '400px',
  userCountry,
  language = 'en'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const marker = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentCoordinates, setCurrentCoordinates] = useState(coordinates)
  const [mapboxLoaded, setMapboxLoaded] = useState(false)
  const { t } = useLanguage()

  // Fonction pour obtenir les coordonnées par défaut basées sur le pays de l'utilisateur
  const getDefaultCoordinates = () => {
    console.log('🌍 Getting default coordinates for user country:', userCountry)
    
    if (userCountry) {
      const countryCoords = getCountryCoordinates(userCountry)
      console.log('📍 Country coordinates found:', countryCoords)
      return countryCoords
    }
    
    // Fallback vers Bahreïn si pas de pays spécifié
    const fallbackCoords = { lat: 26.0667, lng: 50.5577, zoom: 11 }
    console.log('📍 Using fallback coordinates (Bahrain):', fallbackCoords)
    return fallbackCoords
  }

  // Fonction de géocodage inversé avec gestion d'erreur améliorée
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const token = import.meta.env.VITE_MAPBOX_API_KEY
      if (!token) {
        console.warn('⚠️ Mapbox token not found, skipping reverse geocoding')
        return 'Adresse non disponible'
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=${language}`
      )
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name
      }
      
      return 'Adresse non trouvée'
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error)
      return `Coordonnées: ${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
  }

  // Fonction pour charger Mapbox de manière sécurisée
  const loadMapbox = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = import.meta.env.VITE_MAPBOX_API_KEY
      if (!token) {
        throw new Error('Token Mapbox manquant dans les variables d\'environnement')
      }

      // Vérifier si Mapbox GL JS est déjà chargé
      if (typeof window !== 'undefined' && (window as any).mapboxgl) {
        console.log('✅ Mapbox GL JS already loaded')
        setMapboxLoaded(true)
        return (window as any).mapboxgl
      }

      // Charger Mapbox GL JS dynamiquement
      const mapboxgl = await import('mapbox-gl')
      console.log('✅ Mapbox GL JS loaded successfully')
      
      // Vérifier la connectivité à l'API Mapbox
      const testResponse = await fetch(`https://api.mapbox.com/styles/v1/mapbox/streets-v12?access_token=${token}`, {
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // Timeout de 5 secondes
      })
      
      if (!testResponse.ok) {
        throw new Error(`Impossible d'accéder à l'API Mapbox (${testResponse.status})`)
      }
      
      mapboxgl.default.accessToken = token
      setMapboxLoaded(true)
      return mapboxgl.default
    } catch (error) {
      console.error('❌ Error loading Mapbox:', error)
      setError(error instanceof Error ? error.message : 'Erreur de chargement de la carte')
      setMapboxLoaded(false)
      throw error
    }
  }

  // Initialiser la carte
  const initializeMap = async () => {
    if (!mapContainer.current) return

    try {
      const mapboxgl = await loadMapbox()
      const defaultCoords = getDefaultCoordinates()
      
      console.log('🗺️ Initializing map with coordinates:', defaultCoords)

      // Créer la carte
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [defaultCoords.lng, defaultCoords.lat],
        zoom: defaultCoords.zoom || 11,
        attributionControl: false
      })

      // Ajouter les contrôles
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right')

      // Créer le marqueur draggable
      marker.current = new mapboxgl.Marker({ 
        draggable: true,
        color: '#ef4444'
      })
        .setLngLat([defaultCoords.lng, defaultCoords.lat])
        .addTo(map.current)

      // Gérer les événements
      map.current.on('load', () => {
        console.log('✅ Map loaded successfully')
        setIsLoading(false)
        setError(null)
      })

      map.current.on('error', (e: any) => {
        console.error('❌ Map error:', e)
        setError('Erreur de chargement de la carte. Vérifiez votre connexion internet.')
        setIsLoading(false)
      })

      // Clic sur la carte
      map.current.on('click', async (e: any) => {
        const { lng, lat } = e.lngLat
        console.log('🖱️ Map clicked at:', { lat, lng })
        
        marker.current.setLngLat([lng, lat])
        setCurrentCoordinates({ lat, lng })
        onCoordinatesChange({ lat, lng })
        
        if (onAddressChange) {
          const address = await reverseGeocode(lat, lng)
          onAddressChange(address)
        }
      })

      // Drag du marqueur
      marker.current.on('dragend', async () => {
        const lngLat = marker.current.getLngLat()
        const { lng, lat } = lngLat
        console.log('🔄 Marker dragged to:', { lat, lng })
        
        setCurrentCoordinates({ lat, lng })
        onCoordinatesChange({ lat, lng })
        
        if (onAddressChange) {
          const address = await reverseGeocode(lat, lng)
          onAddressChange(address)
        }
      })

      // Définir les coordonnées initiales si fournies
      if (coordinates) {
        console.log('📍 Setting initial coordinates:', coordinates)
        marker.current.setLngLat([coordinates.lng, coordinates.lat])
        map.current.setCenter([coordinates.lng, coordinates.lat])
        setCurrentCoordinates(coordinates)
      }

    } catch (error) {
      console.error('❌ Failed to initialize map:', error)
      setIsLoading(false)
    }
  }

  // Effet pour initialiser la carte
  useEffect(() => {
    initializeMap()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [])

  // Effet pour mettre à jour les coordonnées
  useEffect(() => {
    if (map.current && marker.current && coordinates) {
      console.log('🔄 Updating coordinates:', coordinates)
      marker.current.setLngLat([coordinates.lng, coordinates.lat])
      map.current.setCenter([coordinates.lng, coordinates.lat])
      setCurrentCoordinates(coordinates)
    }
  }, [coordinates])

  // Fonction pour réinitialiser à la position par défaut
  const resetToDefaultLocation = () => {
    const defaultCoords = getDefaultCoordinates()
    console.log('🔄 Resetting to default location:', defaultCoords)
    
    if (map.current && marker.current) {
      marker.current.setLngLat([defaultCoords.lng, defaultCoords.lat])
      map.current.flyTo({
        center: [defaultCoords.lng, defaultCoords.lat],
        zoom: defaultCoords.zoom || 11,
        duration: 1000
      })
      setCurrentCoordinates({ lat: defaultCoords.lat, lng: defaultCoords.lng })
      onCoordinatesChange({ lat: defaultCoords.lat, lng: defaultCoords.lng })
    }
  }

  // Fonction pour réessayer le chargement
  const retryLoading = () => {
    console.log('🔄 Retrying map loading...')
    setError(null)
    setIsLoading(true)
    initializeMap()
  }

  // Rendu conditionnel en cas d'erreur
  if (error && !mapboxLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex flex-col items-center justify-center space-y-4" style={{ height }}>
            <AlertCircle className="h-12 w-12 text-red-500" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('map.map_unavailable')}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {error}
              </p>
              <div className="space-y-2">
                <Button onClick={retryLoading} variant="outline" size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  {t('map.retry')}
                </Button>
                <p className="text-xs text-gray-500">
                  {t('map.manual_coordinates')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              <span className="text-sm text-gray-600">{t('general.loading')}</span>
            </div>
          </div>
        )}
        
        <div
          ref={mapContainer}
          className="w-full rounded-lg"
          style={{ height }}
        />
        
        {/* Instructions overlay */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-start space-x-2">
            <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-gray-800 mb-1">
                {t('map.location_select')}
              </p>
              <p className="text-xs text-gray-600">
                {t('map.location_select_hint')}
              </p>
            </div>
          </div>
        </div>

        {/* Reset button */}
        <Button
          variant="outline"
          size="sm"
          className="absolute bottom-4 right-4 bg-white shadow-lg"
          onClick={resetToDefaultLocation}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t('map.your_position')}
        </Button>

        {/* Coordinates display */}
        {currentCoordinates && (
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg p-2 shadow-lg">
            <p className="text-xs text-gray-600">
              Lat: {typeof currentCoordinates.lat === 'number' ? currentCoordinates.lat.toFixed(6) : parseFloat(currentCoordinates.lat || 0).toFixed(6)}, 
              Lng: {typeof currentCoordinates.lng === 'number' ? currentCoordinates.lng.toFixed(6) : parseFloat(currentCoordinates.lng || 0).toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MapboxLocationPicker