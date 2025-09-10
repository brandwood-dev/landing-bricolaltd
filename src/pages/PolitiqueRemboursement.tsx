import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import PolitiqueAnnulation from './PolitiqueAnnulation';

const PolitiqueRemboursement = () => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('refundPolicy.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('refundPolicy.intro')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Introduction */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('refundPolicy.renters.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.renters.rule1')}
                </p>
                <p className="text-gray-600">
                  {t('refundPolicy.renters.rule2')}
                </p>
              </CardContent>
            </Card>

            {/* Section 2: Access to the Platform */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('refundPolicy.deposit.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.deposit.rule1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.deposit.rule2')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.deposit.rule3')}
                </p>
              </CardContent>
            </Card>

            {/* Section 3: Registration and User Verification */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('refundPolicy.lateReturns.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.lateReturns.rule')}
                </p>
              </CardContent>
            </Card>

            {/* Section 4: Rental Rules and Responsibilities */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('refundPolicy.disputes.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.disputes.rule1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.disputes.rule2')}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('refundPolicy.payments.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.payments.rule1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('refundPolicy.payments.rule2')}
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

export default PolitiqueRemboursement;