
import React from 'react';
import { PlusCircle, Eye, Calendar, DollarSign } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const RentalProcess = () => {
  const { t } = useLanguage();
  const steps = [
    {
      icon: PlusCircle,
      title: t('rental_process.step1.title'),
      description: t('rental_process.step1.description')
    },
    {
      icon: Eye,
      title: t('rental_process.step2.title'),
      description: t('rental_process.step2.description')
    },
    {
      icon: Calendar,
      title: t('rental_process.step3.title'),
      description: t('rental_process.step3.description')
    },
    {
      icon: DollarSign,
      title: t('rental_process.step4.title'),
      description: t('rental_process.step4.description')
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('rental_process.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('rental_process.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RentalProcess;
