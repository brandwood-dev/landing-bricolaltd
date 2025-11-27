import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Grid, List, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { ToolsService } from '@/services/toolsService'
import { Category } from '@/types/bridge/tool.types'

interface SearchAndFiltersProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  validationFilter: string
  onValidationFilterChange: (value: string) => void
  publicationFilter: string
  onPublicationFilterChange: (value: string) => void
  categoryFilter: string
  onCategoryFilterChange: (value: string) => void
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

const MyAdsSearchAndFilters = ({
  searchTerm,
  onSearchChange,
  validationFilter,
  onValidationFilterChange,
  publicationFilter,
  onPublicationFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  viewMode,
  onViewModeChange,
}: SearchAndFiltersProps) => {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)
  const toolsService = new ToolsService()

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError(null)
        const fetchedCategories = await toolsService.getCategories()
        setCategories(fetchedCategories)
      } catch (error) {
        setCategoriesError('Failed to load categories')
      } finally {
        setCategoriesLoading(false)
      }
    }

    loadCategories()
  }, [])
  return (
    <div className='space-y-4 mb-6'>
      {/* Barre de recherche */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
        <Input
          placeholder={t('ads.search')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='pl-10'
        />
      </div>

      {/* Filtres */}
      <div className='space-y-4'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          <Select
            value={validationFilter}
            onValueChange={onValidationFilterChange}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Statut validation' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('general.status')}</SelectItem>
              <SelectItem value='confirmed'>
                {t('general.confirmed')}
              </SelectItem>
              <SelectItem value='rejected'>{t('general.rejected')}</SelectItem>
              <SelectItem value='pending'>{t('general.pending')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={publicationFilter}
            onValueChange={onPublicationFilterChange}
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Statut publication' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('general.public')}</SelectItem>
              <SelectItem value='published'>
                {t('general.published')}
              </SelectItem>
              <SelectItem value='unpublished'>
                {t('general.unpublished')}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className='w-full'>
              <SelectValue placeholder='Catégorie' />
              {categoriesLoading && (
                <Loader2 className='h-4 w-4 animate-spin ml-2' />
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>{t('general.categories')}</SelectItem>
              {categoriesError ? (
                <SelectItem value='error' disabled>
                  Erreur de chargement
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {t(`category.${category.name}`)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Mode d'affichage */}
        <div className='flex justify-center sm:justify-end gap-2'>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size='sm'
            onClick={() => onViewModeChange('grid')}
            className='flex items-center gap-2'
          >
            <Grid className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('general.grid')}</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size='sm'
            onClick={() => onViewModeChange('list')}
            className='flex items-center gap-2'
          >
            <List className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('general.list')}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MyAdsSearchAndFilters
