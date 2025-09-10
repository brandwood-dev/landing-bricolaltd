import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Shield, TrendingUp } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const GuideLoueur = () => {
  const {t, language} = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('ownersGuide.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('ownersGuide.intro')}
            </p>
          </div>

          {/* Getting Started */}
          <div className="mb-12">
            {/*<h2 className="text-3xl font-bold mb-8">Comment commencer</h2>*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step1.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step1.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step2.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step2.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step3.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step3.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step4.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step4.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step5.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step5.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step6.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step6.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className={"flex items-center " + (language === 'ar' ? '[direction:ltr]' : '')}>
                    <CheckCircle className="h-6 w-6 text-green-500 mr-2" />
                    {t('ownersGuide.step7.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('ownersGuide.step7.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Best Practices */}
          {/* <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Conseils pour réussir</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-6 w-6 text-yellow-500 mr-2" />
                    Créez des annonces attractives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Utilisez des photos de haute qualité sous différents angles</li>
                    <li>Rédigez des descriptions détaillées et honnêtes</li>
                    <li>Précisez l'état, l'âge et les caractéristiques techniques</li>
                    <li>Mentionnez les accessoires inclus</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                    Optimisez vos tarifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Étudiez les prix de location similaires dans votre région</li>
                    <li>Proposez des tarifs dégressifs pour les locations longues</li>
                    <li>Ajustez vos prix selon la demande et la saisonnalité</li>
                    <li>Incluez une caution raisonnable pour vous protéger</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 text-green-500 mr-2" />
                    Protégez vos outils
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Vérifiez l'identité du locataire avant la remise</li>
                    <li>Prenez des photos de l'outil avant et après location</li>
                    <li>Expliquez le bon usage et les précautions d'emploi</li>
                    <li>Demandez une caution adaptée à la valeur de l'outil</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Revenus et commissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Bricola prélève une commission de 5,4% sur chaque location réussie pour couvrir :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Les frais de transaction et de paiement sécurisé</li>
                  <li>La couverture d'assurance de vos outils</li>
                  <li>Le support client et la résolution de litiges</li>
                  <li>La maintenance et l'amélioration de la plateforme</li>
                </ul>
                <p className="text-sm text-gray-500 italic">
                  Les paiements sont versés sous 48h après la fin de la location.
                </p>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default GuideLoueur;