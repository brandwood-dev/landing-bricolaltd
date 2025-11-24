import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import SEOHead from '@/components/SEOHead'
import ShareDialog from '@/components/ShareDialog'
import ImageCarousel from '@/components/ImageCarousel'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { generateCanonicalUrl, ensureAbsoluteUrl } from '@/utils/shareUtils'
import { newsService } from '@/services/newsService'
import { News } from '@/types/bridge/news.types'
import { useToast } from '@/hooks/use-toast'
import { Calendar, User, Clock, ArrowLeft, ArrowRight, Loader2, Eye, Share2, ChevronRight } from 'lucide-react'

const BlogPost = () => {
  const { id } = useParams()
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [article, setArticle] = useState<News | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const { toast } = useToast()

  // Load article by ID
  const loadArticle = async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const articleData = await newsService.getNewsById(id)
      setArticle(articleData)

      // Load related articles from the same category
      if (articleData.category) {
        const relatedResponse = await newsService.getPublicNews({
          category: articleData.category,
          limit: 4,
          page: 1,
        })
        // Filter out the current article
        const related = relatedResponse.data
          .filter((article) => article.id !== id)
          .slice(0, 3)
        setRelatedArticles(related)
      } else {
        // If no category, get latest articles excluding current one
        const latestResponse = await newsService.getPublicNews({
          limit: 4,
          page: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        })
        const related = latestResponse.data
          .filter((article) => article.id !== id)
          .slice(0, 3)
        setRelatedArticles(related)
      }
    } catch (error: any) {
      setNotFound(true)
      toast({
        title: 'Erreur',
        description: "Impossible de charger l'article",
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticle()
  }, [id])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Calculate reading time
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  // Get category color
  const getCategoryColor = (category: string) => {
    const colors = {
      'Jardinage': 'bg-green-100 text-green-800',
      'Entretien': 'bg-blue-100 text-blue-800',
      'Transport': 'bg-purple-100 text-purple-800',
      'Bricolage': 'bg-orange-100 text-orange-800',
      'Électricité': 'bg-yellow-100 text-yellow-800',
      'Éclairage': 'bg-amber-100 text-amber-800',
      'Peinture': 'bg-pink-100 text-pink-800',
      'Construction': 'bg-gray-100 text-gray-800',
      'Plantes': 'bg-emerald-100 text-emerald-800',
      'Nettoyage': 'bg-cyan-100 text-cyan-800',
      'Décoration': 'bg-rose-100 text-rose-800',
      'Guide': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  }

  // Get author name
  const getAuthorName = (article: News) => {
    if (article.admin) {
      return `${article.admin.firstName} ${article.admin.lastName}`
    }
    return 'Équipe Bricola'
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='flex items-center space-x-2'>
          <Loader2 className='h-6 w-6 animate-spin' />
          <span>Chargement de l'article...</span>
        </div>
      </div>
    )
  }

  if (notFound || !article) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            Article non trouvé
          </h1>
          <p className='text-gray-600 mb-6'>
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Link
            to='/blog'
            className='inline-flex items-center gap-2 text-accent hover:underline'
          >
            <ArrowLeft className='h-4 w-4' />
            Retour au blog
          </Link>
        </div>
      </div>
    )
  }

  const post = article

  const currentUrl = generateCanonicalUrl(`/blog/${post.id}`)
  const absoluteImage = ensureAbsoluteUrl(post.imageUrl)
  // Optional: shareHtml URL for crawlers (used internally by shareUtils for FB/LinkedIn)
  const shareHtmlUrl = `${generateCanonicalUrl(`/api/news/${post.id}/share`)}`
  const categoryMap: Record<string, string> = {
    Jardinage: 'gardening',
    Entretien: 'maintenance',
    Sécurité: 'safety',
    Nouveautés: 'updates',
    Guides: 'guide',
    Transport: 'transport',
    Bricolage: 'diy',
    Electricité: 'electricity',
    Éclairage: 'lighting',
    Peinture: 'painting',
    Construction: 'construction',
    Plantes: 'plants',
    Nettoyage: 'cleaning',
    Décoration: 'decoration',
  }

  return (
    <div className='min-h-screen bg-background'>
      <SEOHead
        title={post.title}
        description={post.summary || post.title}
        image={absoluteImage}
        url={currentUrl}
        type='article'
        author={getAuthorName(post)}
        publishedTime={new Date(post.createdAt).toISOString()}
        section={post.category || 'blog'}
        tags={[post.category || 'blog', 'outils', 'bricolage', 'location']}
      />
      <Header />
      <main className='py-20'>
        <div className='max-w-5xl mx-auto px-4'>
          {/* Navigation breadcrumb */}
          <nav className='mb-8' aria-label='Breadcrumb'>
            <ol className='flex items-center space-x-2 text-sm text-gray-600'>
              <li>
                <Link to='/' className='hover:text-accent transition-colors'>Accueil</Link>
              </li>
              <li>
                <ChevronRight className='h-4 w-4' />
              </li>
              <li>
                <Link to='/blog' className='hover:text-accent transition-colors'>Blog</Link>
              </li>
              <li>
                <ChevronRight className='h-4 w-4' />
              </li>
              <li className='text-gray-900 font-medium max-w-xs truncate'>
                {post.title}
              </li>
            </ol>
          </nav>

          <article className='bg-white rounded-2xl shadow-xl overflow-hidden'>
            {/* Hero section */}
            <div className='relative h-96 md:h-[500px] overflow-hidden'>
              <img
                src={absoluteImage || '/placeholder-blog.svg'}
                alt={post.title}
                className='w-full h-full object-cover'
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/placeholder-blog.svg'
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
              
              <div className='absolute top-6 left-6 right-6 flex justify-between items-start'>
                <Link
                  to='/blog'
                  className='inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-900 px-4 py-2 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl'
                >
                  <ArrowLeft className='h-4 w-4' />
                  <span className='font-medium'>Retour</span>
                </Link>
                
                <div className='flex gap-3'>
                  <ShareDialog
                    url={currentUrl}
                    title={post.title}
                    excerpt={post.summary}
                    imageUrl={absoluteImage || '/placeholder-blog.svg'}
                  />
                </div>
              </div>
              
              <div className='absolute bottom-0 left-0 right-0 p-8 text-white'>
                <Badge className={`mb-4 ${getCategoryColor(post.category || '')} backdrop-blur-sm bg-opacity-90 border-0`}>
                  {post.category ? post.category : t('blog.category.general')}
                </Badge>
                <h1 className='text-4xl md:text-5xl font-bold leading-tight mb-4'>
                  {post.title}
                </h1>
                
                <div className='flex items-center gap-6 text-sm text-gray-200'>
                  <div className='flex items-center gap-2'>
                    <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold'>
                      {getAuthorName(post).charAt(0)}
                    </div>
                    <span className='font-medium'>{getAuthorName(post)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='h-4 w-4' />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Clock className='h-4 w-4' />
                    <span>{getReadingTime(post.content)} min de lecture</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Eye className='h-4 w-4' />
                    <span>{Math.floor(Math.random() * 1000) + 500}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Article content */}
            <div className='p-8 md:p-12'>
              {/* Summary card */}
              {post.summary && (
                <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 mb-12 border-l-4 border-blue-500'>
                  <h2 className='text-xl font-semibold text-gray-900 mb-3'>En résumé</h2>
                  <p className='text-gray-700 text-lg leading-relaxed'>{post.summary}</p>
                </div>
              )}

              {/* Main content with sections support */}
              <div className='prose prose-lg max-w-none'>
                {/* Check if article has sections (new format) or just content (old format) */}
                {(post as any).sections && (post as any).sections?.length > 0 ? (
                  // New format with sections - Images first, then paragraphs
                  <div className='space-y-16'>
                    {(post as any).sections.slice().reverse().map((section: any, index: number) => (
                      <section key={section.id} className='scroll-mt-20'>
                        {section.title && (
                          <h2 className='text-2xl font-bold text-gray-900 mb-8 border-b-2 border-gray-100 pb-4'>
                            {section.title}
                          </h2>
                        )}
                        
                        {/* Text wrapping layout for carousel and paragraphs */}
                        <div className={`relative ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                          {/* Images en carousel - floated to allow text wrapping */}
                          {section.images?.length > 0 && section.paragraphs?.length > 0 && (
                            <div className={`w-full md:w-1/2 mb-4 ${language === 'ar' ? 'md:float-right md:ml-8' : 'md:float-left md:mr-8'}`}>
                              <ImageCarousel
                                images={section.images}
                                title={section.title}
                                className="mb-0"
                                language={language}
                              />
                            </div>
                          )}
                          
                          {/* Paragraphes qui s'enroulent autour du carousel */}
                          {section.paragraphs?.length > 0 && section.images?.length > 0 && (
                            <div className="space-y-6">
                              {section.paragraphs.map((paragraph: any) => (
                                <div key={paragraph.id} className='text-gray-700 leading-relaxed text-lg'>
                                  {paragraph.content}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Si seulement des images sans paragraphes */}
                          {section.images?.length > 0 && (!section.paragraphs || section.paragraphs.length === 0) && (
                            <div className="w-full">
                              <ImageCarousel
                                images={section.images}
                                title={section.title}
                                className="mb-0"
                                language={language}
                              />
                            </div>
                          )}
                          
                          {/* Si seulement des paragraphes sans images */}
                          {section.paragraphs?.length > 0 && (!section.images || section.images.length === 0) && (
                            <div className={`space-y-6 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                              {section.paragraphs.map((paragraph: any) => (
                                <div key={paragraph.id} className='text-gray-700 leading-relaxed text-lg'>
                                  {paragraph.content}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Clear float seulement si les deux sont présents */}
                          {section.images?.length > 0 && section.paragraphs?.length > 0 && (
                            <div className="clear-both"></div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                ) : (
                  // Old format with just content
                  <div className='space-y-6 text-gray-700 leading-relaxed text-lg'>
                    {post.summary && (
                      <p className='text-xl text-gray-600 font-medium leading-relaxed'>
                        {post.summary}
                      </p>
                    )}
                    
                    <div
                      dangerouslySetInnerHTML={{ __html: post.content }}
                      className='prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:hover:text-blue-800 prose-strong:text-gray-900 prose-ul:list-disc prose-ol:list-decimal prose-li:text-gray-700'
                    />
                    
                    {!post.content && (
                      <div className='text-center py-12'>
                        <div className='text-gray-400 mb-4'>
                          <div className='w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                            <span className='text-2xl'>📝</span>
                          </div>
                        </div>
                        <p className='text-gray-500 text-lg'>Aucun contenu disponible pour cet article.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Article footer */}
              <div className='mt-16 pt-8 border-t border-gray-200'>
                <div className='flex items-center justify-between mb-8'>
                  <div className='text-sm text-gray-500'>
                    <p>Publié le {formatDate(post.createdAt)}</p>
                    {post.updatedAt !== post.createdAt && (
                      <p>Mis à jour le {formatDate(post.updatedAt)}</p>
                    )}
                  </div>
                  
                  <div className='flex gap-3'>
                    <ShareDialog
                      url={currentUrl}
                      title={post.title}
                      excerpt={post.summary}
                      imageUrl={absoluteImage || '/placeholder-blog.svg'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Articles similaires */}
          {relatedArticles.length > 0 && (
            <div className='mt-16'>
              <div className='text-center mb-12'>
                <h2 className='text-3xl font-bold mb-4'>
                  {t('blog.similar_articles')}
                </h2>
                <p className='text-gray-600 max-w-2xl mx-auto'>
                  Découvrez d'autres articles qui pourraient vous intéresser
                </p>
              </div>
              
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
                {relatedArticles.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className='group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'
                  >
                    <div className='relative overflow-hidden'>
                      <img
                        src={relatedPost.imageUrl || '/placeholder-blog.svg'}
                        alt={relatedPost.title}
                        className='w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500'
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/placeholder-blog.svg'
                        }}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                    </div>
                    
                    <CardContent className='p-6'>
                      <Badge className={`mb-3 ${getCategoryColor(relatedPost.category || '')} border-0`}>
                        {relatedPost.category || 'Non catégorisé'}
                      </Badge>
                      <h3 className='font-bold text-lg mb-3 group-hover:text-accent transition-colors line-clamp-2'>
                        <Link to={`/blog/${relatedPost.id}`}>
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className='text-sm text-gray-600 mb-4 line-clamp-3'>
                        {relatedPost.summary}
                      </p>
                      <div className='flex items-center justify-between text-xs text-gray-500'>
                        <span>{getReadingTime(relatedPost.content)} min de lecture</span>
                        <Link 
                          to={`/blog/${relatedPost.id}`}
                          className='text-accent hover:text-accent-dark font-semibold flex items-center gap-1 group-hover:gap-2 transition-all'
                        >
                          Lire
                          <ArrowRight className='h-3 w-3 group-hover:translate-x-1 transition-transform' />
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default BlogPost
