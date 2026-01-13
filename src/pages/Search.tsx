import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import CustomRangeSlider from '@/components/ui/CustomRangeSlider'
import { Badge } from '@/components/ui/badge'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { PriceDisplay } from '@/components/PriceDisplay'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'
import { useCurrencyOptimized } from '@/hooks/useCurrencyOptimized'
import { RateFetchTrigger } from '@/types/currency'
import {
  Search as SearchIcon,
  MapPin,
  Star,
  Filter,
  Heart,
  Loader2,
  X,
  RefreshCw,
} from 'lucide-react'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import {
  Link,
  useSearchParams,
  useNavigate,
  useLocation,
} from 'react-router-dom'
import {
  toolsService,
  Tool,
  Category,
  Subcategory,
  ToolFilters,
} from '../services/toolsService'
import { ModerationStatus, ToolStatus } from '../types/bridge/enums'
import { useToast } from '@/hooks/use-toast'
import { useDebounce } from '@/hooks/useDebounce'

// CSS animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  
  .stagger-animation {
    opacity: 0;
    transform: translateY(30px);
  }
`

const Search = () => {
  const { t, language } = useLanguage()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { calculateBulkPrices, refreshRates } = useCurrencyOptimized()
  const { selectedCurrency, calculatePrice, formatPrice } = useCurrency()

  // Debug log pour vérifier la valeur de isAuthenticated
  console.log('🔍 Search.tsx - isAuthenticated:', isAuthenticated)

  const [priceRange, setPriceRange] = useState([0, 500])
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get('categoryId') || 'all'
  )
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  )
  const [locationQuery, setLocationQuery] = useState('')
  const [sortBy, setSortBy] = useState<
    'title' | 'basePrice' | 'rating' | 'createdAt'
  >('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [tools, setTools] = useState<Tool[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [filtersVisible, setFiltersVisible] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const itemsPerPage = 12

  // Debounced search term for real-time search
  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const debouncedLocationQuery = useDebounce(locationQuery, 300)

  // Currency conversion functions for price slider
  const convertGBPToUserCurrency = useCallback(
    (gbpPrice: number) => {
      if (selectedCurrency === 'GBP') return gbpPrice
      return calculatePrice(gbpPrice, 'GBP') || gbpPrice
    },
    [selectedCurrency, calculatePrice]
  )

  const convertUserCurrencyToGBP = useCallback(
    (userPrice: number) => {
      if (selectedCurrency === 'GBP') return userPrice
      // Convert back to GBP by dividing by the rate
      const rate = calculatePrice(1, 'GBP') || 1
      return userPrice / rate
    },
    [selectedCurrency, calculatePrice]
  )

  // Convert slider range for display
  const displayPriceRange = useMemo(
    () => [
      Math.round(convertGBPToUserCurrency(priceRange[0])),
      Math.round(convertGBPToUserCurrency(priceRange[1])),
    ],
    [priceRange, convertGBPToUserCurrency]
  )

  // Convert display range back to GBP for filtering
  const gbpPriceRange = useMemo(
    () => [
      Math.round(convertUserCurrencyToGBP(displayPriceRange[0])),
      Math.round(convertUserCurrencyToGBP(displayPriceRange[1])),
    ],
    [displayPriceRange, convertUserCurrencyToGBP]
  )

  // Handle price range change from slider
  const handlePriceRangeChange = useCallback(
    (newDisplayRange: number[]) => {
      // Convert the display range back to GBP for internal state
      const newGBPRange = [
        Math.round(convertUserCurrencyToGBP(newDisplayRange[0])),
        Math.round(convertUserCurrencyToGBP(newDisplayRange[1])),
      ]
      setPriceRange(newGBPRange)
    },
    [convertUserCurrencyToGBP]
  )

  // Filter tools on frontend based on GBP price
  const filteredTools = useMemo(() => {
    if (!tools.length) return tools

    return tools.filter((tool) => {
      const toolPrice = tool.basePrice || 0
      return toolPrice >= priceRange[0] && toolPrice <= priceRange[1]
    })
  }, [tools, priceRange])

  // Fetch tools with current filters
  const fetchTools = useCallback(
    async (isRealTimeSearch = false) => {
      if (isRealTimeSearch) {
        setIsSearching(true)
      } else {
        setLoading(true)
      }

      try {
        setError(null)

        const filters: ToolFilters = {
          page: currentPage,
          limit: itemsPerPage,
          search: isRealTimeSearch
            ? debouncedSearchQuery
            : searchQuery || undefined,
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategoryId:
            selectedSubCategory !== 'all' ? selectedSubCategory : undefined,
          minPrice: priceRange[0],
          maxPrice: priceRange[1],
          location: isRealTimeSearch
            ? debouncedLocationQuery
            : locationQuery || undefined,
          toolStatus: ToolStatus.PUBLISHED,
          moderationStatus: ModerationStatus.CONFIRMED,
          sortBy,
          sortOrder,
        }

        const response = await toolsService.getTools(filters)

        if (response && response.data && Array.isArray(response.data)) {
          setTools(response.data)
          setTotalPages(response.totalPages || 1)
          setTotalItems(response.total || response.data.length)
        } else {
          setTools([])
          setTotalPages(1)
          setTotalItems(0)
        }

        // Update URL params for better UX
        const newParams = new URLSearchParams()
        if (filters.search) newParams.set('search', filters.search)
        if (filters.location) newParams.set('location', filters.location)
        if (filters.categoryId) newParams.set('categoryId', filters.categoryId)
        if (filters.subcategoryId)
          newParams.set('subcategoryId', filters.subcategoryId)
        if (currentPage > 1) newParams.set('page', currentPage.toString())

        navigate({ search: newParams.toString() }, { replace: true })
      } catch (err: any) {
        setError(err.message)
        setTools([])
        setTotalPages(1)
        setTotalItems(0)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les outils. Veuillez réessayer.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
        setIsSearching(false)
      }
    },
    [
      debouncedSearchQuery,
      debouncedLocationQuery,
      selectedCategory,
      selectedSubCategory,
      priceRange,
      sortBy,
      sortOrder,
      currentPage,
      itemsPerPage,
      searchQuery,
      locationQuery,
      navigate,
      toast,
    ]
  )

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const fetchedCategories = await toolsService.getCategories()
      setCategories(fetchedCategories)
    } catch (err: any) {
      // Error handled silently
    }
  }

  // Fetch subcategories when category changes
  const fetchSubcategories = async (categoryId: string) => {
    try {
      if (categoryId && categoryId !== 'all') {
        const fetchedSubcategories =
          await toolsService.getSubcategoriesByCategory(categoryId)

        setSubcategories(
          fetchedSubcategories.data?.data || fetchedSubcategories || []
        )
      } else {
        setSubcategories([])
      }
    } catch (err: any) {
      setSubcategories([])
    }
  }

  // Calculate display price based on rental period
  // - handles null/undefined values and ensures valid number output
  const calculateDisplayPrice = (originalPrice: number | string) => {
    const price =
      typeof originalPrice === 'number'
        ? originalPrice
        : parseFloat(originalPrice) || 0
    const feeRate = 0.06
    const feeAmount = price * feeRate
    return price + feeAmount
  }

  // Get primary photo URL
  const getPrimaryPhotoUrl = (tool: Tool) => {
    const primaryPhoto = tool.photos?.find((photo) => photo.isPrimary)
    return (
      primaryPhoto?.url ||
      tool.photos?.[0]?.url ||
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'
    )
  }

  // Handle filter application
  const handleApplyFilters = () => {
    setCurrentPage(1)
    fetchTools()
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-')
    setSortBy(field as 'title' | 'basePrice' | 'rating' | 'createdAt')
    setSortOrder(order as 'asc' | 'desc')
    setCurrentPage(1)
  }

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchQuery('')
    setLocationQuery('')
    setSelectedCategory('all')
    setSelectedSubCategory('all')
    setPriceRange([0, 500])
    setSortBy('createdAt')
    setSortOrder('desc')
    setCurrentPage(1)
  }, [])

  // Toggle filters visibility
  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible)
  }

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  // Handle location input change
  const handleLocationChange = (value: string) => {
    setLocationQuery(value)
    setCurrentPage(1)
  }

  // Handle favorite toggle
  const handleFavoriteToggle = async (tool: Tool) => {
    try {
      if (isFavorite(tool.id)) {
        await removeFromFavorites(tool.id)
        toast({
          title: 'Retiré des favoris',
          description: `${tool.title} a été retiré de vos favoris.`,
        })
      } else {
        await addToFavorites(tool)
        toast({
          title: 'Ajouté aux favoris',
          description: `${tool.title} a été ajouté à vos favoris.`,
        })
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description:
          "Une erreur s'est produite lors de la mise à jour des favoris.",
        variant: 'destructive',
      })
    }
  }

  // Handle rent button click
  const handleRentClick = (toolId: string) => {
    // if (!isAuthenticated) {
    //   // Redirect to login with the current page as return destination
    //   navigate('/login', { state: { from: location } });
    // } else {
    //   // Navigate to tool details page
    navigate(`/tool/${toolId}`)
    // }
  }

  // Handle refresh
  const handleRefresh = async () => {
    setLoading(true)
    try {
      await fetchCategories()
      await fetchTools()
      toast({
        title: 'Actualisation réussie',
        description: 'Les outils ont été rechargés depuis la base de données.',
      })
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'actualiser les données.",
        variant: 'destructive',
      })
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchCategories()
    fetchTools() // Load tools on initial mount
    refreshRates(RateFetchTrigger.SEARCH_PAGE_ENTRY) // Refresh rates on search page entry
  }, [])

  // Real-time search effect
  useEffect(() => {
    if (
      debouncedSearchQuery !== searchQuery ||
      debouncedLocationQuery !== locationQuery
    ) {
      return // Wait for debounce
    }
    fetchTools(true)
  }, [debouncedSearchQuery, debouncedLocationQuery, fetchTools])

  // Filter changes effect
  useEffect(() => {
    setCurrentPage(1) // Reset to first page when filters change
    fetchTools()
  }, [selectedCategory, selectedSubCategory, priceRange, sortBy, sortOrder])

  // Pagination effect
  useEffect(() => {
    fetchTools()
  }, [currentPage])

  // Set initial values from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('categoryId')
    const searchParam = searchParams.get('search')

    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }
    if (searchParam && searchParam !== searchQuery) {
      setSearchQuery(searchParam)
    }
  }, [searchParams])

  // Fetch subcategories when category changes
  useEffect(() => {
    setSelectedSubCategory('all')
    setCurrentPage(1)
    fetchSubcategories(selectedCategory)
  }, [selectedCategory])

  return (
    <div className='min-h-screen bg-gray-50'>
      <style>{styles}</style>
      <Header />
      <main className='py-20'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
            {/* Filtres */}
            <div className='lg:col-span-1'>
              <div className='lg:hidden mb-4'>
                <Button
                  variant='outline'
                  onClick={toggleFilters}
                  className='w-full'
                >
                  <Filter className='mr-2 h-4 w-4' />
                  {filtersVisible
                    ? t('catalog_section.hide_filters')
                    : t('catalog_section.show_filters')}
                </Button>
              </div>
              <Card
                className={`lg:block ${filtersVisible ? 'block' : 'hidden'}`}
              >
                <CardContent className='p-6'>
                  <div className='flex items-center gap-2 mb-6'>
                    <Filter className='h-5 w-5' />
                    <h2 className='text-lg font-semibold'>
                      {t('catalog_section.filters')}
                    </h2>
                  </div>

                  <div className='space-y-6'>
                    <div className='space-y-2'>
                      <Label>{t('catalog_section.search')}</Label>
                      <div className='relative'>
                        <SearchIcon className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder={t('catalog_section.tool_name')}
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === 'Enter' && handleApplyFilters()
                          }
                          className='pl-10'
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>{t('catalog_section.location')}</Label>
                      <div className='relative'>
                        <MapPin className='absolute left-3 top-3 h-4 w-4 text-gray-400' />
                        <Input
                          placeholder={t('catalog_section.location')}
                          value={locationQuery}
                          onChange={(e) => handleLocationChange(e.target.value)}
                          className='pl-10'
                        />
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label>{t('catalog_section.category')}</Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t('catalog_section.all_categories')}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='all'>
                            {t('catalog_section.all_categories')}
                          </SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {t(`categories.${category.name}`) ||
                                category.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedCategory !== 'all' && (
                      <div className='space-y-2'>
                        <Label>{t('catalog_section.sub_category')}</Label>
                        <Select
                          value={selectedSubCategory}
                          onValueChange={setSelectedSubCategory}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t(
                                'catalog_section.all_sub_categories'
                              )}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='all'>
                              {t('catalog_section.all_sub_categories')}
                            </SelectItem>
                            {(() => {
                              return (subcategories || []).map(
                                (subcategory) => (
                                  <SelectItem
                                    key={subcategory.id}
                                    value={subcategory.id}
                                  >
                                    {t(`subcategories.${subcategory.name}`) ||
                                      subcategory.displayName}
                                  </SelectItem>
                                )
                              )
                            })()}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className='space-y-3'>
                      <Label className='text-sm font-medium'>
                        {t('catalog_section.daily_price')}
                      </Label>
                      <div className='px-2'>
                        <CustomRangeSlider
                          value={displayPriceRange}
                          onValueChange={handlePriceRangeChange}
                          min={Math.round(convertGBPToUserCurrency(0))}
                          max={Math.round(convertGBPToUserCurrency(500))}
                          step={1}
                          className='mt-2'
                          currencySymbol={selectedCurrency}
                          convertValue={(value) => value}
                          formatValue={(value) =>
                            formatPrice(value, selectedCurrency)
                          }
                        />
                      </div>
                    </div>

                    <div className='flex gap-2'>
                      <Button
                        onClick={handleApplyFilters}
                        disabled={loading}
                        className='flex-1'
                      >
                        {loading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            {t('common.loading')}
                          </>
                        ) : (
                          t('catalog_section.apply_filters')
                        )}
                      </Button>
                      <Button
                        variant='outline'
                        onClick={clearAllFilters}
                        disabled={loading}
                        className='px-3'
                      >
                        <RefreshCw className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Résultats */}
            <div className='lg:col-span-3'>
              <div
                className={
                  'flex justify-between items-center mb-6 ' +
                  (language === 'ar' ? ' [direction:ltr] ' : '')
                }
              >
                <div className='flex items-center'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleRefresh}
                    disabled={loading}
                    className='flex items-center gap-2'
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                    />
                    {t('refresh')}
                  </Button>

                  <Select
                    onValueChange={handleSortChange}
                    value={`${sortBy}-${sortOrder}`}
                  >
                    <SelectTrigger className='w-48'>
                      <SelectValue placeholder={t('catalog_section.sort_by')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='createdAt-desc'>
                        <div className='flex items-center gap-2'>
                          <span>📅</span>
                          <span>{t('catalog_section.most_recent')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='createdAt-asc'>
                        <div className='flex items-center gap-2'>
                          <span>📅</span>
                          <span>{t('search.sort.oldest')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='title-asc'>
                        <div className='flex items-center gap-2'>
                          <span>🔤</span>
                          <span>{t('search.sort.name_asc')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='title-desc'>
                        <div className='flex items-center gap-2'>
                          <span>🔤</span>
                          <span>{t('search.sort.name_desc')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='basePrice-asc'>
                        <div className='flex items-center gap-2'>
                          <span>💰</span>
                          <span>{t('catalog_section.price_low_to_high')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='basePrice-desc'>
                        <div className='flex items-center gap-2'>
                          <span>💰</span>
                          <span>{t('catalog_section.price_high_to_low')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='rating-desc'>
                        <div className='flex items-center gap-2'>
                          <Star className='h-4 w-4 text-yellow-500' />
                          <span>{t('catalog_section.top_rated')}</span>
                        </div>
                      </SelectItem>
                      <SelectItem value='rating-asc'>
                        <div className='flex items-center gap-2'>
                          <Star className='h-4 w-4 text-gray-400' />
                          <span>{t('search.sort.lowest_rated')}</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(searchQuery ||
                  locationQuery ||
                  selectedCategory !== 'all' ||
                  selectedSubCategory !== 'all') && (
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={clearAllFilters}
                    className='text-gray-500 hover:text-gray-700'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                )}
              </div>
              <div
                className={
                  'flex justify-between items-center mb-6 ' +
                  (language === 'ar' ? ' [direction:ltr] ' : '')
                }
              >
                <div className='flex items-center '>
                  <div>
                    <h1 className={'text-2xl font-bold '}>
                      {totalItems} {t('catalog_section.title')}
                    </h1>
                    <div className='flex items-center gap-2 mt-1'>
                      {selectedCategory !== 'all' && (
                        <p className='text-gray-600'>
                          {t('catalog_section.category')}:{' '}
                          {/* on veut afficher la traduction de selcted category */}
                          {t(
                            `categories.${
                              categories.find(
                                (cat) => cat.id === selectedCategory
                              )?.name
                            }`
                          ) || t(`categories.${selectedCategory}`)}
                        </p>
                      )}
                      {isSearching && (
                        <div className='flex items-center gap-1 text-sm text-blue-600'>
                          <Loader2 className='h-3 w-3 animate-spin' />
                          <span>{t('search.searching')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {loading ? (
                <div className='flex justify-center items-center py-12'>
                  <div className='flex flex-col items-center gap-3'>
                    <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                    <p className='text-sm text-muted-foreground'>
                      {t('common.loading')}
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className='text-center py-12'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center'>
                      <X className='h-8 w-8 text-red-500' />
                    </div>
                    <div>
                      <p className='text-red-600 font-medium'>{error}</p>
                      <p className='text-gray-400 text-sm mt-1'>
                        Veuillez réessayer plus tard
                      </p>
                    </div>
                    <Button variant='outline' onClick={() => fetchTools()}>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      Réessayer
                    </Button>
                  </div>
                </div>
              ) : tools.length === 0 ? (
                <div className='text-center py-12'>
                  <div className='flex flex-col items-center gap-4'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                      <SearchIcon className='h-8 w-8 text-gray-400' />
                    </div>
                    <div>
                      <p className='text-gray-600 text-lg font-medium'>
                        {t('search.noResults')}
                      </p>
                      <p className='text-gray-400 text-sm mt-1'>
                        {t('search.tryDifferentCriteria')}
                      </p>
                    </div>
                    <Button variant='outline' onClick={clearAllFilters}>
                      <RefreshCw className='mr-2 h-4 w-4' />
                      {t('search.resetFilters')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                  {(tools || []).map((tool, index) => {
                    const displayPrice = calculateDisplayPrice(tool.basePrice)
                    return (
                      <div
                        key={tool.id}
                        className='bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-blue-300'
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.6s ease-out forwards',
                        }}
                      >
                        {/* Image */}
                        <div className='relative h-48 bg-gray-100'>
                          <img
                            src={getPrimaryPhotoUrl(tool)}
                            alt={tool.title}
                            className='w-full h-full object-cover'
                          />
                          <div className='absolute top-3 left-3'>
                            <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100 ml-1'>
                              {tool.category?.displayName || tool.category}
                            </Badge>
                            {tool.subcategory && (
                              <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100 ml-1'>
                                {tool.subcategory.displayName}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className='p-4'>
                          <div className='flex items-center justify-between mb-2'>
                            <div className='flex items-center text-sm text-gray-500'>
                              <Star className='h-4 w-4 text-yellow-400 fill-current mr-1' />
                              {tool.rating || 0} ({tool.reviewCount || 0})
                            </div>
                          </div>

                          <h3 className='font-semibold text-gray-900 mb-2 truncate'>
                            {tool.title}
                          </h3>

                          <div className='flex items-center text-sm text-gray-500 mb-3'>
                            <MapPin className='h-4 w-4 mr-1' />
                            {tool.pickupAddress}
                          </div>

                          <div className='flex items-center justify-between mb-4'>
                            <div className='text-lg font-bold text-primary'>
                              <OptimizedPriceDisplay
                                price={calculateDisplayPrice(tool.basePrice)}
                                baseCurrency={tool.baseCurrencyCode || 'GBP'}
                                size='md'
                                cible='basePrice'
                              />
                            </div>
                            <div className='text-sm text-gray-500'>
                              {t('catalog_section.by')}{' '}
                              {tool.owner?.firstName || 'Propriétaire'}
                            </div>
                          </div>

                          <div className='flex items-center justify-between'>
                            <Button
                              size='sm'
                              className={`${
                                isAuthenticated ? 'mr-2' : ''
                              } flex-1`}
                              onClick={() => handleRentClick(tool.id)}
                            >
                              {t('tools.rent')}
                            </Button>
                            {/* Debug log pour vérifier la condition d'affichage */}
                            {console.log(
                              '🔍 Bouton favoris - isAuthenticated:',
                              isAuthenticated,
                              'pour outil:',
                              tool.id
                            )}
                            {isAuthenticated && (
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleFavoriteToggle(tool)}
                                className='p-2'
                              >
                                <Heart
                                  className={`h-4 w-4 ${
                                    isFavorite(tool.id)
                                      ? 'fill-red-500 text-red-500'
                                      : ''
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Pagination */}
              {!loading && !error && tools.length > 0 && totalPages > 1 && (
                <div className='flex justify-center mt-8'>
                  <Pagination>
                    <PaginationContent
                      className={language === 'ar' ? '[direction:ltr]' : ''}
                    >
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className={
                              currentPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      )}

                      {Array.from(
                        { length: Math.min(totalPages, 5) },
                        (_, i) => {
                          let page
                          if (totalPages <= 5) {
                            page = i + 1
                          } else if (currentPage <= 3) {
                            page = i + 1
                          } else if (currentPage >= totalPages - 2) {
                            page = totalPages - 4 + i
                          } else {
                            page = currentPage - 2 + i
                          }
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className='cursor-pointer'
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        }
                      )}

                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className={
                              currentPage === totalPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Search
