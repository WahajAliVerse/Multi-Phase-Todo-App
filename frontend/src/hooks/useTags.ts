import { useState, useEffect, useCallback } from 'react';
import { Tag } from '@/lib/types';

// Custom hook for managing tags
export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize tags
  const initializeTags = useCallback((initialTags: Tag[]) => {
    setTags(initialTags);
  }, []);

  // Add a new tag
  const addTag = useCallback((tag: Tag) => {
    setTags(prev => [...prev, tag]);
  }, []);

  // Update an existing tag
  const updateTag = useCallback((updatedTag: Tag) => {
    setTags(prev => 
      prev.map(tag => 
        tag.id === updatedTag.id ? updatedTag : tag
      )
    );
  }, []);

  // Remove a tag
  const removeTag = useCallback((id: number) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  }, []);

  // Find a tag by ID
  const findTagById = useCallback((id: number): Tag | undefined => {
    return tags.find(tag => tag.id === id);
  }, [tags]);

  // Find tags by name
  const findTagsByName = useCallback((name: string): Tag[] => {
    return tags.filter(tag => 
      tag.name.toLowerCase().includes(name.toLowerCase())
    );
  }, [tags]);

  // Get all tags for a user
  const getUserTags = useCallback((userId: number): Tag[] => {
    return tags.filter(tag => tag.userId === userId);
  }, [tags]);

  // Filter tasks by tags
  const filterTasksByTags = useCallback((tasks: any[], tagIds: number[]) => {
    if (tagIds.length === 0) return tasks;
    
    return tasks.filter(task => {
      if (!task.tags || task.tags.length === 0) return false;
      
      return task.tags.some((taskTag: Tag) => 
        tagIds.includes(taskTag.id)
      );
    });
  }, []);

  // Get unique tags from a list of tasks
  const getUniqueTagsFromTasks = useCallback((tasks: any[]): Tag[] => {
    const tagSet = new Set<number>();
    const uniqueTags: Tag[] = [];
    
    tasks.forEach(task => {
      if (task.tags && Array.isArray(task.tags)) {
        task.tags.forEach((tag: Tag) => {
          if (!tagSet.has(tag.id)) {
            tagSet.add(tag.id);
            uniqueTags.push(tag);
          }
        });
      }
    });
    
    return uniqueTags;
  }, []);

  // Validate tag properties
  const validateTag = useCallback((tag: Partial<Tag>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!tag.name || tag.name.trim().length === 0) {
      errors.push('Tag name is required');
    } else if (tag.name.trim().length > 50) {
      errors.push('Tag name must be less than 50 characters');
    }
    
    if (!tag.color) {
      errors.push('Tag color is required');
    } else {
      // Check if color is a valid hex color
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!hexColorRegex.test(tag.color)) {
        errors.push('Tag color must be a valid hex color');
      }
    }
    
    if (!tag.userId) {
      errors.push('User ID is required');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Check if a tag name already exists for a user
  const isTagNameUnique = useCallback((tagName: string, userId: number, excludeId?: number): boolean => {
    return !tags.some(tag => 
      tag.name.toLowerCase() === tagName.toLowerCase() && 
      tag.userId === userId && 
      tag.id !== excludeId
    );
  }, [tags]);

  // Get tags by color
  const getTagsByColor = useCallback((color: string): Tag[] => {
    return tags.filter(tag => tag.color.toLowerCase() === color.toLowerCase());
  }, [tags]);

  // Sort tags alphabetically
  const sortTagsAlphabetically = useCallback((): Tag[] => {
    return [...tags].sort((a, b) => a.name.localeCompare(b.name));
  }, [tags]);

  // Sort tags by creation date
  const sortTagsByDate = useCallback((): Tag[] => {
    return [...tags].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tags]);

  return {
    tags,
    loading,
    error,
    initializeTags,
    addTag,
    updateTag,
    removeTag,
    findTagById,
    findTagsByName,
    getUserTags,
    filterTasksByTags,
    getUniqueTagsFromTasks,
    validateTag,
    isTagNameUnique,
    getTagsByColor,
    sortTagsAlphabetically,
    sortTagsByDate,
  };
};