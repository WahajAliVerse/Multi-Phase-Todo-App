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
import { formatDate } from '@/utils/dateUtils';

const TagsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tags, loading } = useAppSelector(state => state.tags);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchTags());
  }, [dispatch]);

  // State for pagination and sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9); // 3x3 grid
  const [sortBy, setSortBy] = useState<'name' | 'color' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter tags based on search query
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tag.color.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort tags
  const sortedTags = [...filteredTags].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'color':
        aValue = a.color.toLowerCase();
        bValue = b.color.toLowerCase();
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedTags.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTags = sortedTags.slice(startIndex, startIndex + itemsPerPage);

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

  const handleSubmit = async () => {
    setShowForm(false);
    setEditingTag(null);
    // Wait for tags to be fetched before continuing
    await dispatch(fetchTags());
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTag(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TaskToolbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex-1 w-full">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Tags</h1>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative rounded-md shadow-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                  placeholder="Search tags..."
                  className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as 'name' | 'color' | 'createdAt');
                    setCurrentPage(1); // Reset to first page when sorting
                  }}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                >
                  <option value="name">Sort by Name</option>
                  <option value="color">Sort by Color</option>
                  <option value="createdAt">Sort by Date</option>
                </select>
                
                <button
                  onClick={() => {
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    setCurrentPage(1); // Reset to first page when changing sort order
                  }}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1); // Reset to first page when changing items per page
                  }}
                  className="block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border"
                >
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                </select>
              </div>
            </div>
          </div>
          
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
            ) : (tags || []).length === 0 ? (
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
                {/* Tag Carousel - Show all tags, not just paginated ones */}
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4" style={{ minWidth: 'max-content' }}>
                    {(sortedTags || []).map((tag) => (
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
                  {(paginatedTags || []).map((tag) => (
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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 01-18 0 9 9 0 0118 0z" />
                              </svg>
                              Created: {formatDate(tag.createdAt)}
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                          <span className="font-medium">{Math.min(startIndex + itemsPerPage, sortedTags.length)}</span> of{' '}
                          <span className="font-medium">{sortedTags.length}</span> results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Previous</span>
                            &lt;
                          </button>
                          
                          {/* Page numbers */}
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              // Show all pages if total is 5 or less
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              // If near the beginning, show 1-5
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              // If near the end, show last 5
                              pageNum = totalPages - 4 + i;
                            } else {
                              // Show current page in the middle
                              pageNum = currentPage - 2 + i;
                            }
                            
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          })}
                          
                          <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="sr-only">Next</span>
                            &gt;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default TagsPage;