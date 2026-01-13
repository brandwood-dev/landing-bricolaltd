import React, { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Edit3,
  Check,
  X,
  Shield,
  Camera,
  Upload,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Country } from '@/types/bridge/common.types'
import { authService } from '@/services/authService'
import { getActiveCountries } from '@/services/countriesService'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { userService } from '@/services/userService'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import AddressAutocomplete from '@/components/AddressAutocomplete'
import phonePrefixes from '@/data/phonePrefixes'
const API_BASE_URL = import.meta.env.VITE_BASE_URL
  ? `${import.meta.env.VITE_BASE_URL}`
  : 'http://localhost:4000/api'
const ProfileInfo = () => {
  const { t, language } = useLanguage()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loadingCountries, setLoadingCountries] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false,
  })
  const [currentPasswordValid, setCurrentPasswordValid] = useState(false)
  const [currentPasswordChecked, setCurrentPasswordChecked] = useState(false)
  const [confirmPasswordValid, setConfirmPasswordValid] = useState(false)
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phonePrefix: '+966',
    phoneNumber: '',
    address: '',
    city: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    country: 'SA',
    verified: false,
    profileImage: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [isAddressSelected, setIsAddressSelected] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Initialize user data from AuthContext
  useEffect(() => {
    if (user) {
      // Get country from user object - use countryId directly from user object
      const countryId = user.countryId || 'SA' // Default to Saudi Arabia

      // Map country to correct phone prefix
      const getPhonePrefixByCountry = (countryCode: string): string => {
        const countryPrefixMap: { [key: string]: string } = {
          SA: '+966', // Saudi Arabia
          KW: '+965', // Kuwait
          BH: '+973', // Bahrain
          OM: '+968', // Oman
          QA: '+974', // Qatar
          AE: '+971', // UAE
        }
        return countryPrefixMap[countryCode] || '+966' // Default to Saudi Arabia
      }

      // Get phone prefix - use from database if available, otherwise map from country
      const phonePrefix =
        user.phone_prefix || getPhonePrefixByCountry(countryId)

      // Get phone number and clean it from any prefix if combined
      let phoneNumber = user.phoneNumber || ''

      // If phoneNumber contains a prefix, extract just the number part
      if (phoneNumber.startsWith('+')) {
        // Find where the actual number starts (after the prefix)
        const prefixMatch = phoneNumber.match(/^\+\d{1,4}/)
        if (prefixMatch) {
          phoneNumber = phoneNumber.substring(prefixMatch[0].length)
        }
      }

      const newUserInfo = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phonePrefix: phonePrefix,
        phoneNumber: phoneNumber,
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        country: countryId,
        verified: user.isEmailVerified || false,
        profileImage: user.profilePicture || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }

      setUserInfo(newUserInfo)

      // Set isAddressSelected to true if user already has an address
      if (user.address && user.address.trim() !== '') {
        setIsAddressSelected(true)
      }
    }
  }, [user])



  // Static countries list (same as Register.tsx)
  const countries = [
    { value: 'KW', label: 'kuwait', flag: '<span className="fi fi-kw"></span>' },
    { value: 'SA', label: 'ksa', flag: '<span className="fi fi-sa"></span>' },
    { value: 'BH', label: 'bahrain', flag: '<span className="fi fi-bh"></span>' },
    { value: 'OM', label: 'oman', flag: '<span className="fi fi-om"></span>' },
    { value: 'QA', label: 'qatar', flag: '<span className="fi fi-qa"></span>' },
    { value: 'AE', label: 'uae', flag: '<span className="fi fi-ae"></span>' },
  ]

  // // Generate countries options from static data (same as Register.tsx)
  // const countryOptions = countries.map((country) => ({
  //   value: country.value,
  //   label: t(`countries.${country.label}`),
  //   flag: country.flag,
  // }))

  // Generate phone prefixes from phonePrefixes data (same as Register.tsx)
  const phonePrefix = phonePrefixes.map((prefix) => ({
    value: prefix.value,
    label: prefix.value,
    flag: prefix.flag,
  }))

  const handleInputChange = (field: string, value: string) => {
    setUserInfo((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handlePhonePrefixChange = (prefix: string) => {
    setUserInfo((prev) => ({ ...prev, phonePrefix: prefix }))
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: '' }))
    }
  }

  const handleCountryChange = (countryCode: string) => {
    const selectedCountry = countries.find((c) => c.value === countryCode)
    if (selectedCountry) {
      // Only update the country, do NOT change phone prefix
      // Phone prefix should be independent from country selection
      setUserInfo((prev) => ({
        ...prev,
        country: countryCode,
      }))
      if (errors.country) {
        setErrors((prev) => ({ ...prev, country: '' }))
      }
    }
  }

  const handleAddressChange = (address: string) => {
    setUserInfo((prev) => ({ ...prev, address }))
    setIsAddressSelected(false)
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: '' }))
    }
  }

  const handleAddressSelected = (isSelected: boolean) => {
    setIsAddressSelected(isSelected)
    if (isSelected && errors.address) {
      setErrors((prev) => ({ ...prev, address: '' }))
    }
  }
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    // Validate required fields
    if (!userInfo.firstName.trim()) {
      newErrors.firstName = t('register.firstNameRequired')
    }
    if (!userInfo.lastName.trim()) {
      newErrors.lastName = t('register.lastNameRequired')
    }
    if (!userInfo.phoneNumber.trim()) {
      newErrors.phoneNumber = t('register.phoneRequired')
    }
    if (!userInfo.country) {
      newErrors.country = t('register.countryRequired')
    }
    if (!userInfo.address.trim()) {
      newErrors.address = t('register.addressRequired')
    } else if (
      !isAddressSelected &&
      userInfo.address !== (user?.address || '')
    ) {
      // Only require address selection if the address has been changed from the original
      newErrors.address = t('register.addressSelectRequired')
    }

    // Validate phone number format
    if (userInfo.phoneNumber && !/^\d{8,15}$/.test(userInfo.phoneNumber)) {
      newErrors.phoneNumber = t('register.phoneInvalid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Separate function to handle profile image update
  const handleProfileImageUpdate = async (imageUrl: string) => {
    if (!user) return

    try {
      const updatedUser = await userService.saveProfilePicture(imageUrl)

      // Update local user state with new profile picture
      await updateUser({
        profilePicture: updatedUser.profilePicture,
      })

      toast({
        title: 'Photo de profil mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès.',
      })
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description:
          error.message || 'Échec de la mise à jour de la photo de profil.',
        variant: 'destructive',
      })
      throw error // Re-throw to handle in calling function
    }
  }

  // Separate function to handle profile information update (without password)
  const handleSaveProfile = async () => {
    if (!user) return

    if (!validateForm()) {
      toast({
        title: t('register.validationError'),
        description: t('register.validationErrorDesc'),
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      // Update profile information - excluding profilePicture and password
      // Send phone prefix and phone number separately
      const profileData = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        phoneNumber: userInfo.phoneNumber,
        phone_prefix: userInfo.phonePrefix,
        address: userInfo.address,
        countryId: userInfo.country,
      }

      // Call the profile update endpoint
      const token = localStorage.getItem('authToken')
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Échec de la mise à jour du profil'
        )
      }

      const result = await response.json()
      const updatedUser = result.data

      // Update local user state
      await updateUser({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        phoneNumber: updatedUser.phoneNumber,
        phone_prefix: updatedUser.phone_prefix,
        countryId: updatedUser.countryId,
      })

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été mises à jour avec succès.',
      })

      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Échec de la mise à jour du profil')
      toast({
        title: 'Erreur',
        description: err.message || 'Échec de la mise à jour du profil.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Separate function to handle password change
  const handleChangePassword = async () => {
    if (!user) return

    if (
      !userInfo.currentPassword ||
      !userInfo.newPassword ||
      !userInfo.confirmPassword
    ) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez remplir tous les champs de mot de passe.',
        variant: 'destructive',
      })
      return
    }

    if (!currentPasswordValid) {
      toast({
        title: 'Erreur de validation',
        description: 'Le mot de passe actuel est incorrect.',
        variant: 'destructive',
      })
      return
    }

    if (!passwordValidation.isValid) {
      toast({
        title: 'Erreur de validation',
        description:
          'Le nouveau mot de passe ne respecte pas les critères requis.',
        variant: 'destructive',
      })
      return
    }

    if (!confirmPasswordValid) {
      toast({
        title: 'Erreur de validation',
        description: 'La confirmation du mot de passe ne correspond pas.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSaving(true)
      setError(null)

      await authService.changePassword({
        currentPassword: userInfo.currentPassword,
        newPassword: userInfo.newPassword,
      })

      toast({
        title: 'Mot de passe modifié',
        description: 'Votre mot de passe a été modifié avec succès.',
      })

      // Clear password fields after successful change
      setUserInfo({
        ...userInfo,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })

      // Reset password validation state
      setPasswordValidation({
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasNumber: false,
        hasSpecial: false,
        isValid: false,
      })
      setCurrentPasswordValid(false)
      setCurrentPasswordChecked(false)
      setConfirmPasswordValid(false)
    } catch (passwordError: any) {
      toast({
        title: 'Erreur',
        description:
          passwordError.message || 'Échec de la modification du mot de passe.',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Erreur',
        description: 'Seuls les fichiers JPEG, PNG et WebP sont autorisés.',
        variant: 'destructive',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      toast({
        title: 'Erreur',
        description: 'La taille du fichier ne doit pas dépasser 5MB.',
        variant: 'destructive',
      })
      return
    }

    try {
      setUploadingImage(true)

      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)

     
      const response = await userService.uploadProfilePicture(user.id, file)
  
      const imageUrl = response.data?.data?.data?.url

      if (imageUrl) {
        // Update local state immediately for UI feedback
        setUserInfo((prev) => ({ ...prev, profileImage: imageUrl }))

        // Call the separate function to update profile image in backend and context
        await handleProfileImageUpdate(imageUrl)

        toast({
          title: 'Succès',
          description: response.data?.data?.message || "Image téléchargée avec succès.",
        })
        
      } else {
        throw new Error("URL de l'image non reçue du serveur")
      }
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message || "Échec de l'upload de l'image.",
        variant: 'destructive',
      })
    } finally {
      setUploadingImage(false)
      // Clean up preview URL and reset the input
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
        setImagePreview(null)
      }
      event.target.value = ''
    }
  }

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isValid =
      minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial

    const validation = {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid,
    }

    setPasswordValidation(validation)
    return validation
  }

  // Handle password change with validation
  const handlePasswordChange = (password: string) => {
    setUserInfo({ ...userInfo, newPassword: password })
    validatePassword(password)
    // Re-validate confirm password when new password changes
    if (userInfo.confirmPassword) {
      setConfirmPasswordValid(password === userInfo.confirmPassword)
    }
  }

  // Handle confirm password change
  const handleConfirmPasswordChange = (confirmPassword: string) => {
    setUserInfo({ ...userInfo, confirmPassword })
    setConfirmPasswordValid(userInfo.newPassword === confirmPassword)
  }

  // Validate current password
  const validateCurrentPassword = async (currentPassword: string) => {
    if (!currentPassword.trim()) {
      setCurrentPasswordValid(false)
      setCurrentPasswordChecked(false)
      return
    }

    try {
      const requestPayload = { password: currentPassword }

      // Use the api service instead of fetch directly (like admin does)
      const response = await api.post<{ valid: boolean }>(
        '/auth/validate-password',
        requestPayload
      )

      // Access data via response.data.data.valid according to API structure
      if (response.data.data?.valid) {
        setCurrentPasswordValid(true)
        setCurrentPasswordChecked(true)
      } else {
        setCurrentPasswordValid(false)
        setCurrentPasswordChecked(true)
        toast({
          title: 'Mot de passe incorrect',
          description: 'Le mot de passe actuel est incorrect.',
          variant: 'destructive',
        })
      }
    } catch (error: any) {
      setCurrentPasswordValid(false)
      setCurrentPasswordChecked(true)
      toast({
        title: 'Erreur de validation',
        description: 'Impossible de vérifier le mot de passe actuel.',
        variant: 'destructive',
      })
    }
  }

  // Handle current password blur
  const handleCurrentPasswordBlur = () => {
    if (userInfo.currentPassword) {
      validateCurrentPassword(userInfo.currentPassword)
    }
  }

  return (
    <div className='w-full max-w-4xl mx-auto space-y-6'>
      {/* Section 1: Photo de profil */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex items-start sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-xl font-semibold'>
                {t('profile.photo_title')}
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground mt-1'>
                {t('profile.photo_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex flex-col items-center space-y-4'>
            <div className='relative'>
              <Avatar className='h-24 w-24'>
                <AvatarImage src={imagePreview || userInfo.profileImage} />
                <AvatarFallback className='text-2xl'>
                  {userInfo.firstName[0]}
                  {userInfo.lastName[0]}
                </AvatarFallback>
              </Avatar>
              {uploadingImage && (
                <span className='absolute inset-0 flex items-center justify-center bg-black/50 rounded-full text-white text-xs'>
                  Upload...
                </span>
              )}
              <div className='absolute -bottom-2 -right-2'>
                <label
                  htmlFor='profile-image-upload'
                  className={`cursor-pointer ${
                    uploadingImage ? 'pointer-events-none' : ''
                  }`}
                >
                  <div className='bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors'>
                    {uploadingImage ? (
                      <Loader2 className='h-4 w-4 animate-spin' />
                    ) : (
                      <Camera className='h-4 w-4' />
                    )}
                  </div>
                </label>
                <input
                  id='profile-image-upload'
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/webp'
                  className='hidden'
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </div>
            <div className='text-center'>
              <h3 className='text-lg font-semibold'>
                {userInfo.firstName} {userInfo.lastName}
              </h3>
              <div className='flex flex-wrap items-center justify-center gap-2 mt-2'>
                {userInfo.verified && (
                  <Badge
                    variant='default'
                    className='flex items-center gap-1 text-xs'
                  >
                    <Shield className='h-3 w-3' />
                    {t('profile.verified')}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Informations personnelles */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex  items-start sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-xl font-semibold'>
                {t('profile.personal_info_title')}
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground mt-1'>
                {t('profile.personal_info_description')}
              </CardDescription>
            </div>
          </div>
          {error && (
            <div className='mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md'>
              <p className='text-sm text-destructive'>{error}</p>
            </div>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>{t('profile.first_name')}</Label>
              <Input
                id='firstName'
                value={userInfo.firstName}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`${language === 'ar' ? 'text-right' : ''} ${
                  errors.firstName ? 'border-red-500' : ''
                }`}
              />
              {errors.firstName && (
                <p className='text-sm text-red-500'>{errors.firstName}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>{t('profile.last_name')}</Label>
              <Input
                id='lastName'
                value={userInfo.lastName}
                disabled={!isEditing}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`${language === 'ar' ? 'text-right' : ''} ${
                  errors.lastName ? 'border-red-500' : ''
                }`}
              />
              {errors.lastName && (
                <p className='text-sm text-red-500'>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>{t('profile.email')}</Label>
            <Input
              id='email'
              type='email'
              value={userInfo.email}
              disabled
              onChange={(e) =>
                setUserInfo({ ...userInfo, email: e.target.value })
              }
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phoneNumber'>{t('profile.phone')}</Label>

            <div className='flex gap-2'>
              <Select
                value={userInfo.phonePrefix}
                onValueChange={handlePhonePrefixChange}
                disabled={!isEditing}
              >
                <SelectTrigger className='w-32'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {phonePrefixes.map((prefix, index) => (
                    <SelectItem key={index} value={prefix.value}>
                      <span
                        className='mx-2'
                        dangerouslySetInnerHTML={{ __html: prefix.flag }}
                      />
                      {prefix.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id='phoneNumber'
                type='tel'
                value={userInfo.phoneNumber}
                disabled={!isEditing}
                onChange={(e) =>
                  handleInputChange('phoneNumber', e.target.value)
                }
                className={`flex-1 ${
                  errors.phoneNumber ? 'border-red-500' : ''
                }`}
                placeholder='123456789'
              />
            </div>
            {errors.phoneNumber && (
              <p className='text-sm text-red-500'>{errors.phoneNumber}</p>
            )}
          </div>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='country'>{t('profile.country')}</Label>
              <Select
                value={userInfo.country}
                onValueChange={handleCountryChange}
                disabled={!isEditing}
              >
                <SelectTrigger
                  className={errors.country ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder={t('profile.select_country')} />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country, index) => (
                    <SelectItem key={index} value={country.value}>
                      <span
                        className='mx-2'
                        dangerouslySetInnerHTML={{ __html: country.flag }}
                      />
                      {t(`country.${country.label}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.country && (
                <p className='text-sm text-red-500'>{errors.country}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>{t('profile.address')}</Label>
              {isEditing ? (
                <AddressAutocomplete
                  onChange={handleAddressChange}
                  onAddressSelected={handleAddressSelected}
                  selectedCountry={userInfo.country}
                  value={userInfo.address}
                  className={errors.address ? 'border-red-500' : ''}
                />
              ) : (
                <Input
                  id='address'
                  value={userInfo.address}
                  disabled={true}
                  placeholder={t('profile.address_placeholder')}
                  className={language === 'ar' ? 'text-right' : ''}
                />
              )}
              {errors.address && (
                <p className='text-sm text-red-500'>{errors.address}</p>
              )}
              {isEditing && (
                <p className='text-xs text-muted-foreground'>
                  {t('profile.address_hint')}
                </p>
              )}
            </div>
          </div>

          {/* Boutons de modification du profil */}
          <div className='pt-4 border-t'>
            <div className='flex items-center justify-end gap-2'>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  size='sm'
                  className='w-full sm:w-auto'
                >
                  <Edit3 className='h-4 w-4 mr-2' />
                  {t('profile.edit_button')}
                </Button>
              ) : (
                <div className='flex gap-2 w-full sm:w-auto'>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant='outline'
                    size='sm'
                    className='flex-1 sm:flex-none'
                  >
                    {t('profile.cancel_button')}
                  </Button>
                  <Button
                    onClick={handleSaveProfile}
                    size='sm'
                    disabled={isSaving}
                    className='flex-1 sm:flex-none'
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        {t('profile.saving')}
                      </>
                    ) : (
                      <>
                        <Check className='h-4 w-4 mr-2' />
                        {t('profile.save_button')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Changement de mot de passe */}
      <Card>
        <CardHeader className='pb-4'>
          <div className='flex  items-start sm:items-center justify-between gap-4'>
            <div>
              <CardTitle className='text-xl font-semibold'>
                {t('profile.change_password')}
              </CardTitle>
              <CardDescription className='text-sm text-muted-foreground mt-1'>
                {t('profile.change_password_description')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='currentPassword'>
                {t('profile.current_password')}
              </Label>
              <div className='relative'>
                <Input
                  id='currentPassword'
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={userInfo.currentPassword}
                  onChange={(e) => {
                    setUserInfo({
                      ...userInfo,
                      currentPassword: e.target.value,
                    })
                    // Reset validation states when user types
                    if (currentPasswordChecked) {
                      setCurrentPasswordValid(false)
                      setCurrentPasswordChecked(false)
                    }
                  }}
                  onBlur={handleCurrentPasswordBlur}
                  className={`pr-10 ${language === 'ar' ? 'text-right' : ''} ${
                    currentPasswordChecked
                      ? currentPasswordValid
                        ? 'border-green-500'
                        : 'border-red-500'
                      : ''
                  }`}
                  placeholder={t('profile.current_password_placeholder')}
                />
               
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 hover:bg-transparent'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-500' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-500' />
                    )}
                  </Button>
                  {currentPasswordChecked && (
                    <div>
                      {currentPasswordValid ? (
                        <span className='text-green-500'>✓</span>
                      ) : (
                        <span className='text-red-500'>✗</span>
                      )}
                    </div>
                  )}
              </div>
              {currentPasswordChecked && !currentPasswordValid && (
                <p className='text-sm text-red-500'>
                  {t('profile.current_password_incorrect')}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='newPassword'>{t('profile.new_password')}</Label>
              <div className='relative'>
                <Input
                  id='newPassword'
                  type={showNewPassword ? 'text' : 'password'}
                  value={userInfo.newPassword}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  disabled={!currentPasswordValid}
                  className={`pr-10 ${language === 'ar' ? 'text-right' : ''} ${
                    !currentPasswordValid ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder={
                    currentPasswordValid
                      ? t('profile.new_password_placeholder')
                      : t('profile.current_password_validation')
                  }
                />
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 h-auto p-0 hover:bg-transparent'
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={!currentPasswordValid}
                >
                  {showNewPassword ? (
                    <EyeOff className='h-4 w-4 text-gray-500' />
                  ) : (
                    <Eye className='h-4 w-4 text-gray-500' />
                  )}
                </Button>
              </div>
              {/* Password requirements - only show when password has content and NOT all requirements are met */}
              {userInfo.newPassword.length > 0 &&
                !passwordValidation.isValid && (
                  <div className='text-xs space-y-1 mt-2'>
                    <p
                      className={`flex items-center gap-1 ${
                        passwordValidation.minLength
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                      {t('password.min_length')}
                    </p>
                    <p
                      className={`flex items-center gap-1 ${
                        passwordValidation.hasUppercase
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <span>{passwordValidation.hasUppercase ? '✓' : '✗'}</span>
                      {t('password.uppercase')}
                    </p>
                    <p
                      className={`flex items-center gap-1 ${
                        passwordValidation.hasLowercase
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <span>{passwordValidation.hasLowercase ? '✓' : '✗'}</span>
                      {t('password.lowercase')}
                    </p>
                    <p
                      className={`flex items-center gap-1 ${
                        passwordValidation.hasNumber
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                      {t('password.number')}
                    </p>
                    <p
                      className={`flex items-center gap-1 ${
                        passwordValidation.hasSpecial
                          ? 'text-green-600'
                          : 'text-red-500'
                      }`}
                    >
                      <span>{passwordValidation.hasSpecial ? '✓' : '✗'}</span>
                      {t('password.special_char')}
                    </p>
                  </div>
                )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>
                {t('profile.confirm_new_password')}
              </Label>
              <div className='relative'>
                <Input
                  id='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={userInfo.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  disabled={!currentPasswordValid || !userInfo.newPassword}
                  className={`pr-10 ${language === 'ar' ? 'text-right' : ''} ${
                    !currentPasswordValid || !userInfo.newPassword
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  } ${
                    userInfo.confirmPassword
                      ? confirmPasswordValid
                        ? 'border-green-500'
                        : 'border-red-500'
                      : ''
                  }`}
                  placeholder={
                    currentPasswordValid && userInfo.newPassword
                      ? t('profile.confirm_new_password_placeholder')
                      : t('profile.new_password_first')
                  }
                />
                <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='h-auto p-0 hover:bg-transparent'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={!currentPasswordValid || !userInfo.newPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className='h-4 w-4 text-gray-500' />
                    ) : (
                      <Eye className='h-4 w-4 text-gray-500' />
                    )}
                  </Button>
                  {userInfo.confirmPassword && (
                    <div>
                      {confirmPasswordValid ? (
                        <span className='text-green-500'>✓</span>
                      ) : (
                        <span className='text-red-500'>✗</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {userInfo.confirmPassword && !confirmPasswordValid && (
                <p className='text-sm text-red-500'>
                  {t('profile.passwords_no_match')}
                </p>
              )}
            </div>
          </div>
          <div className='flex justify-end mt-4'>
            <Button
              onClick={handleChangePassword}
              disabled={
                !userInfo.currentPassword ||
                !userInfo.newPassword ||
                !userInfo.confirmPassword ||
                !currentPasswordValid ||
                !passwordValidation.isValid ||
                !confirmPasswordValid ||
                isSaving
              }
              className='bg-blue-600 hover:bg-blue-700'
            >
              {isSaving ? (
                <>
                  <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                  {t('profile.changing_password')}
                </>
              ) : (
                t('profile.change_password')
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ProfileInfo
