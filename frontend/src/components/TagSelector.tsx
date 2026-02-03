import React, { useState, useRef, useEffect } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Tag } from '@/src/lib/types';

interface TagSelectorProps {
  allTags: Tag[];
  selectedTags: Tag[];
  onSelectTags: (tags: Tag[]) => void;
  maxTags?: number;
  allowNewTags?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ 
  allTags, 
  selectedTags, 
  onSelectTags,
  maxTags = 10,
  allowNewTags = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue color
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter tags based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredTags(allTags.filter(tag => 
        !selectedTags.some(selected => selected.id === tag.id)
      ));
    } else {
      const filtered = allTags.filter(tag => 
        tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
        !selectedTags.some(selected => selected.id === tag.id)
      );
      setFilteredTags(filtered);
    }
  }, [inputValue, allTags, selectedTags]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);
    setError(null);
  };

  // Add a tag to the selection
  const addTag = (tag: Tag) => {
    if (selectedTags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    if (!selectedTags.some(t => t.id === tag.id)) {
      onSelectTags([...selectedTags, tag]);
    }
    
    setInputValue('');
    setShowDropdown(false);
  };

  // Remove a tag from the selection
  const removeTag = (tagId: number) => {
    onSelectTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  // Create a new tag
  const createNewTag = () => {
    if (!inputValue.trim()) {
      setError('Tag name cannot be empty');
      return;
    }

    if (selectedTags.length >= maxTags) {
      setError(`Maximum ${maxTags} tags allowed`);
      return;
    }

    // Check if tag already exists
    const existingTag = allTags.find(tag => tag.name.toLowerCase() === inputValue.trim().toLowerCase());
    if (existingTag) {
      addTag(existingTag);
      return;
    }

    // Create new tag
    const newTag: Tag = {
      id: Date.now(), // Temporary ID, will be replaced by backend
      name: inputValue.trim(),
      color: newTagColor,
      userId: 1, // Will be replaced with actual user ID
      createdAt: new Date(),
    };

    onSelectTags([...selectedTags, newTag]);
    setInputValue('');
    setShowDropdown(false);
  };

  // Handle key events
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTags.length > 0) {
        addTag(filteredTags[0]);
      } else if (allowNewTags) {
        createNewTag();
      }
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const lastTag = selectedTags[selectedTags.length - 1];
      removeTag(lastTag.id);
    }
  };

  // Predefined accessible color palette
  const colorPalette = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f43f5e', // rose
  ];

  return (
    <div className="relative w-full">
      <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] p-1 bg-gray-50 rounded border">
        {selectedTags.map(tag => (
          <div 
            key={tag.id} 
            className="flex items-center px-3 py-1 rounded-full text-sm"
            style={{ 
              backgroundColor: `${tag.color}20`, // Add transparency to background
              color: tag.color 
            }}
          >
            {tag.name}
            <button
              type="button"
              className="ml-2 text-gray-500 hover:text-gray-700"
              onClick={() => removeTag(tag.id)}
            >
              ×
            </button>
          </div>
        ))}
        
        <div className="flex flex-wrap items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedTags.length === 0 ? "Add tags..." : ""}
            onFocus={() => setShowDropdown(true)}
            className="flex-grow min-w-[100px] border-none shadow-none focus:ring-0 p-0 bg-transparent"
          />
          
          {allowNewTags && inputValue && !allTags.some(tag => 
            tag.name.toLowerCase() === inputValue.toLowerCase()
          ) && (
            <div className="flex items-center gap-2">
              <select
                value={newTagColor}
                onChange={(e) => setNewTagColor(e.target.value)}
                className="text-xs border rounded p-1"
              >
                {colorPalette.map(color => (
                  <option 
                    key={color} 
                    value={color}
                    style={{ backgroundColor: color + '20', color }}
                  >
                    {color}
                  </option>
                ))}
              </select>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={createNewTag}
              >
                Add "{inputValue}"
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-1">{error}</div>
      )}
      
      {showDropdown && filteredTags.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
          {filteredTags.map(tag => (
            <div
              key={tag.id}
              className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
              onClick={() => addTag(tag)}
            >
              <span 
                className="w-4 h-4 rounded-full mr-2 inline-block" 
                style={{ backgroundColor: tag.color }}
              ></span>
              {tag.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};