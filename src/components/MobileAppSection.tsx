import React from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Smartphone } from 'lucide-react'

const MobileAppSection = () => {
  const { t } = useLanguage()

  return (
    <section className='py-20 bg-white-50'>
      <div className='max-w-7xl mx-auto px-4 text-center'>
        <div className='flex flex-col items-center justify-center'>
          <div className='mb-6 p-4 bg-primary/10 rounded-full'>
            <Smartphone className='w-12 h-12 text-primary' />
          </div>

          <h2 className='text-3xl md:text-4xl font-bold mb-4 text-gray-900'>
            {t('mobile_app.title')}
          </h2>

          <p className='text-xl text-gray-600 mb-10 max-w-2xl mx-auto'>
            {t('mobile_app.subtitle')}
          </p>

          <div className='flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-2xl mx-auto'>
            <a
              href='#'
              target='_blank'
              rel='noopener noreferrer'
              className='transition-transform hover:scale-105'
            >
              <img
                src='/app.png'
                alt={t('mobile_app.app_store')}
                className='h-[60px] w-auto object-contain'
              />
            </a>

            <a
              href='#'
              target='_blank'
              rel='noopener noreferrer'
              className='transition-transform hover:scale-105'
            >
              <img
                src='/google.png'
                alt={t('mobile_app.google_play')}
                className='h-[60px] w-auto object-contain'
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MobileAppSection
