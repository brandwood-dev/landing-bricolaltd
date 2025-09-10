import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Check, X, Shield, Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Country } from '@/types/bridge/common.types';
import { authService } from '@/services/authService';
import { countriesService } from '@/services/countriesService';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const ProfileInfo = () => {
  const { t, language } = useLanguage();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false
  });
  const [userInfo, setUserInfo] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    newEmail: '',
    phonePrefix: '+965',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bio: '',
    country: 'KWD',
    verified: false,
    profileImage: '',
    accountType: 'individual',
    currentPassword: '',
    newPassword: ''
  });

  // Initialize user data from AuthContext
  useEffect(() => {
    if (user) {
      setUserInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        email: user.email || '',
        newEmail: user.newEmail || '',
        phonePrefix: user.phonePrefix || '+965',
        phone: user.phoneNumber || '',
        address: user.address || '',
        city: user.city || '',
        postalCode: user.postalCode || '',
        latitude: user.latitude || null,
        longitude: user.longitude || null,
        bio: user.bio || '',
        country: user.country?.code || user.countryId || '',
        verified: user.verifiedEmail || false,
        profileImage: user.profilePicture || '',
        accountType: user.userType || 'individual',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  // Fetch countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const countriesData = await countriesService.getActiveCountries();
        setCountries(countriesData);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
        toast({
          title: t('error.title'),
          description: 'Failed to load countries',
          variant: 'destructive',
        });
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, [t, toast]);

  // Generate countries options from fetched data
  const countryOptions = countries.map(country => ({
    value: country.code,
    label: country.name,
    flag: country.code.toLowerCase()
  }));

  // Generate phone prefixes from fetched countries data
  const phonePrefixes = countries.map(country => ({
    value: country.phonePrefix,
    label: `${country.phonePrefix} (${country.name})`,
    flag: country.code.toLowerCase()
  }));
  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      setError(null);

      // If both password fields are filled, handle password change
      if (userInfo.currentPassword && userInfo.newPassword) {
        if (!passwordValidation.isValid) {
          toast({
            title: "Erreur de validation",
            description: "Le nouveau mot de passe ne respecte pas les critères requis.",
            variant: "destructive",
          });
          return;
        }

        try {
          await authService.changePassword({
            currentPassword: userInfo.currentPassword,
            newPassword: userInfo.newPassword
          });
          
          toast({
            title: "Mot de passe modifié",
            description: "Votre mot de passe a été modifié avec succès.",
          });

          // Clear password fields after successful change
          setUserInfo({
            ...userInfo,
            currentPassword: '',
            newPassword: ''
          });
          
          // Reset password validation state
          setPasswordValidation({
            minLength: false,
            hasUppercase: false,
            hasLowercase: false,
            hasNumber: false,
            hasSpecial: false,
            isValid: false
          });
        } catch (passwordError: any) {
          toast({
            title: "Erreur",
            description: passwordError.message || "Échec de la modification du mot de passe.",
            variant: "destructive",
          });
          return;
        }
      }

      // Update profile information
      const profileData: any = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        displayName: userInfo.displayName,
        email: userInfo.email,
        phoneNumber: userInfo.phone,
        phonePrefix: userInfo.phonePrefix,
        address: userInfo.address,
        city: userInfo.city,
        postalCode: userInfo.postalCode,
        latitude: userInfo.latitude,
        longitude: userInfo.longitude,
        bio: userInfo.bio,
        countryId: userInfo.country,
        userType: userInfo.accountType as 'individual' | 'business'
      };

      // Only include newEmail if it has a value
      if (userInfo.newEmail && userInfo.newEmail.trim()) {
        profileData.newEmail = userInfo.newEmail;
      }

      const updatedUser = await authService.updateProfile(profileData);
      await updateUser(profileData);
      
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès.",
      });
      
      setIsEditing(false);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setError(err.message || 'Échec de la mise à jour du profil');
      toast({
        title: "Erreur",
        description: err.message || "Échec de la mise à jour du profil.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUserInfo({...userInfo, profileImage: e.target?.result as string});
      };
      reader.readAsDataURL(file);
    }
  };

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

    const validation = {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid
    };

    setPasswordValidation(validation);
    return validation;
  };

  // Handle password change with validation
  const handlePasswordChange = (password: string) => {
    setUserInfo({...userInfo, newPassword: password});
    validatePassword(password);
  };

  const handleAccountDeletion = () => {
    // Here you would make an API call to delete the account
    console.log('Deleting account...');
    // For now, just show a confirmation in the console
    // In a real implementation, you would:
    // 1. Make an API call to delete the account
    // 2. Show a success message
    // 3. Redirect the user to the home page or login page
  };

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="flex flex-col items-center space-y-3 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20">
                <AvatarImage src={userInfo.profileImage} />
                <AvatarFallback className="text-lg sm:text-xl">{userInfo.firstName[0]}{userInfo.lastName[0]}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div className="absolute -bottom-2 -right-2">
                  <label htmlFor="profile-image-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-colors">
                      <Camera className="h-3 w-3" />
                    </div>
                  </label>
                  <input
                    id="profile-image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              )}
            </div>
            <div className="text-center sm:text-left ">
              <CardTitle className="text-lg sm:text-xl">
                {userInfo.firstName} {userInfo.lastName}
              </CardTitle>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                {userInfo.verified && (
                  <Badge variant="default" className="flex items-center gap-1 text-xs">
                    <Shield className="h-3 w-3" />
                    {t('profile.verified')}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs">
                  {userInfo.accountType === 'individual' ? t('profile.account_type_individual') : t('profile.account_type_business')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('profile.member_since').replace('{date}', language === 'fr' ? 'janvier 2024' : language === 'ar' ? 'يناير 2024' : 'January 2024')}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto sm:flex-shrink-0 ">
            {!isEditing ? (
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {t('profile.edit')}
              </Button>
            ) : (
              <div className="flex gap-2 w-full sm:w-auto">
                <Button size="sm" onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none">
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving} className="flex-1 sm:flex-none">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">{t('profile.first_name')}</Label>
            <Input 
              id="firstName" 
              value={userInfo.firstName}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, firstName: e.target.value})}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">{t('profile.last_name')}</Label>
            <Input 
              id="lastName" 
              value={userInfo.lastName}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, lastName: e.target.value})}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input 
            id="displayName" 
            value={userInfo.displayName}
            disabled={!isEditing}
            onChange={(e) => setUserInfo({...userInfo, displayName: e.target.value})}
            placeholder="Enter your display name"
            className={language === 'ar' ? 'text-right' : ''}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">{t('profile.current_password')}</Label>
            <Input 
              id="currentPassword" 
              type="password"
              value={userInfo.currentPassword}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, currentPassword: e.target.value})}
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">{t('profile.new_password')}</Label>
            <Input 
              id="newPassword" 
              type="password"
              value={userInfo.newPassword}
              disabled={!isEditing}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={language === 'ar' ? 'text-right' : ''}
            />
            {/* Password requirements - only show when editing, password has content, and NOT all requirements are met */}
            {isEditing && userInfo.newPassword.length > 0 && !passwordValidation.isValid && (
              <div className="text-xs space-y-1 mt-2">
                <p className={`flex items-center gap-1 ${passwordValidation.minLength ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{passwordValidation.minLength ? '✓' : '✗'}</span>
                  {t('password.min_length')}
                </p>
                <p className={`flex items-center gap-1 ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{passwordValidation.hasUppercase ? '✓' : '✗'}</span>
                  {t('password.uppercase')}
                </p>
                <p className={`flex items-center gap-1 ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{passwordValidation.hasLowercase ? '✓' : '✗'}</span>
                  {t('password.lowercase')}
                </p>
                <p className={`flex items-center gap-1 ${passwordValidation.hasNumber ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{passwordValidation.hasNumber ? '✓' : '✗'}</span>
                  {t('password.number')}
                </p>
                <p className={`flex items-center gap-1 ${passwordValidation.hasSpecial ? 'text-green-600' : 'text-red-500'}`}>
                  <span>{passwordValidation.hasSpecial ? '✓' : '✗'}</span>
                  {t('password.special_char')}
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">{t('profile.email')}</Label>
          <Input 
            id="email" 
            type="email" 
            value={userInfo.email}
            disabled={!isEditing}
            onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newEmail">New Email</Label>
          <Input 
            id="newEmail" 
            type="email" 
            value={userInfo.newEmail}
            disabled={!isEditing}
            onChange={(e) => setUserInfo({...userInfo, newEmail: e.target.value})}
            placeholder="Enter new email address"
            className={language === 'ar' ? 'text-right' : ''}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t('profile.phone')}</Label>
          <div className="flex gap-2">
            <Select 
              value={userInfo.phonePrefix} 
              onValueChange={(value) => setUserInfo({...userInfo, phonePrefix: value})}
              disabled={!isEditing || loadingCountries}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {loadingCountries ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.loading')}
                  </SelectItem>
                ) : (
                  phonePrefixes.map((prefix) => (
                    <SelectItem key={prefix.value} value={prefix.value}>
                    <span className={`fi fi-${prefix.flag} mx-2`}></span>
                    {prefix.label}
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input 
              id="phone" 
              value={userInfo.phone}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
              className="flex-1"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">{t('profile.country')}</Label>
            <Select 
              value={userInfo.country} 
              onValueChange={(value) => setUserInfo({...userInfo, country: value})}
              disabled={!isEditing || loadingCountries}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingCountries ? t('common.loading') : t('profile.select_country')} />
              </SelectTrigger>
              <SelectContent>
                {loadingCountries ? (
                  <SelectItem value="loading" disabled>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {t('common.loading')}
                  </SelectItem>
                ) : (
                  countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                    <span className={`fi fi-${country.flag} mx-2`}></span>
                    {country.label}
                  </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t('profile.address')}</Label>
            <Input 
              id="address" 
              value={userInfo.address}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
              placeholder={t('profile.address_placeholder')}
              className={language === 'ar' ? 'text-right' : ''}
            />
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                {t('profile.address_hint')}
              </p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input 
              id="city" 
              value={userInfo.city}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, city: e.target.value})}
              placeholder="Enter your city"
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input 
              id="postalCode" 
              value={userInfo.postalCode}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, postalCode: e.target.value})}
              placeholder="Enter postal code"
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <textarea 
            id="bio" 
            value={userInfo.bio}
            disabled={!isEditing}
            onChange={(e) => setUserInfo({...userInfo, bio: e.target.value})}
            placeholder="Tell us about yourself"
            className={`min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${language === 'ar' ? 'text-right' : ''}`}
            rows={4}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude</Label>
            <Input 
              id="latitude" 
              type="number"
              step="any"
              value={userInfo.latitude || ''}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, latitude: e.target.value ? parseFloat(e.target.value) : null})}
              placeholder="Enter latitude"
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude</Label>
            <Input 
              id="longitude" 
              type="number"
              step="any"
              value={userInfo.longitude || ''}
              disabled={!isEditing}
              onChange={(e) => setUserInfo({...userInfo, longitude: e.target.value ? parseFloat(e.target.value) : null})}
              placeholder="Enter longitude"
              className={language === 'ar' ? 'text-right' : ''}
            />
          </div>
        </div>
        {/* Delete account button */}
          <div className="flex justify-center sm:justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  <span className="sm:hidden">{t('profile.delete_account')}</span>
                  <span className="hidden sm:inline">{t('profile.delete_account')}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader className={`flex flex-row flex-wrap items-center ${language === 'ar' ? 'justify-end' : ''}`}>
                  <AlertDialogTitle>{t('profile.delete_confirm')}</AlertDialogTitle>
                  <AlertDialogDescription className={`text-left space-y-2${language === 'ar' ? ' text-right' : ''}`}>
                    <div>{t('profile.delete_description')}</div>
                    <div>{t('profile.delete_processing')}</div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('action.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccountDeletion}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('action.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        {!isEditing && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>{t('profile.edit_profile_photo')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileInfo;