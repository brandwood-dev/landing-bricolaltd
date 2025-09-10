import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const CGU = () => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('cgu.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('cgu.last_updated')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Section 1: Introduction */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section1.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section1.p1')}
                </p>
                <p className="text-gray-600">
                  {t('cgu.section1.p2')}
                </p>
              </CardContent>
            </Card>

            {/* Section 2: Access to the Platform */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section2.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section2.p1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section2.p2')}
                </p>
                <p className="text-gray-600">
                  {t('cgu.section2.p3')}
                </p>
              </CardContent>
            </Card>

            {/* Section 3: Registration and User Verification */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section3.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section3.li1')}</li>
                  <li>{t('cgu.section3.li2')}</li>
                  <li>{t('cgu.section3.li3')}</li>
                  <li>{t('cgu.section3.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 4: Rental Rules and Responsibilities */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section4.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section4.li1')}</li>
                  <li>{t('cgu.section4.li2')}</li>
                  <li>{t('cgu.section4.li3')}</li>
                  <li>{t('cgu.section4.li4')}</li>
                  <li>{t('cgu.section4.li5')}</li>
                  <li>{t('cgu.section4.li6')}</li>
                  <li>{t('cgu.section4.li7')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 5: Payment, Commissions and Wallets */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section5.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section5.li1')}</li>
                  <li>{t('cgu.section5.li2')}</li>
                  <li>{t('cgu.section5.li3')}</li>
                  <li>{t('cgu.section5.li4')}</li>
                  <li>{t('cgu.section5.li5')}</li>
                  <li>{t('cgu.section5.li6')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 6: Security Deposit Policy */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section6.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section6.li1')}</li>
                  <li>{t('cgu.section6.li2')}</li>
                  <li>{t('cgu.section6.li3')}</li>
                  <li>{t('cgu.section6.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 7: Dispute Handling */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section7.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section7.li1')}</li>
                  <li>{t('cgu.section7.li2')}</li>
                  <li>{t('cgu.section7.li3')}</li>
                  <li>{t('cgu.section7.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 8: Fair Use and Platform Integrity */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section8.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section8.li1')}</li>
                  <li>{t('cgu.section8.li2')}</li>
                  <li>{t('cgu.section8.li3')}</li>
                  <li>{t('cgu.section8.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 9: Cancellation and Refund Policy */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section9.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section9.li1')}</li>
                  <li>{t('cgu.section9.li2')}</li>
                  <li>{t('cgu.section9.li3')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 10: Service Availability and Updates */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section10.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section10.li1')}</li>
                  <li>{t('cgu.section10.li2')}</li>
                  <li>{t('cgu.section10.li3')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 11: Data Protection and Privacy */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section11.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section11.li1')}</li>
                  <li>{t('cgu.section11.li2')}</li>
                  <li>{t('cgu.section11.li3')}</li>
                  <li>{t('cgu.section11.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 12: Jurisdiction and Legal Framework */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section12.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>{t('cgu.section12.li1')}</li>
                  <li>{t('cgu.section12.li2')}</li>
                  <li>{t('cgu.section12.li3')}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Section 13: Automatic Confirmation in Case of Inactivity */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section13.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('cgu.section13.p')}
                </p>
              </CardContent>
            </Card>

            {/* Section 14: Modification and Acceptance of Terms */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section14.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section14.p1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section14.p2')}
                </p>
                <p className="text-gray-600">
                  {t('cgu.section14.p3')}
                </p>
              </CardContent>
            </Card>

            {/* Section 15: Contact and Official Communication */}
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('cgu.section15.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('cgu.section15.p1')}
                </p>
                <p className="text-gray-600">
                  {t('cgu.section15.p2')}
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

export default CGU;