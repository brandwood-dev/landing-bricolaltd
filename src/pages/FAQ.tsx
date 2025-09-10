import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

const FAQ = () => {
  const { t, language } = useLanguage();

  // Determine the direction based on the language
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      className="min-h-screen  bg-background"
      dir={direction} // Enforce direction at the root level
      style={{
        textAlign: direction === 'rtl' ? 'right' : 'left', // Align text with direction
      }}
    >
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div
            className="text-center mb-16"
            style={{
              textAlign: 'center', // Keep hero text centered regardless of direction
            }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('faq.hero.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('faq.hero.subtitle')}
            </p>
          </div>

          {/* General Questions */}
          <Card className="mb-8">
            <CardHeader className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>
              <CardTitle>{t('faq.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible >
                <AccordionItem value="general-1"  >
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q1')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a1')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-2">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q2')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a2')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-3">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q3')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a3')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-4">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q4')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a4')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-5">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q5')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a5')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-6">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q6')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a6')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-7">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q7')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a7')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="general-8">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.general.q8')}</AccordionTrigger>
                  <AccordionContent>{t('faq.general.a8')}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* For Renters */}
          <Card className="mb-8">
            <CardHeader className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>
              <CardTitle>{t('faq.renters.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className={`w-full ${direction === 'rtl' ? 'rtl-accordion' : ''}`}>
                <AccordionItem value="renter-1">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.renters.q1')}</AccordionTrigger>
                  <AccordionContent>{t('faq.renters.a1')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="renter-2">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.renters.q2')}</AccordionTrigger>
                  <AccordionContent>{t('faq.renters.a2')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="renter-3">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.renters.q3')}</AccordionTrigger>
                  <AccordionContent>{t('faq.renters.a3')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="renter-4">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.renters.q4')}</AccordionTrigger>
                  <AccordionContent>{t('faq.renters.a4')}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* For Owners */}
          <Card className="mb-8">
            <CardHeader className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>
              <CardTitle>{t('faq.owners.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className={`w-full ${direction === 'rtl' ? 'rtl-accordion' : ''}`}>
                <AccordionItem value="owner-1">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q1')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a1')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="owner-2">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q2')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a2')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="owner-3">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q3')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a3')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="owner-4">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q4')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a4')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="owner-5">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q5')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a5')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="owner-6">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.owners.q6')}</AccordionTrigger>
                  <AccordionContent>{t('faq.owners.a6')}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Payment and Security */}
          <Card className="mb-8">
            <CardHeader className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>
              <CardTitle >{t('faq.payment.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className={`w-full ${direction === 'rtl' ? 'rtl-accordion' : ''}`}>
                <AccordionItem value="payment-1">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q1')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a1')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-2">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q2')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a2')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-3">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q3')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a3')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-4">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q4')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a4')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-5">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q5')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a5')}</AccordionContent>
                </AccordionItem>
                <AccordionItem value="payment-6">
                  <AccordionTrigger className={`${language === 'ar' ? 'flex !flex-row' : ''}`}>{t('faq.payment.q6')}</AccordionTrigger>
                  <AccordionContent>{t('faq.payment.a6')}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;