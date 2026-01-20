import { useState, useEffect } from 'react';

interface DueDatePickerProps {
  value: string; // ISO string format
  onChange: (date: string) => void; // ISO string format
  minDate?: string; // Minimum allowed date in ISO string format
}

const DueDatePicker = ({ value, onChange, minDate }: DueDatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState(value);
  const [showTime, setShowTime] = useState(!!value && value.includes('T'));

  // Update local state when prop changes
  useEffect(() => {
    setSelectedDate(value);
    setShowTime(!!value && value.includes('T'));
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    
    if (showTime && newDate) {
      // If we're showing time and have a date, preserve the time part
      const timePart = selectedDate?.split('T')[1] || '00:00';
      onChange(`${newDate}T${timePart}`);
    } else {
      onChange(newDate);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (selectedDate && newTime) {
      onChange(`${selectedDate}T${newTime}`);
    }
  };

  const toggleTimePicker = () => {
    if (showTime) {
      // Remove time part when toggling off
      const datePart = selectedDate?.split('T')[0] || '';
      onChange(datePart);
      setSelectedDate(datePart);
    } else {
      // Add current time when toggling on
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newDateTime = `${selectedDate}T${timeString}`;
      onChange(newDateTime);
      setSelectedDate(newDateTime);
    }
    setShowTime(!showTime);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={selectedDate?.split('T')[0] || ''}
            onChange={handleDateChange}
            min={minDate?.split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        {showTime && (
          <div className="flex-1">
            <label htmlFor="dueTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Time
            </label>
            <input
              type="time"
              id="dueTime"
              value={selectedDate?.split('T')[1]?.substring(0, 5) || ''}
              onChange={handleTimeChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="includeTime"
          checked={showTime}
          onChange={toggleTimePicker}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="includeTime" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Include time
        </label>
      </div>
    </div>
  );
};

export default DueDatePicker;