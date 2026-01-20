import { useState, useEffect } from 'react';

interface RecurrenceFormProps {
  recurrencePattern: any; // In a real app, you'd have a RecurrencePattern type
  onChange: (pattern: any) => void;
}

const RecurrenceForm = ({ recurrencePattern, onChange }: RecurrenceFormProps) => {
  const [patternType, setPatternType] = useState(recurrencePattern?.patternType || 'none');
  const [interval, setInterval] = useState(recurrencePattern?.interval || 1);
  const [endCondition, setEndCondition] = useState(recurrencePattern?.endCondition || 'never');
  const [occurrenceCount, setOccurrenceCount] = useState(recurrencePattern?.occurrenceCount || 5);
  const [endDate, setEndDate] = useState(recurrencePattern?.endDate || '');

  const handleUpdate = () => {
    const updatedPattern = {
      patternType,
      interval,
      endCondition,
      occurrenceCount: endCondition === 'after_occurrences' ? occurrenceCount : undefined,
      endDate: endCondition === 'on_date' ? endDate : undefined,
    };

    onChange(updatedPattern);
  };

  // Update whenever any field changes
  useEffect(() => {
    handleUpdate();
  }, [patternType, interval, endCondition, occurrenceCount, endDate]);

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Recurring Task</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Recurrence Pattern
          </label>
          <select
            value={patternType}
            onChange={(e) => setPatternType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="none">Does not repeat</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {patternType !== 'none' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Every
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  value={interval}
                  onChange={(e) => setInterval(Number(e.target.value))}
                  className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {patternType === 'daily' && 'day(s)'}
                  {patternType === 'weekly' && 'week(s)'}
                  {patternType === 'monthly' && 'month(s)'}
                  {patternType === 'yearly' && 'year(s)'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ends
              </label>
              <select
                value={endCondition}
                onChange={(e) => setEndCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="never">Never</option>
                <option value="after_occurrences">After occurrences</option>
                <option value="on_date">On date</option>
              </select>
            </div>

            {endCondition === 'after_occurrences' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Number of occurrences
                </label>
                <input
                  type="number"
                  min="1"
                  value={occurrenceCount}
                  onChange={(e) => setOccurrenceCount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}

            {endCondition === 'on_date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RecurrenceForm;