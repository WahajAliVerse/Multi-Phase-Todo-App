import { useState } from 'react';

interface RecurrenceFormProps {
  recurrencePattern: any;
  onChange: (pattern: any) => void;
}

const RecurrenceForm = ({ recurrencePattern, onChange }: RecurrenceFormProps) => {
  const [patternType, setPatternType] = useState(recurrencePattern?.patternType || 'none');
  const [interval, setInterval] = useState(recurrencePattern?.interval || 1);
  const [endCondition, setEndCondition] = useState(recurrencePattern?.endCondition || 'never');
  const [occurrenceCount, setOccurrenceCount] = useState(recurrencePattern?.occurrenceCount || 1);
  const [endDate, setEndDate] = useState(recurrencePattern?.endDate || '');

  const handleSave = () => {
    const pattern = {
      patternType,
      interval,
      endCondition,
      ...(endCondition === 'after_occurrences' && { occurrenceCount }),
      ...(endCondition === 'on_date' && { endDate }),
    };
    onChange(pattern);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Recurrence Pattern</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="patternType" className="block text-sm font-medium text-foreground mb-1">
            Pattern Type
          </label>
          <select
            id="patternType"
            value={patternType}
            onChange={(e) => {
              setPatternType(e.target.value);
              handleSave();
            }}
            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
          >
            <option value="none">None</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {patternType !== 'none' && (
          <>
            <div>
              <label htmlFor="interval" className="block text-sm font-medium text-foreground mb-1">
                Repeat Every
              </label>
              <input
                type="number"
                id="interval"
                min="1"
                value={interval}
                onChange={(e) => {
                  setInterval(parseInt(e.target.value));
                  handleSave();
                }}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              />
              <span className="text-sm text-muted-foreground ml-2">
                {patternType === 'daily' && 'day(s)'}
                {patternType === 'weekly' && 'week(s)'}
                {patternType === 'monthly' && 'month(s)'}
                {patternType === 'yearly' && 'year(s)'}
              </span>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">
                End Condition
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'never'}
                    onChange={() => {
                      setEndCondition('never');
                      handleSave();
                    }}
                    className="mr-2"
                  />
                  Never
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'after_occurrences'}
                    onChange={() => {
                      setEndCondition('after_occurrences');
                      handleSave();
                    }}
                    className="mr-2"
                  />
                  After
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="endCondition"
                    checked={endCondition === 'on_date'}
                    onChange={() => {
                      setEndCondition('on_date');
                      handleSave();
                    }}
                    className="mr-2"
                  />
                  On Date
                </label>
              </div>

              {endCondition === 'after_occurrences' && (
                <div className="mt-2">
                  <label htmlFor="occurrenceCount" className="block text-sm font-medium text-foreground mb-1">
                    Number of Occurrences
                  </label>
                  <input
                    type="number"
                    id="occurrenceCount"
                    min="1"
                    value={occurrenceCount}
                    onChange={(e) => {
                      setOccurrenceCount(parseInt(e.target.value));
                      handleSave();
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                  />
                </div>
              )}

              {endCondition === 'on_date' && (
                <div className="mt-2">
                  <label htmlFor="endDate" className="block text-sm font-medium text-foreground mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      handleSave();
                    }}
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecurrenceForm;