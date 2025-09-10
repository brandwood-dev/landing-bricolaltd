import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, Shield, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const GuideLocataire = () => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('rentersGuide.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('rentersGuide.intro')} 
            </p>
          </div>

          {/* How to Rent */}
          <div className="mb-12">
            {/* <h2 className="text-3xl font-bold mb-8">Comment louer un outil</h2> */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <Search className="h-6 w-6 text-blue-500 mr-2" />
                     {t('rentersGuide.step1.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step1.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-6 w-6 text-green-500 mr-2" />
                     {t('rentersGuide.step2.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step2.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <Shield className="h-6 w-6 text-purple-500 mr-2" />
                     {t('rentersGuide.step3.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step3.description')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                     {t('rentersGuide.step4.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step4.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                     {t('rentersGuide.step5.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step5.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                     {t('rentersGuide.step6.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step6.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                   {t('rentersGuide.step7.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step7.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                     {t('rentersGuide.step8.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step8.description')}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-orange-500 mr-2" />
                     {t('rentersGuide.step9.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    {t('rentersGuide.step9.description')}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tips for Renters */}
          {/* <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8">Conseils pour bien louer</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Avant la réservation</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Lisez attentivement la description de l'outil</li>
                    <li>Vérifiez les photos et l'état mentionné</li>
                    <li>Consultez les avis des précédents locataires</li>
                    <li>Contactez le propriétaire si vous avez des questions</li>
                    <li>Assurez-vous de la compatibilité avec votre projet</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pendant la location</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Inspectez l'outil avec le propriétaire à la remise</li>
                    <li>Prenez des photos de l'état initial</li>
                    <li>Respectez les consignes d'utilisation données</li>
                    <li>Manipulez l'outil avec soin et précaution</li>
                    <li>Contactez le propriétaire en cas de problème</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Lors du retour</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-gray-600">
                    <li>Nettoyez l'outil avant de le rendre</li>
                    <li>Respectez l'heure de retour convenue</li>
                    <li>Vérifiez l'état avec le propriétaire</li>
                    <li>Signalez tout dommage éventuel</li>
                    <li>Laissez un avis honnête sur votre expérience</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Sécurité et assurance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Votre sécurité et celle des outils loués sont nos priorités :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>Tous les outils sont couverts par notre assurance complète</li>
                  <li>Vos paiements sont protégés jusqu'à la remise effective</li>
                  <li>Un service client disponible 7j/7 pour vous accompagner</li>
                  <li>Système de caution pour protéger les propriétaires</li>
                  <li>Vérification de l'identité de tous les utilisateurs</li>
                </ul>
                <p className="text-sm text-gray-500 italic">
                  En cas de problème, notre équipe intervient rapidement pour trouver une solution équitable.
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

export default GuideLocataire;