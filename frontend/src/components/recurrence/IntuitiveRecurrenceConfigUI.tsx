import React, { useState, useEffect } from 'react';
import { RecurrencePattern } from '../../models/recurrence';
import { RecurrenceValidationService } from '../../services/recurrenceValidationService';

interface IntuitiveRecurrenceConfigUIProps {
  initialPattern?: RecurrencePattern;
  onSave: (pattern: RecurrencePattern) => void;
  onCancel: () => void;
}

const IntuitiveRecurrenceConfigUI: React.FC<IntuitiveRecurrenceConfigUIProps> = ({ 
  initialPattern, 
  onSave, 
  onCancel 
}) => {
  const [patternType, setPatternType] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(
    initialPattern?.patternType || 'daily'
  );
  const [interval, setInterval] = useState(initialPattern?.interval || 1);
  const [endCondition, setEndCondition] = useState<'never' | 'after_occurrences' | 'on_date'>(
    initialPattern?.endCondition || 'never'
  );
  const [occurrenceCount, setOccurrenceCount] = useState(initialPattern?.occurrenceCount || 1);
  const [endDate, setEndDate] = useState(initialPattern?.endDate || '');
  const [daysOfWeek, setDaysOfWeek] = useState<Array<'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'>>(
    initialPattern?.daysOfWeek || []
  );
  const [daysOfMonth, setDaysOfMonth] = useState<number[]>(initialPattern?.daysOfMonth || []);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; errors: string[] }>({ 
    isValid: true, 
    errors: [] 
  });
  const [feedback, setFeedback] = useState<{ warnings: string[]; suggestions: string[] }>({ 
    warnings: [], 
    suggestions: [] 
  });

  // Update validation in real-time
  useEffect(() => {
    const pattern: RecurrencePattern = {
      id: initialPattern?.id || crypto.randomUUID(),
      patternType,
      interval,
      endCondition,
      occurrenceCount: endCondition === 'after_occurrences' ? occurrenceCount : undefined,
      endDate: endCondition === 'on_date' ? endDate : undefined,
      daysOfWeek: patternType === 'weekly' ? daysOfWeek : undefined,
      daysOfMonth: patternType === 'monthly' ? daysOfMonth : undefined,
      createdAt: initialPattern?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setValidationResult(RecurrenceValidationService.validatePattern(pattern));
    setFeedback(RecurrenceValidationService.getRealTimeFeedback(pattern));
  }, [patternType, interval, endCondition, occurrenceCount, endDate, daysOfWeek, daysOfMonth, initialPattern]);

  const handleDayOfWeekToggle = (day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun') => {
    if (daysOfWeek.includes(day)) {
      setDaysOfWeek(daysOfWeek.filter(d => d !== day));
    } else {
      setDaysOfWeek([...daysOfWeek, day]);
    }
  };

  const handleDayOfMonthToggle = (day: number) => {
    if (daysOfMonth.includes(day)) {
      setDaysOfMonth(daysOfMonth.filter(d => d !== day));
    } else {
      setDaysOfMonth([...daysOfMonth, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const pattern: RecurrencePattern = {
      id: initialPattern?.id || crypto.randomUUID(),
      patternType,
      interval,
      endCondition,
      occurrenceCount: endCondition === 'after_occurrences' ? occurrenceCount : undefined,
      endDate: endCondition === 'on_date' ? endDate : undefined,
      daysOfWeek: patternType === 'weekly' ? daysOfWeek : undefined,
      daysOfMonth: patternType === 'monthly' ? daysOfMonth : undefined,
      createdAt: initialPattern?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (validationResult.isValid) {
      onSave(pattern);
    }
  };

  // Format the pattern for display
  const formatPatternPreview = (): string => {
    let preview = `Repeat ${patternType}`;
    
    if (interval > 1) {
      preview += ` every ${interval} ${patternType}s`;
    } else {
      preview += 'ly';
    }
    
    if (patternType === 'weekly' && daysOfWeek.length > 0) {
      preview += ` on ${daysOfWeek.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')}`;
    }
    
    if (patternType === 'monthly' && daysOfMonth.length > 0) {
      preview += ` on day${daysOfMonth.length > 1 ? 's' : ''} ${daysOfMonth.join(', ')}`;
    }
    
    if (endCondition === 'after_occurrences') {
      preview += ` for ${occurrenceCount} occurrence${occurrenceCount > 1 ? 's' : ''}`;
    } else if (endCondition === 'on_date') {
      preview += ` until ${new Date(endDate).toLocaleDateString()}`;
    } else {
      preview += ' indefinitely';
    }
    
    return preview;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm font-medium text-blue-800">Pattern Preview: {formatPatternPreview()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pattern Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Repeat Pattern
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setPatternType(type)}
                className={`px-3 py-2 text-sm rounded-md ${
                  patternType === type
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Interval */}
        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
            Every
          </label>
          <div className="flex">
            <input
              type="number"
              id="interval"
              min="1"
              value={interval}
              onChange={(e) => setInterval(parseInt(e.target.value) || 1)}
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-l-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
              {patternType}{interval > 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Days of Week (for weekly patterns) */}
      {patternType === 'weekly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days of Week
          </label>
          <div className="grid grid-cols-7 gap-2">
            {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayOfWeekToggle(day)}
                className={`px-3 py-2 text-sm rounded-md ${
                  daysOfWeek.includes(day)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {day.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Days of Month (for monthly patterns) */}
      {patternType === 'monthly' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days of Month
          </label>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayOfMonthToggle(day)}
                className={`px-3 py-2 text-sm rounded-md ${
                  daysOfMonth.includes(day)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* End Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          End Condition
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['never', 'after_occurrences', 'on_date'] as const).map(condition => (
            <button
              key={condition}
              type="button"
              onClick={() => setEndCondition(condition)}
              className={`px-3 py-2 text-sm rounded-md ${
                endCondition === condition
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {condition === 'never' ? 'Never' : 
               condition === 'after_occurrences' ? 'After Occurrences' : 'On Date'}
            </button>
          ))}
        </div>
      </div>

      {/* Occurrence Count (when end condition is 'after_occurrences') */}
      {endCondition === 'after_occurrences' && (
        <div>
          <label htmlFor="occurrenceCount" className="block text-sm font-medium text-gray-700 mb-1">
            Number of Occurrences
          </label>
          <input
            type="number"
            id="occurrenceCount"
            min="1"
            value={occurrenceCount}
            onChange={(e) => setOccurrenceCount(parseInt(e.target.value) || 1)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {/* End Date (when end condition is 'on_date') */}
      {endCondition === 'on_date' && (
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      )}

      {/* Validation Errors */}
      {!validationResult.isValid && validationResult.errors.length > 0 && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Validation Errors</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {validationResult.errors.map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warnings and Suggestions */}
      {(feedback.warnings.length > 0 || feedback.suggestions.length > 0) && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Feedback</h3>
              <div className="mt-2 text-sm text-yellow-700">
                {feedback.warnings.length > 0 && (
                  <>
                    <h4 className="font-medium">Warnings:</h4>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {feedback.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </>
                )}
                {feedback.suggestions.length > 0 && (
                  <>
                    <h4 className="font-medium mt-2">Suggestions:</h4>
                    <ul className="list-disc pl-5 space-y-1 mt-1">
                      {feedback.suggestions.map((suggestion, idx) => (
                        <li key={idx}>{suggestion}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
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
          type="submit"
          disabled={!validationResult.isValid}
          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            validationResult.isValid
              ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Save Recurrence Pattern
        </button>
      </div>
    </form>
  );
};

export default IntuitiveRecurrenceConfigUI;