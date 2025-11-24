
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { newsService } from '@/services/newsService';
import { News, NewsCategory, NewsFilters } from '../types/bridge/news.types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, Clock, Loader2, ArrowRight, TrendingUp, Eye } from 'lucide-react';

const Blog = () => {
  const { t, language } = useLanguage();
  const [currentPage, setCurrentPage] = useState(1);
  const [articles, setArticles] = useState<News[]>([]);
  const [featuredArticle, setFeaturedArticle] = useState<News | null>(null);
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
    { id: '12', name: 'Guide', displayName: 'Guide' }
  ];
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const itemsPerPage = 6;

  // Load articles
  const loadArticles = async (page: number = currentPage, category: string = selectedCategory) => {
    try {
      setError(null);
      const filters: NewsFilters = {
        page,
        limit: 6,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      if (category) {
        filters.category = category;
      }
      
      const response = await newsService.getPublicNews(filters);
      
      setArticles(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotalArticles(response.total || 0);
    } catch (error: any) {
      console.error('Failed to load articles:', error);
      setError(error.message || 'Failed to load articles');
      
      // Show fallback demo data when API is not available
      if (error.message?.includes('Network Error')) {
        setArticles([
          {
            id: 'demo-1',
            title: 'Guide complet du bricolage pour débutants',
            content: 'Découvrez les bases essentielles du bricolage avec nos conseils d\'experts...',
            summary: 'Apprenez les techniques fondamentales du bricolage avec ce guide complet pour débutants.',
            category: 'Bricolage',
            imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
            isPublic: true,
            isFeatured: true,
            createdAt: new Date('2024-01-15'),
            updatedAt: new Date('2024-01-15'),
            admin: {
              id: 'demo-admin',
              firstName: 'Jean',
              lastName: 'Dupont',
              email: 'jean@bricola.fr'
            }
          },
          {
            id: 'demo-2',
            title: '10 astuces de jardinage pour un jardin magnifique',
            content: 'Transformez votre jardin avec ces astuces simples mais efficaces...',
            summary: 'Découvrez 10 astuces de jardinage qui transformeront votre espace extérieur.',
            category: 'Jardinage',
            imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
            isPublic: true,
            isFeatured: false,
            createdAt: new Date('2024-01-10'),
            updatedAt: new Date('2024-01-10'),
            admin: {
              id: 'demo-admin-2',
              firstName: 'Marie',
              lastName: 'Martin',
              email: 'marie@bricola.fr'
            }
          },
          {
            id: 'demo-3',
            title: 'Comment choisir les bons outils de construction',
            content: 'Un guide complet pour sélectionner les outils adaptés à vos projets...',
            summary: 'Apprenez à choisir les bons outils de construction pour vos projets.',
            category: 'Construction',
            imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800',
            isPublic: true,
            isFeatured: false,
            createdAt: new Date('2024-01-05'),
            updatedAt: new Date('2024-01-05'),
            admin: {
              id: 'demo-admin-3',
              firstName: 'Pierre',
              lastName: 'Bernard',
              email: 'pierre@bricola.fr'
            }
          }
        ]);
        setTotalPages(1);
        setTotalArticles(3);
      } else {
        setArticles([]);
        setTotalPages(1);
        setTotalArticles(0);
        toast({
          title: 'Erreur',
          description: error.message || 'Impossible de charger les articles',
          variant: 'destructive'
        });
      }
    }
  };

  // Load random featured article
  const loadFeaturedArticle = async () => {
    try {
      const response = await newsService.getPublicNews({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      if (response.data && response.data.length > 0) {
        // Select a random article from the first 10 articles
        const randomIndex = Math.floor(Math.random() * response.data.length);
        setFeaturedArticle(response.data[randomIndex]);
      }
    } catch (error: any) {
      console.warn('Failed to load featured article:', error.message);
    }
  };



  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await Promise.all([
        loadArticles(),
        loadFeaturedArticle()
      ]);
      setLoading(false);
    };
    
    initializeData();
  }, []);

  // Reload articles when page or category changes
  useEffect(() => {
    if (!loading) {
      loadArticles(currentPage, selectedCategory);
    }
  }, [currentPage, selectedCategory]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get author name
  const getAuthorName = (article: News) => {
    if (article.admin) {
      return `${article.admin.firstName} ${article.admin.lastName}`;
    }
    return 'Équipe Bricola';
  };

  // Calculate reading time
  const getReadingTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content?.split(/\s+/).length || 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };

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
  };

  // Get category key for translations
  const getCategoryKey = (category: string) => {
    const keyMap = {
      'Jardinage': 'gardening',
      'Entretien': 'maintenance',
      'Transport': 'transport',
      'Bricolage': 'diy',
      'Électricité': 'electricity',
      'Éclairage': 'lighting',
      'Peinture': 'painting',
      'Construction': 'construction',
      'Plantes': 'plants',
      'Nettoyage': 'cleaning',
      'Décoration': 'decoration',
      'Guide': 'guide'
    };
    return keyMap[category as keyof typeof keyMap] || 'general';
  };

  // // Get category name
  // const getCategoryName = (categoryId?: string) => {
  //   if (!categoryId) return t('blog.category.general');
  //   const category = categories.find(cat => cat.id === categoryId);
  //   return category?.displayName || category?.name || t('blog.category.general');
  // };

  // Handle category filter
  const handleCategoryFilter = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(categoryName);
    }
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 bg-blue-600/20 rounded-full animate-pulse" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Chargement des articles</h3>
          <p className="text-gray-600">Préparation de votre expérience de lecture...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && articles.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <Header />
        <main className="py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-xl p-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔧</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Service temporairement indisponible</h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
                Nous rencontrons actuellement des difficultés techniques pour charger les articles. 
                Notre équipe travaille à résoudre ce problème dans les plus brefs délais.
              </p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                Réessayer
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">{t('blog.title')}</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('blog.description')}
            </p>
          </div>

          {/* Article principal en vedette */}
          {featuredArticle && (
            <div className="mb-16">
              <div className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-700">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all duration-500" />
                <div className="relative">
                  <img 
                    src={featuredArticle.imageUrl || '/placeholder-blog.svg'} 
                    alt={featuredArticle.title}
                    className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-blog.svg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center gap-3 mb-4">
                      <TrendingUp className="h-5 w-5 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wide">Article en vedette</span>
                    </div>
                    
                    <Badge className={`mb-4 ${getCategoryColor(featuredArticle.category || '')} border-0`}>
                      {t(`blog.${featuredArticle.category}`) || t('blog.category.general')}
                    </Badge>
                    
                    <h2 className="text-4xl font-bold mb-4 leading-tight">
                      <Link to={`/blog/${featuredArticle.id}`} className="hover:text-yellow-400 transition-colors duration-300">
                        {featuredArticle.title}
                      </Link>
                    </h2>
                    
                    <p className="text-lg text-gray-200 mb-6 line-clamp-3">
                      {featuredArticle.summary}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{getAuthorName(featuredArticle)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(featuredArticle.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{getReadingTime(featuredArticle.content)} min de lecture</span>
                        </div>
                      </div>
                      
                      <Link 
                        to={`/blog/${featuredArticle.id}`}
                        className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-6 py-3 rounded-full transition-all duration-300 group-hover:scale-105"
                      >
                        Lire l'article
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Grille d'articles modernisée */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {articles.map((article) => (
              <article key={article.id} className="group relative">
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="relative overflow-hidden">
                    <img 
                      src={article.imageUrl || '/placeholder-blog.svg'} 
                      alt={article.title}
                      className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-blog.svg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="absolute top-4 right-4">
                      <Badge className={`${getCategoryColor(article.category || '')} backdrop-blur-sm bg-opacity-80 border-0`}>
                        {t(`blog.${article.category}`) || t('blog.category.general')}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{Math.floor(Math.random() * 500) + 100}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{getReadingTime(article.content)} min</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-3 group-hover:text-accent transition-colors">
                      <Link to={`/blog/${article.id}`} className="line-clamp-2">
                        {article.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                      {article.summary}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {getAuthorName(article).charAt(0)}
                        </div>
                        <span className="font-medium">{getAuthorName(article)}</span>
                      </div>
                      
                      <Link 
                        to={`/blog/${article.id}`}
                        className="inline-flex items-center gap-1 text-accent hover:text-accent-dark font-semibold text-sm group-hover:gap-2 transition-all"
                      >
                        Lire
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mb-16">
              <Pagination>
                <PaginationContent className={language === 'ar' ? "[direction:ltr]" : ''}>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(currentPage - 1)}
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                  
                  {/* First page */}
                  {currentPage > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(1)}
                          className="cursor-pointer"
                        >
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {currentPage > 4 && (
                        <PaginationItem>
                          <span className="px-3 py-2">...</span>
                        </PaginationItem>
                      )}
                    </>
                  )}
                  
                  {/* Pages around current page */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    
                    if (page < 1 || page > totalPages) return null;
                    
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  {/* Last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <PaginationItem>
                          <span className="px-3 py-2">...</span>
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink
                          onClick={() => setCurrentPage(totalPages)}
                          className="cursor-pointer"
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
                        className="cursor-pointer"
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {/* Section catégories modernisée */}
          <div className={`mt-20 ${language === 'ar' ? '[direction:rtl]' : ''}`}>
            {/* Network error indicator */}
            {error && (
              <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-600">⚠️</span>
                  <div>
                    <p className="text-yellow-800 font-medium">Mode hors ligne</p>
                    <p className="text-yellow-700 text-sm">Affichage des articles de démonstration</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className={`text-center mb-12 ${language === 'ar' ? '[direction:rtl]' : ''}`}>
              <h2 className="text-3xl font-bold mb-4">{t('blog.popular_categories')}</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                {t('blog.popular_categories.subtitle')}
              </p>
            </div>
            
            <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ${language === 'ar' ? '[direction:rtl]' : ''}`}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.name)}
                  className={`group relative overflow-hidden rounded-lg p-3 text-left transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.name 
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg' 
                      : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <div className="relative z-10">
                    <div className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                        selectedCategory === category.name 
                          ? 'bg-white/20 backdrop-blur-sm' 
                          : getCategoryColor(category.name).split(' ')[0]
                      }`}>
                        <span className="text-lg">
                          {category.name === 'Jardinage' && '🌱'}
                          {category.name === 'Entretien' && '🔧'}
                          {category.name === 'Transport' && '🚚'}
                          {category.name === 'Bricolage' && '🔨'}
                          {category.name === 'Électricité' && '⚡'}
                          {category.name === 'Éclairage' && '💡'}
                          {category.name === 'Peinture' && '🎨'}
                          {category.name === 'Construction' && '🏗️'}
                          {category.name === 'Plantes' && '🌿'}
                          {category.name === 'Nettoyage' && '🧹'}
                          {category.name === 'Décoration' && '🖼️'}
                          {category.name === 'Guide' && '📖'}
                        </span>
                      </div>
                      <div className={`flex-1 min-w-0 ${language === 'ar' ? 'text-right' : ''}`}>
                        <h3 className="font-semibold text-sm mb-1">{t(`blog.${category.name}`)}</h3>
                        <p className={`text-xs leading-tight ${
                          selectedCategory === category.name ? 'text-white/80' : 'text-gray-600'
                        } ${language === 'ar' ? 'text-right' : ''}`}>
                          {t(`blog.category.${getCategoryKey(category.name)}.desc`)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedCategory === category.name && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
