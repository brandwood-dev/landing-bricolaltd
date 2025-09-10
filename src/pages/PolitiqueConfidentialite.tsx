import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const PolitiqueConfidentialite = () => {
  const { t, language } = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('privacy.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('privacy.last_updated')}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section1.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('privacy.section1.p1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('privacy.section1.p2')}
                </p>
                <p className="text-gray-600">
                  {t('privacy.section1.p3')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section2.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section2.p1')}</p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">{t('privacy.section2.identification')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('privacy.section2.identification.li1')}</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">{t('privacy.section2.account')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('privacy.section2.account.li1')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t('privacy.section2.payment')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('privacy.section2.payment.li1')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t('privacy.section2.technical')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('privacy.section2.technical.li1')}</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">{t('privacy.section2.usage')}</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                      <li>{t('privacy.section2.usage.li1')}</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section3.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section3.p1')}</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>{t('privacy.section3.li1')}</li>
                  <li>{t('privacy.section3.li2')}</li>
                  <li>{t('privacy.section3.li3')}</li>
                  <li>{t('privacy.section3.li4')}</li>
                  <li>{t('privacy.section3.li5')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section4.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('privacy.section4.p1')}
                </p>
                <div className="space-y-3 text-gray-600">
                  <p>{t('privacy.section4.consent')}</p>
                  <p>{t('privacy.section4.interest')}</p>
                  <p>{t('privacy.section4.legal')}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section5.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section5.p1')}</p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                  <li>{t('privacy.section5.li1')}</li>
                  <li>{t('privacy.section5.li2')}</li>
                  <li>{t('privacy.section5.li3')}</li>
                  <li>{t('privacy.section5.li4')}</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section6.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section6.p1')}</p>
                <p className="text-gray-600">
                  {t('privacy.section6.p2')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section7.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section7.p1')}</p>
                <p className="text-gray-600">
                  {t('privacy.section7.p2')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section8.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{t('privacy.section8.p1')}</p>
                {/* Show detailed rights if available, otherwise show simple list */}
                {t('privacy.section8.access') && t('privacy.section8.access.desc') ? (
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li><strong>{t('privacy.section8.access')} </strong>{t('privacy.section8.access.desc')}</li>
                    <li><strong>{t('privacy.section8.rectification')} </strong>{t('privacy.section8.rectification.desc')}</li>
                    <li><strong>{t('privacy.section8.erasure')} </strong>{t('privacy.section8.erasure.desc')}</li>
                    <li><strong>{t('privacy.section8.withdrawal')} </strong>{t('privacy.section8.withdrawal.desc')}</li>
                  </ul>
                ) : (
                  <ul className="list-disc list-inside space-y-2 text-gray-600 ml-4">
                    <li>{t('privacy.section8.li1')}</li>
                    <li>{t('privacy.section8.li2')}</li>
                    <li>{t('privacy.section8.li3')}</li>
                    <li>{t('privacy.section8.li4')}</li>
                  </ul>
                )}
                <p className="text-gray-600 mt-4">
                  {t('privacy.section8.p2') || t('privacy.section8.contact')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section9.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {t('privacy.section9.p1')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={`flex ${language === 'ar' ? 'justify-end' : 'justify-start'}`}>
                <CardTitle>{t('privacy.section10.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  {t('privacy.section10.p1')}
                </p>
                <p className="text-gray-600 mb-4">
                  {t('privacy.section10.p2')}
                </p>
                <p className="text-gray-600">
                  {t('privacy.section10.p3')}
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

export default PolitiqueConfidentialite;