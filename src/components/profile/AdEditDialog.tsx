
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Euro, MapPin, Tag, FileText, Camera, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toolsService } from '@/services/toolsService';
import AddressAutocomplete from '@/components/AddressAutocomplete';

interface ToolPhoto {
  id: string;
  url: string;
  filename: string;
  isPrimary: boolean;
  toolId: string;
  createdAt: string;
}

interface Tool {
  id: string;
  title: string;
  description: string;
  brand?: string;
  model?: string;
  year?: number;
  condition: string;
  pickupAddress: string;
  basePrice: number;
  depositAmount: number;
  ownerInstructions?: string;
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  photos: ToolPhoto[];
  toolStatus: string;
  moderationStatus: string;
}

interface AdEditDialogProps {
  ad: Tool;
  onClose: () => void;
  onSave: () => void;
}

const AdEditDialog = ({ ad, onClose, onSave }: AdEditDialogProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Log de débogage pour le pays de l'utilisateur
  console.log('User country for address suggestions:', user?.country || 'KW');
  
  const [formData, setFormData] = useState({
    title: ad.title,
    brand: ad.brand || '',
    model: ad.model || '',
    year: ad.year?.toString() || '',
    category: ad.category?.id || '',
    subcategory: ad.subcategory?.id || '',
    condition: ad.condition.toString(),
    price: ad.basePrice,
    deposit: ad.depositAmount.toString(),
    location: ad.pickupAddress,
    description: ad.description,
    instructions: ad.ownerInstructions || ''
  });
  
  // Debug logs pour l'initialisation
  console.log('🔧 AdEditDialog - Initial data:', {
    category: ad.category,
    subcategory: ad.subcategory,
    formData_category: ad.category?.id || '',
    formData_subcategory: ad.subcategory?.id || ''
  });
  const [existingPhotos, setExistingPhotos] = useState<ToolPhoto[]>(ad.photos || []);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [photosToDelete, setPhotosToDelete] = useState<string[]>([]);
  const [primaryPhotoId, setPrimaryPhotoId] = useState<string | null>(
    ad.photos?.find(photo => photo.isPrimary)?.id || null
  );
  const [newPhotoPrimaryIndex, setNewPhotoPrimaryIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Array<{id: string, name: string}>>([]);
  const [subcategories, setSubcategories] = useState<Array<{id: string, name: string}>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const categories = await toolsService.getCategories();
        setCategories(categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les catégories',
          variant: 'destructive'
        });
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      console.log('🔧 Loading subcategories for category:', formData.category);
      if (formData.category) {
        try {
          setLoadingSubcategories(true);
          const subcategories = await toolsService.getSubcategoriesByCategory(formData.category);
          console.log('🔧 Loaded subcategories:', subcategories);
          setSubcategories(subcategories || []);
        } catch (error) {
          console.error('Error loading subcategories:', error);
          setSubcategories([]);
        } finally {
          setLoadingSubcategories(false);
        }
      } else {
        console.log('🔧 No category selected, clearing subcategories');
        setSubcategories([]);
        setLoadingSubcategories(false);
      }
    };

    // Load subcategories if we have categories loaded and a category is selected
    if (categories.length > 0 && formData.category) {
      loadSubcategories();
    } else if (!formData.category) {
      // Clear subcategories if no category is selected
      setSubcategories([]);
      setLoadingSubcategories(false);
    }
  }, [formData.category, categories]);

  const handleCategoryChange = (categoryId: string) => {
    console.log('🔧 Category changed to:', categoryId);
    console.log('🔧 Previous formData:', formData);
    const newFormData = {
      ...formData,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    };
    console.log('🔧 New formData:', newFormData);
    setFormData(newFormData);
    // Clear subcategories list to force reload
    setSubcategories([]);
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
        const isValidType = file.type.startsWith('image/');
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
        return isValidType && isValidSize;
      });
      
      if (validFiles.length + existingPhotos.length + newPhotos.length > 5) {
        toast({
          title: t('general.error'),
          description: 'Maximum 5 photos allowed',
          variant: 'destructive'
        });
        return;
      }
      
      setNewPhotos(prev => [...prev, ...validFiles]);
      
      // If this is the first photo and no existing primary photo, set it as primary
      if (existingPhotos.length === 0 && newPhotos.length === 0 && validFiles.length > 0 && !primaryPhotoId) {
        setNewPhotoPrimaryIndex(0);
      }
  };

  const handleRemoveExistingPhoto = (photoId: string) => {
    setPhotosToDelete(prev => [...prev, photoId]);
    setExistingPhotos(prev => prev.filter(photo => photo.id !== photoId));
    
    // If removing the primary photo, clear the primary selection
    if (primaryPhotoId === photoId) {
      setPrimaryPhotoId(null);
    }
  };

  const handleRemoveNewPhoto = (index: number) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
    // Reset primary selection if removing the primary photo
    if (newPhotoPrimaryIndex === index) {
      setNewPhotoPrimaryIndex(null);
    } else if (newPhotoPrimaryIndex !== null && newPhotoPrimaryIndex > index) {
      setNewPhotoPrimaryIndex(newPhotoPrimaryIndex - 1);
    }
  };

  const handleSetExistingPhotoPrimary = (photoId: string) => {
    setPrimaryPhotoId(photoId);
    setNewPhotoPrimaryIndex(null); // Désélectionner toute nouvelle photo principale
  };

  const handleSetNewPhotoPrimary = (index: number) => {
    setNewPhotoPrimaryIndex(index);
    setPrimaryPhotoId(null); // Désélectionner toute photo existante principale
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Prepare form data for API
      const updateData = {
        title: formData.title,
        description: formData.description,
        brand: formData.brand,
        model: formData.model,
        year: formData.year ? parseInt(formData.year) : undefined,
        condition: parseInt(formData.condition),
        basePrice: formData.price,
        depositAmount: parseFloat(formData.deposit),
        pickupAddress: formData.location,
        ownerInstructions: formData.instructions,
        categoryId: formData.category,
        subcategoryId: formData.subcategory || null // Send null if empty string
      };

      // Debug logs
      console.log('🔧 FormData before update:', {
        category: formData.category,
        subcategory: formData.subcategory
      });
      console.log('🔧 UpdateData being sent to API:', updateData);

      // Update tool data
      await toolsService.updateTool(ad.id, updateData);
      console.log('Tool data updated successfully');

      // Handle photo deletions with error handling
      const deletionResults = [];
      for (const photoId of photosToDelete) {
        try {
          // Validate photo ID format
          if (!photoId || typeof photoId !== 'string' || photoId.trim() === '') {
            console.warn(`Invalid photo ID: ${photoId}`);
            continue;
          }
          
          console.log(`Attempting to delete photo: ${photoId}`);
          await toolsService.deletePhoto(ad.id, photoId);
          console.log(`Successfully deleted photo: ${photoId}`);
          deletionResults.push({ photoId, success: true });
        } catch (error) {
          console.error(`Failed to delete photo ${photoId}:`, error);
          deletionResults.push({ photoId, success: false, error: error.message });
          // Continue with other deletions instead of failing completely
        }
      }

      // Handle new photo uploads with error handling
      const uploadResults = [];
      let newPrimaryPhotoId = null;
      if (newPhotos.length > 0) {
        for (let i = 0; i < newPhotos.length; i++) {
          const photo = newPhotos[i];
          try {
            console.log(`Uploading new photo ${i + 1}/${newPhotos.length}`);
            const uploadedPhoto = await toolsService.addToolPhoto(ad.id, photo);
            console.log(`Successfully uploaded photo ${i + 1}`);
            uploadResults.push({ index: i, success: true, photoId: uploadedPhoto.id });
            
            // Store the ID of the photo that should be primary
            if (newPhotoPrimaryIndex === i) {
              newPrimaryPhotoId = uploadedPhoto.id;
            }
          } catch (error) {
            console.error(`Failed to upload photo ${i + 1}:`, error);
            uploadResults.push({ index: i, success: false, error: error.message });
            // Continue with other uploads
          }
        }
      }

      // Handle primary photo setting
      try {
        if (primaryPhotoId) {
          // Set existing photo as primary
          await toolsService.setPhotoPrimary(primaryPhotoId);
          console.log(`Set existing photo ${primaryPhotoId} as primary`);
        } else if (newPrimaryPhotoId) {
          // Set newly uploaded photo as primary
          await toolsService.setPhotoPrimary(newPrimaryPhotoId);
          console.log(`Set new photo ${newPrimaryPhotoId} as primary`);
        }
      } catch (error) {
        console.error('Failed to set primary photo:', error);
        // Don't fail the entire operation for this
      }

      // Check if there were any critical failures
      const failedDeletions = deletionResults.filter(r => !r.success);
      const failedUploads = uploadResults.filter(r => !r.success);
      
      let successMessage = t('ads.success_message');
      if (failedDeletions.length > 0 || failedUploads.length > 0) {
        const issues = [];
        if (failedDeletions.length > 0) {
          issues.push(`${failedDeletions.length} photo(s) could not be deleted`);
        }
        if (failedUploads.length > 0) {
          issues.push(`${failedUploads.length} photo(s) could not be uploaded`);
        }
        successMessage += `. Note: ${issues.join(', ')}.`;
      }

      toast({
        title: t('message.success'),
        description: successMessage,
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating tool:', error);
      toast({
        title: t('general.error'),
        description: 'Failed to update tool',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  const { t, language} = useLanguage();
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader className={language === 'ar' ? 'flex justify-end' : 'text-left'}>
        <DialogTitle>{t('ads.update')}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.general_information')}
                  <FileText className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <FileText className="h-5 w-5 mr-2" />
                  {t('ads.general_information')}
                </>
              )
            }
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">{t('ads.listing_title')} *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="brand">{t('ads.brand')}</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                placeholder={`${t('general.example')}: Bosch`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="model">{t('ads.model')}</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder={`${t('general.example')}: GSB 13 RE`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">{t('ads.year_of_purchase')}</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
                placeholder={`${t('general.example')}: 2022`}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">{t('ads.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('ads.description_placeholder')}
              rows={4}
            />
          </div>
        </div>

        {/* Catégorisation */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.categorization')}
                  <Tag className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <Tag className="h-5 w-5 mr-2" />
                  {t('ads.categorization')}
                </>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('ads.category')} *</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} disabled={loadingCategories}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Chargement..." : "Sélectionner une catégorie"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    console.log('🔧 Rendering category:', category, 'Selected:', formData.category === category.id);
                    return (
                      <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('ads.sub_category')}</Label>
              <Select value={formData.subcategory} onValueChange={(value) => {
                console.log('🔧 Subcategory changed to:', value);
                console.log('🔧 Available subcategories:', subcategories);
                console.log('🔧 Current formData before subcategory change:', formData);
                const newFormData = {...formData, subcategory: value};
                console.log('🔧 New formData after subcategory change:', newFormData);
                setFormData(newFormData);
              }} disabled={loadingSubcategories || !formData.category}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingSubcategories ? "Chargement..." : t('ads.sub_category_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((subcategory) => {
                    console.log('🔧 Rendering subcategory:', subcategory, 'Selected:', formData.subcategory === subcategory.id);
                    return (
                      <SelectItem key={subcategory.id} value={subcategory.id}>{subcategory.name}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('ads.tool_condition')} *</Label>
            <Select value={formData.condition} onValueChange={(value) => setFormData({...formData, condition: value})}>
              <SelectTrigger>
                <SelectValue placeholder={t('ads.tool_condition')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Neuf</SelectItem>
                <SelectItem value="2">Comme neuf</SelectItem>
                <SelectItem value="3">Bon état</SelectItem>
                <SelectItem value="4">État correct</SelectItem>
                <SelectItem value="5">Mauvais état</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tarification */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.pricing')}
                  <Euro className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <Euro className="h-5 w-5 mr-2" />
                  {t('ads.pricing')}
                </>
            )}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t('ads.pricing_placeholder')} *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deposit">{t('ads.deposit')} *</Label>
              <Input
                id="deposit"
                type="number"
                value={formData.deposit}
                onChange={(e) => setFormData({...formData, deposit: e.target.value})}
                placeholder="100"
              />
            </div>
          </div>
        </div>

        {/* Localisation */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.location')}
                  <MapPin className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <MapPin className="h-5 w-5 mr-2" />
                  {t('ads.location')}
                </>
            )}
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="location">{t('ads.location')} *</Label>
            <AddressAutocomplete
              value={formData.location}
              onChange={(value) => setFormData({...formData, location: value})}
              onAddressSelected={(isSelected) => console.log('Address selected:', isSelected)}
              placeholder={t('ads.location_placeholder')}
              selectedCountry={user?.country || 'KW'}
            />
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.photos')}
                  <Camera className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <Camera className="h-5 w-5 mr-2" />
                  {t('ads.photos')}
                </>
            )
            }
          </h3>
          
          {/* Existing Photos */}
          {existingPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Photos actuelles</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {existingPhotos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingPhoto(photo.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {primaryPhotoId === photo.id && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                    {primaryPhotoId !== photo.id && (
                      <button
                        type="button"
                        onClick={() => handleSetExistingPhotoPrimary(photo.id)}
                        className="absolute bottom-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Définir comme principale
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* New Photos Preview */}
          {newPhotos.length > 0 && (
            <div className="space-y-2">
              <Label>Nouvelles photos</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {newPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={photo.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewPhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    {newPhotoPrimaryIndex === index && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </div>
                    )}
                    {newPhotoPrimaryIndex !== index && (
                      <button
                        type="button"
                        onClick={() => handleSetNewPhotoPrimary(index)}
                        className="absolute bottom-2 right-2 bg-green-500 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Définir comme principale
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Upload New Photos */}
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('ads.photos_placeholder')}
            </p>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={existingPhotos.length + newPhotos.length >= 5}
            >
              {t('ads.browse_files')}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG jusqu'à 10MB • {5 - existingPhotos.length - newPhotos.length} photos restantes
            </p>
            {existingPhotos.length === 0 && newPhotos.length === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Au moins une photo est requise
              </p>
            )}
          </div>
        </div>

        {/* Consignes */}
        <div className="space-y-4">
          <h3 className={"text-lg font-semibold flex items-center" + (language === 'ar' ? ' flex justify-end' : '')}>
            {
              language === 'ar' ? (
                <>
                {t('ads.owner_instructions')}
                  <Tag className="h-5 w-5 mr-2 ml-2" />
                  
                </>
              ):(
                <>
                  <Tag className="h-5 w-5 mr-2" />
                  {t('ads.owner_instructions')}
                </>
            )}
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">{t('ads.owner_instructions')}</Label>
            <Textarea
              id="instructions"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              placeholder={`${t('general.example')}: ${t('ads.owner_instructions_placeholder')}`}
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isLoading}
          >
            {t('action.cancel')}
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Sauvegarde...' : t('action.save')}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AdEditDialog;
