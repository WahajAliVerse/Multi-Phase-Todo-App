import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tagSchema, TagFormData } from '../../utils/validation';
import { Tag } from '../../models/tag';
import { TagService } from '../../services/tagService';

interface TagManagerProps {
  initialTags?: Tag[];
  onTagsChange: (tags: Tag[]) => void;
}

const TagManager: React.FC<TagManagerProps> = ({ initialTags = [], onTagsChange }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TagFormData>({
    resolver: zodResolver(tagSchema),
  });

  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize with initial tags
  useEffect(() => {
    setTags(initialTags);
  }, [initialTags]);

  // Handle form submission for creating/updating tags
  const onSubmit = (data: TagFormData) => {
    if (editingTagId) {
      // Update existing tag
      setTags(prevTags => 
        prevTags.map(tag => 
          tag.id === editingTagId 
            ? { ...tag, name: data.name, color: selectedColor || data.color } 
            : tag
        )
      );
    } else {
      // Create new tag
      const newTag: Tag = {
        id: crypto.randomUUID(),
        name: data.name,
        color: selectedColor || data.color,
        userId: 'current-user-id', // In a real app, this would come from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTags(prevTags => [...prevTags, newTag]);
    }

    // Reset form and state
    reset();
    setEditingTagId(null);
    setSelectedColor('');
    setShowColorPicker(false);
  };

  // Handle editing a tag
  const handleEditTag = (tag: Tag) => {
    setEditingTagId(tag.id);
    setValue('name', tag.name);
    setSelectedColor(tag.color);
    setShowColorPicker(true);
  };

  // Handle deleting a tag
  const handleDeleteTag = (tagId: string) => {
    setTags(prevTags => prevTags.filter(tag => tag.id !== tagId));
  };

  // Handle color selection
  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setValue('color', color);
    setShowColorPicker(false);
  };

  // Filter tags based on search term
  const filteredTags = TagService.filterTagsByName(tags, searchTerm);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Manage Tags</h3>
      
      {/* Tag Creation Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tag Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name
            </label>
            <input
              type="text"
              id="name"
              {...register('name')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter tag name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Color
            </label>
            
            {/* Color display and picker toggle */}
            <div className="flex items-center space-x-2">
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 cursor-pointer" 
                style={{ backgroundColor: selectedColor || '#ccc' }}
                onClick={() => setShowColorPicker(!showColorPicker)}
              />
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                {selectedColor ? 'Change Color' : 'Select Color'}
              </button>
            </div>

            {/* Color picker dropdown */}
            {showColorPicker && (
              <div className="mt-2 p-3 bg-white border border-gray-300 rounded-md shadow-lg z-10 absolute">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Choose a color:</h4>
                <div className="grid grid-cols-6 gap-2">
                  {TagService.getAccessibleColorPalette().map((color) => (
                    <div
                      key={color}
                      className={`w-6 h-6 rounded-full cursor-pointer border-2 ${
                        selectedColor === color ? 'border-gray-800' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSelectColor(color)}
                      title={color}
                    />
                  ))}
                </div>
                
                {/* Random color generator */}
                <button
                  type="button"
                  onClick={() => handleSelectColor(TagService.generateRandomAccessibleColor())}
                  className="mt-2 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  Generate Random Color
                </button>
              </div>
            )}
            
            {errors.color && (
              <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-4">
          {editingTagId && (
            <button
              type="button"
              onClick={() => {
                reset();
                setEditingTagId(null);
                setSelectedColor('');
                setShowColorPicker(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editingTagId ? 'Update Tag' : 'Create Tag'}
          </button>
        </div>
      </form>

      {/* Tag Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Tags List */}
      <div>
        <h4 className="text-md font-medium text-gray-700 mb-2">Your Tags</h4>
        {filteredTags.length === 0 ? (
          <p className="text-sm text-gray-500">No tags found. Create your first tag!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredTags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center justify-between p-3 border rounded-md"
                style={{ borderLeft: `4px solid ${tag.color}` }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm">{tag.name}</span>
                </div>
                <div className="flex space-x-1">
                  <button
                    type="button"
                    onClick={() => handleEditTag(tag)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagManager;