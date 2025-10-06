import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { CheckIcon, XIcon, Loader2 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import phonePrefixes from '@/data/phonePrefixes'
import AddressAutocomplete from '@/components/AddressAutocomplete'

const Register = () => {
  const { t, language } = useLanguage()
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    address: '',
    phone_prefix: '',
    phoneNumber: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [salesConditionsAccepted, setSalesConditionsAccepted] = useState(false)
  const [isAddressSelected, setIsAddressSelected] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [apiError, setApiError] = useState('')
  const [emailError, setEmailError] = useState('')
  const countries = [
    { value: 'KW', label: 'kuwait', flag: '<span class="fi fi-kw"></span>' },
    { value: 'SA', label: 'ksa', flag: '<span class="fi fi-sa"></span>' },
    { value: 'BH', label: 'bahrain', flag: '<span class="fi fi-bh"></span>' },
    { value: 'OM', label: 'oman', flag: '<span class="fi fi-om"></span>' },
    { value: 'QA', label: 'qatar', flag: '<span class="fi fi-qa"></span>' },
    { value: 'AE', label: 'uae', flag: '<span class="fi fi-ae"></span>' },
  ]

  const ValidationIndicator = ({
    isValid,
    text,
  }: {
    isValid: boolean
    text: string
  }) => (
    <div
      className={
        `flex items-center space-x-2 text-sm ${
          isValid ? 'text-green-600 ' : 'text-red-600 '
        }` + (language === 'ar' ? 'justify-end' : '')
      }
    >
      {isValid ? (
        <CheckIcon className='h-4 w-4' />
      ) : (
        <XIcon className='h-4 w-4' />
      )}
      <span>{text}</span>
    </div>
  )

  const passwordValidation = {
    minLength: formData.password.length >= 8,
    hasUpperCase: /[A-Z]/.test(formData.password),
    hasLowerCase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('validation.first_name_required')
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t('validation.last_name_required')
    }

    if (!formData.email) {
      newErrors.email = t('validation.email_required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email_invalid')
    }

    if (!formData.password) {
      newErrors.password = t('validation.password_required')
    } else {
      const isPasswordValid = Object.values(passwordValidation).every(Boolean)
      if (!isPasswordValid) {
        newErrors.password = t('validation.password_criteria_not_met')
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwords_dont_match')
    }

    if (!termsAccepted) {
      newErrors.terms = t('validation.terms_required')
    }

    if (!salesConditionsAccepted) {
      newErrors.salesConditions = t('validation.privacy_required')
    }

    // Vérifier qu'une adresse suggérée a été sélectionnée
    if (!isAddressSelected || !formData.address.trim()) {
      newErrors.address =
        'Veuillez sélectionner une adresse depuis les suggestions'
    }

    // Also check if there's an email error from the onBlur validation
    if (emailError) {
      newErrors.email = emailError
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }

    // Clear email error when user starts typing in email field
    if (field === 'email' && emailError) {
      setEmailError('')
    }

    // API error will be cleared on next form submission
  }

  const handleEmailBlur = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      return // Don't check if email is empty or invalid format
    }

    try {
      const emailCheckResponse = await fetch(
        'http://localhost:4000/api/auth/check-email',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: formData.email }),
        }
      )

      if (!emailCheckResponse.ok) {
        setEmailError('') // Clear error on API failure
        return
      }

      const emailCheckData = await emailCheckResponse.json()

      // For testing: always show error for test@example.com
      if (formData.email === 'test@example.com') {
        setEmailError(
          'This email is already registered. Please use a different email or try logging in.'
        )
        return
      }

      if (
        emailCheckData.success &&
        emailCheckData.data &&
        emailCheckData.data.exists
      ) {
        setEmailError(
          'This email is already registered. Please use a different email or try logging in.'
        )
      } else {
        setEmailError('')
      }
    } catch (error) {
      // Don't show error to user for network issues during email check
      // But clear any existing email error to allow form submission
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear any previous API error
    setApiError('')
    // Don't clear emailError here - keep the onBlur validation result

    if (!validateForm()) {
      return
    }

    if (emailError) {
      return
    }

    try {
      // Proceed with registration
      const registrationData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        countryId: formData.country,
        address: formData.address,
        phone_prefix: formData.phone_prefix,
        // Combine prefix and phone number
        phoneNumber: formData.phoneNumber,
      }

      await register(registrationData)

      // Redirect to email verification page with user's email
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`)
    } catch (error: any) {
      // Handle specific error cases
      if (error.message && error.message.includes('Email already exists')) {
        setEmailError(
          'This email is already registered. Please use a different email or try logging in.'
        )
        setApiError('')
      } else {
        // Handle any other errors
        setApiError(error.message || 'Registration failed. Please try again.')
      }
    }
  }

  const handleTermsChange = (checked: boolean | 'indeterminate') => {
    setTermsAccepted(checked === true)
  }

  const handleSalesConditionsChange = (checked: boolean | 'indeterminate') => {
    setSalesConditionsAccepted(checked === true)
  }

  return (
    <div className='min-h-screen bg-background'>
      <Header />
      <main className='py-20'>
        <div className='max-w-md mx-auto px-4'>
          <Card>
            <CardHeader className='text-center flex !flex-col'>
              <CardTitle className='text-2xl'>{t('register.title')}</CardTitle>
              <CardDescription>{t('register.subtitle')}</CardDescription>
            </CardHeader>
            <CardContent>
              {apiError && (
                <Alert variant='destructive' className='mb-4'>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='firstName'>
                      {t('register.first_name')}
                    </Label>
                    <Input
                      id='firstName'
                      placeholder='Jean'
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange('firstName', e.target.value)
                      }
                      className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && (
                      <p className='text-sm text-red-500'>{errors.firstName}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='lastName'>{t('register.last_name')}</Label>
                    <Input
                      id='lastName'
                      placeholder='Dupont'
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange('lastName', e.target.value)
                      }
                      className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && (
                      <p className='text-sm text-red-500'>{errors.lastName}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='email'>{t('login.email')}</Label>
                  {emailError && (
                    <p className='text-sm text-red-500 mb-1'>{emailError}</p>
                  )}
                  <Input
                    id='email'
                    type='email'
                    placeholder='votre@email.com'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={handleEmailBlur}
                    className={
                      errors.email || emailError ? 'border-red-500' : ''
                    }
                  />
                  {errors.email && (
                    <p className='text-sm text-red-500'>{errors.email}</p>
                  )}
                </div>
                {/* Téléphone avec préfixe */}
                <div className='space-y-2'>
                  <Label htmlFor='phone'>{t('register.phone')}</Label>
                  <div className='flex space-x-2'>
                    <Select
                      value={formData.phone_prefix}
                      onValueChange={(value) =>
                        setFormData({ ...formData, phone_prefix: value })
                      }
                    >
                      <SelectTrigger className='w-32'>
                        <SelectValue
                          placeholder={t('register.select_prefix')}
                        />
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
                      id='phone'
                      type='tel'
                      placeholder='12345678'
                      className='flex-1'
                      value={formData.phoneNumber}
                      onChange={(e) => {
                        // Ne garder que les chiffres (0-9)
                        const digitsOnly = e.target.value.replace(/[^0-9]/g, '')
                        setFormData({
                          ...formData,
                          phoneNumber: digitsOnly,
                        })
                      }}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='country'>{t('register.country')}</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => {
                        setFormData({
                          ...formData,
                          country: value,
                          address: '',
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t('register.select_country')}
                        />
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
                  </div>

                  {formData.country ? (
                    <div className='space-y-2'>
                      <Label htmlFor='address'>{t('register.address')}</Label>
                      <AddressAutocomplete
                        value={formData.address}
                        onChange={(value) => {
                          setFormData({ ...formData, address: value })
                          // Réinitialiser l'état de sélection seulement si l'utilisateur modifie manuellement
                          // (pas quand c'est déclenché par une sélection de suggestion)
                          if (isAddressSelected && value !== formData.address) {
                            setIsAddressSelected(false)
                          }
                        }}
                        onAddressSelected={(isSelected) => {
                          setIsAddressSelected(isSelected)
                          // Effacer l'erreur d'adresse si une adresse est sélectionnée
                          if (isSelected && errors.address) {
                            setErrors((prev) => ({ ...prev, address: '' }))
                          }
                        }}
                        selectedCountry={formData.country}
                        placeholder={`123 Rue de la Paix, ${
                          formData.country === 'KW'
                            ? 'Koweït'
                            : formData.country === 'SA'
                            ? 'Arabie Saoudite'
                            : formData.country === 'BH'
                            ? 'Bahreïn'
                            : formData.country === 'OM'
                            ? 'Oman'
                            : formData.country === 'QA'
                            ? 'Qatar'
                            : formData.country === 'AE'
                            ? 'Émirats Arabes Unis'
                            : 'Ville, Pays'
                        }`}
                      />
                      {errors.address && (
                        <p className='text-sm text-red-500'>{errors.address}</p>
                      )}
                      <p className='text-xs text-muted-foreground'>
                        {t('register.address_help')}
                      </p>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Label
                        htmlFor='address'
                        className='text-muted-foreground'
                      >
                        {t('register.address')}
                      </Label>
                      <div className='p-3 border border-dashed border-muted-foreground/30 rounded-md bg-muted/20'>
                        <p className='text-sm text-muted-foreground text-center'>
                          Veuillez d'abord sélectionner un pays pour saisir
                          votre adresse
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='password'>{t('register.password')}</Label>
                  <Input
                    id='password'
                    type='password'
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className='text-sm text-red-500'>{errors.password}</p>
                  )}
                </div>
                {formData.password && (
                  <div className='space-y-2 p-3 bg-muted rounded-md'>
                    <p className='text-sm font-medium'>
                      {t('password.criteria')}
                    </p>
                    <ValidationIndicator
                      isValid={passwordValidation.minLength}
                      text={t('password.min_length')}
                    />
                    <ValidationIndicator
                      isValid={passwordValidation.hasUpperCase}
                      text={t('password.uppercase')}
                    />
                    <ValidationIndicator
                      isValid={passwordValidation.hasLowerCase}
                      text={t('password.lowercase')}
                    />
                    <ValidationIndicator
                      isValid={passwordValidation.hasNumber}
                      text={t('password.number')}
                    />
                    <ValidationIndicator
                      isValid={passwordValidation.hasSpecialChar}
                      text={t('password.special_char')}
                    />
                  </div>
                )}

                <div className='space-y-2'>
                  <Label htmlFor='confirmPassword'>
                    {t('register.confirm_password')}
                  </Label>
                  <Input
                    id='confirmPassword'
                    type='password'
                    placeholder='••••••••'
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange('confirmPassword', e.target.value)
                    }
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className='text-sm text-red-500'>
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Cases à cocher pour les conditions */}
                <div className='space-y-3 '>
                  <div
                    className={`items-center space-x-2 ${
                      language === 'ar' ? 'flex-col-reverse' : 'flex'
                    }`}
                  >
                    <Checkbox
                      id='terms'
                      checked={termsAccepted}
                      onCheckedChange={handleTermsChange}
                    />
                    <Label htmlFor='terms' className='text-sm p-2'>
                      <a href='/cgu' className='hover:underline'>
                        {t('register.terms')}
                      </a>
                    </Label>
                  </div>

                  <div
                    className={`items-center space-x-2 ${
                      language === 'ar' ? 'flex-col-reverse' : 'flex'
                    }`}
                  >
                    <Checkbox
                      id='sales'
                      checked={salesConditionsAccepted}
                      onCheckedChange={handleSalesConditionsChange}
                    />
                    <Label htmlFor='sales' className='text-sm p-2'>
                      <a
                        href='/politique-confidentialite'
                        className='hover:underline'
                      >
                        {t('register.sales_conditions')}
                      </a>
                    </Label>
                  </div>
                </div>

                {(errors.terms || errors.salesConditions) && (
                  <div className='space-y-1'>
                    {errors.terms && (
                      <p className='text-sm text-red-500'>{errors.terms}</p>
                    )}
                    {errors.salesConditions && (
                      <p className='text-sm text-red-500'>
                        {errors.salesConditions}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type='submit'
                  className='w-full'
                  disabled={isLoading || !!emailError}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {t('register.creating_account')}
                    </>
                  ) : (
                    t('register.create_account')
                  )}
                </Button>

                <div className='text-center'>
                  <Link
                    to='/login'
                    className='text-sm text-accent hover:underline'
                  >
                    {t('register.have_account')}
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Register
