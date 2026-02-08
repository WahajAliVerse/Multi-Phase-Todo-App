'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTasks, 
  fetchTags, 
  clearTasksError, 
  clearTasksSuccessMessage 
} from '@/store/tasksSlice';
import { RootState } from '@/store';
import { Tag } from '@/types/api';
import TaskForm from '@/components/TaskForm';
import TagForm from '@/components/TagForm';
import TaskItem from '@/components/TaskItem';
import TagItem from '@/components/TagItem';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

const TasksPage = () => {
  const dispatch = useDispatch();
  const { tasks, loading: tasksLoading, error: tasksError, successMessage: tasksSuccess } = useSelector(
    (state: RootState) => state.tasks
  );
  const { tags, loading: tagsLoading, error: tagsError, successMessage: tagsSuccess } = useSelector(
    (state: RootState) => state.tags
  );
  
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showTagForm, setShowTagForm] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);

  useEffect(() => {
    // Load initial data
    dispatch(fetchTasks());
    dispatch(fetchTags());
  }, [dispatch]);

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setShowTagForm(true);
  };

  const handleCancelTaskForm = () => {
    setShowTaskForm(false);
    setEditingTask(null);
  };

  const handleCancelTagForm = () => {
    setShowTagForm(false);
    setEditingTag(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Task Manager</h1>
      
      {/* Combined error display */}
      {(tasksError || tagsError) && (
        <ErrorDisplay 
          error={tasksError || tagsError} 
          onClose={() => {
            dispatch(clearTasksError());
          }} 
        />
      )}
      
      {/* Combined success message */}
      {(tasksSuccess || tagsSuccess) && (
        <SuccessMessage 
          message={tasksSuccess || tagsSuccess} 
          onClose={() => {
            dispatch(clearTasksSuccessMessage());
          }} 
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Tasks</h2>
            <button
              onClick={() => setShowTaskForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Task
            </button>
          </div>

          {showTaskForm && (
            <TaskForm 
              task={editingTask} 
              tags={tags} 
              onCancel={handleCancelTaskForm} 
            />
          )}

          {tasksLoading ? (
            <p className="text-gray-600">Loading tasks...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {tasks.length === 0 ? (
                <p className="p-4 text-gray-600">No tasks found. Create your first task!</p>
              ) : (
                tasks.map(task => (
                  <TaskItem 
                    key={task.id} 
                    task={task} 
                    tags={tags} 
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Tags Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Tags</h2>
            <button
              onClick={() => setShowTagForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add Tag
            </button>
          </div>

          {showTagForm && (
            <TagForm 
              tag={editingTag} 
              onCancel={handleCancelTagForm} 
            />
          )}

          {tagsLoading ? (
            <p className="text-gray-600">Loading tags...</p>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {tags.length === 0 ? (
                <p className="p-4 text-gray-600">No tags found. Create your first tag!</p>
              ) : (
                tags.map(tag => (
                  <TagItem 
                    key={tag.id} 
                    tag={tag} 
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TasksPage;