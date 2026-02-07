import React, { useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TagRead } from '@/lib/types';

interface TagManagerProps {
  selectedTags: string[]; // Array of tag IDs
  availableTags: TagRead[];
  onTagToggle: (tagId: string) => void;
  onCreateTag?: (tagName: string) => void;
  className?: string;
}

const TagManager: React.FC<TagManagerProps> = ({ 
  selectedTags, 
  availableTags, 
  onTagToggle, 
  onCreateTag,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleCreateNewTag();
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag when backspace is pressed on empty input
      const lastTagId = selectedTags[selectedTags.length - 1];
      onTagToggle(lastTagId);
    }
  };

  const handleCreateNewTag = () => {
    if (inputValue.trim() && onCreateTag) {
      onCreateTag(inputValue.trim());
      setInputValue('');
    }
  };

  const handleTagClick = (tagId: string) => {
    onTagToggle(tagId);
  };

  const filteredTags = availableTags.filter(
    tag => 
      tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(tag.id)
  );

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-1">
        {selectedTags.length === 0 ? (
          <span className="text-sm text-gray-500 italic">No tags selected</span>
        ) : (
          selectedTags.map(tagId => {
            const tag = availableTags.find(t => t.id === tagId);
            return tag ? (
              <Badge 
                key={tagId} 
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
                onClick={() => handleTagClick(tagId)}
              >
                {tag.name}
                <span className="ml-1 opacity-70">×</span>
              </Badge>
            ) : null;
          })
        )}
      </div>

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder="Add tags..."
              className="mt-1"
            />
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-64" align="start">
          {filteredTags.length > 0 ? (
            <ScrollArea className="h-60">
              {filteredTags.map(tag => (
                <div
                  key={tag.id}
                  className="p-2 cursor-pointer hover:bg-accent flex items-center justify-between"
                  onClick={() => {
                    handleTagClick(tag.id);
                    setInputValue('');
                    if (inputRef.current) inputRef.current.focus();
                  }}
                >
                  <span>{tag.name}</span>
                  {selectedTags.includes(tag.id) && (
                    <span className="text-green-500">✓</span>
                  )}
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              {inputValue ? (
                <>
                  <p>No tags match "{inputValue}"</p>
                  {onCreateTag && (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full justify-start"
                      onClick={handleCreateNewTag}
                    >
                      Create "{inputValue}"
                    </Button>
                  )}
                </>
              ) : (
                <p>No tags available</p>
              )}
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TagManager;