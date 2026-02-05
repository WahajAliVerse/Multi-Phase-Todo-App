import React, { useState } from 'react';
import { Reminder } from '../../models/reminder';
import ReminderConfigPanel from '../reminders/ReminderConfigPanel';

interface MultipleReminderConfigProps {
  taskReminders: Reminder[];
  taskId: string;
  onSave: (reminders: Reminder[]) => void;
  onCancel: () => void;
}

const MultipleReminderConfig: React.FC<MultipleReminderConfigProps> = ({ 
  taskReminders, 
  taskId,
  onSave, 
  onCancel 
}) => {
  const [reminders, setReminders] = useState<Reminder[]>(taskReminders);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  const handleAddReminder = () => {
    const newReminder: Reminder = {
      id: crypto.randomUUID(),
      taskId,
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60).toISOString(), // Default to 1 hour from now
      deliveryStatus: 'pending',
      deliveryMethods: ['browser'], // Default to browser notification
      createdAt: new Date().toISOString(),
    };
    setEditingReminder(newReminder);
    setShowAddForm(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowAddForm(true);
  };

  const handleSaveReminder = (reminder: Reminder) => {
    if (editingReminder && editingReminder.id === reminder.id) {
      // Update existing reminder
      setReminders(prev => prev.map(r => r.id === reminder.id ? reminder : r));
    } else {
      // Add new reminder
      setReminders(prev => [...prev, reminder]);
    }
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const handleDeleteReminder = (reminderId: string) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== reminderId));
  };

  const handleCancelForm = () => {
    setShowAddForm(false);
    setEditingReminder(null);
  };

  const handleSaveAll = () => {
    onSave(reminders);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Task Reminders</h3>
        <button
          type="button"
          onClick={handleAddReminder}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Reminder
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gray-50 p-4 rounded-md">
          <ReminderConfigPanel
            initialReminder={editingReminder || undefined}
            taskId={taskId}
            onSave={handleSaveReminder}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {reminders.length === 0 ? (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No reminders</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new reminder.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAddReminder}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Add Reminder
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div 
              key={reminder.id} 
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(reminder.scheduledTime).toLocaleString()}
                    </p>
                    <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      reminder.deliveryStatus === 'delivered' 
                        ? 'bg-green-100 text-green-800' 
                        : reminder.deliveryStatus === 'pending' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : reminder.deliveryStatus === 'sent' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-red-100 text-red-800'
                    }`}>
                      {reminder.deliveryStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Delivery methods: {reminder.deliveryMethods.join(', ')}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEditReminder(reminder)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
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
            </div>
          ))}
        </div>
      )}

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
          type="button"
          onClick={handleSaveAll}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save All Reminders
        </button>
      </div>
    </div>
  );
};

export default MultipleReminderConfig;