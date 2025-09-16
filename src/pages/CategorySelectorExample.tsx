import React from 'react';
import CategorySelector from '@/components/examples/CategorySelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const CategorySelectorExample: React.FC = () => {
  const handleCategoryChange = (categoryId: string) => {
    console.log('📂 Catégorie sélectionnée:', categoryId);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    console.log('📁 Sous-catégorie sélectionnée:', subcategoryId);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Exemple de Sélecteur de Catégories
            </h1>
            <p className="text-muted-foreground">
              Démonstration du chargement des catégories et sous-catégories depuis la base de données
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sélecteur de Catégories</CardTitle>
              <CardDescription>
                Ce composant charge dynamiquement les catégories et sous-catégories 
                depuis la base de données en utilisant toolsService.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategorySelector 
                onCategoryChange={handleCategoryChange}
                onSubcategoryChange={handleSubcategoryChange}
              />
            </CardContent>
          </Card>

          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Instructions de test</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Pour tester ce composant :</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Ouvrez la console du navigateur (F12)</li>
                      <li>Observez les logs de chargement des catégories</li>
                      <li>Sélectionnez une catégorie dans le premier dropdown</li>
                      <li>Observez le chargement automatique des sous-catégories</li>
                      <li>Vérifiez les logs dans la console pour voir les IDs sélectionnés</li>
                    </ol>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Fonctionnalités testées :</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Chargement automatique des catégories au montage</li>
                      <li>Chargement dynamique des sous-catégories</li>
                      <li>Gestion des états de chargement</li>
                      <li>Gestion des erreurs avec toast</li>
                      <li>Réinitialisation de la sous-catégorie lors du changement de catégorie</li>
                      <li>Interface utilisateur responsive</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Structure de l'API :</h4>
                    <div className="bg-muted p-3 rounded text-sm font-mono">
                      <p>toolsService.getCategories() → Category[]</p>
                      <p>toolsService.getSubcategoriesByCategory(categoryId) → Subcategory[]</p>
                      <p>Réponse API : &#123;"data": [...], "message": "Request successful"&#125;</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectorExample;