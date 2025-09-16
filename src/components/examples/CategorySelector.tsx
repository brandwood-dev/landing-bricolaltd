import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toolsService } from '@/services/toolsService';
import { Category, Subcategory } from '@/types/bridge/tool.types';
import { Loader2 } from 'lucide-react';

interface CategorySelectorProps {
  onCategoryChange?: (categoryId: string) => void;
  onSubcategoryChange?: (subcategoryId: string) => void;
  selectedCategoryId?: string;
  selectedSubcategoryId?: string;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  onCategoryChange,
  onSubcategoryChange,
  selectedCategoryId = '',
  selectedSubcategoryId = ''
}) => {
  const { toast } = useToast();
  
  // States pour les catégories et sous-catégories
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  
  // États locaux pour les sélections
  const [categoryId, setCategoryId] = useState(selectedCategoryId);
  const [subcategoryId, setSubcategoryId] = useState(selectedSubcategoryId);

  // Charger les catégories au montage du composant
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('🔄 Chargement des catégories...');
        const categoriesData = await toolsService.getCategories();
        console.log('✅ Catégories chargées:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive"
        });
      } finally {
        setLoadingCategories(false);
      }
    };
    
    loadCategories();
  }, [toast]);

  // Charger les sous-catégories quand la catégorie change
  const loadSubcategories = async (categoryId: string) => {
    try {
      setLoadingSubcategories(true);
      console.log('🔄 Chargement des sous-catégories pour la catégorie:', categoryId);
      const subcategoriesData = await toolsService.getSubcategoriesByCategory(categoryId);
      console.log('✅ Sous-catégories chargées:', subcategoriesData);
      setSubcategories(subcategoriesData);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sous-catégories:', error);
      setSubcategories([]);
      toast({
        title: "Erreur",
        description: "Impossible de charger les sous-catégories",
        variant: "destructive"
      });
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Gérer le changement de catégorie
  const handleCategoryChange = (value: string) => {
    setCategoryId(value);
    setSubcategoryId(''); // Réinitialiser la sous-catégorie
    
    // Charger les sous-catégories pour la nouvelle catégorie
    if (value) {
      loadSubcategories(value);
    } else {
      setSubcategories([]);
    }
    
    // Notifier le parent
    onCategoryChange?.(value);
    onSubcategoryChange?.(''); // Réinitialiser la sous-catégorie dans le parent
  };

  // Gérer le changement de sous-catégorie
  const handleSubcategoryChange = (value: string) => {
    setSubcategoryId(value);
    onSubcategoryChange?.(value);
  };

  // Charger les sous-catégories si une catégorie est présélectionnée
  useEffect(() => {
    if (selectedCategoryId && selectedCategoryId !== categoryId) {
      setCategoryId(selectedCategoryId);
      loadSubcategories(selectedCategoryId);
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (selectedSubcategoryId !== subcategoryId) {
      setSubcategoryId(selectedSubcategoryId);
    }
  }, [selectedSubcategoryId]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">
        Sélecteur de Catégories (Exemple)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sélecteur de catégorie */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Catégorie *
          </Label>
          <Select 
            value={categoryId} 
            onValueChange={handleCategoryChange}
            disabled={loadingCategories}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue
                placeholder={
                  loadingCategories ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </div>
                  ) : (
                    "Choisir une catégorie"
                  )
                }
              />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingCategories && (
            <p className="text-xs text-muted-foreground">
              Chargement des catégories depuis la base de données...
            </p>
          )}
        </div>

        {/* Sélecteur de sous-catégorie */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">
            Sous-catégorie
          </Label>
          <Select 
            value={subcategoryId} 
            onValueChange={handleSubcategoryChange}
            disabled={!categoryId || subcategories.length === 0 || loadingSubcategories}
          >
            <SelectTrigger className="h-12 text-base">
              <SelectValue
                placeholder={
                  loadingSubcategories ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Chargement...
                    </div>
                  ) : !categoryId ? (
                    "Choisir une catégorie d'abord"
                  ) : subcategories.length === 0 ? (
                    "Aucune sous-catégorie disponible"
                  ) : (
                    "Choisir une sous-catégorie"
                  )
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subcategories.map((subcategory) => (
                <SelectItem key={subcategory.id} value={subcategory.id}>
                  {subcategory.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loadingSubcategories && (
            <p className="text-xs text-muted-foreground">
              Chargement des sous-catégories depuis la base de données...
            </p>
          )}
        </div>
      </div>

      {/* Informations de débogage */}
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h4 className="font-medium mb-2">Informations de débogage :</h4>
        <div className="text-sm space-y-1">
          <p><strong>Catégorie sélectionnée :</strong> {categoryId || 'Aucune'}</p>
          <p><strong>Sous-catégorie sélectionnée :</strong> {subcategoryId || 'Aucune'}</p>
          <p><strong>Nombre de catégories :</strong> {categories.length}</p>
          <p><strong>Nombre de sous-catégories :</strong> {subcategories.length}</p>
          <p><strong>État de chargement :</strong> 
            {loadingCategories ? 'Chargement catégories...' : 
             loadingSubcategories ? 'Chargement sous-catégories...' : 'Terminé'}
          </p>
        </div>
      </div>

      {/* Instructions d'utilisation */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Comment utiliser ce composant :</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <p>1. Les catégories sont chargées automatiquement depuis la base de données</p>
          <p>2. Sélectionnez une catégorie pour charger ses sous-catégories</p>
          <p>3. Les données sont récupérées via toolsService.getCategories() et toolsService.getSubcategoriesByCategory()</p>
          <p>4. La structure de l'API retourne les données dans response.data.data</p>
          <p>5. Les états de chargement et les erreurs sont gérés automatiquement</p>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;

// Exemple d'utilisation :
// <CategorySelector 
//   onCategoryChange={(categoryId) => console.log('Catégorie:', categoryId)}
//   onSubcategoryChange={(subcategoryId) => console.log('Sous-catégorie:', subcategoryId)}
//   selectedCategoryId="category-id-123"
//   selectedSubcategoryId="subcategory-id-456"
// />