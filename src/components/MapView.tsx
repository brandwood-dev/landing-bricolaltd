import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MapPin, Star, Loader2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toolsService } from '@/services/toolsService'
import { Tool } from '@/types/bridge/tool.types'
import { User } from '@/types/bridge/user.types'
import { getCountryCoordinates } from '@/utils/countryCoordinates'
import 'mapbox-gl/dist/mapbox-gl.css'

const MapView = ({ 
  searchQuery, 
  selectedAddress, 
  locationQuery,
  user,
  isAuthenticated,
  setSearchQuery
}: { 
  searchQuery: string;
  selectedAddress?: any;
  locationQuery?: string;
  user?: User | null;
  isAuthenticated?: boolean;
  setSearchQuery?: (query: string) => void;
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
  // Local search query for input (doesn't trigger API calls)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '')
  // Remove localSearchQuery as we now use server-side filtering

  // Handle search submission
  const handleSearch = () => {
    if (setSearchQuery && localSearchQuery.trim()) {
      setSearchQuery(localSearchQuery.trim());
    }
  };

  // Sync localSearchQuery with searchQuery when searchQuery changes externally
  useEffect(() => {
    setLocalSearchQuery(searchQuery || '');
  }, [searchQuery]);

  // Default countries for non-authenticated users (Gulf countries)
  const defaultCountries = ['KW', 'BH', 'SA', 'AE', 'QA', 'OM'];

  // Add coordinates to tools (in real app, these would come from the database)
  // Process tools to use real coordinates from database
  const toolsWithCoords = tools
    .filter(tool => {
      // Only include tools that have valid coordinates from database
      // Note: coordinates come as strings from API, so we need to check if they can be converted to numbers
      const lat = parseFloat(tool.latitude as string);
      const lng = parseFloat(tool.longitude as string);
      return tool.latitude && tool.longitude && 
             !isNaN(lat) && !isNaN(lng);
    })
    .map((tool, index) => {
      const toolWithCoords = {
        ...tool,
        coordinates: { 
          lat: Number(tool.latitude), 
          lng: Number(tool.longitude) 
        },
      };
      
      console.log(`📍 Outil "${tool.title}" - Coordonnées DB:`, {
        lat: tool.latitude, 
        lng: tool.longitude,
        owner: tool.owner?.firstName,
        ownerCountry: tool.owner?.country || tool.owner?.countryId
      });
      return toolWithCoords;
    });
  
  console.log('🗺️ Total outils avec coordonnées valides:', toolsWithCoords.length);
  console.log('🔐 État d\'authentification:', { isAuthenticated, userCountryId: user?.countryId });

  // Apply country filtering based on user authentication
  const countryFilteredTools = toolsWithCoords.filter(tool => {
    const toolCountry = tool.owner?.countryId;
    
    // Debug: Log tool details
    console.log(`🔍 Filtrage outil "${tool.title}" - Pays: ${toolCountry}, Owner: ${tool.owner?.email}`);
    
    // If user is authenticated, show ONLY tools from user's specific country
    if (isAuthenticated && user?.countryId) {
      const isFromUserCountry = toolCountry === user.countryId;
      console.log(`👤 Utilisateur connecté - User country: ${user.countryId}, Tool country: ${toolCountry}, Match: ${isFromUserCountry}`);
      return isFromUserCountry;
    }
    
    // If user is not authenticated, show tools from all Gulf countries
    if (!isAuthenticated) {
      const isFromGulfCountry = defaultCountries.includes(toolCountry || '');
      console.log(`🏖️ Utilisateur non connecté - Tool country: ${toolCountry}, Is Gulf: ${isFromGulfCountry}, DefaultCountries: [${defaultCountries.join(', ')}]`);
      return isFromGulfCountry;
    }
    
    // Fallback: show no tools
    return false;
  });

  console.log(`🌍 Filtrage par pays - Utilisateur connecté: ${isAuthenticated}, Pays: ${user?.countryId}`);
  console.log(`📊 Outils après filtrage par pays: ${countryFilteredTools.length} (était ${toolsWithCoords.length})`);

  // No client-side search filtering - handled by server
  const filteredTools = countryFilteredTools;

  // Load tools from API with filters
  useEffect(() => {
    const fetchTools = async () => {
      try {
        setLoading(true)
        
        // Prepare filters
        const filters: any = {};
        
        // Use server-side search filtering for better performance
        if (searchQuery && searchQuery.trim()) {
          filters.search = searchQuery.trim();
        }
        
        // Location filtering is handled client-side after fetching
        
        console.log('🔍 Fetching tools with filters:', filters);
        const response = await toolsService.getTools(filters);
        console.log('📦 Raw API response:', response);
        console.log('📊 Tools received from API:', response.data?.length || 0);
        
        // Log first few tools to understand structure
        if (response.data && response.data.length > 0) {
          console.log('🔍 First tool structure:', JSON.stringify(response.data[0], null, 2));
          console.log('🔍 Owner structure of first tool:', response.data[0].owner);
          console.log('🔍 Country info in first tool:', {
            'owner.country': response.data[0].owner?.country,
            'owner.countryId': response.data[0].owner?.countryId,
            'owner.country.code': response.data[0].owner?.country?.code,
            'owner.country.id': response.data[0].owner?.country?.id,
            'owner.country.name': response.data[0].owner?.country?.name
          });
          
          // Log a few more tools to see the pattern
          console.log('🔍 Sample of tools with country info:');
          response.data.slice(0, 5).forEach((tool, index) => {
            console.log(`Tool ${index + 1}: ${tool.title}`, {
              'owner.country': tool.owner?.country,
              'owner.countryId': tool.owner?.countryId,
              'owner.country.code': tool.owner?.country?.code,
              'owner.country.id': tool.owner?.country?.id,
              'owner.country.name': tool.owner?.country?.name
            });
          });
        }
        
        setTools(response.data || []);
      } catch (error) {
        console.error('❌ Error fetching tools:', error);
        setTools([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTools()
  }, [selectedAddress, locationQuery, searchQuery, user?.countryId, isAuthenticated])

  useEffect(() => {
    // Use selected address coordinates if available, otherwise get user's location
    if (selectedAddress && selectedAddress.geometry && selectedAddress.geometry.coordinates) {
      const [lng, lat] = selectedAddress.geometry.coordinates;
      console.log('📍 Using selected address coordinates:', { lat, lng });
      setUserLocation({ lat, lng });
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('📍 Using geolocation coordinates:', { 
            lat: position.coords.latitude, 
            lng: position.coords.longitude 
          });
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.log('❌ Geolocation failed, using user country fallback');
          // Use user's country coordinates if authenticated, otherwise Kuwait
          const userCountryCode = isAuthenticated && user?.countryId ? user.countryId : 'KW';
          const countryCoords = getCountryCoordinates(userCountryCode);
          console.log('🌍 Using country coordinates for geolocation fallback:', { 
            country: userCountryCode, 
            coords: countryCoords 
          });
          setUserLocation({ lat: countryCoords.lat, lng: countryCoords.lng });
        }
      )
    } else {
      console.log('❌ Geolocation not available, using user country fallback');
      // Use user's country coordinates if authenticated, otherwise Kuwait
      const userCountryCode = isAuthenticated && user?.countryId ? user.countryId : 'KW';
      const countryCoords = getCountryCoordinates(userCountryCode);
      console.log('🌍 Using country coordinates for no geolocation:', { 
        country: userCountryCode, 
        coords: countryCoords 
      });
      setUserLocation({ lat: countryCoords.lat, lng: countryCoords.lng });
    }
  }, [selectedAddress, isAuthenticated, user?.countryId])

  const initializeMap = async () => {
    if (!mapContainer.current || !userLocation || !mapboxToken) return

    try {
      // Dynamic import of mapbox-gl
      const mapboxgl = await import('mapbox-gl')

      // Disable telemetry to avoid AdBlocker errors
      mapboxgl.default.prewarm()
      mapboxgl.default.clearPrewarmedResources()

      mapboxgl.default.accessToken = mapboxToken

      // Determine zoom level and center based on authentication status
      let mapCenter = [userLocation.lng, userLocation.lat];
      let zoomLevel = 12; // Default for authenticated users

      if (!isAuthenticated) {
        // For non-authenticated users, use a central point in the Gulf region
        // Center around Saudi Arabia to show all Gulf countries
        mapCenter = [45.0792, 23.8859]; // Central Saudi Arabia coordinates
        zoomLevel = 3; // Wide zoom to show all Gulf countries
        console.log('🌍 Utilisateur non connecté - Vue élargie des pays du Golfe, zoom:', zoomLevel);
      } else {
        // For authenticated users, center on their specific country with closer zoom
        if (user?.countryId) {
          const userCountryCoords = getCountryCoordinates(user.countryId);
          if (userCountryCoords) {
            mapCenter = [userCountryCoords.lng, userCountryCoords.lat];
            zoomLevel = 10; // Closer zoom for user's specific country
          }
        }
        console.log('👤 Utilisateur connecté - Vue centrée sur le pays de l\'utilisateur:', user?.countryId, 'zoom:', zoomLevel);
      }

      const map = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapCenter,
        zoom: zoomLevel,
      })

      // Add user location marker only for authenticated users or when geolocation is available
      if (isAuthenticated || (userLocation.lat !== 45.0792 && userLocation.lng !== 23.8859)) {
        const userMarker = new mapboxgl.default.Marker({ color: 'blue' })
          .setLngLat([userLocation.lng, userLocation.lat])
          .setPopup(
            new mapboxgl.default.Popup().setHTML('<div>Votre position</div>')
          )
          .addTo(map)
      }

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
      {/* Search Input */}
      <div className='flex gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
          <Input
            type='text'
            placeholder='Rechercher des outils sur la carte...'
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className='pl-10 pr-4 py-2'
          />
        </div>
        <Button 
          onClick={handleSearch}
          className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white'
          disabled={!localSearchQuery.trim()}
        >
          <Search className='h-4 w-4' />
        </Button>
      </div>

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
