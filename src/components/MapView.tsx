import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Star, Navigation, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toolsService } from '@/services/toolsService'
import { Tool } from '@/types/bridge/tool.types'

const MapView = ({ searchQuery }: { searchQuery: string }) => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const [userLocation, setUserLocation] = useState<{
    lat: number
    lng: number
  } | null>(null)
  const [selectedTool, setSelectedTool] = useState<any>(null)
  const [mapboxToken, setMapboxToken] = useState(
    'pk.eyJ1IjoiYnJhbmR3b29kIiwiYSI6ImNtZm56dWdrbzAwcDYybHNmcXF0Mnoya2oifQ.lFWmwCmjUa_GdkOVZjROSQ'
  )
  const [showTokenInput, setShowTokenInput] = useState(true)
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  // Add coordinates to tools (in real app, these would come from the database)
  const toolsWithCoords = tools.map((tool, index) => ({
    ...tool,
    coordinates: {
      lat: 48.8566 + (Math.random() - 0.5) * 0.1, // Paris area with random offset
      lng: 2.3522 + (Math.random() - 0.5) * 0.1,
    },
  }))

  const filteredTools = toolsWithCoords.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Load tools from API
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        const response = await toolsService.getTools()
        setTools(response.data || [])
      } catch (error) {
        console.error('Error fetching tools:', error)
        setTools([])
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [])

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('Error getting location:', error)
          // Fallback to Paris coordinates
          setUserLocation({ lat: 48.8566, lng: 2.3522 })
        }
      )
    } else {
      setUserLocation({ lat: 48.8566, lng: 2.3522 })
    }
  }, [])

  const initializeMap = async () => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl')

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
      filteredTools.forEach((tool) => {
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

      // Add navigation control
      map.addControl(new mapboxgl.default.NavigationControl())

      return () => map.remove()
    } catch (error) {
      console.error('Error loading map:', error)
    }
  }

  useEffect(() => {
    if (mapboxToken && !showTokenInput) {
      initializeMap()
    }
  }, [userLocation, mapboxToken, showTokenInput, filteredTools])

  if (showTokenInput) {
    return (
      <Card className='w-full max-w-md mx-auto mt-8'>
        <CardContent className='p-6'>
          <h3 className='text-lg font-semibold mb-4'>Configuration Mapbox</h3>
          <p className='text-sm text-gray-600 mb-4'>
            Pour afficher la carte, veuillez entrer votre token Mapbox public.
            Vous pouvez l'obtenir sur{' '}
            <a
              href='https://mapbox.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 underline'
            >
              mapbox.com
            </a>
          </p>
          <div className='space-y-4'>
            <Input
              type='text'
              placeholder='pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ...'
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <Button
              onClick={() => setShowTokenInput(false)}
              disabled={!mapboxToken}
              className='w-full'
            >
              Afficher la carte
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

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
        <Button
          variant='outline'
          size='sm'
          onClick={() => setShowTokenInput(true)}
        >
          <Navigation className='h-4 w-4 mr-2' />
          Reconfigurer
        </Button>
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
            {filteredTools.map((tool) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapView
