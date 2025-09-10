
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Upload, Euro, MapPin, Tag, FileText, Camera } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Ad {
  id: string;
  title: string;
  category: string;
  price: number;
  published: boolean;
  validationStatus: string;
  rating: number;
  totalRentals: number;
  image: string;
}

interface AdEditDialogProps {
  ad: Ad;
}

const AdEditDialog = ({ ad }: AdEditDialogProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: ad.title,
    brand: '',
    model: '',
    year: '',
    category: ad.category,
    subcategory: '',
    condition: '',
    price: ad.price,
    deposit: '',
    location: '',
    description: '',
    instructions: ''
  });

  const categories = {
    'jardinage': 'Jardinage',
    'bricolage': 'Bricolage', 
    'nettoyage': 'Nettoyage',
    'evenementiel': 'Événementiel'
  };

  const subcategories = {
    'Jardinage': ['Gazon', 'Terre', 'Bois', 'Arbre', 'Feuilles'],
    'Bricolage': ['Construction', 'Électricité', 'Peinture', 'Vis et Boulons'],
    'Nettoyage': ['Tissus', 'Eau', 'Poussière'],
    'Événementiel': ['Son', 'Éclairage', 'Cuisine', 'Animation et Jeux', 'Décoration', 'Mobilier', 'Structure']
  };

  const handleSave = () => {
    toast({
      title: t('message.success'),
      description: t('ads.success_message'),
    });
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
              <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, value]) => (
                    <SelectItem key={key} value={value}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('ads.sub_category')}</Label>
              <Select value={formData.subcategory} onValueChange={(value) => setFormData({...formData, subcategory: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t('ads.sub_category_placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {formData.category && subcategories[formData.category as keyof typeof subcategories]?.map((sub) => (
                    <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                  ))}
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
                <SelectItem value="new">{t('add_tool.condition_new')}</SelectItem>
                <SelectItem value="excellent">{t('add_tool.condition_excellent')}</SelectItem>
                <SelectItem value="good">{t('add_tool.condition_good')}</SelectItem>
                <SelectItem value="fair">{t('add_tool.condition_fair')}</SelectItem>
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
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder={t('ads.location_placeholder')}
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
          
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              {t('ads.photos_placeholder')}
            </p>
            <Button variant="outline" size="sm">
              {t('ads.browse_files')}
            </Button>
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
          <Button variant="outline">{t('action.cancel')}</Button>
          <Button onClick={handleSave}>{t('action.save')}</Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default AdEditDialog;
