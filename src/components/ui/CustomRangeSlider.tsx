import React, { useState, useRef, useCallback } from 'react';

interface CustomRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
  // Nouvelles props pour la conversion de devise
  currencySymbol?: string;
  convertValue?: (value: number) => number; // Fonction pour convertir GBP vers devise utilisateur
  formatValue?: (value: number) => string; // Fonction pour formater l'affichage
}

const CustomRangeSlider: React.FC<CustomRangeSliderProps> = ({
  min,
  max,
  step = 1,
  value,
  onValueChange,
  className = '',
  currencySymbol = '£',
  convertValue,
  formatValue
}) => {
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Fonction pour formater la valeur affichée
  const getDisplayValue = useCallback((val: number): string => {
    if (formatValue) {
      return formatValue(val);
    }
    
    const displayVal = convertValue ? convertValue(val) : val;
    return `${currencySymbol}${Math.round(displayVal)}`;
  }, [currencySymbol, convertValue, formatValue]);

  const getPercentage = useCallback((val: number) => {
    return ((val - min) / (max - min)) * 100;
  }, [min, max]);

  const getValueFromPercentage = useCallback((percentage: number) => {
    const rawValue = min + (percentage / 100) * (max - min);
    return Math.round(rawValue / step) * step;
  }, [min, max, step]);

  const handleMouseDown = useCallback((type: 'min' | 'max') => (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(type);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const newValue = getValueFromPercentage(percentage);

    if (isDragging === 'min') {
      const newMin = Math.min(newValue, value[1] - step);
      onValueChange([Math.max(min, newMin), value[1]]);
    } else {
      const newMax = Math.max(newValue, value[0] + step);
      onValueChange([value[0], Math.min(max, newMax)]);
    }
  }, [isDragging, value, onValueChange, getValueFromPercentage, min, max, step]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const minPercentage = getPercentage(value[0]);
  const maxPercentage = getPercentage(value[1]);

  return (
    <div className={`relative w-full ${className}`}>
      {/* Track */}
      <div
        ref={sliderRef}
        className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
      >
        {/* Active range */}
        <div
          className="absolute h-2 bg-blue-500 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${maxPercentage - minPercentage}%`,
          }}
        />
        
        {/* Min handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1 -translate-x-2 hover:scale-110 transition-transform"
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown('min')}
        />
        
        {/* Max handle */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-grab active:cursor-grabbing transform -translate-y-1 -translate-x-2 hover:scale-110 transition-transform"
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown('max')}
        />
      </div>
      
      {/* Value labels */}
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>{getDisplayValue(value[0])}</span>
        <span>{getDisplayValue(value[1])}</span>
      </div>
    </div>
  );
};

export default CustomRangeSlider;