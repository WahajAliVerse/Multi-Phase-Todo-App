import React, { useState } from 'react';
import { Task } from '../../models/task';
import { RecurrencePattern } from '../../models/recurrence';
import RecurrenceConfigForm from '../recurrence/RecurrenceConfigForm';

interface TaskRecurrenceEditorProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onCancel: () => void;
}

const TaskRecurrenceEditor: React.FC<TaskRecurrenceEditorProps> = ({ task, onSave, onCancel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedTask, setUpdatedTask] = useState<Task>(task);

  const handleSaveRecurrence = (pattern: RecurrencePattern) => {
    const updated = {
      ...updatedTask,
      recurrencePattern: pattern,
      updatedAt: new Date().toISOString(),
    };
    setUpdatedTask(updated);
    setIsEditing(false);
  };

  const handleSaveChanges = () => {
    onSave(updatedTask);
  };

  const handleRemoveRecurrence = () => {
    const updated = {
      ...updatedTask,
      recurrencePattern: undefined,
      updatedAt: new Date().toISOString(),
    };
    setUpdatedTask(updated);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Recurrence Pattern</h3>
        {!isEditing && !updatedTask.recurrencePattern && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Add Pattern
          </button>
        )}
      </div>

      {isEditing ? (
        <RecurrenceConfigForm
          initialPattern={updatedTask.recurrencePattern}
          onSave={handleSaveRecurrence}
          onCancel={() => setIsEditing(false)}
        />
      ) : updatedTask.recurrencePattern ? (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Pattern Type</p>
                <p className="font-medium capitalize">{updatedTask.recurrencePattern.patternType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Interval</p>
                <p className="font-medium">Every {updatedTask.recurrencePattern.interval} {updatedTask.recurrencePattern.patternType}{updatedTask.recurrencePattern.interval > 1 ? 's' : ''}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">End Condition</p>
                <p className="font-medium capitalize">{updatedTask.recurrencePattern.endCondition}</p>
              </div>
              {updatedTask.recurrencePattern.endCondition === 'after_occurrences' && (
                <div>
                  <p className="text-sm text-gray-500">Occurrences</p>
                  <p className="font-medium">{updatedTask.recurrencePattern.occurrenceCount}</p>
                </div>
              )}
              {updatedTask.recurrencePattern.endCondition === 'on_date' && (
                <div>
                  <p className="text-sm text-gray-500">End Date</p>
                  <p className="font-medium">{updatedTask.recurrencePattern.endDate ? new Date(updatedTask.recurrencePattern.endDate).toLocaleDateString() : 'N/A'}</p>
                </div>
              )}
            </div>

            {updatedTask.recurrencePattern.daysOfWeek && updatedTask.recurrencePattern.daysOfWeek.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Days of Week</p>
                <p className="font-medium">{updatedTask.recurrencePattern.daysOfWeek.join(', ')}</p>
              </div>
            )}

            {updatedTask.recurrencePattern.daysOfMonth && updatedTask.recurrencePattern.daysOfMonth.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500">Days of Month</p>
                <p className="font-medium">{updatedTask.recurrencePattern.daysOfMonth.join(', ')}</p>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit Pattern
            </button>
            <button
              type="button"
              onClick={handleRemoveRecurrence}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Remove Pattern
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">No recurrence pattern set for this task.</p>
      )}

      {updatedTask.recurrencePattern && (
        <div className="mt-6 flex justify-end space-x-3">
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
      )}
    </div>
  );
};

export default TaskRecurrenceEditor;