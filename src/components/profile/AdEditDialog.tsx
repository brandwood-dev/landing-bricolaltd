import React, { useState, useEffect, useCallback } from 'react'
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Euro,
  MapPin,
  Tag,
  FileText,
  Camera,
  X,
  Save,
  Loader2,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { toolsService } from '@/services/toolsService'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import MapboxLocationPicker from '@/components/MapboxLocationPicker'
import { OptimizedPriceDisplay } from '@/components/OptimizedPriceDisplay'

interface ToolPhoto {
  id: string
  url: string
  filename: string
  isPrimary: boolean
  toolId: string
  createdAt: string
}

interface Tool {
  id: string
  title: string
  description: string
  brand?: string
  model?: string
  year?: number
  condition: string
  pickupAddress: string
  basePrice: number
  depositAmount: number
  instructions?: string
  category: {
    id: string
    name: string
    displayName: string
  }
  subcategory: {
    id: string
    name: string
    displayName: string
  }
  photos: ToolPhoto[]
  toolStatus: string
  moderationStatus: string
}

interface AdEditDialogProps {
  ad: Tool
  onClose: () => void
  onSave: () => void
}

const AdEditDialog = ({ ad, onClose, onSave }: AdEditDialogProps) => {
  const { toast } = useToast()
  const { user } = useAuth()
  const { t, language } = useLanguage()
  const { currency, calculatePrice } = useCurrency()

  // Convert prices from GBP (database) to user's currency for display
  const initialPrice =
    currency.code === 'GBP'
      ? Number(ad.basePrice) || 0
      : Number(calculatePrice(ad.basePrice, 'GBP', currency.code)) || 0

  const initialDeposit =
    currency.code === 'GBP'
      ? Number(ad.depositAmount) || 0
      : Number(calculatePrice(ad.depositAmount, 'GBP', currency.code)) || 0

  const [formData, setFormData] = useState({
    title: ad.title,
    brand: ad.brand || '',
    model: ad.model || '',
    year: ad.year?.toString() || '',
    category: ad.category?.id || '',
    subcategory: ad.subcategory?.id || '',
    condition: ad.condition.toString(),
    price: initialPrice,
    deposit: initialDeposit,
    location: ad.pickupAddress,
    description: ad.description,
    instructions: ad.ownerInstructions || '',
    latitude: (ad as any).latitude ? parseFloat((ad as any).latitude) : null,
    longitude: (ad as any).longitude ? parseFloat((ad as any).longitude) : null,
  })

  // Photo management states
  const [existingPhotos, setExistingPhotos] = useState<ToolPhoto[]>(
    ad.photos || []
  )
  const [newPhotos, setNewPhotos] = useState<File[]>([])
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([])
  const [primaryPhotoId, setPrimaryPhotoId] = useState<string | null>(
    ad.photos?.find((photo) => photo.isPrimary)?.id || null
  )
  const [newPhotoPrimaryIndex, setNewPhotoPrimaryIndex] = useState<
    number | null
  >(null)

  // Photo operation states
  const [photoOperations, setPhotoOperations] = useState<{
    uploading: { [key: number]: boolean }
    deleting: { [key: string]: boolean }
    settingPrimary: string | null
  }>({
    uploading: {},
    deleting: {},
    settingPrimary: null,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; displayName: string }>
  >([])
  const [subcategories, setSubcategories] = useState<
    Array<{ id: string; name: string; displayName: string }>
  >([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAddressSelected, setIsAddressSelected] = useState(true) // true car on modifie un outil existant avec une adresse

  // Currency conversion states - similar to AddTool.tsx
  const [priceInGBP, setPriceInGBP] = useState<number | null>(null)
  const [depositInGBP, setDepositInGBP] = useState<number | null>(null)

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true)
        const categories = await toolsService.getCategories()
        setCategories(categories || [])
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
  }, [])

  // Convert price to GBP in real-time (similar to AddTool.tsx)
  useEffect(() => {
    if (formData.price !== null && formData.price !== undefined) {
      if (currency.code === 'GBP') {
        setPriceInGBP(formData.price)
      } else {
        const convertedPrice = calculatePrice(
          formData.price,
          currency.code,
          'GBP'
        )
        if (convertedPrice !== null && convertedPrice !== undefined) {
          setPriceInGBP(convertedPrice)
        }
      }
    }
  }, [formData.price, currency.code, calculatePrice])

  // Convert deposit to GBP in real-time (similar to AddTool.tsx)
  useEffect(() => {
    if (formData.deposit !== null && formData.deposit !== undefined) {
      if (currency.code === 'GBP') {
        setDepositInGBP(formData.deposit)
      } else {
        const convertedDeposit = calculatePrice(
          formData.deposit,
          currency.code,
          'GBP'
        )
        if (convertedDeposit !== null && convertedDeposit !== undefined) {
          setDepositInGBP(convertedDeposit)
        }
      }
    }
  }, [formData.deposit, currency.code, calculatePrice])

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.category) {
        try {
          setLoadingSubcategories(true)
          const subcategories = await toolsService.getSubcategoriesByCategory(
            formData.category
          )
          setSubcategories(subcategories || [])
        } catch (error) {
          setSubcategories([])
        } finally {
          setLoadingSubcategories(false)
        }
      } else {
        setSubcategories([])
        setLoadingSubcategories(false)
      }
    }

    if (categories.length > 0 && formData.category) {
      loadSubcategories()
    } else if (!formData.category) {
      setSubcategories([])
      setLoadingSubcategories(false)
    }
  }, [formData.category, categories])

  // Auto-save functionality

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handleCategoryChange = (categoryId: string) => {
    const newFormData = {
      ...formData,
      category: categoryId,
      subcategory: '', // Reset subcategory when category changes
    }
    setFormData(newFormData)
    setSubcategories([])
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis'
    }
    if (!formData.description.trim())
      newErrors.description = 'La description est requise'
    if (!formData.category) newErrors.category = 'La catégorie est requise'
    if (!formData.condition)
      newErrors.condition = "L'état de l'outil est requis"
    if (!formData.price || formData.price <= 0)
      newErrors.price = 'Le prix doit être supérieur à 0'
    if (!formData.deposit || formData.deposit <= 0)
      newErrors.deposit = 'Le dépôt doit être supérieur à 0'
    if (!isAddressSelected)
      newErrors.location = 'Veuillez sélectionner une adresse sur la carte'

    // Validation des photos - au moins une photo doit exister
    const totalPhotos = existingPhotos.length + newPhotos.length
    if (totalPhotos === 0) {
      newErrors.photos = 'Au moins une photo est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Photo management
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB
      return isValidType && isValidSize
    })

    if (validFiles.length !== files.length) {
      toast({
        title: 'Attention',
        description:
          'Certains fichiers ont été ignorés (format non supporté ou taille > 10MB)',
        variant: 'destructive',
      })
    }

    setNewPhotos((prev) => [...prev, ...validFiles])

    // Clear photos error if it exists
    if (errors.photos) {
      setErrors((prev) => ({ ...prev, photos: '' }))
    }
  }

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index))
    if (newPhotoPrimaryIndex === index) {
      setNewPhotoPrimaryIndex(null)
    } else if (newPhotoPrimaryIndex !== null && newPhotoPrimaryIndex > index) {
      setNewPhotoPrimaryIndex((prev) => prev! - 1)
    }
  }

  const handleRemoveExistingPhoto = async (photoId: string) => {
    try {
      // Set deleting state
      setPhotoOperations((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [photoId]: true },
      }))

      // Call API to delete photo
      await toolsService.deletePhoto(ad.id, photoId)

      // Remove from local state
      setExistingPhotos((prev) => prev.filter((p) => p.id !== photoId))

      // Reset primary photo if it was the deleted one
      if (primaryPhotoId === photoId) {
        setPrimaryPhotoId(null)
        // Auto-select first remaining photo as primary if exists
        const remainingPhotos = existingPhotos.filter((p) => p.id !== photoId)
        if (remainingPhotos.length > 0) {
          setPrimaryPhotoId(remainingPhotos[0].id)
        }
      }

      toast({
        title: 'Succès',
        description: 'Photo supprimée avec succès',
      })
    } catch (error) {
      console.error('Error deleting photo:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la photo',
        variant: 'destructive',
      })
    } finally {
      // Clear deleting state
      setPhotoOperations((prev) => ({
        ...prev,
        deleting: { ...prev.deleting, [photoId]: false },
      }))
    }
  }

  const handleSetNewPhotoPrimary = (index: number) => {
    setNewPhotoPrimaryIndex(index)
    setPrimaryPhotoId(null)
  }

  const handleSetExistingPhotoPrimary = async (photoId: string) => {
    try {
      // Set setting primary state
      setPhotoOperations((prev) => ({
        ...prev,
        settingPrimary: photoId,
      }))

      // Call API to set photo as primary
      await toolsService.setPhotoPrimary(photoId)

      // Update local state
      setPrimaryPhotoId(photoId)
      setNewPhotoPrimaryIndex(null)

      toast({
        title: 'Succès',
        description: 'Photo principale définie avec succès',
      })
    } catch (error) {
      console.error('Error setting primary photo:', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de définir la photo principale',
        variant: 'destructive',
      })
    } finally {
      // Clear setting primary state
      setPhotoOperations((prev) => ({
        ...prev,
        settingPrimary: null,
      }))
    }
  }

  // Improved save function with better photo handling
  const handleSave = async () => {
    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)

      // Use pre-calculated GBP values (similar to AddTool.tsx)
      const finalPriceInGBP = priceInGBP || Number(formData.price) || 0
      const finalDepositInGBP = depositInGBP || Number(formData.deposit) || 0

      // Update tool data first
      const updateData = {
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year.toString()) : null,
        description: formData.description,
        categoryId: formData.category,
        subcategoryId: formData.subcategory,
        condition: parseInt(formData.condition),
        basePrice: finalPriceInGBP,
        depositAmount: finalDepositInGBP,
        pickupAddress: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ownerInstructions: formData.instructions,
      }

      await toolsService.updateTool(ad.id, updateData)

      // Upload new photos with progress tracking
      const uploadedPhotos: ToolPhoto[] = []
      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i]
        try {
          // Set uploading state
          setPhotoOperations((prev) => ({
            ...prev,
            uploading: { ...prev.uploading, [i]: true },
          }))

          const isPrimary = newPhotoPrimaryIndex === i && !primaryPhotoId
          const uploadedPhoto = await toolsService.addToolPhoto(
            ad.id,
            photo,
            isPrimary
          )
          uploadedPhotos.push(uploadedPhoto)

          // If this was set as primary, update the primary photo ID
          if (isPrimary) {
            setPrimaryPhotoId(uploadedPhoto.id)
          }
        } catch (error) {
          console.error('Error uploading photo:', error)
          toast({
            title: 'Erreur',
            description: `Impossible d'uploader la photo ${photo.name}`,
            variant: 'destructive',
          })
        } finally {
          // Clear uploading state
          setPhotoOperations((prev) => ({
            ...prev,
            uploading: { ...prev.uploading, [i]: false },
          }))
        }
      }

      // Ensure we have a primary photo
      const allPhotos = [...existingPhotos, ...uploadedPhotos]
      if (
        allPhotos.length > 0 &&
        !primaryPhotoId &&
        newPhotoPrimaryIndex === null
      ) {
        // Set first photo as primary if no primary is selected
        const firstPhoto = allPhotos[0]
        try {
          await toolsService.setPhotoPrimary(firstPhoto.id)
          setPrimaryPhotoId(firstPhoto.id)
        } catch (error) {
          console.error('Error setting default primary photo:', error)
        }
      }

      // Clear new photos and reset states
      setNewPhotos([])
      setNewPhotoPrimaryIndex(null)
      setPhotoOperations({
        uploading: {},
        deleting: {},
        settingPrimary: null,
      })

      toast({
        title: 'Succès',
        description: "L'outil a été mis à jour avec succès",
      })

      onSave()
      onClose()
    } catch (error) {
      console.error('Error updating tool:', error)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la mise à jour',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }



  return (
    <TooltipProvider>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex items-center justify-between'>
            <DialogTitle className='text-xl font-semibold text-foreground'>
              {t('tools.edit')}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className='space-y-8 py-4'>
          {/* General Information Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <FileText className='h-5 w-5 mr-2 text-accent' />
                {t('add_tool.general_info')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <Label
                    htmlFor='title'
                    className='text-sm font-medium text-foreground'
                  >
                    {t('add_tool.title')} *
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-4 w-4 ml-1 inline text-gray-400' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Donnez un titre clair et descriptif à votre outil</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input
                    id='title'
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder={t('add_tool.title_placeholder')}
                    className={`h-12 text-base ${
                      errors.title ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.title && (
                    <p className='text-sm text-red-500'>{errors.title}</p>
                  )}
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
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder={t('add_tool.brand_placeholder')}
                    className='h-12 text-base'
                  />
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='model'
                    className='text-sm font-medium text-foreground'
                  >
                    {t('add_tool.model')}
                  </Label>
                  <Input
                    id='model'
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
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
                    max={new Date().getFullYear()}
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
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
                  {t('add_tool.description')} *
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-4 w-4 ml-1 inline text-gray-400' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Décrivez votre outil en détail pour attirer les
                        locataires
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder={t('add_tool.description_placeholder')}
                  className={`min-h-[120px] text-base ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className='text-sm text-red-500'>{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Categorization Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <Tag className='h-5 w-5 mr-2 text-accent' />
                {t('add_tool.categorization')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-foreground'>
                    {t('add_tool.category')} *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      handleInputChange('category', value)
                    }
                    disabled={loadingCategories}
                  >
                    <SelectTrigger
                      className={`h-12 text-base ${
                        errors.category ? 'border-red-500' : ''
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          loadingCategories
                            ? 'Chargement...'
                            : 'Sélectionner une catégorie'
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
                  {errors.category && (
                    <p className='text-sm text-red-500'>{errors.category}</p>
                  )}
                </div>

                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-foreground'>
                    {t('ads.sub_category')}
                  </Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) =>
                      handleInputChange('subcategory', value)
                    }
                    disabled={loadingSubcategories || !formData.category}
                  >
                    <SelectTrigger className='h-12 text-base'>
                      <SelectValue
                        placeholder={
                          loadingSubcategories
                            ? 'Chargement...'
                            : t('ads.sub_category_placeholder')
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((subcategory) => (
                        <SelectItem key={subcategory.id} value={subcategory.id}>
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
                  {t('ads.tool_condition')} *
                </Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) =>
                    handleInputChange('condition', value)
                  }
                >
                  <SelectTrigger
                    className={`h-12 text-base ${
                      errors.condition ? 'border-red-500' : ''
                    }`}
                  >
                    <SelectValue placeholder={t('ads.tool_condition')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='1'>Neuf</SelectItem>
                    <SelectItem value='2'>Comme neuf</SelectItem>
                    <SelectItem value='3'>Bon état</SelectItem>
                    <SelectItem value='4'>État correct</SelectItem>
                    <SelectItem value='5'>Mauvais état</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className='text-sm text-red-500'>{errors.condition}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Pricing Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <Euro className='h-5 w-5 mr-2 text-accent' />
                {t('ads.pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-3'>
                  <Label
                    htmlFor='price'
                    className='text-sm font-medium text-foreground'
                  >
                    {t('ads.pricing_placeholder')} * ({currency.code})
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className='h-4 w-4 ml-1 inline text-gray-400' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Prix de location par jour</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                  <div className='relative'>
                    <Input
                      id='price'
                      type='number'
                      min='0.01'
                      step='0.01'
                      value={formData.price || ''}
                      onChange={(e) => {
                        const value = e.target.value
                        const numValue = value ? parseFloat(value) : undefined
                        // Block input if value exceeds 500
                        // Block input if GBP-converted value exceeds 500
                        const gbpValue =
                          currency.code === 'GBP'
                            ? numValue
                            : calculatePrice(numValue, currency.code, 'GBP')
                        if (numValue && gbpValue > 500) {
                          return
                        }
                        handleInputChange('price', numValue)
                      }}
                      className={`h-12 text-base ${
                        errors.price ? 'border-red-500' : ''
                      }`}
                    />
                    {currency.code !== 'GBP' && formData.price > 0 && (
                      <div className='mt-2 text-sm text-muted-foreground'>
                        <span className='ml-2'>
                          (≈ £{priceInGBP?.toFixed(2)} GBP)
                        </span>
                      </div>
                    )}
                  </div>
                  {errors.price && (
                    <p className='text-sm text-red-500'>{errors.price}</p>
                  )}
                </div>

                <div className='space-y-3'>
                  <Label
                    htmlFor='deposit'
                    className='text-sm font-medium text-foreground'
                  >
                    {t('ads.deposit')} ({currency.code})
                  </Label>
                  <div className='relative'>
                    <Input
                      id='deposit'
                      type='number'
                      min='0'
                      step='0.01'
                      value={formData.deposit}
                      onChange={(e) => {
                        const value = e.target.value
                        const numValue = value ? parseFloat(value) : undefined
                        // Block input if value exceeds 500
                        // Block input if GBP-converted value exceeds 500
                        const gbpValue =
                          currency.code === 'GBP'
                            ? numValue
                            : calculatePrice(numValue, currency.code, 'GBP')
                        if (numValue && gbpValue > 500) {
                          return
                        }
                        handleInputChange('deposit', numValue)
                      }}
                      placeholder='100'
                      className={`h-12 text-base ${
                        errors.deposit ? 'border-red-500' : ''
                      }`}
                    />
                    {currency.code !== 'GBP' &&
                      parseFloat(formData.deposit) > 0 && (
                        <div className='mt-2 text-sm text-muted-foreground'>
                          <span className='ml-2'>
                            (≈ £{depositInGBP?.toFixed(2)} GBP)
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <MapPin className='h-5 w-5 mr-2 text-accent' />
                {t('location.label')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Affichage des informations actuelles */}
              <div className='bg-gray-50 p-4 rounded-lg border'>
                <h4 className='text-sm font-medium text-gray-700 mb-3 flex items-center'>
                  <Info className='h-4 w-4 mr-2' />
                  {t('add_tool.current_location')}
                </h4>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 text-sm'>
                  <div>
                    <span className='font-medium text-gray-600'>
                      {t('add_tool.address')}:
                    </span>
                    <p className='text-gray-800 mt-1'>
                      {formData.location || 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-gray-600'>
                      {t('add_tool.latitude')}:
                    </span>
                    <p className='text-gray-800 mt-1'>
                      {formData.latitude
                        ? typeof formData.latitude === 'number'
                          ? formData.latitude.toFixed(6)
                          : !isNaN(parseFloat(formData.latitude))
                          ? parseFloat(formData.latitude).toFixed(6)
                          : formData.latitude
                        : 'Non définie'}
                    </p>
                  </div>
                  <div>
                    <span className='font-medium text-gray-600'>
                      {t('add_tool.longitude')}:
                    </span>
                    <p className='text-gray-800 mt-1'>
                      {formData.longitude
                        ? typeof formData.longitude === 'number'
                          ? formData.longitude.toFixed(6)
                          : !isNaN(parseFloat(formData.longitude))
                          ? parseFloat(formData.longitude).toFixed(6)
                          : formData.longitude
                        : 'Non définie'}
                    </p>
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <Label className='text-sm font-medium text-foreground'>
                  {t('add_tool.address')} *
                </Label>

                <MapboxLocationPicker
                  coordinates={
                    formData.latitude && formData.longitude
                      ? {
                          lat: formData.latitude,
                          lng: formData.longitude,
                        }
                      : undefined
                  }
                  onCoordinatesChange={(coordinates) => {
                    handleInputChange('latitude', coordinates.lat)
                    handleInputChange('longitude', coordinates.lng)
                    setIsAddressSelected(true)
                  }}
                  onAddressChange={(address) => {
                    handleInputChange('location', address)
                  }}
                  userCountry={user?.country || 'KW'}
                  height='400px'
                />
                {errors.location && (
                  <p className='text-sm text-red-500'>{errors.location}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Photos Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <Camera className='h-5 w-5 mr-2 text-accent' />
                {t('ads.photos')}
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Existing Photos */}
              {existingPhotos.length > 0 && (
                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-foreground'>
                    Photos actuelles
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {existingPhotos.map((photo) => (
                      <div key={photo.id} className='relative group'>
                        <img
                          src={photo.url}
                          alt={photo.filename}
                          className='w-full h-32 object-cover rounded-lg border'
                        />

                        {/* Delete button with loading state */}
                        <button
                          type='button'
                          onClick={() => handleRemoveExistingPhoto(photo.id)}
                          disabled={photoOperations.deleting[photo.id]}
                          className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50'
                        >
                          {photoOperations.deleting[photo.id] ? (
                            <Loader2 className='h-4 w-4 animate-spin' />
                          ) : (
                            <X className='h-4 w-4' />
                          )}
                        </button>

                        {/* Primary photo indicator */}
                        {primaryPhotoId === photo.id && (
                          <div className='absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center'>
                            <CheckCircle className='h-3 w-3 mr-1' />
                            Principal
                          </div>
                        )}

                        {/* Set as primary button with loading state */}
                        {primaryPhotoId !== photo.id && (
                          <button
                            type='button'
                            onClick={() =>
                              handleSetExistingPhotoPrimary(photo.id)
                            }
                            disabled={
                              photoOperations.settingPrimary === photo.id
                            }
                            className='absolute bottom-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 flex items-center'
                          >
                            {photoOperations.settingPrimary === photo.id ? (
                              <Loader2 className='h-3 w-3 animate-spin mr-1' />
                            ) : null}
                            Définir comme principale
                          </button>
                        )}

                        {/* Deleting overlay */}
                        {photoOperations.deleting[photo.id] && (
                          <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
                            <div className='text-white text-sm flex items-center'>
                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                              Suppression...
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Photos Preview */}
              {newPhotos.length > 0 && (
                <div className='space-y-3'>
                  <Label className='text-sm font-medium text-foreground'>
                    Nouvelles photos
                  </Label>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                    {newPhotos.map((photo, index) => (
                      <div key={index} className='relative group'>
                        <img
                          src={URL.createObjectURL(photo)}
                          alt={photo.name}
                          className='w-full h-32 object-cover rounded-lg border'
                        />

                        {/* Remove button */}
                        <button
                          type='button'
                          onClick={() => handleRemoveNewPhoto(index)}
                          className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <X className='h-4 w-4' />
                        </button>

                        {/* Primary photo indicator */}
                        {newPhotoPrimaryIndex === index && (
                          <div className='absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center'>
                            <CheckCircle className='h-3 w-3 mr-1' />
                            Principal
                          </div>
                        )}

                        {/* Set as primary button */}
                        {newPhotoPrimaryIndex !== index && (
                          <button
                            type='button'
                            onClick={() => handleSetNewPhotoPrimary(index)}
                            className='absolute bottom-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            Définir comme principale
                          </button>
                        )}

                        {/* Upload progress overlay */}
                        {photoOperations.uploading[index] && (
                          <div className='absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center'>
                            <div className='text-white text-sm flex items-center'>
                              <Loader2 className='h-4 w-4 animate-spin mr-2' />
                              Upload...
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Photo Upload Button */}
              <div className='space-y-3'>
                <Label className='text-sm font-medium text-foreground'>
                  Ajouter des photos
                </Label>
                <div className='flex items-center justify-center w-full'>
                  <label
                    htmlFor='photo-upload'
                    className='flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors'
                  >
                    <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                      <Upload className='w-8 h-8 mb-4 text-gray-500' />
                      <p className='mb-2 text-sm text-gray-500'>
                        <span className='font-semibold'>
                          Cliquez pour uploader
                        </span>{' '}
                        ou glissez-déposez
                      </p>
                      <p className='text-xs text-gray-500'>
                        PNG, JPG, JPEG (MAX. 10MB par fichier)
                      </p>
                    </div>
                    <input
                      id='photo-upload'
                      type='file'
                      className='hidden'
                      multiple
                      accept='image/*'
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
                {errors.photos && (
                  <p className='text-sm text-red-500 flex items-center'>
                    <AlertCircle className='h-4 w-4 mr-1' />
                    {errors.photos}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Owner Instructions Section */}
          <Card>
            <CardHeader>
              <CardTitle
                className={`flex items-center ${
                  language === 'ar' ? 'justify-end' : ''
                }`}
              >
                <FileText className='h-5 w-5 mr-2 text-accent' />
                Instructions pour le locataire
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                <Label
                  htmlFor='instructions'
                  className='text-sm font-medium text-foreground'
                >
                  Instructions spéciales (optionnel)
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className='h-4 w-4 ml-1 inline text-gray-400' />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Instructions particulières pour l'utilisation ou la
                        récupération de l'outil
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </Label>
                <Textarea
                  id='instructions'
                  value={formData.instructions}
                  onChange={(e) =>
                    handleInputChange('instructions', e.target.value)
                  }
                  placeholder='Ex: Récupération possible uniquement le week-end, clés disponibles chez le voisin, etc.'
                  className='min-h-[100px] text-base'
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className='flex justify-end space-x-4 pt-6 border-t'>
          <Button variant='outline' onClick={onClose} disabled={isSaving}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className='h-4 w-4 mr-2' />
                Sauvegarder
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </TooltipProvider>
  )
}

export default AdEditDialog
