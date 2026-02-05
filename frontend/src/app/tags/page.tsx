'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Tag } from '@/lib/types';
import { 
  addOrUpdateTag, 
  removeTag, 
  setTags, 
  selectTag as selectTagAction,
  clearSelectedTag,
  updateTag
} from '@/store/slices/tagsSlice';
import { useGetTagsQuery, useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } from '@/lib/api';

// Define the page component
export default function TagsPage() {
  const dispatch = useAppDispatch();
  const { tags, selectedTag, loading, error } = useAppSelector(state => state.tags);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [userId, setUserId] = useState(1); // In a real app, this would come from auth context

  // RTK Query hooks for API operations
  const { data: apiTags, isLoading, isError, refetch } = useGetTagsQuery();
  const [createTag, { isLoading: isCreating }] = useCreateTagMutation();
  const [updateTagApi, { isLoading: isUpdating }] = useUpdateTagMutation();
  const [deleteTag, { isLoading: isDeleting }] = useDeleteTagMutation();

  // Update local state when API data changes
  useEffect(() => {
    if (apiTags) {
      dispatch(setTags(apiTags));
    }
  }, [apiTags, dispatch]);

  // Handle form submission to create or update a tag
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Tag name is required');
      return;
    }
    
    try {
      if (selectedTag) {
        // Update existing tag
        const updatedTag = {
          ...selectedTag,
          name: name.trim(),
          color,
        };
        
        await updateTagApi({ id: selectedTag.id, tag: updatedTag }).unwrap();
        dispatch(updateTag({ id: selectedTag.id, updates: { name: name.trim(), color } }));
      } else {
        // Create new tag
        const newTag: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'> = {
          name: name.trim(),
          color,
          userId,
        };
        
        const result = await createTag(newTag).unwrap();
        dispatch(addOrUpdateTag(result));
      }
      
      // Reset form
      setName('');
      setColor('#3b82f6');
      dispatch(clearSelectedTag());
    } catch (err) {
      console.error('Error saving tag:', err);
      alert('Failed to save tag');
    }
  };

  // Handle editing a tag
  const handleEdit = (tag: Tag) => {
    setName(tag.name);
    setColor(tag.color);
    dispatch(selectTagAction(tag));
  };

  // Handle deleting a tag
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tag?')) {
      return;
    }
    
    try {
      await deleteTag(id).unwrap();
      dispatch(removeTag(id));
    } catch (err) {
      console.error('Error deleting tag:', err);
      alert('Failed to delete tag');
    }
  };

  // Handle cancelling form
  const handleCancel = () => {
    setName('');
    setColor('#3b82f6');
    dispatch(clearSelectedTag());
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Manage Tags</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {selectedTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tag Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tag name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex flex-wrap gap-2">
                {colorPalette.map((paletteColor) => (
                  <button
                    key={paletteColor}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 ${
                      color === paletteColor ? 'border-gray-800' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: paletteColor }}
                    onClick={() => setColor(paletteColor)}
                    aria-label={`Select ${paletteColor} color`}
                  />
                ))}
                <div className="flex items-center">
                  <span className="mr-2">Custom:</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 p-1 border rounded"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2 pt-4">
              <Button 
                type="submit" 
                disabled={isCreating || isUpdating}
              >
                {selectedTag ? 'Update Tag' : 'Create Tag'}
              </Button>
              
              {selectedTag && (
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
        
        {/* Tags List Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Tags</h2>
          
          {loading || isLoading ? (
            <div className="text-center py-4">Loading tags...</div>
          ) : tags.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No tags found</div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {tags.map(tag => (
                <div 
                  key={tag.id} 
                  className="flex justify-between items-center p-3 border rounded hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <span 
                      className="w-4 h-4 rounded-full mr-3 inline-block" 
                      style={{ backgroundColor: tag.color }}
                    ></span>
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(tag)}
                    >
                      Edit
                    </Button>
                    <Button 
                      type="button" 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(tag.id)}
                      disabled={isDeleting}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}