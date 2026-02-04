import React, { useState, useMemo } from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { RecurrencePattern } from '@/lib/types';
import { formatForDisplay } from '@/lib/timezone-utils';

interface RecurrenceEditorProps {
  initialValue?: RecurrencePattern;
  onSave: (pattern: RecurrencePattern) => void;
  onCancel: () => void;
}

export const RecurrenceEditor: React.FC<RecurrenceEditorProps> = ({
  initialValue,
  onSave,
  onCancel
}) => {
  const [patternType, setPatternType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    initialValue?.patternType || 'daily'
  );
  const [interval, setInterval] = useState<number>(initialValue?.interval || 1);
  const [endCondition, setEndCondition] = useState<'never' | 'after_occurrences' | 'on_date'>(
    initialValue?.endCondition || 'never'
  );
  const [occurrenceCount, setOccurrenceCount] = useState<number>(initialValue?.occurrenceCount || 1);
  const [endDate, setEndDate] = useState<string>(initialValue?.endDate ? new Date(initialValue.endDate).toISOString().split('T')[0] : '');
  const [daysOfWeek, setDaysOfWeek] = useState<string[]>(initialValue?.daysOfWeek || []);
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>(initialValue?.daysOfMonth || []);
  const [error, setError] = useState<string | null>(null);

  // Calculate preview dates
  const previewDates = useMemo(() => {
    if (!patternType) return [];

    const now = new Date();
    const dates: Date[] = [];
    const maxPreview = 5; // Show next 5 occurrences

    // Helper function to add dates based on pattern
    const addDates = (baseDate: Date, count: number, incrementFn: (date: Date, i: number) => Date) => {
      for (let i = 1; i <= count; i++) {
        const newDate = incrementFn(baseDate, i);
        if (endCondition === 'on_date' && newDate > new Date(endDate)) break;
        if (endCondition === 'after_occurrences' && i > occurrenceCount) break;
        dates.push(newDate);
        if (dates.length >= maxPreview) break;
      }
    };

    switch (patternType) {
      case 'daily':
        addDates(now, maxPreview * interval, (date, i) => {
          const newDate = new Date(date);
          newDate.setDate(date.getDate() + (i * interval));
          return newDate;
        });
        break;

      case 'weekly':
        // If specific days of week are selected
        if (daysOfWeek.length > 0) {
          // This is a simplified implementation - in a real app, you'd calculate the next occurrences
          // based on the selected days of the week
          const dayMap: Record<string, number> = {
            'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
          };

          // Find next occurrences based on selected days
          let currentDate = new Date(now);
          let added = 0;

          while (added < maxPreview) {
            currentDate.setDate(currentDate.getDate() + 1);
            const dayIndex = currentDate.getDay();
            const dayAbbr = Object.keys(dayMap).find(key => dayMap[key] === dayIndex);

            if (dayAbbr && daysOfWeek.includes(dayAbbr)) {
              dates.push(new Date(currentDate));
              added++;
            }

            // Prevent infinite loop
            if (currentDate > new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) break; // 30 days max
          }
        } else {
          // Weekly pattern without specific days - just add weeks
          addDates(now, maxPreview * interval, (date, i) => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + (i * interval * 7));
            return newDate;
          });
        }
        break;

      case 'monthly':
        if (daysOfMonth.length > 0) {
          // Monthly pattern with specific days of month
          let currentDate = new Date(now.getFullYear(), now.getMonth(), Math.max(...daysOfMonth));
          let monthsAdded = 0;
          let added = 0;

          while (added < maxPreview && monthsAdded < 12) { // Max 12 months to prevent infinite loop
            for (const day of daysOfMonth.sort((a, b) => a - b)) {
              const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

              // If the day doesn't exist in this month (e.g., Feb 30), use the last day of the month
              if (newDate.getMonth() !== currentDate.getMonth() && day > 28) {
                // Set to last day of month
                newDate.setDate(0); // Last day of previous month
              }

              if (newDate > now && dates.length < maxPreview) {
                dates.push(newDate);
                added++;

                if (endCondition === 'on_date' && newDate > new Date(endDate)) {
                  break;
                }
                if (endCondition === 'after_occurrences' && added > occurrenceCount) {
                  break;
                }
              }
            }

            currentDate.setMonth(currentDate.getMonth() + 1);
            monthsAdded++;
          }
        } else {
          // Monthly pattern without specific days - just add months
          addDates(now, maxPreview * interval, (date, i) => {
            const newDate = new Date(date);
            newDate.setMonth(date.getMonth() + (i * interval));
            return newDate;
          });
        }
        break;

      case 'yearly':
        // Yearly pattern
        addDates(now, maxPreview * interval, (date, i) => {
          const newDate = new Date(date);
          newDate.setFullYear(date.getFullYear() + (i * interval));
          return newDate;
        });
        break;
    }

    return dates.slice(0, maxPreview);
  }, [patternType, interval, endCondition, occurrenceCount, endDate, daysOfWeek, daysOfMonth]);

  const handleDayOfWeekChange = (day: string) => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleDayOfMonthChange = (day: number) => {
    if (daysOfMonth.includes(day)) {
      setDaysOfMonth(daysOfMonth.filter(d => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    if (endCondition === 'after_occurrences' && occurrenceCount <= 0) {
      setError('Occurrence count must be greater than 0');
      return;
    }

    if (endCondition === 'on_date' && !endDate) {
      setError('End date is required when end condition is "on date"');
      return;
    }

    if (interval <= 0) {
      setError('Interval must be greater than 0');
      return;
    }

    // Create the recurrence pattern object
    const recurrencePattern: RecurrencePattern = {
      id: initialValue?.id || Date.now(), // Use existing ID or generate a temporary one
      patternType,
      interval,
      endCondition,
      ...(endCondition === 'after_occurrences' && { occurrenceCount }),
      ...(endCondition === 'on_date' && endDate && { endDate: new Date(endDate) }),
      ...(patternType === 'weekly' && daysOfWeek.length > 0 && { daysOfWeek }),
      ...(patternType === 'monthly' && daysOfMonth.length > 0 && { daysOfMonth }),
      createdAt: initialValue?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(recurrencePattern);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded-lg shadow" role="form" aria-label="Recurrence Pattern Editor">
      <h3 className="text-lg font-semibold" id="recurrence-editor-heading">Recurrence Pattern</h3>

      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pattern Type</label>
          <Select
            value={patternType}
            onChange={(e) => setPatternType(e.target.value as any)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Repeat Every</label>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              min="1"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              placeholder="Interval"
            />
            <span className="text-sm">{patternType}</span>
          </div>
        </div>
      </div>

      {(patternType === 'weekly' || patternType === 'monthly') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            {patternType === 'weekly' ? 'Days of Week' : 'Days of Month'}
          </label>

          {patternType === 'weekly' && (
            <div className="grid grid-cols-7 gap-2">
              {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayOfWeekChange(day)}
                  className={`p-2 text-xs rounded ${
                    daysOfWeek.includes(day)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {day.substring(0, 1).toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {patternType === 'monthly' && (
            <div className="grid grid-cols-7 gap-1 max-h-40 overflow-y-auto">
              {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayOfMonthChange(day)}
                  className={`p-2 text-xs rounded ${
                    daysOfMonth.includes(day)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">End Condition</label>
        <Select
          value={endCondition}
          onChange={(e) => setEndCondition(e.target.value as any)}
          options={[
            { value: 'never', label: 'Never' },
            { value: 'after_occurrences', label: 'After Occurrences' },
            { value: 'on_date', label: 'On Date' },
          ]}
        />
      </div>

      {endCondition === 'after_occurrences' && (
        <div>
          <label className="block text-sm font-medium mb-1">Number of Occurrences</label>
          <Input
            type="number"
            min="1"
            value={occurrenceCount}
            onChange={(e) => setOccurrenceCount(Number(e.target.value))}
            placeholder="Number of occurrences"
          />
        </div>
      )}

      {endCondition === 'on_date' && (
        <div>
          <label className="block text-sm font-medium mb-1">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      )}

      {/* Preview Section */}
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Preview of Next Occurrences</h4>
        {previewDates.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {previewDates.map((date, index) => (
              <div key={index} className="p-2 bg-blue-50 rounded text-sm text-center">
                {formatForDisplay(date)}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Configure the pattern to see preview</p>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Pattern
        </Button>
      </div>
    </form>
  );
};