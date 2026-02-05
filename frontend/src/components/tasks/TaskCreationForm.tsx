import React, { useState } from 'react';
import { Task } from '../../models/task';
import { RecurrencePattern } from '../../models/recurrence';
import RecurrenceConfigForm from '../recurrence/RecurrenceConfigForm';
import { Tag } from '../../models/tag';

interface TaskCreationFormProps {
  onCreateTask: (task: Omit<Task, 'id'>) => void;
  onCancel: () => void;
  availableTags: Tag[];
}

const TaskCreationForm: React.FC<TaskCreationFormProps> = ({ onCreateTask, onCancel, availableTags }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | null>(null);
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTask: Omit<Task, 'id'> = {
      title,
      description,
      status: 'active',
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'current-user-id', // In a real app, this would come from auth context
      tags: availableTags.filter(tag => selectedTags.includes(tag.id)),
      recurrencePattern: hasRecurrence ? recurrencePattern || undefined : undefined,
    };

    onCreateTask(newTask);
  };

  const handleRecurrenceSave = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    setShowRecurrenceForm(false);
    setHasRecurrence(true);
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Tags Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTagSelection(tag.id)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedTags.includes(tag.id)
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
              style={
                selectedTags.includes(tag.id)
                  ? { backgroundColor: `${tag.color}20`, color: tag.color } // Add transparency to background
                  : {}
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Recurrence Pattern */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex items-center">
          <input
            id="hasRecurrence"
            type="checkbox"
            checked={hasRecurrence}
            onChange={(e) => {
              setHasRecurrence(e.target.checked);
              if (!e.target.checked) {
                setRecurrencePattern(null);
              } else {
                setShowRecurrenceForm(true);
              }
            }}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="hasRecurrence" className="ml-2 block text-sm text-gray-900">
            Recurring Task
          </label>
        </div>

        {hasRecurrence && recurrencePattern && (
          <div className="mt-3 p-3 bg-blue-50 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {recurrencePattern.patternType.charAt(0).toUpperCase() + recurrencePattern.patternType.slice(1)} 
                  {' '}every {recurrencePattern.interval} {recurrencePattern.patternType}
                </p>
                <p className="text-xs text-gray-500">
                  Ends: {recurrencePattern.endCondition} 
                  {recurrencePattern.endCondition === 'after_occurrences' && ` after ${recurrencePattern.occurrenceCount} occurrences`}
                  {recurrencePattern.endCondition === 'on_date' && ` on ${recurrencePattern.endDate}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRecurrenceForm(true)}
                className="text-xs text-indigo-600 hover:text-indigo-900"
              >
                Edit
              </button>
            </div>
          </div>
        )}

        {showRecurrenceForm && (
          <div className="mt-3">
            <RecurrenceConfigForm
              initialPattern={recurrencePattern || undefined}
              onSave={handleRecurrenceSave}
              onCancel={() => setShowRecurrenceForm(false)}
            />
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
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Task
        </button>
      </div>
    </form>
  );
};

export default TaskCreationForm;