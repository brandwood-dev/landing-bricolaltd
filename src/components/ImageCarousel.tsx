import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: Array<{
    id: string
    url: string
    alt?: string
  }>
  title?: string
  className?: string
  language?: 'fr' | 'en' | 'ar'
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  title,
  className = '',
  language = 'fr',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!images || images.length === 0) {
    return null
  }

  // Si 1 ou 2 images, affichage simple sans carousel
  if (images.length <= 2) {
    const isRTL = language === 'ar'
    const textAlignment = isRTL ? 'text-right' : 'text-left'
    
    // Pour 1 seule image, utiliser le même style que le carousel
    if (images.length === 1) {
      return (
        <div className={`${className} w-full ${isRTL ? 'md:float-right md:ml-8' : 'md:float-left md:mr-8'} mb-4`}>
          <div className='relative overflow-hidden rounded-xl bg-gray-100'>
            <div className='aspect-video relative'>
              <img
                src={images[0].url}
                alt={images[0].alt || title || 'Image'}
                className='w-full h-full object-cover'
              />
            </div>
            {/* Légende si disponible */}
            {images[0].alt && (
              <p className={`text-sm text-gray-600 mt-3 ${textAlignment} italic`}>
                {images[0].alt}
              </p>
            )}
          </div>
        </div>
      )
    }
    
    // Pour 2 images, grille côte à côte
    return (
      <div className={`${className} w-full ${isRTL ? 'md:float-right md:ml-8' : 'md:float-left md:mr-8'} mb-4`}>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {images.map((image, index) => (
            <div key={image.id} className='relative overflow-hidden rounded-xl bg-gray-100'>
              <div className='aspect-video relative'>
                <img
                  src={image.url}
                  alt={image.alt || title || 'Image'}
                  className='w-full h-full object-cover'
                />
              </div>
              {/* Légende si disponible */}
              {image.alt && (
                <p className={`text-sm text-gray-600 mt-2 ${textAlignment} italic`}>
                  {image.alt}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Si plus de 2 images, carousel affichant 1 image à la fois
  const nextImage = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevImage = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    )
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

  // Determine alignment based on language
  const isRTL = language === 'ar'
  const textAlignment = isRTL ? 'text-right' : 'text-left'

  return (
    <div className={`relative group ${className} w-full`}>
      <div className='relative overflow-hidden rounded-xl bg-gray-100'>
        <div className='aspect-video relative'>
          <img
            src={images[currentIndex].url}
            alt={images[currentIndex].alt || title || 'Image'}
            className='w-full h-full object-cover transition-transform duration-500 ease-in-out'
          />
          
          {/* Badge for image number */}
          {/* <div className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-black/70 backdrop-blur-sm px-2 py-1 rounded-full text-white text-xs font-medium`}>
            {currentIndex + 1} / {images.length}
          </div> */}

          {/* Navigation flèches */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110`}
              >
                <ChevronLeft className='h-5 w-5' />
              </button>

              <button
                onClick={nextImage}
                className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110`}
              >
                <ChevronRight className='h-5 w-5' />
              </button>
            </>
          )}

          {/* Indicateur d'image */}
          {images.length > 1 && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm'>
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Points de navigation */}
      {images.length > 1 && (
        <div className={`flex gap-2 mt-4 ${isRTL ? 'justify-end' : 'justify-start'}`}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}

      {/* Légende si disponible */}
      {images[currentIndex].alt && (
        <p className={`text-sm text-gray-600 mt-3 ${textAlignment} italic`}>
          {images[currentIndex].alt}
        </p>
      )}
    </div>
  )
}

export default ImageCarousel
