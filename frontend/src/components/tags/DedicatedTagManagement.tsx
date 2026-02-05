import React, { useState, useEffect } from 'react';
import { Tag } from '../../models/tag';
import { TagService } from '../../services/tagService';

interface DedicatedTagManagementProps {
  initialTags?: Tag[];
  onSave: (tags: Tag[]) => void;
  onCancel: () => void;
}

const DedicatedTagManagement: React.FC<DedicatedTagManagementProps> = ({ 
  initialTags = [], 
  onSave, 
  onCancel 
}) => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize with accessible color palette
  const [availableColors] = useState<string[]>(TagService.getAccessibleColorPalette());

  useEffect(() => {
    if (initialTags.length > 0) {
      setTags(initialTags);
    }
  }, [initialTags]);

  const handleAddTag = () => {
    // Validate the new tag
    const newTag: Partial<Tag> = {
      name: newTagName,
      color: newTagColor,
    };

    const validation = TagService.validateTag(newTag);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Check if tag name is unique
    if (!TagService.isTagNameUnique(newTagName, 'current-user-id', tags)) {
      setValidationErrors(['A tag with this name already exists']);
      return;
    }

    const tagToAdd: Tag = {
      id: crypto.randomUUID(),
      name: newTagName,
      color: newTagColor,
      userId: 'current-user-id', // In a real app, this would come from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTags([...tags, tagToAdd]);
    setNewTagName('');
    setNewTagColor('');
    setValidationErrors([]);
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;

    // Validate the updated tag
    const validation = TagService.validateTag(editingTag);
    
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Check if tag name is unique (excluding the current tag being edited)
    const otherTags = tags.filter(tag => tag.id !== editingTag.id);
    if (!TagService.isTagNameUnique(editingTag.name, 'current-user-id', otherTags)) {
      setValidationErrors(['A tag with this name already exists']);
      return;
    }

    setTags(tags.map(tag => 
      tag.id === editingTag.id ? { ...editingTag, updatedAt: new Date().toISOString() } : tag
    ));
    setEditingTag(null);
    setValidationErrors([]);
  };

  const handleDeleteTag = (tagId: string) => {
    setTags(tags.filter(tag => tag.id !== tagId));
  };

  const startEditing = (tag: Tag) => {
    setEditingTag(tag);
  };

  const cancelEditing = () => {
    setEditingTag(null);
  };

  const handleColorSelect = (color: string) => {
    if (editingTag) {
      setEditingTag({ ...editingTag, color });
    } else {
      setNewTagColor(color);
    }
  };

  // Filter tags based on search term
  const filteredTags = TagService.filterTagsByName(tags, searchTerm);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tag Management</h2>
        <p className="mt-1 text-sm text-gray-500">
          Create, edit, and manage tags for organizing your tasks.
        </p>
      </div>

      {/* Add New Tag Form */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {editingTag ? 'Edit Tag' : 'Add New Tag'}
        </h3>

        {validationErrors.length > 0 && (
          <div className="rounded-md bg-red-50 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {validationErrors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="tagName" className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name
            </label>
            <input
              type="text"
              id="tagName"
              value={editingTag ? editingTag.name : newTagName}
              onChange={(e) => 
                editingTag 
                  ? setEditingTag({...editingTag, name: e.target.value}) 
                  : setNewTagName(e.target.value)
              }
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter tag name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag Color
            </label>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-full border border-gray-300 mr-3" 
                style={{ backgroundColor: editingTag ? editingTag.color : newTagColor }}
              />
              <select
                value={editingTag ? editingTag.color : newTagColor}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select a color</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex space-x-3">
          {editingTag ? (
            <>
              <button
                type="button"
                onClick={handleUpdateTag}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Tag
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!newTagName || !newTagColor}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                newTagName && newTagColor
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  : 'bg-gray-400 cursor-not-allowed'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
            >
              Add Tag
            </button>
          )}
        </div>
      </div>

      {/* Tag Search */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center">
          <label htmlFor="tagSearch" className="block text-sm font-medium text-gray-700 mr-2">
            Search Tags:
          </label>
          <input
            type="text"
            id="tagSearch"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tags..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Tags List */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Your Tags ({tags.length})
        </h3>

        {filteredTags.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tags</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'No tags match your search.' : 'Get started by creating a new tag.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTags.map((tag) => (
              <div 
                key={tag.id} 
                className="flex items-center justify-between p-4 border rounded-lg"
                style={{ borderLeft: `4px solid ${tag.color}` }}
              >
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2" 
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="text-sm font-medium">{tag.name}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => startEditing(tag)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(tags)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Tags
        </button>
      </div>
    </div>
  );
};

export default DedicatedTagManagement;