import React, { useState } from 'react';
import { Task } from '../../models/task';
import { Tag } from '../../models/tag';
import { RecurrencePattern } from '../../models/recurrence';
import { Reminder } from '../../models/reminder';
import IntuitiveRecurrenceConfigUI from '../recurrence/IntuitiveRecurrenceConfigUI';
import MultipleReminderConfig from '../reminders/MultipleReminderConfig';
import TagAssignmentUI from '../tags/TagAssignmentUI';

interface TaskFormWithIntegratedControlsProps {
  task?: Task;
  availableTags: Tag[];
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskFormWithIntegratedControls: React.FC<TaskFormWithIntegratedControlsProps> = ({ 
  task, 
  availableTags, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [status, setStatus] = useState(task?.status || 'active');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(task?.tags?.map(tag => tag.id) || []);
  const [hasRecurrence, setHasRecurrence] = useState(!!task?.recurrencePattern);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | undefined>(task?.recurrencePattern);
  const [hasReminders, setHasReminders] = useState(task?.reminders && task.reminders.length > 0);
  const [reminders, setReminders] = useState<Reminder[]>(task?.reminders || []);
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedTask: Task = {
      id: task?.id || crypto.randomUUID(),
      title,
      description,
      status: status as 'active' | 'completed',
      priority: priority as 'low' | 'medium' | 'high',
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: task?.userId || 'current-user-id', // In a real app, this would come from auth context
      tags: availableTags.filter(tag => selectedTagIds.includes(tag.id)),
      recurrencePattern: hasRecurrence ? recurrencePattern : undefined,
      reminders: hasReminders ? reminders : [],
    };

    onSave(updatedTask);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTagIds(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const handleSaveRecurrence = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    setHasRecurrence(true);
    setShowRecurrenceForm(false);
  };

  const handleSaveReminders = (updatedReminders: Reminder[]) => {
    setReminders(updatedReminders);
    setHasReminders(updatedReminders.length > 0);
    setShowReminderForm(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Task Details</h3>
            <p className="mt-1 text-sm text-gray-500">
              Basic information about the task.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-6">
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

              <div className="sm:col-span-6">
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

              <div className="sm:col-span-2">
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

              <div className="sm:col-span-2">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'completed')}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="sm:col-span-2">
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
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Tags</h3>
            <p className="mt-1 text-sm text-gray-500">
              Organize your task with tags.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <TagAssignmentUI
              availableTags={availableTags}
              selectedTagIds={selectedTagIds}
              onTagToggle={handleTagToggle}
            />
          </div>
        </div>
      </div>

      {/* Recurrence Section */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Recurrence</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set up recurring instances of this task.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="flex items-center mb-4">
              <input
                id="hasRecurrence"
                type="checkbox"
                checked={hasRecurrence}
                onChange={(e) => {
                  setHasRecurrence(e.target.checked);
                  if (!e.target.checked) {
                    setRecurrencePattern(undefined);
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="hasRecurrence" className="ml-2 block text-sm text-gray-900">
                Make this task recurring
              </label>
            </div>

            {hasRecurrence && (
              <div className="mt-4">
                {showRecurrenceForm ? (
                  <IntuitiveRecurrenceConfigUI
                    initialPattern={recurrencePattern}
                    onSave={handleSaveRecurrence}
                    onCancel={() => setShowRecurrenceForm(false)}
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    {recurrencePattern ? (
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {recurrencePattern.patternType.charAt(0).toUpperCase() + recurrencePattern.patternType.slice(1)} 
                          {' '}every {recurrencePattern.interval} {recurrencePattern.patternType}{recurrencePattern.interval > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ends: {recurrencePattern.endCondition} 
                          {recurrencePattern.endCondition === 'after_occurrences' && ` after ${recurrencePattern.occurrenceCount} occurrences`}
                          {recurrencePattern.endCondition === 'on_date' && ` on ${recurrencePattern.endDate}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No recurrence pattern set.</p>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowRecurrenceForm(true)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {recurrencePattern ? 'Edit' : 'Configure'} Pattern
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Reminders</h3>
            <p className="mt-1 text-sm text-gray-500">
              Set up notifications for this task.
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="flex items-center mb-4">
              <input
                id="hasReminders"
                type="checkbox"
                checked={hasReminders}
                onChange={(e) => {
                  setHasReminders(e.target.checked);
                  if (!e.target.checked) {
                    setReminders([]);
                  }
                }}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="hasReminders" className="ml-2 block text-sm text-gray-900">
                Add reminders to this task
              </label>
            </div>

            {hasReminders && (
              <div className="mt-4">
                {showReminderForm ? (
                  <MultipleReminderConfig
                    taskReminders={reminders}
                    taskId={task?.id || ''}
                    onSave={handleSaveReminders}
                    onCancel={() => setShowReminderForm(false)}
                  />
                ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} configured
                      </p>
                      {reminders.length > 0 && (
                        <p className="text-xs text-gray-500">
                          Next: {new Date(reminders[0].scheduledTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowReminderForm(true)}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      {reminders.length > 0 ? 'Edit' : 'Configure'} Reminders
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
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
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskFormWithIntegratedControls;