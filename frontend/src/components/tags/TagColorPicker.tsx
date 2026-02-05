import React, { useState } from 'react';
import { TagService } from '../../services/tagService';

interface TagColorPickerProps {
  onSelectColor: (color: string) => void;
  initialColor?: string;
  className?: string;
}

const TagColorPicker: React.FC<TagColorPickerProps> = ({ 
  onSelectColor, 
  initialColor,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(initialColor || '');

  const handleColorClick = (color: string) => {
    setSelectedColor(color);
    onSelectColor(color);
    setIsOpen(false);
  };

  const handleRandomColor = () => {
    const randomColor = TagService.generateRandomAccessibleColor();
    setSelectedColor(randomColor);
    onSelectColor(randomColor);
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedColor ? (
          <div 
            className="w-8 h-8 rounded-full" 
            style={{ backgroundColor: selectedColor }}
          />
        ) : (
          <span className="text-gray-400">+</span>
        )}
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Choose a color:</h4>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {TagService.getAccessibleColorPalette().map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-6 h-6 rounded-full border-2 ${
                    selectedColor === color ? 'border-gray-800' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorClick(color)}
                  title={color}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            
            <button
              type="button"
              onClick={handleRandomColor}
              className="w-full text-xs text-indigo-600 hover:text-indigo-800 py-1"
            >
              Generate Random Accessible Color
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagColorPicker;