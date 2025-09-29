import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useFavorites } from '@/hooks/useFavorites'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
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
import { toolsService } from '@/services/toolsService'
import { reviewsService, ReviewTool } from '@/services/reviewsService'
import { Tool, Review } from '@/types/bridge/tool.types'
import { useToast } from '@/hooks/use-toast'
import {
  Star,
  MapPin,
  User,
  CheckCircle,
  ArrowLeft,
  Heart,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr, enUS, arSA } from 'date-fns/locale'

const ToolDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [tool, setTool] = useState<Tool | null>(null)
  const [reviews, setReviews] = useState<ReviewTool[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const [totalReviewPages, setTotalReviewPages] = useState(1)
  const [totalReviews, setTotalReviews] = useState(0)
  const reviewsPerPage = 3
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Fetch tool details
  const fetchTool = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const toolData = await toolsService.getTool(id)
      setTool(toolData)
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('----------------------------------------------------')
      console.log('Tool details:', toolData)
    } catch (err: any) {
      console.error('Error fetching tool:', err)
      setError(err.message)
      toast({
        title: 'Erreur',
        description: "Impossible de charger les détails de l'outil.",
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch tool reviews
  const fetchReviews = async (page: number = 1) => {
    if (!id) return

    try {
      setReviewsLoading(true)
      const reviewsData = await reviewsService.getToolReviewsByToolId(id)
      setReviews(reviewsData)
      setTotalReviewPages(Math.ceil(reviewsData.length / reviewsPerPage))
      setTotalReviews(reviewsData.length)
    } catch (err: any) {
      console.error('Error fetching reviews:', err)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les avis.',
        variant: 'destructive',
      })
    } finally {
      setReviewsLoading(false)
    }
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

  // Get all photo URLs with primary photo first
  const getAllPhotoUrls = (tool: Tool) => {
    if (tool.photos && tool.photos.length > 0) {
      // Sort photos to put primary photo first
      const sortedPhotos = [...tool.photos].sort((a, b) => {
        if (a.isPrimary) return -1
        if (b.isPrimary) return 1
        return 0
      })
      return sortedPhotos.map((photo) => photo.url)
    }
    return [getPrimaryPhotoUrl(tool)]
  }

  // Calculate prices with 6% fees
  const calculateDisplayPrice = (basePrice: number): number => {
    // Convert basePrice to number if it's a string and calculate fees
    const basePriceNumber = typeof basePrice === 'string' ? parseFloat(basePrice) : basePrice
    const feeAmount = (basePriceNumber || 0) * 0.06
    return basePriceNumber + feeAmount
  }

  // Initial data fetch
  useEffect(() => {
    fetchTool()
  }, [id])

  // Fetch reviews when tool is loaded
  useEffect(() => {
    if (tool) {
      fetchReviews(currentReviewPage)
    }
  }, [tool, currentReviewPage])

  // Handle review page change
  const handleReviewPageChange = (page: number) => {
    setCurrentReviewPage(page)
  }

  const handleFavoriteToggle = async () => {
    if (!tool) return

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

  // Carousel navigation functions
  const nextImage = () => {
    if (!tool) return
    const allPhotos = getAllPhotoUrls(tool)
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length)
  }

  const prevImage = () => {
    if (!tool) return
    const allPhotos = getAllPhotoUrls(tool)
    setCurrentImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background'>
        <Header />
        <main className='py-20'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='flex justify-center items-center py-20'>
              <Loader2 className='h-8 w-8 animate-spin mr-2' />
              <span>{t('common.loading')}</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !tool) {
    return (
      <div className='min-h-screen bg-background'>
        <Header />
        <main className='py-20'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='text-center py-20'>
              <p className='text-red-600 mb-4'>{error || 'Outil non trouvé'}</p>
              <Link to='/search'>
                <Button>Retour à la recherche</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  
  const categoryName = tool.category?.displayName || 'Unknown Category'
  const subcategoryName =
    tool.subcategory?.displayName || 'Unknown Subcategory'
  const ownerName =
    `${tool.owner?.firstName || ''} ${
      tool.owner?.lastName || ''
    }`.trim() || 'Unknown Owner'
  const displayPrice = calculateDisplayPrice(tool.basePrice)
  const primaryPhotoUrl = getPrimaryPhotoUrl(tool)
  const allPhotoUrls = getAllPhotoUrls(tool)
  const feeAmount = (tool.basePrice || 0) * 0.06

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-7xl mx-auto px-4'>
          <div className='mb-6'>
            <Link
              to='/search'
              className='inline-flex items-center gap-2 text-accent hover:underline'
            >
              <ArrowLeft className='h-4 w-4' />
              {t('tools.back_to_results')}
            </Link>
          </div>

          {/* Owner Information */}
          <Card className='mb-6'>
            <CardContent
              className={'p-6 flex' + (language === 'ar' ? ' justify-end' : '')}
            >
              {language === 'ar' ? (
                <div className='flex items-center gap-4'>
                  <div>
                    <div className='flex items-center gap-2'>
                      {tool.owner?.verifiedEmail && (
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-800'
                        >
                          <CheckCircle className='h-3 w-3 mr-1' />
                          {t('tools.verified')}
                        </Badge>
                      )}
                      <h2 className='text-xl font-semibold'>{ownerName}</h2>
                    </div>
                    <p className='text-gray-600'>{t('tools.owner')}</p>
                  </div>
                  <Avatar className='h-16 w-16'>
                    <AvatarImage
                      src={
                        tool.owner?.profilePicture || '/placeholder.svg'
                      }
                      alt={ownerName}
                    />
                    <AvatarFallback>
                      <User className='h-8 w-8' />
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : (
                <div className='flex items-center gap-4'>
                  <Avatar className='h-16 w-16'>
                    <AvatarImage
                      src={
                        tool.owner?.profilePicture || '/placeholder.svg'
                      }
                      alt={ownerName}
                    />
                    <AvatarFallback>
                      <User className='h-8 w-8' />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-xl font-semibold'>{ownerName}</h2>
                      {tool.owner?.verifiedEmail && (
                        <Badge
                          variant='secondary'
                          className='bg-green-100 text-green-800'
                        >
                          <CheckCircle className='h-3 w-3 mr-1' />
                          {t('tools.verified')}
                        </Badge>
                      )}
                    </div>
                    <p className='text-gray-600'>{t('tools.owner')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Carousel */}
            <div>
              {/* Main Image with Navigation */}
              <div className='relative mb-4'>
                <img
                  src={allPhotoUrls[currentImageIndex]}
                  alt={`${tool.title} ${currentImageIndex + 1}`}
                  className='w-full h-96 object-cover rounded-lg'
                />
                
                {/* Navigation Buttons */}
                {allPhotoUrls.length > 1 && (
                  <>
                    <Button
                      variant='outline'
                      size='icon'
                      className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white'
                      onClick={prevImage}
                    >
                      <ChevronLeft className='h-4 w-4' />
                    </Button>
                    <Button
                      variant='outline'
                      size='icon'
                      className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white'
                      onClick={nextImage}
                    >
                      <ChevronRight className='h-4 w-4' />
                    </Button>
                  </>
                )}
                
                {/* Image Counter */}
                <div className='absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm'>
                  {currentImageIndex + 1} / {allPhotoUrls.length}
                </div>
              </div>
              
              {/* Thumbnails */}
              {allPhotoUrls.length > 1 && (
                <div className='grid grid-cols-4 gap-2'>
                  {allPhotoUrls.slice(0, 4).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${tool.title} ${index + 1}`}
                      className={`w-full h-20 object-cover rounded cursor-pointer transition-all ${
                        currentImageIndex === index
                          ? 'ring-2 ring-accent opacity-100'
                          : 'hover:opacity-80 opacity-70'
                      }`}
                      onClick={() => goToImage(index)}
                    />
                  ))}
                </div>
              )}
              
              {/* Dots Indicator */}
              {allPhotoUrls.length > 4 && (
                <div className='flex justify-center mt-4 space-x-2'>
                  {allPhotoUrls.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === index
                          ? 'bg-accent'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      onClick={() => goToImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Tool Information */}
            <div>
              <div
                className={
                  'flex items-center gap-2 mb-4 ' +
                  (language === 'ar' ? '[direction:ltr]' : '')
                }
              >
                <Badge variant='secondary'>{categoryName}</Badge>
                <Badge variant='outline'>{subcategoryName}</Badge>
                <Badge className='bg-green-500'>
                  {tool.condition === 1 && t('tools.condition_new')}
                  {tool.condition === 2 && t('tools.condition_like_new')}
                  {tool.condition === 3 && t('tools.condition_good')}
                  {tool.condition === 4 && t('tools.condition_fair')}
                  {tool.condition === 5 && t('tools.condition_poor')}
                  {tool.condition === '' && t('tools.condition_unknown')}
                </Badge>
              </div>

              <h1 className='text-3xl font-bold mb-4'>{tool.title}</h1>

              <div className='space-y-3 mb-6'>
                <div className='grid grid-cols-2 gap-4 '>
                  <div>
                    <span className='text-gray-600'>{t('tools.brand')}:</span>
                    <span className='ml-2 font-medium'>
                      {tool.brand || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>{t('tools.model')}:</span>
                    <span className='ml-2 font-medium'>
                      {tool.model || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className='text-gray-600'>
                      {t('tools.year_of_purchase')}:
                    </span>
                    <span className='ml-2 font-medium'>
                      {tool.year || 'N/A'}
                    </span>
                  </div>
                  <div
                    className={
                      'flex items-center gap-1 ' +
                      (language === 'ar' ? 'justify-end' : '')
                    }
                  >
                    {language === 'ar' ? (
                      <>
                        <span className='text-gray-600'>
                          {tool.pickupAddress}
                        </span>
                        <MapPin className='h-4 w-4 text-gray-400' />
                      </>
                    ) : (
                      <>
                        <MapPin className='h-4 w-4 text-gray-400' />
                        <span className='text-gray-600'>
                          {tool.pickupAddress}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div
                className={
                  'flex items-center gap-4 mb-6 ' +
                  (language === 'ar' ? '[direction:ltr]' : '')
                }
              >
                <div className='flex items-center gap-1'>
                  <Star className='h-5 w-5 fill-yellow-400 text-yellow-400' />
                  <span className='font-medium'>{tool.rating || 0}</span>
                  <span className='text-gray-500'>
                    ({tool.reviewCount || 0} avis)
                  </span>
                </div>
              </div>

              <div className='bg-accent/5 rounded-lg p-6 mb-6'>
                <div className='text-3xl font-bold text-accent mb-2'>
                  {displayPrice.toFixed(2)} €
                  <span className='text-lg font-normal text-gray-600'>
                    /{t('tools.day')}
                  </span>
                </div>
                <div className='text-sm text-gray-600 mb-4'>
                  {t('tools.fees_and_taxes')} : {(feeAmount || 0).toFixed(1)} €
                  (6% {t('tools.of')} {tool.basePrice || 0} €{' '}
                  {t('tools.charged')})
                </div>
                <div className='text-sm text-gray-600 mb-4'>
                  {t('tools.deposit')}: {tool.depositAmount || 0}€{' '}
                  {t('tools.refunded')}
                </div>
                <div className='space-y-2'>
                  {!isAuthenticated ? (
                    <Button 
                      className='w-full' 
                      size='lg'
                      onClick={() => navigate('/login')}
                    >
                      {t('tools.rent_now')}
                    </Button>
                  ) : user?.id === tool.owner.id ? (
                    <Button 
                      className='w-full' 
                      size='lg'
                      disabled
                    >
                      Votre outil
                    </Button>
                  ) : (
                    <Link to={`/rent/${tool.id}`}>
                      <Button className='w-full' size='lg'>
                        {t('tools.rent_now')}
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={handleFavoriteToggle}
                  >
                    <Heart
                      className={`h-4 w-4 mr-2 ${
                        isFavorite(tool.id) ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                    {isFavorite(tool.id)
                      ? `${t('tools.remove_from_favorites')}`
                      : `${t('tools.add_to_favorites')}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-1 gap-8'>
            {/* Description and Reviews */}
            <div>
              <Card className='mb-6'>
                <CardContent className='p-6'>
                  <h2 className='text-xl font-semibold mb-4'>
                    {t('tools.desc')}
                  </h2>
                  <p className='text-gray-700 mb-6'>{tool.description}</p>

                  {/* <h3 className="text-lg font-semibold mb-3">Caractéristiques</h3>
                  <ul className="grid grid-cols-2 gap-2">
                    {tool.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul> */}
                </CardContent>
              </Card>

              {/* Owner Instructions */}
              <Card className='mb-6'>
                <CardContent className='p-6'>
                  <h2 className='text-xl font-semibold mb-4'>
                    {t('tools.instructions')}
                  </h2>
                  <ul className='text-sm text-muted-foreground space-y-1'>
                    {tool.ownerInstructions
                      ?.split('\n')
                      .map((instruction, index) => (
                        <li key={index}>• {instruction}</li>
                      ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Reviews with Pagination */}
              <Card>
                <CardContent className='p-6'>
                  <h2 className='text-xl font-semibold mb-4'>
                    {t('tools.reviews')}
                  </h2>
                  {reviewsLoading ? (
                    <div className='flex justify-center py-4'>
                      <Loader2 className='h-6 w-6 animate-spin' />
                    </div>
                  ) : (
                    <div className='space-y-4 mb-6'>
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div
                            key={review.id}
                            className='border-b pb-4 last:border-b-0'
                          >
                            <div className='flex items-start gap-3 mb-2'>
                              {/* Photo de profil du reviewer */}
                              <div className='flex-shrink-0'>
                                {review.reviewer?.profilePicture ? (
                                  <img
                                    src={review.reviewer.profilePicture}
                                    alt={`${review.reviewer?.firstName} ${review.reviewer?.lastName}`}
                                    className='w-10 h-10 rounded-full object-cover border-2 border-gray-200'
                                  />
                                ) : (
                                  <div className='w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-sm border-2 border-gray-200'>
                                    {review.reviewer?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                )}
                              </div>
                              
                              {/* Contenu de l'avis */}
                              <div className='flex-1'>
                                <div className='flex items-center gap-2 mb-1'>
                                  <span className='font-medium text-gray-900'>
                                    {review.reviewer.firstName} {review.reviewer.lastName}
                                  </span>
                                  <span className='text-sm text-gray-500'>
                                    {format(
                                      new Date(review.createdAt),
                                      'dd MMMM yyyy',
                                      {
                                        locale:
                                          language === 'fr'
                                            ? fr
                                            : language === 'ar'
                                            ? arSA
                                            : enUS,
                                      }
                                    )}
                                  </span>
                                </div>
                                
                                {/* Étoiles de notation */}
                                <div className='flex items-center mb-2'>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className='text-gray-700'>{review.comment}</p>
                          </div>
                        ))
                      ) : (
                        <p className='text-gray-500 text-center py-4'>
                          Aucun avis pour le moment.
                        </p>
                      )}
                    </div>
                  )}

                  {totalReviewPages > 1 && (
                    <Pagination>
                      <PaginationContent
                        className={language === 'ar' ? '[direction:ltr]' : ''}
                      >
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handleReviewPageChange(
                                Math.max(1, currentReviewPage - 1)
                              )
                            }
                            className={
                              currentReviewPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {[...Array(totalReviewPages)].map((_, index) => (
                          <PaginationItem key={index}>
                            <PaginationLink
                              onClick={() => handleReviewPageChange(index + 1)}
                              isActive={currentReviewPage === index + 1}
                              className='cursor-pointer'
                            >
                              {index + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handleReviewPageChange(
                                Math.min(
                                  totalReviewPages,
                                  currentReviewPage + 1
                                )
                              )
                            }
                            className={
                              currentReviewPage === totalReviewPages
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ToolDetails
