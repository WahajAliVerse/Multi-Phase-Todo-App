'use client';

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import {
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
  addTag,
  removeTag,
  clearError
} from '@/lib/store/slices/tagSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

const TagsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { tags, loading, error } = useSelector((state: RootState) => state.tag);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3b82f6', // Default blue color
  });

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      // Show error message to user
      console.error('Error:', error);
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({ ...prev, color }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTag) {
      // Update existing tag
      dispatch(updateTag({ tagId: editingTag.id, tagData: formData }))
        .then(() => {
          setIsDialogOpen(false);
          setEditingTag(null);
          setFormData({ name: '', color: '#3b82f6' });
        })
        .catch(err => console.error('Failed to update tag:', err));
    } else {
      // Create new tag
      dispatch(createTag(formData))
        .then(() => {
          setIsDialogOpen(false);
          setFormData({ name: '', color: '#3b82f6' });
        })
        .catch(err => console.error('Failed to create tag:', err));
    }
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color || '#3b82f6',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (tagId: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      dispatch(deleteTag(tagId));
    }
  };

  const handleNewTag = () => {
    setEditingTag(null);
    setFormData({ name: '', color: '#3b82f6' });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Tags</h1>
        <div className="flex space-x-4">
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleNewTag}>Create New Tag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tag Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter tag name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-16 h-10 p-1"
                    />
                    <span>{formData.color}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTag ? 'Update Tag' : 'Create Tag'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center items-center h-32">
          <p>Loading tags...</p>
        </div>
      )}

      {/* Tags Grid */}
      {!loading && tags.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No tags found. Create your first tag!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tags.map((tag) => (
            <Card key={tag.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{tag.name}</CardTitle>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(tag)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-2 border" 
                    style={{ backgroundColor: tag.color || '#3b82f6' }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {tag.color || '#3b82f6'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(tag.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagsPage;