import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createTag, 
  updateTag, 
  clearTagsError, 
  clearTagsSuccessMessage 
} from '@/store/tagsSlice';
import { RootState } from '@/store';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

interface TagFormProps {
  tag?: {
    id: string;
    name: string;
    color: string;
  };
  onCancel: () => void;
}

const TagForm: React.FC<TagFormProps> = ({ tag, onCancel }) => {
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((state: RootState) => state.tags);
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || '#3B82F6'); // Default to blue
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clear previous messages
    dispatch(clearTagsError());
    dispatch(clearTagsSuccessMessage());

    try {
      if (tag) {
        // Update existing tag
        await dispatch(updateTag({ 
          id: tag.id, 
          tagData: { name, color } 
        }));
      } else {
        // Create new tag
        await dispatch(createTag({ name, color }));
      }
      
      // Reset form
      setName('');
      setColor('#3B82F6');
      
      // Close form after successful submission
      onCancel();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{tag ? 'Edit Tag' : 'Create New Tag'}</h2>
      
      <ErrorDisplay 
        error={error} 
        onClose={() => dispatch(clearTagsError())} 
      />
      
      <SuccessMessage 
        message={successMessage} 
        onClose={() => dispatch(clearTagsSuccessMessage())} 
      />

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700 font-medium mb-2">
          Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter tag name"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="color" className="block text-gray-700 font-medium mb-2">
          Color
        </label>
        <div className="flex items-center">
          <input
            type="color"
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <span className="ml-3 text-gray-600">{color}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : (tag ? 'Update Tag' : 'Create Tag')}
        </button>
      </div>
    </form>
  );
};

export default TagForm;