import React, { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, RotateCcw } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface FilterOptions {
  searchTerm: string
  statusFilter: string
  periodFilter: string
}

interface RequestsAndReservationsFiltersProps {
  data: any[]
  onFilteredDataChange: (filteredData: any[]) => void
  searchPlaceholder?: string
  statusOptions: { value: string; label: string }[]
}

const RequestsAndReservationsFilters = ({
  data,
  onFilteredDataChange,
  searchPlaceholder = "Rechercher par titre d'annonce...",
  statusOptions,
}: RequestsAndReservationsFiltersProps) => {
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    statusFilter: 'all',
    periodFilter: 'all',
  })
  const { t } = useLanguage()

  const [showSuggestions, setShowSuggestions] = useState(false)

  // Generate suggestions based on search term
  const suggestions = useMemo(() => {
    if (
      !filters.searchTerm ||
      filters.searchTerm.length < 2 ||
      !data ||
      !Array.isArray(data)
    )
      return []

    return data
      .filter((item) =>
        item?.toolName?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
      .map((item) => item.toolName)
      .filter((name, index, arr) => name && arr.indexOf(name) === index) // Remove duplicates and null values
      .slice(0, 5) // Limit to 5 suggestions
  }, [data, filters.searchTerm])

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    if (!data || !Array.isArray(data)) return []
    let result = [...data]

    // Search filter
    if (filters.searchTerm) {
      result = result.filter((item) =>
        item.toolName?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filters.statusFilter !== 'all') {
      result = result.filter((item) => item.status === filters.statusFilter)
    }

    // Period filter
    if (filters.periodFilter !== 'all') {
      const now = new Date()
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfYear = new Date(now.getFullYear(), 0, 1)

      result = result.filter((item) => {
        const itemDate = new Date(
          item.startDate || item.createdAt || Date.now()
        )

        switch (filters.periodFilter) {
          case 'week':
            return itemDate >= startOfWeek
          case 'month':
            return itemDate >= startOfMonth
          case 'year':
            return itemDate >= startOfYear
          default:
            return true
        }
      })
    }

    return result
  }, [data, filters])

  // Update parent component when filtered data changes
  React.useEffect(() => {
    onFilteredDataChange(filteredData)
  }, [filteredData, onFilteredDataChange])

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    if (key === 'searchTerm') {
      setShowSuggestions(value.length >= 2)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setFilters((prev) => ({ ...prev, searchTerm: suggestion }))
    setShowSuggestions(false)
  }

  const handleReset = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      periodFilter: 'all',
    })
    setShowSuggestions(false)
  }

  return (
    <div className='bg-white p-4 rounded-lg border mb-6 space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {/* Search field with suggestions */}
        <div className='relative'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder={searchPlaceholder}
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              onFocus={() => setShowSuggestions(filters.searchTerm.length >= 2)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className='pl-10'
            />
          </div>

          {/* Suggestions dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto'>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className='w-full text-left px-4 py-2 hover:bg-gray-50 border-b last:border-b-0'
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status filter */}
        <Select
          value={filters.statusFilter}
          onValueChange={(value) => handleFilterChange('statusFilter', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Filtrer par statut' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('request.all')}</SelectItem>
            {statusOptions && Array.isArray(statusOptions)
              ? statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {t(`status.${option.value.toLowerCase()}`)}
                  </SelectItem>
                ))
              : null}
          </SelectContent>
        </Select>

        {/* Period filter */}
        <Select
          value={filters.periodFilter}
          onValueChange={(value) => handleFilterChange('periodFilter', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder='Filtrer par période' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>{t('general.all_periods')}</SelectItem>
            <SelectItem value='week'>{t('general.week')}</SelectItem>
            <SelectItem value='month'>{t('general.month')}</SelectItem>
            <SelectItem value='year'>{t('general.year')}</SelectItem>
          </SelectContent>
        </Select>

        {/* Reset button */}
        <Button
          variant='outline'
          onClick={handleReset}
          className='flex items-center gap-2'
        >
          <RotateCcw className='h-4 w-4' />
          {t('request.reset')}
        </Button>
      </div>

      {/* Results count */}
      <div className='text-sm text-muted-foreground'>
        {filteredData.length} {t('request.results_found')}
      </div>
    </div>
  )
}

export default RequestsAndReservationsFilters
