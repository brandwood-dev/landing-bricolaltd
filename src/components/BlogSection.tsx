import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { newsService } from '@/services/newsService'
import { News } from '@/types/bridge/news.types'
import { Calendar, User, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

const BlogSection = () => {
  const [latestPosts, setLatestPosts] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage()

  // Load latest blog posts
  useEffect(() => {
    const loadLatestPosts = async () => {
      try {
        const posts = await newsService.getLatestNews(3)
        setLatestPosts(posts)
      } catch (error) {
        console.warn('Failed to load latest blog posts:', error)
        // Fail silently for homepage component
      } finally {
        setLoading(false)
      }
    }

    loadLatestPosts()
  }, [])

  // Format date
  const formatDate = (dateString: string) => {
    const locale = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'ar-SA'
    return new Date(dateString).toLocaleDateString(locale, {
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
    return t('blog.author.bricola_team')
 }

  // Get translated category name
  const getCategoryName = (category: string) => {
    const translationKey = `blog.${category}`
    const translated = t(translationKey)
    // If translation returns the key itself, it means no translation found, return original
    return translated === translationKey ? category : translated
  }

  if (loading) {
    return (
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl md:text-4xl font-bold mb-4'>
              {t('blog_section.title')}
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              {t('blog_section.description')}
            </p>
          </div>
          <div className='flex justify-center'>
            <Loader2 className='h-8 w-8 animate-spin' />
          </div>
        </div>
      </section>
    )
  }

  if (latestPosts.length === 0) {
    return null // Don't render the section if no posts
  }

  return (
    <section className='py-20 bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold mb-4'>
            {t('blog_section.title')}
          </h2>
          <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
            {t('blog_section.description')}
          </p>
        </div>

        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className='w-full mb-12'
        >
          <CarouselContent className='-ml-2 md:-ml-4'>
            {latestPosts.map((post) => (
              <CarouselItem
                key={post.id}
                className='pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3'
              >
                <Card className='overflow-hidden hover:shadow-lg transition-shadow card-hover h-full'>
                  <img
                    src={post.imageUrl || '/placeholder-blog.jpg'}
                    alt={post.title}
                    className='w-full h-48 object-cover'
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      if (
                        target.src !==
                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDQwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjxzdmcgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMTY4IiB5PSI2NCI+CjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0yMSAxNS01LTUtNSA1IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'
                      ) {
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDQwMCAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+Cjxzdmcgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeD0iMTY4IiB5PSI2NCI+CjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Im0yMSAxNS01LTUtNSA1IiBzdHJva2U9IiM5Q0EzQUYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo8L3N2Zz4K'
                      }
                    }}
                  />
                  <CardContent className='p-6'>
                    <Badge className='mb-3'>{getCategoryName(post.category)}</Badge>
                    <h3 className='text-xl font-semibold mb-3'>
                      <Link
                        to={`/blog/${post.id}`}
                        className='hover:text-accent transition-colors'
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className='text-gray-600 mb-4 line-clamp-2'>
                      {post.summary || post.title}
                    </p>
                    <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                      <div className='flex items-center gap-1'>
                        <User className='h-4 w-4' />
                        <span>{getAuthorName(post)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='h-4 w-4' />
                        <span>{formatDate(post.createdAt.toString())}</span>
                      </div>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <Button variant='outline' size='sm' className='w-full'>
                        {t('blog_section.read_article')}
                        <ArrowRight className='h-4 w-4 ml-2' />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className='hidden md:flex' />
          <CarouselNext className='hidden md:flex' />
        </Carousel>

        <div className='text-center'>
          <Link to='/blog'>
            <Button size='lg' variant='outline'>
              {t('blog_section.view_all')}
              <ArrowRight className='h-4 w-4 ml-2' />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default BlogSection
