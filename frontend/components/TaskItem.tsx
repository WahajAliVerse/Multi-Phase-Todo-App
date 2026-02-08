import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  updateTask, 
  deleteTask, 
  clearTasksError, 
  clearTasksSuccessMessage 
} from '@/store/tasksSlice';
import { Task, Tag } from '@/types/api';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import ErrorDisplay from '@/components/ErrorDisplay';
import SuccessMessage from '@/components/SuccessMessage';

interface TaskItemProps {
  task: Task;
  tags: Tag[];
}

const TaskItem: React.FC<TaskItemProps> = ({ task, tags }) => {
  const dispatch = useDispatch();
  const { error, successMessage } = useSelector((state: RootState) => state.tasks);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(task.tag_ids || []);

  const handleSave = async () => {
    // Clear previous messages
    dispatch(clearTasksError());
    dispatch(clearTasksSuccessMessage());
    
    await dispatch(updateTask({ 
      id: task.id, 
      taskData: { 
        title, 
        description, 
        completed: task.completed,
        tag_ids: selectedTagIds
      } 
    }));
    setIsEditing(false);
  };

  const handleDelete = async () => {
    // Clear previous messages
    dispatch(clearTasksError());
    dispatch(clearTasksSuccessMessage());
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(task.id));
    }
  };

  const handleToggleComplete = async () => {
    // Clear previous messages
    dispatch(clearTasksError());
    dispatch(clearTasksSuccessMessage());
    
    await dispatch(updateTask({ 
      id: task.id, 
      taskData: { completed: !task.completed } 
    }));
  };

  const handleTagToggle = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      setSelectedTagIds(selectedTagIds.filter(id => id !== tagId));
    } else {
      setSelectedTagIds([...selectedTagIds, tagId]);
    }
  };

  const associatedTags = tags.filter(tag => task.tag_ids?.includes(tag.id));

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-start">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleToggleComplete}
          className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
        />
        
        <div className="ml-3 flex-1">
          {isEditing ? (
            <>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded-md mb-2"
                rows={2}
              />
              
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagToggle(tag.id)}
                      className={`px-2 py-1 rounded-full text-xs ${
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
                    setTitle(task.title);
                    setDescription(task.description || '');
                    setSelectedTagIds(task.tag_ids || []);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <h3 className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                  {task.title}
                </h3>
                <div className="flex space-x-2">
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
              </div>
              
              {task.description && (
                <p className={`text-gray-600 mt-1 ${task.completed ? 'line-through' : ''}`}>
                  {task.description}
                </p>
              )}
              
              {associatedTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {associatedTags.map(tag => (
                    <span 
                      key={tag.id} 
                      className="px-2 py-1 rounded-full text-xs"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }} // Add opacity to background
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <ErrorDisplay 
        error={error} 
        onClose={() => dispatch(clearTasksError())} 
      />
      
      <SuccessMessage 
        message={successMessage} 
        onClose={() => dispatch(clearTasksSuccessMessage())} 
      />
    </div>
  );
};

export default TaskItem;