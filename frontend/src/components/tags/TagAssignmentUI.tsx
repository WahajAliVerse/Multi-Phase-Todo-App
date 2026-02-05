import React, { useState } from 'react';
import { Tag } from '../../models/tag';

interface TagAssignmentUIProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onTagToggle: (tagId: string) => void;
  className?: string;
}

const TagAssignmentUI: React.FC<TagAssignmentUIProps> = ({ 
  availableTags, 
  selectedTagIds, 
  onTagToggle,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tags based on search term
  const filteredTags = availableTags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label htmlFor="tag-search" className="block text-sm font-medium text-gray-700 mb-1">
          Search Tags
        </label>
        <input
          type="text"
          id="tag-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tags..."
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Available Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {filteredTags.length > 0 ? (
            filteredTags.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagToggle(tag.id)}
                className={`px-3 py-1.5 text-sm rounded-full flex items-center ${
                  selectedTagIds.includes(tag.id)
                    ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
                style={
                  selectedTagIds.includes(tag.id)
                    ? { backgroundColor: `${tag.color}20`, color: tag.color, borderColor: tag.color } // Add transparency to background
                    : { backgroundColor: '#f3f4f6', color: '#374151' } // Default gray
                }
              >
                {tag.name}
                {selectedTagIds.includes(tag.id) && (
                  <svg 
                    className="ml-1 h-3 w-3" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={3} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                )}
              </button>
            ))
          ) : (
            <p className="text-sm text-gray-500">No tags match your search.</p>
          )}
        </div>
      </div>

      {selectedTagIds.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selected Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags
              .filter(tag => selectedTagIds.includes(tag.id))
              .map(tag => (
                <div 
                  key={tag.id} 
                  className="px-3 py-1.5 text-sm rounded-full flex items-center"
                  style={{ 
                    backgroundColor: `${tag.color}20`, 
                    color: tag.color 
                  }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => onTagToggle(tag.id)}
                    className="ml-2 rounded-full hover:bg-opacity-20 hover:bg-white"
                    aria-label={`Remove ${tag.name} tag`}
                  >
                    <svg 
                      className="h-3.5 w-3.5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M6 18L18 6M6 6l12 12" 
                      />
                    </svg>
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TagAssignmentUI;