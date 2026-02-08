import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { 
  createTask, 
  updateTask, 
  clearTasksError, 
  clearTasksSuccessMessage 
} from '@/store/tasksSlice';
import { RootState } from '@/store';
import { Tag } from '@/types/api';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

interface TaskFormProps {
  task?: {
    id: string;
    title: string;
    description?: string;
    tag_ids?: string[];
  };
  tags: Tag[];
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, tags, onCancel }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { error, successMessage } = useSelector((state: RootState) => state.tasks);
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(task?.tag_ids || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Clear previous messages
    dispatch(clearTasksError());
    dispatch(clearTasksSuccessMessage());

    try {
      if (task) {
        // Update existing task
        await dispatch(updateTask({ 
          id: task.id, 
          taskData: { 
            title, 
            description, 
            tag_ids: selectedTagIds 
          } 
        }));
      } else {
        // Create new task
        await dispatch(createTask({ 
          title, 
          description, 
          tag_ids: selectedTagIds 
        }));
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setSelectedTagIds([]);
      
      // Close form after successful submission
      onCancel();
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{task ? 'Edit Task' : 'Create New Task'}</h2>
      
      <ErrorDisplay 
        error={error} 
        onClose={() => dispatch(clearTasksError())} 
      />
      
      <SuccessMessage 
        message={successMessage} 
        onClose={() => dispatch(clearTasksSuccessMessage())} 
      />

      <div className="mb-4">
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task title"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagToggle(tag.id)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTagIds.includes(tag.id)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tag.name}
            </button>
          ))}
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
          {isLoading ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;