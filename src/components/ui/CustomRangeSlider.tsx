import React, { useState, useRef, useCallback } from 'react'

interface CustomRangeSliderProps {
  value: [number, number]
  onValueChange: (value: [number, number]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const CustomRangeSlider: React.FC<CustomRangeSliderProps> = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)

  const getPercentage = (val: number) => ((val - min) / (max - min)) * 100

  const handleMouseDown = (type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(type)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const newValue = Math.round((percentage / 100) * (max - min) + min)
      const steppedValue = Math.round(newValue / step) * step

      if (isDragging === 'min') {
        const newMin = Math.min(steppedValue, value[1] - step)
        onValueChange([Math.max(min, newMin), value[1]])
      } else {
        const newMax = Math.max(steppedValue, value[0] + step)
        onValueChange([value[0], Math.min(max, newMax)])
      }
    },
    [isDragging, value, min, max, step, onValueChange]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(null)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  const minPercentage = getPercentage(value[0])
  const maxPercentage = getPercentage(value[1])

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-full bg-primary rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`
          }}
        />
        
        {/* Min thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1/2 -translate-x-1/2 shadow-md hover:scale-110 transition-transform"
          style={{ left: `${minPercentage}%`, top: '50%' }}
          onMouseDown={handleMouseDown('min')}
        />
        
        {/* Max thumb */}
        <div
          className="absolute w-5 h-5 bg-white border-2 border-primary rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1/2 -translate-x-1/2 shadow-md hover:scale-110 transition-transform"
          style={{ left: `${maxPercentage}%`, top: '50%' }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>

      {/* Value displays */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-primary rounded-full mb-2 shadow-sm"></div>
          <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
            {value[0]}€
          </span>
          <span className="text-xs text-gray-500 mt-1">Min</span>
        </div>
        
        <div className="flex-1 mx-4 border-t border-dashed border-gray-300"></div>
        
        <div className="flex flex-col items-center">
          <div className="w-3 h-3 bg-primary rounded-full mb-2 shadow-sm"></div>
          <span className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary">
            {value[1]}€
          </span>
          <span className="text-xs text-gray-500 mt-1">Max</span>
        </div>
      </div>
    </div>
  )
}

export default CustomRangeSlider