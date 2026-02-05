import React, { useState } from 'react';
import { Task } from '../../models/task';
import { Tag } from '../../models/tag';
import { Reminder } from '../../models/reminder';
import ReminderConfigPanel from '../reminders/ReminderConfigPanel';

interface TaskWithRemindersFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
  availableTags: Tag[];
}

const TaskWithRemindersForm: React.FC<TaskWithRemindersFormProps> = ({ task, onSave, onCancel, availableTags }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [status, setStatus] = useState(task?.status || 'active');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags?.map(tag => tag.id) || []);
  const [reminders, setReminders] = useState<Reminder[]>(task?.reminders || []);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder> | null>(null);

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
      tags: availableTags.filter(tag => selectedTags.includes(tag.id)),
      reminders: reminders,
    };

    onSave(updatedTask);
  };

  const handleAddReminder = () => {
    setNewReminder({
      id: crypto.randomUUID(),
      taskId: task?.id || '',
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // Default to 1 hour from now
      deliveryStatus: 'pending',
      deliveryMethods: ['browser'], // Default to browser notification
    });
    setShowReminderForm(true);
  };

  const handleSaveReminder = (reminder: Reminder) => {
    if (task?.reminders) {
      // Update existing reminder
      const updatedReminders = reminders.map(r => 
        r.id === reminder.id ? reminder : r
      );
      setReminders(updatedReminders);
    } else {
      // Add new reminder
      setReminders([...reminders, reminder]);
    }
    setShowReminderForm(false);
    setNewReminder(null);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Reminders Section */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">Reminders</h3>
          <button
            type="button"
            onClick={handleAddReminder}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Reminder
          </button>
        </div>

        {reminders.length > 0 ? (
          <div className="space-y-2">
            {reminders.map(reminder => (
              <div key={reminder.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-md">
                <div>
                  <p className="text-sm font-medium">{new Date(reminder.scheduledTime).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Methods: {reminder.deliveryMethods.join(', ')}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    reminder.deliveryStatus === 'delivered' 
                      ? 'bg-green-100 text-green-800' 
                      : reminder.deliveryStatus === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                  }`}>
                    {reminder.deliveryStatus}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteReminder(reminder.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">No reminders set for this task.</p>
        )}

        {showReminderForm && newReminder && (
          <div className="mt-4">
            <ReminderConfigPanel
              initialReminder={newReminder}
              taskId={task?.id || ''}
              onSave={handleSaveReminder}
              onCancel={() => setShowReminderForm(false)}
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
          {task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskWithRemindersForm;