import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const PolitiqueAnnulation = () => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('cancellationPolicy.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('cancellationPolicy.intro')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Introduction */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cancellationPolicy.renters.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cancellationPolicy.renters.rule1')}
                </p>
                <p className="text-gray-600">
                  {t('cancellationPolicy.renters.rule2')}
                </p>
              </CardContent>
            </Card>

            {/* Section 2: Access to the Platform */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cancellationPolicy.owners.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cancellationPolicy.owners.rule1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('cancellationPolicy.owners.rule2')}
                </p>
              </CardContent>
            </Card>

            {/* Section 3: Registration and User Verification */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cancellationPolicy.maxDuration.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cancellationPolicy.maxDuration.rule')}
                </p>
              </CardContent>
            </Card>

            {/* Section 4: Rental Rules and Responsibilities */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cancellationPolicy.autoCancellations.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cancellationPolicy.autoCancellations.rule')}
                </p>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PolitiqueAnnulation;