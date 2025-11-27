import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { Card, CardContent } from '@/components/ui/card'
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
import { newsService } from '@/services/newsService'
import { News, NewsCategory, NewsFilters } from '../types/bridge/news.types'
import { useToast } from '@/hooks/use-toast'
import { Calendar, User, Clock, Loader2 } from 'lucide-react'

const Blog = () => {
  const { t, language } = useLanguage()
  const [currentPage, setCurrentPage] = useState(1)
  const [articles, setArticles] = useState<News[]>([])
  const [featuredArticle, setFeaturedArticle] = useState<News | null>(null)
  // Fixed categories list
  const categories: NewsCategory[] = [
    { id: '1', name: 'Jardinage', displayName: 'Jardinage' },
    { id: '2', name: 'Entretien', displayName: 'Entretien' },
    { id: '3', name: 'Transport', displayName: 'Transport' },
    { id: '4', name: 'Bricolage', displayName: 'Bricolage' },
    { id: '5', name: 'Électricité', displayName: 'Électricité' },
    { id: '6', name: 'Éclairage', displayName: 'Éclairage' },
    { id: '7', name: 'Peinture', displayName: 'Peinture' },
    { id: '8', name: 'Construction', displayName: 'Construction' },
    { id: '9', name: 'Plantes', displayName: 'Plantes' },
    { id: '10', name: 'Nettoyage', displayName: 'Nettoyage' },
    { id: '11', name: 'Décoration', displayName: 'Décoration' },
    { id: '12', name: 'Guide', displayName: 'Guide' },
  ]
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [totalArticles, setTotalArticles] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const { toast } = useToast()
  const itemsPerPage = 6

  // Load articles
  const loadArticles = async (
    page: number = currentPage,
    category: string = selectedCategory
  ) => {
    try {
      const filters: NewsFilters = {
        page,
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }

      if (category) {
        filters.category = category
      }

      const response = await newsService.getPublicNews(filters)

      setArticles(response.data || [])
      setTotalPages(response.totalPages || 1)
      setTotalArticles(response.total || 0)
    } catch (error: any) {
      console.error('Failed to load articles:', error)
      setArticles([])
      setTotalPages(1)
      setTotalArticles(0)
      toast({
        title: 'Error',
        description: error.message || 'Failed to load articles',
        variant: 'destructive',
      })
    }
  }

  // Load random featured article
  const loadFeaturedArticle = async () => {
    try {
      const response = await newsService.getPublicNews({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })

      if (response.data && response.data.length > 0) {
        // Select a random article from the first 10 articles
        const randomIndex = Math.floor(Math.random() * response.data.length)
        setFeaturedArticle(response.data[randomIndex])
      }
    } catch (error: any) {
      console.warn('Failed to load featured article:', error.message)
    }
  }

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true)
      await Promise.all([loadArticles(), loadFeaturedArticle()])
      setLoading(false)
    }

    initializeData()
  }, [])

  // Reload articles when page or category changes
  useEffect(() => {
    if (!loading) {
      loadArticles(currentPage, selectedCategory)
    }
  }, [currentPage, selectedCategory])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Get author name
  const getAuthorName = (article: News) => {
    if (article.admin) {
      return `${article.admin.firstName} ${article.admin.lastName}`
    }
    return 'Équipe Bricola'
  }

  // // Get category name
  // const getCategoryName = (categoryId?: string) => {
  //   if (!categoryId) return t('blog.category.general');
  //   const category = categories.find(cat => cat.id === categoryId);
  //   return category?.displayName || category?.name || t('blog.category.general');
  // };

  // Handle category filter
  const handleCategoryFilter = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('')
    } else {
      setSelectedCategory(categoryName)
    }
    setCurrentPage(1)
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>{t('general.loading')}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='text-center mb-12'>
            <h1 className='text-4xl font-bold mb-4'>{t('blog.title')}</h1>
            <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
              {t('blog.description')}
            </p>
          </div>

          {/* Article principal */}
          {featuredArticle && (
            <div className='mb-12'>
              <Card className='overflow-hidden'>
                <div className='grid grid-cols-1 lg:grid-cols-2'>
                  <img
                    src={featuredArticle.imageUrl || '/placeholder-blog.svg'}
                    alt={featuredArticle.title}
                    className='w-full h-64 lg:h-full object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = '/placeholder-blog.svg'
                    }}
                  />
                  <CardContent className='p-8'>
                    <Badge className='mb-4'>
                      {t(`blog.${featuredArticle.category}`) ||
                        t('blog.category.general')}
                    </Badge>
                    <h2 className='text-2xl font-bold mb-4'>
                      <Link
                        to={`/blog/${featuredArticle.id}`}
                        className='hover:text-accent'
                      >
                        {featuredArticle.title}
                      </Link>
                    </h2>
                    <p className='text-gray-600 mb-6'>
                      {featuredArticle.summary}
                    </p>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <User className='h-4 w-4' />
                        <span>{getAuthorName(featuredArticle)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>{formatDate(featuredArticle.createdAt)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Clock className='h-4 w-4' />

                        <span>
                          {Math.ceil(
                            (featuredArticle.content?.length || 0) / 180
                          )}
                          {t('general.min')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}

          {/* Grille d'articles */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
            {articles.map((article) => (
              <Card
                key={article.id}
                className='overflow-hidden hover:shadow-lg transition-shadow'
              >
                <img
                  src={article.imageUrl || '/placeholder-blog.svg'}
                  alt={article.title}
                  className='w-full h-48 object-cover'
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/placeholder-blog.svg'
                  }}
                />
                <CardContent className='p-6'>
                  <Badge className='mb-3'>
                    {t(`blog.${article.category}`) ||
                      t('blog.category.general')}
                  </Badge>
                  <h3 className='text-xl font-semibold mb-3'>
                    <Link
                      to={`/blog/${article.id}`}
                      className='hover:text-accent'
                    >
                      {article.title}
                    </Link>
                  </h3>
                  <p className='text-gray-600 mb-4'>{article.summary}</p>
                  <div className='flex items-center justify-between text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <User className='h-4 w-4' />
                      <span>{getAuthorName(article)}</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-4 w-4' />
                      <span>
                        {Math.ceil((article.content?.length || 0) / 180)}
                        {t('general.min')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex justify-center mb-16'>
              <Pagination>
                <PaginationContent
                  className={language === 'ar' ? '[direction:ltr]' : ''}
                >
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className='cursor-pointer'
                      />
                    </PaginationItem>
                  )}

                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className='cursor-pointer'
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <span className='px-3 py-2'>...</span>
                        </PaginationItem>
                      )}
                    </>
                  )}

                  {/* Pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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

                    if (page < 1 || page > totalPages) return null

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
                  })}

                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <span className='px-3 py-2'>...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className='cursor-pointer'
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(currentPage + 1)}
                        className='cursor-pointer'
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Section catégories */}
          <div className='mt-16'>
            <h2 className='text-2xl font-bold text-center mb-8'>
              {t('blog.popular_categories')}
            </h2>
            <div className='flex flex-wrap justify-center gap-4'>
              {categories.map((category) => (
                <Badge
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? 'default' : 'outline'
                  }
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-white'
                  }`}
                  onClick={() => handleCategoryFilter(category.name)}
                >
                  {t(`blog.${category.name}`)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Blog
