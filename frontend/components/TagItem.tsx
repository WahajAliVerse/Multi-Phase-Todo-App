import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  updateTag, 
  deleteTag, 
  clearTagsError, 
  clearTagsSuccessMessage 
} from '@/store/tagsSlice';
import { Tag } from '@/types/api';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

interface TagItemProps {
  tag: Tag;
}

const TagItem: React.FC<TagItemProps> = ({ tag }) => {
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((state: RootState) => state.tags);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);

  const handleSave = async () => {
    // Clear previous messages
    dispatch(clearTagsError());
    dispatch(clearTagsSuccessMessage());
    
    await dispatch(updateTag({ 
      id: tag.id, 
      tagData: { name, color } 
    }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Clear previous messages
    dispatch(clearTagsError());
    dispatch(clearTagsSuccessMessage());
    
    if (window.confirm('Are you sure you want to delete this tag? This action cannot be undone.')) {
      await dispatch(deleteTag(tag.id));
    }
  };

  return (
    <div className="border-b border-gray-200 py-3 flex justify-between items-center">
      {isEditing ? (
        <div className="flex-1 flex items-center space-x-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md"
          />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 border border-gray-300 rounded-md cursor-pointer"
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setName(tag.name);
                setColor(tag.color);
              }}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center">
            <span 
              className="w-4 h-4 rounded-full mr-2 border border-gray-300" 
              style={{ backgroundColor: color }}
            ></span>
            <span>{tag.name}</span>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Delete
            </button>
          </div>
        </>
      )}
      
      <ErrorDisplay 
        error={error} 
        onClose={() => dispatch(clearTagsError())} 
      />
      
      <SuccessMessage 
        message={successMessage} 
        onClose={() => dispatch(clearTagsSuccessMessage())} 
      />
    </div>
  );
};

export default TagItem;