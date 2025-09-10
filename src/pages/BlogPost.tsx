
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import SEOHead from '@/components/SEOHead';
import ShareDialog from '@/components/ShareDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateCanonicalUrl } from '@/utils/shareUtils';
import { newsService } from '@/services/newsService';
import { News } from '@/types/bridge/news.types';
import { useToast } from '@/hooks/use-toast';
import { Calendar, User, Clock, ArrowLeft, Loader2 } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [article, setArticle] = useState<News | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();

  // Load article by ID
  const loadArticle = async () => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const articleData = await newsService.getNewsById(id);
      setArticle(articleData);
      
      // Load related articles from the same category
      if (articleData.categoryId) {
        const relatedResponse = await newsService.getPublicNews({
          categoryId: articleData.categoryId,
          limit: 4,
          page: 1
        });
        // Filter out the current article
        const related = relatedResponse.data.filter(article => article.id !== id).slice(0, 3);
        setRelatedArticles(related);
      } else {
        // If no category, get latest articles excluding current one
        const latestResponse = await newsService.getPublicNews({
          limit: 4,
          page: 1,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        });
        const related = latestResponse.data.filter(article => article.id !== id).slice(0, 3);
        setRelatedArticles(related);
      }
    } catch (error: any) {
      console.error('Failed to load article:', error);
      setNotFound(true);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'article',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticle();
  }, [id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Chargement de l'article...</span>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article non trouvé</h1>
          <p className="text-gray-600 mb-6">L'article que vous recherchez n'existe pas ou a été supprimé.</p>
          <Link to="/blog" className="inline-flex items-center gap-2 text-accent hover:underline">
            <ArrowLeft className="h-4 w-4" />
            Retour au blog
          </Link>
        </div>
      </div>
    );
  }

  const post = article;

  const currentUrl = generateCanonicalUrl(`/blog/${post.id}`);
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
  };


  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={post.title}
        description={post.summary || post.title}
        image={post.imageUrl}
        url={currentUrl}
        type="article"
        author={getAuthorName(post)}
        publishedTime={new Date(post.createdAt).toISOString()}
        section={post.categoryId || 'blog'}
        tags={[post.categoryId || 'blog', 'outils', 'bricolage', 'location']}
      />
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link to="/blog" className="inline-flex items-center gap-2 text-accent hover:underline">
              <ArrowLeft className="h-4 w-4" />
              {t('blog.return')}
            </Link>
          </div>

          <article>
            <header className="mb-8">
              <Badge className="mb-4">{post.categoryId ? t(`blog.category.${categoryMap[post.categoryId]}`) : 'Non catégorisé'}</Badge>
              <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{getAuthorName(post)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>5{t('general.min')}</span>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <ShareDialog
                    url={currentUrl}
                    title={post.title}
                    excerpt={post.summary}
                  />
                </div>
              </div>

              <img 
                src={post.imageUrl || '/placeholder-blog.svg'} 
                alt={post.title}
                className="w-full h-96 object-cover rounded-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-blog.svg';
                }}
              />
            </header>

            <div className="prose prose-lg max-w-none mb-12">
              {post.summary && (
                <p className="text-lg text-gray-700 mb-6">{post.summary}</p>
              )}
              
              <div className="space-y-6 text-gray-700" dangerouslySetInnerHTML={{ __html: post.content }}>
              </div>
              
              {!post.content && (
              <div className="space-y-6 text-gray-700">
                <h2 className="text-2xl font-semibold">Introduction</h2>
                <p>
                  Le choix d'une perceuse est crucial pour réussir ses projets de bricolage. 
                  Que vous soyez débutant ou bricoleur expérimenté, il existe une perceuse 
                  adaptée à vos besoins et à votre budget.
                </p>

                <h2 className="text-2xl font-semibold">Les différents types de perceuses</h2>
                <h3 className="text-xl font-medium">1. Perceuse filaire</h3>
                <p>
                  La perceuse filaire offre une puissance constante et convient parfaitement 
                  pour les gros travaux. Elle ne nécessite pas de recharge et peut être utilisée 
                  en continu.
                </p>

                <h3 className="text-xl font-medium">2. Perceuse sans fil</h3>
                <p>
                  Plus pratique et maniable, la perceuse sans fil est idéale pour les travaux 
                  en extérieur ou dans des endroits difficiles d'accès. L'autonomie de la 
                  batterie est un critère important à considérer.
                </p>

                <h2 className="text-2xl font-semibold">Critères de choix</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Puissance et couple de serrage</li>
                  <li>Type de mandrin (auto-serrant ou à clé)</li>
                  <li>Vitesse de rotation variable</li>
                  <li>Présence d'un mode percussion</li>
                  <li>Ergonomie et poids</li>
                  <li>Accessoires inclus</li>
                </ul>

                <h2 className="text-2xl font-semibold">Nos recommandations</h2>
                <p>
                  Pour débuter, nous recommandons une perceuse visseuse sans fil de 18V 
                  avec deux batteries. Cela vous permettra de réaliser la plupart des 
                  travaux domestiques sans contrainte.
                </p>

                <p>
                  N'hésitez pas à louer différents modèles sur Bricola LTD pour tester 
                  et trouver la perceuse qui correspond le mieux à vos besoins avant 
                  de faire un achat.
                </p>
              </div>
              )}
            </div>

            {/* Articles similaires */}
            {relatedArticles.length > 0 && (
            <div className="border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">{t('blog.similar_articles')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((relatedPost) => (
                  <Card key={relatedPost.id} className="hover:shadow-lg transition-shadow">
                    <img 
                      src={relatedPost.imageUrl || '/placeholder-blog.svg'} 
                      alt={relatedPost.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-blog.svg';
                      }}
                    />
                    <CardContent className="p-4">
                      <Badge className="mb-2">{relatedPost.categoryId ? t(`blog.category.${categoryMap[relatedPost.categoryId]}`) : 'Non catégorisé'}</Badge>
                      <h3 className="font-semibold mb-2">
                        <Link to={`/blog/${relatedPost.id}`} className="hover:text-accent">
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600">{relatedPost.summary}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            )}
          </article>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
