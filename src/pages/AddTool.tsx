import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Upload,
  Camera,
  Euro,
  Shield,
  MapPin,
  Tag,
  FileText,
  Settings,
  Calendar,
  Loader2,
  X,
} from 'lucide-react'
import { toolsService } from '@/services/toolsService'
import { CreateToolData } from '@/types/bridge/tool.types'
import MapboxLocationPicker from '@/components/MapboxLocationPicker'

const AddTool = () => {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  // Debug logs pour le pays de l'utilisateur
  console.log('🔍 [AddTool] Debug user country data:', {
    user: user,
    'user?.country': user?.country,
    'user?.countryId': user?.countryId,
    'user?.country || user?.countryId': user?.country || user?.countryId,
    'typeof user?.country': typeof user?.country,
    'typeof user?.countryId': typeof user?.countryId,
  })

  // Déterminer le pays de l'utilisateur avec fallback
  const userCountryCode = user?.countryId || user?.country?.code || user?.country || 'BH'
  console.log('🌍 [AddTool] Final user country code:', userCountryCode)

  // Form state
  const [formData, setFormData] = useState<Partial<CreateToolData>>({
    title: '',
    brand: '',
    model: '',
    year: undefined,
    description: '',
    categoryId: '',
    subcategoryId: '',
    condition: undefined,
    basePrice: undefined,
    depositAmount: undefined,
    pickupAddress: '',
    latitude: undefined,
    longitude: undefined,
    ownerInstructions: '',
  })

  // File upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [primaryPhotoIndex, setPrimaryPhotoIndex] = useState<number>(0)

  // UI state
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [isAddressSelected, setIsAddressSelected] = useState(false)

  // Categories state
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('')

  // Name validation state
  const [nameValidation, setNameValidation] = useState<{
    isChecking: boolean
    isUnique: boolean | null
    message: string
  }>({ isChecking: false, isUnique: null, message: '' })

  // Check name uniqueness
  const checkNameUniqueness = async (name: string) => {
    if (!name.trim()) {
      setNameValidation({ isChecking: false, isUnique: null, message: '' })
      return
    }

    setNameValidation({
      isChecking: true,
      isUnique: null,
      message: t('addtool.verification_in_progress'),
    })

    try {
      const result = await toolsService.checkNameUniqueness(name.trim())

      if (result.isUnique) {
        setNameValidation({
          isChecking: false,
          isUnique: true,
          message: t('addtool.name_available'),
        })
      } else {
        setNameValidation({
          isChecking: false,
          isUnique: false,
          message: t('addtool.name_already_used'),
        })
      }
    } catch (error: any) {
      let errorMessage = t('addtool.error_occurred')
      if (error.response?.status === 404) {
        errorMessage = t('addtool.error_occurred')
      } else if (error.response?.status >= 500) {
        errorMessage = t('addtool.error_occurred')
      } else if (error.message) {
        errorMessage = t('addtool.error_occurred')
      }

      setNameValidation({
        isChecking: false,
        isUnique: null,
        message: errorMessage,
      })
    }
  }

  // Input change handler
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Handle category change to load subcategories
    if (field === 'categoryId' && value) {
      loadSubcategories(value)
      setFormData((prev) => ({ ...prev, subcategoryId: '' })) // Reset subcategory
    }
  }

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categoriesData = await toolsService.getCategories()
        setCategories(categoriesData || [])

        // Debug: Log user country for Mapbox configuration
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les catégories',
          variant: 'destructive',
        })
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [user])

  // Load subcategories when category changes
  const loadSubcategories = async (categoryId: string) => {
    try {
      const subcategoriesData = await toolsService.getSubcategoriesByCategory(
        categoryId
      )
      setSubcategories(subcategoriesData || [])
    } catch (error) {
      setSubcategories([])
    }
  }

  // File input handler
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    // Vérifier la taille de chaque fichier (1MB maximum)
    const maxSize = 1048576 // 1MB en bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      toast({
        title: 'Fichier trop volumineux',
        description: `Les images ne doivent pas dépasser 1MB. ${oversizedFiles.length} fichier(s) ignoré(s).`,
        variant: 'destructive',
      })
      // Filtrer les fichiers qui respectent la limite de taille
      const validFiles = files.filter((file) => file.size <= maxSize)
      if (validFiles.length === 0) return

      // Continuer avec les fichiers valides
      if (validFiles.length + selectedFiles.length > 10) {
        toast({
          title: 'Limite atteinte',
          description: 'Vous ne pouvez ajouter que 10 photos maximum',
          variant: 'destructive',
        })
        return
      }
      setSelectedFiles((prev) => [...prev, ...validFiles])
      return
    }

    if (files.length + selectedFiles.length > 10) {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez ajouter que 10 photos maximum',
        variant: 'destructive',
      })
      return
    }
    setSelectedFiles((prev) => [...prev, ...files])
  }

  // Remove file
  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    // Adjust primary photo index if necessary
    if (index === primaryPhotoIndex) {
      setPrimaryPhotoIndex(0) // Reset to first photo
    } else if (index < primaryPhotoIndex) {
      setPrimaryPhotoIndex((prev) => prev - 1) // Shift index down
    }
  }

  // Set primary photo
  const setPrimaryPhoto = (index: number) => {
    setPrimaryPhotoIndex(index)
  }

  // Check if form is valid for button state
  const isFormValid = () => {
    return (
      formData.title?.trim() &&
      formData.categoryId &&
      formData.condition &&
      formData.basePrice &&
      formData.basePrice > 0 &&
      isAddressSelected &&
      formData.latitude &&
      formData.longitude
      // nameValidation.isUnique === true && // DISABLED - uniqueness check removed
      // !nameValidation.isChecking // DISABLED - uniqueness check removed
    )
  }

  // Form validation
  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast({
        title: 'Champ requis',
        description: 'Le titre est obligatoire',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.categoryId) {
      toast({
        title: 'Champ requis',
        description: 'La catégorie est obligatoire',
        variant: 'destructive',
      })
      return false
    }

    if (!formData.condition) {
      toast({
        title: 'Champ requis',
        description: "L'état de l'outil est obligatoire",
        variant: 'destructive',
      })
      return false
    }

    if (!formData.basePrice || formData.basePrice <= 0) {
      toast({
        title: 'Prix invalide',
        description: 'Le prix par jour doit être supérieur à 0',
        variant: 'destructive',
      })
      return false
    }

    if (!isAddressSelected || !formData.latitude || !formData.longitude) {
      toast({
        title: 'Adresse requise',
        description: 'Veuillez sélectionner une adresse en cliquant sur la carte',
        variant: 'destructive',
      })
      return false
    }

    if (formData.depositAmount !== undefined && formData.depositAmount < 0) {
      toast({
        title: 'Dépôt invalide',
        description: 'Le montant du dépôt ne peut pas être négatif',
        variant: 'destructive',
      })
      return false
    }

    if (
      formData.year !== undefined &&
      (formData.year < 1900 || formData.year > 2030)
    ) {
      toast({
        title: 'Année invalide',
        description: "L'année doit être comprise entre 1900 et 2030",
        variant: 'destructive',
      })
      return false
    }

    return true
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setSubmitting(true)

      const toolData: CreateToolData = {
        title: formData.title!,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        description: formData.description,
        categoryId: formData.categoryId!,
        subcategoryId: formData.subcategoryId,
        condition: formData.condition!,
        basePrice: formData.basePrice!,
        depositAmount: formData.depositAmount,
        pickupAddress: formData.pickupAddress,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ownerInstructions: formData.ownerInstructions,
        ownerId: user?.id!,
        primaryPhotoIndex:
          selectedFiles.length > 0 ? primaryPhotoIndex : undefined,
      }

      await toolsService.createTool(toolData, selectedFiles)

      // Set localStorage flag for MyAds refresh
      localStorage.setItem('toolAdded', 'true')

      toast({
        title: 'Outil créé avec succès',
        description:
          'Votre outil est en attente de modération. Il sera visible une fois approuvé par notre équipe.',
      })

      // Navigate to profile with my-ads tab
      navigate('/profile?tab=my-ads')
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible de créer l'outil",
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const categoryMap: Record<string, string> = {
    [t('addtool.category_gardening')]: 'gardening',
    Entretien: 'maintenance',
    Sécurité: 'safety',
    Nouveautés: 'updates',
    Guides: 'guide',
    [t('addtool.category_transport')]: 'transport',
    [t('addtool.category_diy')]: 'diy',
    Electricité: 'electricity',
    Éclairage: 'lighting',
    Peinture: 'painting',
    Construction: 'construction',
    Plantes: 'plants',
    [t('addtool.category_cleaning')]: 'cleaning',
    Décoration: 'decoration',
  }

  const subCategoriesMap: { [key: string]: string[] } = {
    jardinage: [
      t('category.gardening.lawn'),
      t('category.gardening.soil'),
      t('category.gardening.wood'),
      t('category.gardening.tree'),
      t('category.gardening.leaves'),
    ],
    bricolage: [
      t('category.diy.construction'),
      t('category.diy.electricity'),
      t('category.diy.painting'),
      t('category.diy.screws_and_bolts'),
    ],
    transport: [
      t('category.transport.heavy_load'),
      t('category.transport.engine'),
      t('category.transport.wheel'),
    ],
    nettoyage: [
      t('category.cleaning.fabric'),
      t('category.cleaning.water'),
      t('category.cleaning.dust'),
    ],
    evenementiel: [
      t('category.event.lighting'),
      t('category.event.kitchen'),
      t('category.event.entertainment_and_games'),
      t('category.event.furniture'),
      t('category.event.decoration'),
      t('category.event.structure'),
    ],
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = Array.from(e.dataTransfer.files)

    // Vérifier la taille de chaque fichier (1MB maximum)
    const maxSize = 1048576 // 1MB en bytes
    const oversizedFiles = files.filter((file) => file.size > maxSize)

    if (oversizedFiles.length > 0) {
      toast({
        title: 'Fichier trop volumineux',
        description: `Les images ne doivent pas dépasser 1MB. ${oversizedFiles.length} fichier(s) ignoré(s).`,
        variant: 'destructive',
      })
      // Filtrer les fichiers qui respectent la limite de taille
      const validFiles = files.filter((file) => file.size <= maxSize)
      if (validFiles.length === 0) return

      // Continuer avec les fichiers valides
      if (validFiles.length + selectedFiles.length > 10) {
        toast({
          title: 'Limite atteinte',
          description: 'Vous ne pouvez ajouter que 10 photos maximum',
          variant: 'destructive',
        })
        return
      }
      setSelectedFiles((prev) => [...prev, ...validFiles])
      return
    }

    if (files.length + selectedFiles.length > 10) {
      toast({
        title: 'Limite atteinte',
        description: 'Vous ne pouvez ajouter que 10 photos maximum',
        variant: 'destructive',
      })
      return
    }
    setSelectedFiles((prev) => [...prev, ...files])
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-background via-background to-accent/5'>
      <Header />
      <main className='py-16'>
        <div className='max-w-5xl mx-auto px-6'>
          {/* Header Section */}
          <div className='text-center mb-12'>
            <div className='inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-2xl mb-6'>
              <Tag className='h-8 w-8 text-accent' />
            </div>
            <h1 className='text-4xl font-bold text-foreground mb-4'>
              {t('add_tool.title')}
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              {t('add_tool.subtitle')}
            </p>
          </div>

          {/* Main Form Card */}
          <Card className='shadow-xl border-0 bg-card/80 backdrop-blur-sm'>
            <CardHeader className='bg-gradient-to-r flex items-center justify-center from-accent/10 to-accent/5 border-b'>
              <CardTitle className='text-2xl flex !items-center text-foreground'>
                <Settings className='h-6 w-6 mr-3 text-accent' />
                {t('add_tool.info_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className='p-8'>
              <div className='space-y-8'>
                {/* Basic Information Section */}
                <div className='space-y-6'>
                  <h3
                    className={`text-lg font-semibold text-foreground flex items-center ${
                      language === 'ar' ? 'justify-end' : ''
                    }`}
                  >
                    <FileText className='h-5 w-5 mr-2 text-accent' />
                    {t('add_tool.general_info')}
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-3'>
                      <Label
                        htmlFor='title'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.ad_title')} *
                      </Label>
                      <Input
                        id='title'
                        value={formData.title || ''}
                        onChange={(e) =>
                          handleInputChange('title', e.target.value)
                        }
                        placeholder={t('add_tool.title_placeholder')}
                        className='h-12 text-base'
                      />
                    </div>

                    <div className='space-y-3'>
                      <Label
                        htmlFor='brand'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.brand')}
                      </Label>
                      <Input
                        id='brand'
                        value={formData.brand || ''}
                        onChange={(e) =>
                          handleInputChange('brand', e.target.value)
                        }
                        placeholder={t('add_tool.brand_placeholder')}
                        className='h-12 text-base'
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-3'>
                      <Label
                        htmlFor='model'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.model')}
                      </Label>
                      <Input
                        id='model'
                        value={formData.model || ''}
                        onChange={(e) =>
                          handleInputChange('model', e.target.value)
                        }
                        placeholder={t('add_tool.model_placeholder')}
                        className='h-12 text-base'
                      />
                    </div>

                    <div className='space-y-3'>
                      <Label
                        htmlFor='year'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.year')}
                      </Label>
                      <Input
                        id='year'
                        type='number'
                        min='1900'
                        max='2030'
                        value={formData.year || ''}
                        onChange={(e) =>
                          handleInputChange(
                            'year',
                            e.target.value
                              ? parseInt(e.target.value)
                              : undefined
                          )
                        }
                        placeholder={t('add_tool.year_placeholder')}
                        className='h-12 text-base'
                      />
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <Label
                      htmlFor='description'
                      className='text-sm font-medium text-foreground'
                    >
                      {t('add_tool.description')}
                    </Label>
                    <Textarea
                      id='description'
                      value={formData.description || ''}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      placeholder={t('add_tool.description_placeholder')}
                      className='min-h-[120px] resize-none text-base'
                    />
                  </div>
                </div>

                {/* Category Section */}
                <div className='space-y-6'>
                  <h3 className='text-lg font-semibold text-foreground'>
                    {t('add_tool.categorization')}
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-3'>
                      <Label className='text-sm font-medium text-foreground'>
                        {t('add_tool.category')} *
                      </Label>
                      <Select
                        value={formData.categoryId || ''}
                        onValueChange={(value) =>
                          handleInputChange('categoryId', value)
                        }
                        disabled={loadingCategories}
                      >
                        <SelectTrigger className='h-12 text-base'>
                          <SelectValue
                            placeholder={
                              loadingCategories
                                ? t('addtool.verification_in_progress')
                                : t('add_tool.choose_category')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {t(`categories.${category.name}`) ||
                                category.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='space-y-3'>
                      <Label className='text-sm font-medium text-foreground'>
                        {t('add_tool.subcategory')}
                      </Label>
                      <Select
                        value={formData.subcategoryId || ''}
                        onValueChange={(value) =>
                          handleInputChange('subcategoryId', value)
                        }
                        disabled={
                          !formData.categoryId || subcategories.length === 0
                        }
                      >
                        <SelectTrigger className='h-12 text-base'>
                          <SelectValue
                            placeholder={
                              !formData.categoryId
                                ? t('add_tool.choose_category')
                                : t('add_tool.choose_subcategory')
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {subcategories.map((subcategory) => (
                            <SelectItem
                              key={subcategory.id}
                              value={subcategory.id}
                            >
                              {t(`subcategories.${subcategory.name}`) ||
                                subcategory.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <Label className='text-sm font-medium text-foreground'>
                      {t('add_tool.condition')} *
                    </Label>
                    <Select
                      value={formData.condition?.toString() || ''}
                      onValueChange={(value) =>
                        handleInputChange('condition', parseInt(value))
                      }
                    >
                      <SelectTrigger className='h-12 text-base'>
                        <SelectValue placeholder={t('add_tool.condition')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='1'>Neuf</SelectItem>
                        <SelectItem value='2'>Comme neuf</SelectItem>
                        <SelectItem value='3'>Bon état</SelectItem>
                        <SelectItem value='4'>État correct</SelectItem>
                        <SelectItem value='5'>Mauvais état</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className='space-y-6'>
                  <h3
                    className={`text-lg font-semibold text-foreground flex items-center ${
                      language === 'ar' ? 'justify-end' : ''
                    }`}
                  >
                    <Euro className='h-5 w-5 mr-2 text-accent' />
                    {t('add_tool.pricing')}
                  </h3>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='space-y-3'>
                      <Label
                        htmlFor='price'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.price_per_day')} *
                      </Label>
                      <div className='relative'>
                        <Input
                          id='price'
                          type='number'
                          min='0.01'
                          step='0.01'
                          value={formData.basePrice || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'basePrice',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          placeholder='25'
                          className='h-12 text-base pl-8'
                        />
                        <Euro className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      </div>
                    </div>

                    <div className='space-y-3'>
                      <Label
                        htmlFor='deposit'
                        className='text-sm font-medium text-foreground'
                      >
                        {t('add_tool.deposit')}
                      </Label>
                      <div className='relative'>
                        <Input
                          id='deposit'
                          type='number'
                          min='0'
                          step='0.01'
                          value={formData.depositAmount || ''}
                          onChange={(e) =>
                            handleInputChange(
                              'depositAmount',
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          placeholder='100'
                          className='h-12 text-base pl-8'
                        />
                        <Shield className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Section */}
                <div className='space-y-6'>
                  <h3
                    className={`text-lg font-semibold text-foreground flex items-center ${
                      language === 'ar' ? 'justify-end' : ''
                    }`}
                  >
                    <MapPin className='h-5 w-5 mr-2 text-accent' />
                    {t('add_tool.location_title')}
                  </h3>

                  <div className='space-y-6'>
                    {/* Map for location selection */}
                    <div className='space-y-3'>
                      <Label className='text-sm font-medium text-foreground'>
                        {t('add_tool.address')} * - Sélectionnez directement sur la carte
                      </Label>
                      <MapboxLocationPicker
                        coordinates={
                          formData.latitude && formData.longitude
                            ? { lat: formData.latitude, lng: formData.longitude }
                            : undefined
                        }
                        onCoordinatesChange={(coordinates) => {
                          handleInputChange('latitude', coordinates.lat)
                          handleInputChange('longitude', coordinates.lng)
                          setIsAddressSelected(true) // Marquer l'adresse comme sélectionnée
                        }}
                        onAddressChange={(address) =>
                          handleInputChange('pickupAddress', address)
                        }
                        className='h-96'
                        userCountry={userCountryCode}
                      />
                    </div>

                    {/* Address and coordinates display */}
                    {(formData.latitude && formData.longitude) || formData.pickupAddress ? (
                      <div className='bg-muted p-4 rounded-lg space-y-2'>
                        {formData.pickupAddress && (
                          <div className='text-sm text-foreground'>
                            📍 <strong>Adresse:</strong> {formData.pickupAddress}
                          </div>
                        )}
                        {formData.latitude && formData.longitude && (
                          <div className='text-xs text-muted-foreground'>
                            🌍 <strong>Coordonnées:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border-l-4 border-accent'>
                        💡 Cliquez sur la carte pour sélectionner l'adresse de récupération de votre outil
                      </div>
                    )}
                  </div>
                </div>

                {/* Photos Section */}
                <div className='space-y-6'>
                  <h3
                    className={`text-lg font-semibold text-foreground flex items-center ${
                      language === 'ar' ? 'justify-end' : ''
                    }`}
                  >
                    <Camera className='h-5 w-5 mr-2 text-accent' />
                    {t('add_tool.photos_title')}
                  </h3>

                  <div
                    className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                      dragActive
                        ? 'border-accent bg-accent/10 scale-[1.02]'
                        : 'border-border hover:border-accent hover:bg-accent/5'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className='flex !flex-col items-center'>
                      <div className='w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4'>
                        <Upload className='h-8 w-8 text-accent' />
                      </div>
                      <p className='text-lg font-medium text-foreground mb-2'>
                        {t('add_tool.add_photos')}
                      </p>
                      <p className='text-sm text-muted-foreground mb-6'>
                        {t('add_tool.drop_images')}
                      </p>
                      <input
                        type='file'
                        id='file-upload'
                        multiple
                        accept='image/*'
                        onChange={handleFileInput}
                        className='hidden'
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='lg'
                        onClick={() =>
                          document.getElementById('file-upload')?.click()
                        }
                        className='border-accent text-accent hover:bg-accent hover:text-accent-foreground'
                      >
                        {t('add_tool.browse_files')}
                      </Button>
                      <p className='text-xs text-muted-foreground mt-3'>
                        {t('add_tool.file_format')}
                      </p>
                    </div>
                  </div>

                  {/* Selected Files Preview */}
                  {selectedFiles.length > 0 && (
                    <div className='mt-4'>
                      <p className='text-sm font-medium text-foreground mb-2'>
                        Fichiers sélectionnés ({selectedFiles.length}/10):
                      </p>
                      <p className='text-xs text-muted-foreground mb-3'>
                        Cliquez sur une image pour la définir comme photo
                        principale
                      </p>
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-3'>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className='relative group'>
                            <div
                              className={`aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 transition-colors ${
                                index === primaryPhotoIndex
                                  ? 'border-primary ring-2 ring-primary/20'
                                  : 'border-transparent hover:border-primary/50'
                              }`}
                              onClick={() => setPrimaryPhoto(index)}
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt={file.name}
                                className='w-full h-full object-cover'
                              />
                              {index === primaryPhotoIndex && (
                                <div className='absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium'>
                                  Principale
                                </div>
                              )}
                            </div>
                            <button
                              type='button'
                              onClick={() => removeFile(index)}
                              className='absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10'
                            >
                              ×
                            </button>
                            <p className='text-xs text-muted-foreground mt-1 truncate'>
                              {file.name}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Instructions Section */}
                <div className='space-y-6'>
                  <h3
                    className={`text-lg font-semibold text-foreground flex items-center ${
                      language === 'ar' ? 'justify-end' : ''
                    }`}
                  >
                    <FileText className='h-5 w-5 mr-2 text-accent' />
                    {t('add_tool.instructions_title')}
                  </h3>

                  <div className='space-y-3'>
                    <Label
                      htmlFor='instructions'
                      className='text-sm font-medium text-foreground'
                    >
                      {t('add_tool.owner_instructions')}
                    </Label>
                    <Textarea
                      id='instructions'
                      value={formData.ownerInstructions || ''}
                      onChange={(e) =>
                        handleInputChange('ownerInstructions', e.target.value)
                      }
                      placeholder='Ex: Prévoir une rallonge électrique, nettoyer après usage, manipulation délicate...'
                      className='min-h-[100px] resize-none text-base'
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className='pt-6'>
                  <Button
                    type='submit'
                    size='lg'
                    disabled={submitting || !isFormValid()}
                    onClick={handleSubmit}
                    className='w-full h-14 text-base font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50'
                  >
                    {submitting ? (
                      <>
                        <Loader2 className='h-5 w-5 mr-2 animate-spin' />
                        Publication en cours...
                      </>
                    ) : (
                      <>
                        <Upload className='h-5 w-5 mr-2' />
                        {t('add_tool.publish')}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default AddTool
