import { useState } from 'react';

interface DueDatePickerProps {
  dueDate: string | null;
  onChange: (date: string | null) => void;
}

const DueDatePicker = ({ dueDate, onChange }: DueDatePickerProps) => {
  const [selectedDate, setSelectedDate] = useState<string>(dueDate || '');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    onChange(newDate || null);
  };

  const clearDate = () => {
    setSelectedDate('');
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground">Due Date</label>
      <div className="flex items-center space-x-2">
        <input
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="flex-1 px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
        />
        {selectedDate && (
          <button
            type="button"
            onClick={clearDate}
            className="px-3 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

export default DueDatePicker;