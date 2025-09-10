import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ContratLocation = () => {
  const {t, language} = useLanguage();
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">{t('rentalContract.title')}</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('rentalContract.subtitle')}
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                <CardTitle className={"flex items-center justify-between " + (language === 'ar' ? '[direction:ltr]' : '')}>
                  {t('rentalContract.cardTitle')}
                  <Button variant="outline" size="sm" className='mr-1'>
                    <Download className="h-4 w-4 mr-2" />
                    {t('rentalContract.downloadButton')}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.section.signatories.title')}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>{t('rentalContract.section.signatories.owner.name')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.owner.address')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.owner.phone')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.owner.email')} </strong></p>
                  </div>
                  <p className="text-center font-medium my-2">{t('rentalContract.section.signatories.separator')}</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><strong>{t('rentalContract.section.signatories.tenant.name')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.tenant.address')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.tenant.phone')} </strong></p>
                    <p><strong>{t('rentalContract.section.signatories.tenant.email')} </strong></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article1.title')}</h3>
                  <p className="text-gray-600">
                    {t('rentalContract.article1.description')}
                  </p>
                  <div className="bg-gray-50 p-4 rounded-lg mt-2">
                    <p><strong>{t('rentalContract.article1.fields.designation')} </strong></p>
                    <p><strong>{t('rentalContract.article1.fields.brandModel')} </strong></p>
                    <p><strong>{t('rentalContract.article1.fields.serialNumber')} </strong></p>
                    <p><strong>{t('rentalContract.article1.fields.condition')} </strong></p>
                    <p><strong>{t('rentalContract.article1.fields.accessories')} </strong></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article2.title')}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>{t('rentalContract.article2.fields.startDate')} </strong></p>
                    <p><strong>{t('rentalContract.article2.fields.endDate')} </strong></p>
                    <p><strong>{t('rentalContract.article2.fields.handoverLocation')} </strong></p>
                    <p><strong>{t('rentalContract.article2.fields.returnLocation')} </strong></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article3.title')}</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p><strong>{t('rentalContract.article3.fields.rentalPrice')} </strong></p>
                    <p><strong>{t('rentalContract.article3.fields.deposit')} </strong></p>
                    <p><strong>{t('rentalContract.article3.fields.paymentMethod')} </strong></p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article4.title')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>{t('rentalContract.article4.list.1')}</li>
                    <li>{t('rentalContract.article4.list.2')}</li>
                    <li>{t('rentalContract.article4.list.3')}</li>
                    <li>{t('rentalContract.article4.list.4')}</li>
                    <li>{t('rentalContract.article4.list.5')}</li>
                    <li>{t('rentalContract.article4.list.6')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article5.title')}</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>{t('rentalContract.article5.list.1')}</li>
                    <li>{t('rentalContract.article5.list.2')}</li>
                    <li>{t('rentalContract.article5.list.3')}</li>
                    <li>{t('rentalContract.article5.list.4')}</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article6.title')}</h3>
                  <p className="text-gray-600 mb-2">
                    {t('rentalContract.article6.intro')}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                    <li>{t('rentalContract.article6.coverage.1')}</li>
                    <li>{t('rentalContract.article6.coverage.2')}</li>
                    <li>{t('rentalContract.article6.coverage.3')}</li>
                  </ul>
                  <p className="text-gray-600 mt-2">
                    {t('rentalContract.article6.note')}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">{t('rentalContract.article7.title')}</h3>
                  <p className="text-gray-600">
                    {t('rentalContract.article7.text')}
                  </p>
                </div>

                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="font-semibold mb-2">{t('rentalContract.signatures.owner')}</h4>
                      <div className="border-2 border-dashed border-gray-300 h-20 flex items-center justify-center text-gray-500">
                        [Signature et date]
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{t('rentalContract.signatures.tenant')}</h4>
                      <div className="border-2 border-dashed border-gray-300 h-20 flex items-center justify-center text-gray-500">
                        [Signature et date]
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className={language === 'ar' ? '[direction:ltr]' : ''}>
                <CardTitle>{t('rentalContract.instructions.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-gray-600">
                  <p>
                    <strong>1.</strong> {t('rentalContract.instructions.list.1')}
                  </p>
                  <p>
                    <strong>2.</strong> {t('rentalContract.instructions.list.2')}
                  </p>
                  <p>
                    <strong>3.</strong> {t('rentalContract.instructions.list.3')}
                  </p>
                  <p>
                    <strong>4.</strong> {t('rentalContract.instructions.list.4')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContratLocation;