import React, { useState, useEffect } from 'react'
import {
  Search,
  Calendar,
  Hammer,
  RotateCcw,
  PlusCircle,
  CheckCircle,
  Handshake,
  DollarSign,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'


const RentalProcess = () => {
  const { t, language } = useLanguage()
const [isWindows, setIsWindows] = useState(false)
  const renterSteps = [
    {
      icon: Search,
      title: t('rental_process.renter.step1.title'),
      description: t('rental_process.renter.step1.description'),
    },
    {
      icon: Calendar,
      title: t('rental_process.renter.step2.title'),
      description: t('rental_process.renter.step2.description'),
    },
    {
      icon: Hammer,
      title: t('rental_process.renter.step3.title'),
      description: t('rental_process.renter.step3.description'),
    },
    {
      icon: RotateCcw,
      title: t('rental_process.renter.step4.title'),
      description: t('rental_process.renter.step4.description'),
    },
  ]

  const ownerSteps = [
    {
      icon: PlusCircle,
      title: t('rental_process.owner.step1.title'),
      description: t('rental_process.owner.step1.description'),
    },
    {
      icon: CheckCircle,
      title: t('rental_process.owner.step2.title'),
      description: t('rental_process.owner.step2.description'),
    },
    {
      icon: Handshake,
      title: t('rental_process.owner.step3.title'),
      description: t('rental_process.owner.step3.description'),
    },
    {
      icon: DollarSign,
      title: t('rental_process.owner.step4.title'),
      description: t('rental_process.owner.step4.description'),
    },
  ]
 useEffect(() => {
   setIsWindows(window.navigator.userAgent.indexOf('Windows') !== -1)
 }, [])
  const StepCard = ({
    step,
    index,
    colorClass,
    bgClass,
  }: {
    step: any
    index: number
    colorClass: string
    bgClass: string
  }) => {
    const IconComponent = step.icon
    return (
      <Card className='border-none shadow-md hover:shadow-lg transition-all duration-300 h-full'>
        <CardContent className='pt-6 flex flex-col items-center text-center h-full'>
          <div
            className={`w-16 h-16 ${bgClass} rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110`}
          >
            <IconComponent className={`h-8 w-8 ${colorClass}`} />
          </div>
          <div
            className={`w-8 h-8 rounded-full ${bgClass} ${colorClass} flex items-center justify-center font-bold mb-3 text-sm`}
          >
            {index + 1}
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            {step.title}
          </h3>
          <p className='text-gray-600'>{step.description}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <section className='py-20 bg-gray-50/50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
            {t('rental_process.title')}
          </h2>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            {t('rental_process.description')}
          </p>
        </div>

        <Tabs defaultValue='renter' className='w-full'>
          <div className='flex justify-center mb-12'>
            <TabsList className='h-14 p-1 bg-gray-100 rounded-full'>
              <TabsTrigger
                value='renter'
                className='h-full px-8 rounded-full text-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all'
              >
                {t('rental_process.renter.title')}
              </TabsTrigger>
              <TabsTrigger
                value='owner'
                className='h-full px-8 rounded-full text-lg data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-all'
              >
                {t('rental_process.owner.title')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='renter' className='mt-0 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {/* if lang is ar et not mobile version, inverse l'ordre d'affichage des cartes */}
              {language === 'ar' && isWindows
                ? renterSteps
                    .reverse()
                    .map((step, index) => (
                      <StepCard
                        key={index}
                        step={step}
                        index={renterSteps.length - index - 1}
                        colorClass='text-primary'
                        bgClass='bg-primary/10'
                      />
                    ))
                : renterSteps.map((step, index) => (
                    <StepCard
                      key={index}
                      step={step}
                      index={index}
                      colorClass='text-primary'
                      bgClass='bg-primary/10'
                    />
                  ))}
            </div>
          </TabsContent>

          <TabsContent value='owner' className='mt-0 animate-fade-in'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              {/* if lang is ar et not mobile version, inverse l'ordre d'affichage des cartes */}
              {language === 'ar' && isWindows
                ? ownerSteps
                    .reverse()
                    .map((step, index) => (
                      <StepCard
                        key={index}
                        step={step}
                        index={ownerSteps.length - index - 1}
                        colorClass='text-orange-500'
                        bgClass='bg-orange-500/10'
                      />
                    ))
                : ownerSteps.map((step, index) => (
                    <StepCard
                      key={index}
                      step={step}
                      index={index}
                      colorClass='text-orange-500'
                      bgClass='bg-orange-500/10'
                    />
                  ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  )
}

export default RentalProcess
