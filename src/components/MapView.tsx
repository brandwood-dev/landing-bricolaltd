import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Star, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toolsService } from '@/services/toolsService'
import { Tool } from '@/types/bridge/tool.types'
import 'mapbox-gl/dist/mapbox-gl.css'

const MapView = ({ 
  searchQuery, 
  selectedAddress, 
  locationQuery 
}: { 
  searchQuery: string;
  selectedAddress?: any;
  locationQuery?: string;
}) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const mapboxToken = import.meta.env.VITE_MAPBOX_API_KEY || 
    'pk.eyJ1IjoiYnJhbmR3b29kIiwiYSI6ImNtZm56dWdrbzAwcDYybHNmcXF0Mnoya2oifQ.lFWmwCmjUa_GdkOVZjROSQ'
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  // Add coordinates to tools (in real app, these would come from the database)
  const toolsWithCoords = tools.map((tool, index) => {
    // Use selected address area if available, otherwise use Gulf region coordinates
    const baseCoords = selectedAddress && selectedAddress.geometry && selectedAddress.geometry.coordinates
      ? { lat: selectedAddress.geometry.coordinates[1], lng: selectedAddress.geometry.coordinates[0] }
      : { lat: 29.3759, lng: 47.9774 }; // Kuwait coordinates as fallback
    
    // Generate coordinates around the base location with better distribution
    const angle = (index * 137.5) % 360; // Golden angle for better distribution
    const distance = 0.01 + (Math.random() * 0.04); // 1-5km radius
    const lat = baseCoords.lat + distance * Math.cos(angle * Math.PI / 180);
    const lng = baseCoords.lng + distance * Math.sin(angle * Math.PI / 180);
    
    const toolWithCoords = {
      ...tool,
      coordinates: { lat, lng },
    };
    
    console.log(`📍 Outil "${tool.title}" - Coordonnées générées:`, toolWithCoords.coordinates);
    return toolWithCoords;
  })
  
  console.log('🗺️ Total outils avec coordonnées:', toolsWithCoords.length);

  // Supprimer le double filtrage côté client car l'API filtre déjà
  const filteredTools = toolsWithCoords

  // Load tools from API with location filter
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        
        // Prepare filters with location if available
        const filters: any = {};
        
        // Use selectedAddress place_name or locationQuery for location filtering
        if (selectedAddress && selectedAddress.place_name) {
          filters.location = selectedAddress.place_name;
          console.log('🔍 Recherche avec adresse sélectionnée:', selectedAddress.place_name);
        } else if (locationQuery && locationQuery.trim()) {
          filters.location = locationQuery;
          console.log('🔍 Recherche avec query location:', locationQuery);
        }
        
        // Add search query filter
        if (searchQuery && searchQuery.trim()) {
          filters.search = searchQuery;
          console.log('🔍 Recherche avec titre:', searchQuery);
        }
        
        console.log('📡 Appel API avec filtres:', filters);
        const response = await toolsService.getTools(filters)
        console.log('📦 Outils récupérés de l\'API:', response.data?.length || 0, response.data);
        setTools(response.data || [])
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des outils:', error)
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [selectedAddress, locationQuery, searchQuery])

  useEffect(() => {
    // Use selected address coordinates if available, otherwise get user's location
    if (selectedAddress && selectedAddress.geometry && selectedAddress.geometry.coordinates) {
      const [lng, lat] = selectedAddress.geometry.coordinates;
      setUserLocation({ lat, lng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          // Fallback to Kuwait coordinates (center of Gulf region)
          setUserLocation({ lat: 29.3759, lng: 47.9774 })
        }
      )
    } else {
      // Fallback to Kuwait coordinates
      setUserLocation({ lat: 29.3759, lng: 47.9774 })
    }
  }, [selectedAddress])

  const initializeMap = async () => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl')

      // Disable telemetry to avoid AdBlocker errors
      mapboxgl.default.prewarm()
      mapboxgl.default.clearPrewarmedResources()

      mapboxgl.default.accessToken = mapboxToken

      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLocation.lng, userLocation.lat],
        zoom: 12,
      })

      // Add user location marker
      const userMarker = new mapboxgl.default.Marker({ color: 'blue' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(
          new mapboxgl.default.Popup().setHTML('<div>Votre position</div>')
        )
        .addTo(map)

      // Add tool markers
      console.log('🎯 Ajout des marqueurs pour', filteredTools.length, 'outils');
      filteredTools.forEach((tool, index) => {
        console.log(`📌 Ajout marqueur ${index + 1}:`, tool.title, 'à', tool.coordinates);
        const marker = new mapboxgl.default.Marker({ color: 'red' })
          .setLngLat([tool.coordinates.lng, tool.coordinates.lat])
          .setPopup(
            new mapboxgl.default.Popup().setHTML(`
              <div class="p-2">
                <h3 class="font-semibold">${tool.title}</h3>
                <p class="text-sm text-gray-600">${
                  tool.basePrice || tool.price
                }€/jour</p>
                <p class="text-sm">${tool.pickupAddress}</p>
              </div>
            `)
          )
          .addTo(map)

        marker.getElement().addEventListener('click', () => {
          setSelectedTool(tool)
        })
      })
      
      if (filteredTools.length === 0) {
        console.log('⚠️ Aucun outil à afficher sur la carte');
      }

      // Add navigation control
      map.addControl(new mapboxgl.default.NavigationControl())

      return () => map.remove()
    } catch (error) {
      console.error('Error loading map:', error)
    }
  }

  useEffect(() => {
    if (mapboxToken) {
      initializeMap()
    }
  }, [userLocation, mapboxToken, filteredTools])



  if (loading) {
    return (
      <div className='flex items-center justify-center h-96'>
        <Loader2 className='h-8 w-8 animate-spin' />
        <span className='ml-2'>Chargement des outils...</span>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h2 className='text-xl font-semibold'>
          Carte des outils ({filteredTools.length} résultats)
        </h2>

      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <div className='lg:col-span-2'>
          <div
            ref={mapContainer}
            className='w-full h-96 rounded-lg border'
            style={{ minHeight: '400px' }}
          />
        </div>

        <div className='space-y-4'>
          <h3 className='font-semibold'>Outils trouvés</h3>
          <div className='space-y-2 max-h-96 overflow-y-auto'>
            {filteredTools.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>
                <MapPin className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                <p className='text-sm'>Aucun outil trouvé</p>
                <p className='text-xs'>Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              filteredTools.map((tool) => (
                <Card
                  key={tool.id}
                  className={`cursor-pointer transition-colors ${
                    selectedTool?.id === tool.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedTool(tool)}
                >
                  <CardContent className='p-3'>
                    <div className='flex gap-3'>
                      <img
                        src={tool.photos?.[0]?.url || '/placeholder.svg'}
                        alt={tool.title}
                        className='w-16 h-16 object-cover rounded'
                      />
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-medium text-sm truncate'>
                          {tool.title}
                        </h4>
                        <div className='flex items-center gap-1 text-xs text-gray-500'>
                          <Star className='h-3 w-3 fill-yellow-400 text-yellow-400' />
                          {tool.rating || 0} ({tool.reviewCount || 0})
                        </div>
                        <div className='flex items-center gap-1 text-xs text-gray-500'>
                          <MapPin className='h-3 w-3' />
                          {tool.pickupAddress}
                        </div>
                        <div className='flex items-center justify-between mt-1'>
                          <span className='font-semibold text-sm'>
                            {tool.basePrice}€/jour
                          </span>
                          <Link to={`/tool/${tool.id}`}>
                            <Button
                              size='sm'
                              variant='outline'
                              className='text-xs h-6'
                            >
                              Voir
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView
