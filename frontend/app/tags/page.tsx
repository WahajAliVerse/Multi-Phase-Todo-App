'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchTags, createTag, updateTag, deleteTag } from '@/redux/slices/tagsSlice';
import { openModal } from '@/redux/slices/uiSlice';
import TagChip from '@/components/common/TagChip';
import TagForm from '@/components/forms/TagForm';
import TaskToolbar from '@/components/common/TaskToolbar';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

const TagsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tags, loading } = useAppSelector(state => state.tags);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  const handleCreateNew = () => {
    setEditingTag(null);
    setShowForm(true);
  };

  const handleEdit = (tag: any) => {
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      dispatch(deleteTag(id));
    }
  };

  const handleSubmit = () => {
    setShowForm(false);
    setEditingTag(null);
    dispatch(fetchTags()); // Refresh the list
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TaskToolbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tags</h1>
          <Button variant="primary" onClick={handleCreateNew}>
            Create New Tag
          </Button>
        </div>

        {showForm ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{editingTag ? 'Edit Tag' : 'Create New Tag'}</CardTitle>
              </CardHeader>
              <CardBody>
                <TagForm 
                  tag={editingTag} 
                  onSubmitCallback={handleSubmit} 
                  onCancel={handleCancel} 
                />
              </CardBody>
            </Card>
          </motion.div>
        ) : (
          <>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
              </div>
            ) : tags.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12"
              >
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No tags</h3>
                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  Get started by creating a new tag.
                </p>
                <div className="mt-6">
                  <Button variant="primary" onClick={handleCreateNew}>
                    Create New Tag
                  </Button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Tag Carousel */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
                    {tags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <TagChip 
                          tag={tag} 
                          onClick={() => handleEdit(tag)}
                          removable={true}
                          onRemove={() => handleDelete(tag.id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Grid View of Tags */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {tags.map((tag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      drag="x"
                      dragConstraints={{ left: 0, right: 0 }}
                      className="cursor-move"
                    >
                      <Card elevated>
                        <CardBody>
                          <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-2">
                              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <span className="font-medium text-gray-900 dark:text-white">{tag.name}</span>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="sm" onClick={() => handleEdit(tag)}>
                                Edit
                              </Button>
                              <Button variant="danger" size="sm" onClick={() => handleDelete(tag.id)}>
                                Delete
                              </Button>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Used in {tag.taskCount || 0} tasks
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Created: {new Date(tag.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TagsPage;