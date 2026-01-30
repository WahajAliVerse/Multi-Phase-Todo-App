'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Tag } from '@/types/index';

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#000000');
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  // In a real app, you would fetch tags from an API
  useEffect(() => {
    // Mock data for now
    setTags([
      { id: '1', name: 'Work', color: '#FF6B6B', userId: '1', createdAt: new Date().toISOString() },
      { id: '2', name: 'Personal', color: '#4ECDC4', userId: '1', createdAt: new Date().toISOString() },
      { id: '3', name: 'Urgent', color: '#45B7D1', userId: '1', createdAt: new Date().toISOString() },
    ]);
  }, []);

  const handleCreateTag = (e: FormEvent) => {
    e.preventDefault();
    if (!tagName.trim()) return;

    const newTag: Tag = {
      id: (tags.length + 1).toString(), // In a real app, this would come from the backend
      name: tagName,
      color: tagColor,
      userId: '1', // Placeholder user ID
      createdAt: new Date().toISOString(),
    };

    setTags([...tags, newTag]);
    setTagName('');
    setTagColor('#000000');
  };

  const handleUpdateTag = (e: FormEvent) => {
    e.preventDefault();
    if (!tagName.trim() || !editingTag) return;

    setTags(tags.map(tag =>
      tag.id === editingTag.id
        ? { ...tag, name: tagName, color: tagColor, updatedAt: new Date().toISOString() }
        : tag
    ));

    setEditingTag(null);
    setTagName('');
    setTagColor('#000000');
  };

  const handleEditClick = (tag: Tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
  };

  const handleDeleteTag = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Manage Tags</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form for creating/updating tags */}
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            {editingTag ? 'Edit Tag' : 'Create New Tag'}
          </h2>
          
          <form onSubmit={editingTag ? handleUpdateTag : handleCreateTag}>
            <div className="mb-4">
              <label htmlFor="tagName" className="block text-sm font-medium mb-1">
                Tag Name
              </label>
              <input
                type="text"
                id="tagName"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Enter tag name"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="tagColor" className="block text-sm font-medium mb-1">
                Tag Color
              </label>
              <div className="flex items-center">
                <input
                  type="color"
                  id="tagColor"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-10 h-10 border border-input rounded cursor-pointer"
                />
                <span className="ml-2 text-sm">{tagColor}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {editingTag ? (
                <>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Update Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTag(null);
                      setTagName('');
                      setTagColor('#000000');
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Create Tag
                </button>
              )}
            </div>
          </form>
        </div>
        
        {/* List of existing tags */}
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Existing Tags</h2>
          
          {tags.length === 0 ? (
            <p className="text-muted-foreground">No tags created yet.</p>
          ) : (
            <div className="space-y-3">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3" 
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <span className="font-medium">{tag.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditClick(tag)}
                      className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.id)}
                      className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
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
    </div>
  );
}