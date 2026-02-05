import React, { useState, useEffect, useRef } from 'react';
import { Tag } from '../../models/tag';

interface TagAutocompleteProps {
  allTags: Tag[];
  selectedTags: Tag[];
  onSelectTag: (tag: Tag) => void;
  onRemoveTag: (tagId: string) => void;
  placeholder?: string;
  className?: string;
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({ 
  allTags, 
  selectedTags, 
  onSelectTag, 
  onRemoveTag,
  placeholder = 'Search tags...',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter tags based on input
  const filteredTags = allTags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.some(selected => selected.id === tag.id)
  );

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredTags.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && highlightedIndex >= 0) {
        e.preventDefault();
        handleSelectTag(filteredTags[highlightedIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, highlightedIndex, filteredTags]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectTag = (tag: Tag) => {
    onSelectTag(tag);
    setInputValue('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the input field
    onRemoveTag(tagId);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex flex-wrap items-center gap-2 min-h-[42px] px-3 py-2 border border-gray-300 rounded-md shadow-sm">
        {/* Selected tags */}
        {selectedTags.map(tag => (
          <div 
            key={tag.id} 
            className="flex items-center bg-indigo-100 text-indigo-800 rounded-full pl-3 pr-2 py-1 text-sm"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }} // Add transparency to background
          >
            <span>{tag.name}</span>
            <button
              type="button"
              onClick={(e) => handleRemoveTag(tag.id, e)}
              className="ml-2 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-800 hover:bg-indigo-200 focus:outline-none"
              aria-label={`Remove ${tag.name} tag`}
            >
              <svg className="h-3 w-3" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
              </svg>
            </button>
          </div>
        ))}

        {/* Input field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className="flex-grow min-w-[100px] border-0 focus:ring-0 p-0 py-1 text-sm"
        />
      </div>

      {/* Dropdown */}
      {isOpen && filteredTags.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredTags.map((tag, index) => (
            <div
              key={tag.id}
              onMouseDown={() => handleSelectTag(tag)} // Use mouseDown to ensure it fires before blur
              className={`cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white ${
                index === highlightedIndex ? 'bg-indigo-600 text-white' : 'text-gray-900'
              }`}
            >
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: tag.color }}
                />
                <span className={`block truncate ${index === highlightedIndex ? 'font-semibold' : 'font-normal'}`}>
                  {tag.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message when no tags match */}
      {isOpen && filteredTags.length === 0 && inputValue && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-2 text-base ring-1 ring-black ring-opacity-5 sm:text-sm">
          <div className="text-gray-700 text-center py-2">
            No tags found matching "{inputValue}"
          </div>
        </div>
      )}
    </div>
  );
};

export default TagAutocomplete;