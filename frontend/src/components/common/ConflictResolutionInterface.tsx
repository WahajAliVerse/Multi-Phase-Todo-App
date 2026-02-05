import React, { useState } from 'react';
import { RecurrencePattern } from '../../models/recurrence';
import { Task } from '../../models/task';

interface ConflictResolutionInterfaceProps {
  conflictingTasks: Task[];
  proposedPattern: RecurrencePattern;
  onResolve: (resolution: 'skip' | 'adjust' | 'continue') => void;
  onCancel: () => void;
}

const ConflictResolutionInterface: React.FC<ConflictResolutionInterfaceProps> = ({ 
  conflictingTasks, 
  proposedPattern,
  onResolve,
  onCancel 
}) => {
  const [selectedOption, setSelectedOption] = useState<'skip' | 'adjust' | 'continue' | null>(null);
  const [adjustmentDetails, setAdjustmentDetails] = useState<string>('');

  const handleOptionSelect = (option: 'skip' | 'adjust' | 'continue') => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      onResolve(selectedOption);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Conflict Detected</h3>
            <button 
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-4">
              The recurrence pattern you're creating conflicts with the following existing tasks:
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              {conflictingTasks.map((task, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-red-100 last:border-0">
                  <span>{task.title}</span>
                  <span className="text-xs text-gray-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                  </span>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-gray-700 mb-4">
              The proposed pattern "{proposedPattern.patternType}" with interval {proposedPattern.interval} 
              would create overlapping tasks. How would you like to resolve this?
            </p>
            
            <div className="space-y-3">
              <div 
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedOption === 'skip' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleOptionSelect('skip')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedOption === 'skip'}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    <strong>Skip conflicting instances</strong> - Create the pattern but skip dates that conflict with existing tasks
                  </label>
                </div>
              </div>
              
              <div 
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedOption === 'adjust' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleOptionSelect('adjust')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedOption === 'adjust'}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    <strong>Adjust conflicting tasks</strong> - Move existing tasks to nearest available time slot
                  </label>
                </div>
                
                {selectedOption === 'adjust' && (
                  <div className="mt-2 ml-7">
                    <label htmlFor="adjustment-details" className="block text-sm font-medium text-gray-700 mb-1">
                      Adjustment details (optional)
                    </label>
                    <textarea
                      id="adjustment-details"
                      rows={2}
                      value={adjustmentDetails}
                      onChange={(e) => setAdjustmentDetails(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Describe how you'd like to adjust the conflicting tasks..."
                    />
                  </div>
                )}
              </div>
              
              <div 
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedOption === 'continue' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleOptionSelect('continue')}
              >
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedOption === 'continue'}
                    readOnly
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label className="ml-3 block text-sm text-gray-700">
                    <strong>Continue with conflicts</strong> - Allow overlapping tasks (not recommended)
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          <div className="items-center px-4 py-3 mt-6 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedOption}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                selectedOption 
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Confirm Resolution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolutionInterface;