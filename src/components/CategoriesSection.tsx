
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Scissors, Hammer, Droplets, Car, Music, Loader2, Wrench, Home, Zap, Paintbrush } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toolsService } from '@/services/toolsService';
import { Category } from '../types/bridge/tool.types';
import { useToast } from '@/hooks/use-toast';


const CategoriesSection = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Icon mapping for categories
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: any } = {
      'jardinage': Scissors,
      'gardening': Scissors,
      'bricolage': Hammer,
      'diy': Hammer,
      'nettoyage': Droplets,
      'cleaning': Droplets,
      'evenements': Music,
      'events': Music,
      'automobile': Car,
      'automotive': Car,
      'outillage': Wrench,
      'tools': Wrench,
      'maison': Home,
      'home': Home,
      'electricite': Zap,
      'electrical': Zap,
      'peinture': Paintbrush,
      'painting': Paintbrush
    };
    return iconMap[categoryName.toLowerCase()] || Hammer;
  };

  // Color mapping for categories
  const getCategoryColor = (index: number) => {
    const colors = [
      'bg-green-100 text-green-700',
      'bg-orange-100 text-orange-700', 
      'bg-blue-100 text-blue-700',
      'bg-pink-100 text-pink-700',
      'bg-purple-100 text-purple-700',
      'bg-yellow-100 text-yellow-700',
      'bg-red-100 text-red-700',
      'bg-indigo-100 text-indigo-700'
    ];
    return colors[index % colors.length];
  };

  // Image mapping for categories
  const getCategoryImage = (categoryName: string) => {
    const imageMap: { [key: string]: string } = {
      'jardinage': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'gardening': 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'bricolage': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'diy': 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'nettoyage': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'evenements': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      'events': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'
    };
    return imageMap[categoryName.toLowerCase()] || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
  };

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedCategories = await toolsService.getCategories();
        setCategories(fetchedCategories.data.slice(0, 4)); // Show only first 4 categories
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        // Fallback to hardcoded categories
        setCategories([
          { id: '1', name: 'jardinage', displayName: t('categories.gardening') },
          { id: '2', name: 'bricolage', displayName: t('categories.diy') },
          { id: '3', name: 'nettoyage', displayName: t('categories.cleaning') },
          { id: '4', name: 'evenements', displayName: t('categories.events') }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [t]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('categories.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('categories.description')}
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-gray-600">Chargement des catégories...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('categories.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('categories.description')}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 ">
          {categories.map((category, index) => {
            const IconComponent = getCategoryIcon(category.name);
            const categoryColor = getCategoryColor(index);
            const categoryImage = getCategoryImage(category.name);
            
            return (
              <Link
                key={category.id}
                to={`/search?categoryId=${category.id}`}
                className='group relative overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-lg transition-all duration-300'
              >
                <div className='aspect-square bg-gray-100 relative overflow-hidden'>
                  <img
                    src={categoryImage}
                    alt={category.displayName}
                    className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                  />
                  <div className='absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors' />
                  <div
                    className={`absolute top-4 left-4 p-2 rounded-lg ${categoryColor}`}
                  >
                    <IconComponent className='h-5 w-5' />
                  </div>
                </div>
                <div className='p-4'>
                  <h3 className='font-semibold text-gray-900 text-center'>
                    {t(`categories.${category.name}`)}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
