import React, { useState } from 'react';
import { Task } from '../../models/task';
import { Tag } from '../../models/tag';
import RecurrenceConfigForm from '../recurrence/RecurrenceConfigForm';
import ReminderConfigPanel from '../reminders/ReminderConfigPanel';
import TagManager from '../tags/TagManager';

interface UnifiedTaskConfigurationPanelProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
}

const UnifiedTaskConfigurationPanel: React.FC<UnifiedTaskConfigurationPanelProps> = ({ 
  task, 
  onSave, 
  onCancel 
}) => {
  const [activeTab, setActiveTab] = useState<'recurrence' | 'reminders' | 'tags'>('recurrence');
  const [updatedTask, setUpdatedTask] = useState<Task>(task);
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [newReminder, setNewReminder] = useState<any>(null);

  const handleSaveRecurrence = (recurrencePattern: any) => {
    setUpdatedTask(prev => ({
      ...prev,
      recurrencePattern
    }));
    setShowRecurrenceForm(false);
  };

  const handleSaveReminder = (reminder: any) => {
    setUpdatedTask(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), reminder]
    }));
    setShowReminderForm(false);
    setNewReminder(null);
  };

  const handleSaveTags = (tags: Tag[]) => {
    setUpdatedTask(prev => ({
      ...prev,
      tags
    }));
  };

  const handleSaveChanges = () => {
    onSave(updatedTask);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('recurrence')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'recurrence'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recurrence
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'reminders'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Reminders
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'tags'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Tags
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'recurrence' && (
          <div>
            {showRecurrenceForm ? (
              <RecurrenceConfigForm
                initialPattern={updatedTask.recurrencePattern}
                onSave={handleSaveRecurrence}
                onCancel={() => setShowRecurrenceForm(false)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Recurrence Pattern</h3>
                  <button
                    type="button"
                    onClick={() => setShowRecurrenceForm(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {updatedTask.recurrencePattern ? 'Edit Pattern' : 'Set Pattern'}
                  </button>
                </div>
                
                {updatedTask.recurrencePattern ? (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p><span className="font-medium">Pattern:</span> {updatedTask.recurrencePattern.patternType}</p>
                    <p><span className="font-medium">Interval:</span> Every {updatedTask.recurrencePattern.interval} {updatedTask.recurrencePattern.patternType}</p>
                    <p><span className="font-medium">Ends:</span> {updatedTask.recurrencePattern.endCondition}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No recurrence pattern set. Click "Set Pattern" to configure.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reminders' && (
          <div>
            {showReminderForm ? (
              <ReminderConfigPanel
                taskId={updatedTask.id}
                onSave={handleSaveReminder}
                onCancel={() => setShowReminderForm(false)}
              />
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Reminders</h3>
                  <button
                    type="button"
                    onClick={() => setShowReminderForm(true)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Add Reminder
                  </button>
                </div>
                
                {updatedTask.reminders && updatedTask.reminders.length > 0 ? (
                  <div className="space-y-3">
                    {updatedTask.reminders.map((reminder, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-md flex justify-between items-center">
                        <div>
                          <p className="font-medium">{new Date(reminder.scheduledTime).toLocaleString()}</p>
                          <p className="text-sm text-gray-500">Methods: {reminder.deliveryMethods.join(', ')}</p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          reminder.deliveryStatus === 'delivered' 
                            ? 'bg-green-100 text-green-800' 
                            : reminder.deliveryStatus === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {reminder.deliveryStatus}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reminders set. Click "Add Reminder" to configure.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Task Tags</h3>
            <TagManager 
              initialTags={updatedTask.tags || []} 
              onTagsChange={handleSaveTags} 
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveChanges}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedTaskConfigurationPanel;