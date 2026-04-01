import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { Play, X } from 'lucide-react'

const VideoSection = () => {
  const { t } = useLanguage()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPlayingMobile, setIsPlayingMobile] = useState(false)

  return (
    <section className='py-16 px-4 bg-gray-50 overflow-hidden'>
      <div className='max-w-5xl mx-auto'>
        <div className='flex flex-col items-center justify-center gap-12'>
          {/* Video Container */}
          <div className='w-full relative flex justify-center aspect-video'>
            {/* Desktop View */}
            <div className='hidden md:block w-full h-full relative z-10'>
              {/* Placeholder for layout stability */}
              <div className='w-full h-full rounded-2xl bg-gray-200' />

              {/* Click Trigger Overlay */}
              {!isExpanded && (
                <div
                  className='absolute inset-0 z-20 cursor-pointer flex items-center justify-center group'
                  onClick={() => setIsExpanded(true)}
                >
                  <div className='w-20 h-20 bg-accent/90 rounded-full flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110'>
                    <Play
                      className='w-10 h-10 text-white ml-2'
                      fill='currentColor'
                    />
                  </div>
                </div>
              )}

              <div
                className={`transition-all duration-500 ease-in-out ${
                  isExpanded
                    ? 'fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm'
                    : 'absolute inset-0'
                }`}
                onClick={() => isExpanded && setIsExpanded(false)}
              >
                <div
                  className={`bg-black overflow-hidden transition-all duration-500 ease-in-out relative ${
                    isExpanded
                      ? 'w-[80vw] h-[80vh] rounded-2xl shadow-2xl'
                      : 'w-full h-full rounded-2xl'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {isExpanded && (
                    <button
                      onClick={() => setIsExpanded(false)}
                      className='absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors'
                      aria-label='Close fullscreen'
                    >
                      <X className='w-6 h-6' />
                    </button>
                  )}
                  {/* Prevent iframe from stealing click when not expanded */}
                  {!isExpanded && <div className='absolute inset-0 z-10' />}
                  <iframe
                    src={`https://www.youtube.com/embed/ZjkR2Bc-42U?autoplay=1&mute=${isExpanded ? '0' : '1'}&loop=1&playlist=ZjkR2Bc-42U&controls=${isExpanded ? '1' : '0'}&showinfo=0&rel=0&modestbranding=1`}
                    className='w-full h-full'
                    allow='autoplay; encrypted-media'
                    title='Bricola Promotional Video'
                  />
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className='md:hidden absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-black shadow-lg'>
              {!isPlayingMobile ? (
                <>
                  <div
                    className='absolute inset-0 bg-cover bg-center opacity-70'
                    style={{
                      backgroundImage: `url('https://img.youtube.com/vi/ZjkR2Bc-42U/maxresdefault.jpg')`,
                    }}
                  />
                  <button
                    onClick={() => setIsPlayingMobile(true)}
                    className='absolute inset-0 flex items-center justify-center group'
                    aria-label='Play video'
                  >
                    <div className='w-16 h-16 bg-accent rounded-full flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110'>
                      <Play
                        className='w-8 h-8 text-white ml-1'
                        fill='currentColor'
                      />
                    </div>
                  </button>
                </>
              ) : (
                <iframe
                  src='https://www.youtube.com/embed/ZjkR2Bc-42U?autoplay=1&mute=0&rel=0&modestbranding=1'
                  className='w-full h-full'
                  allow='autoplay; encrypted-media'
                  allowFullScreen
                  title='Bricola Promotional Video'
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VideoSection
