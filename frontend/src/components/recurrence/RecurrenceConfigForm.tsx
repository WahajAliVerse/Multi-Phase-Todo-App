import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { recurrencePatternSchema, RecurrencePatternFormData } from '../../utils/validation';
import { RecurrencePattern } from '../../models/recurrence';

interface RecurrenceConfigFormProps {
  initialPattern?: RecurrencePattern;
  onSave: (pattern: RecurrencePattern) => void;
  onCancel: () => void;
}

const RecurrenceConfigForm: React.FC<RecurrenceConfigFormProps> = ({ 
  initialPattern, 
  onSave, 
  onCancel 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RecurrencePatternFormData>({
    resolver: zodResolver(recurrencePatternSchema),
    defaultValues: initialPattern || {
      patternType: 'daily',
      interval: 1,
      endCondition: 'never',
    },
  });

  const watchedEndCondition = watch('endCondition');
  const watchedPatternType = watch('patternType');

  const onSubmit = (data: RecurrencePatternFormData) => {
    // Convert form data to RecurrencePattern model
    const pattern: RecurrencePattern = {
      id: initialPattern?.id || crypto.randomUUID(),
      patternType: data.patternType,
      interval: data.interval,
      endCondition: data.endCondition,
      occurrenceCount: data.occurrenceCount,
      endDate: data.endDate,
      daysOfWeek: data.daysOfWeek,
      daysOfMonth: data.daysOfMonth,
      createdAt: initialPattern?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(pattern);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pattern Type */}
        <div>
          <label htmlFor="patternType" className="block text-sm font-medium text-gray-700 mb-1">
            Pattern Type
          </label>
          <select
            id="patternType"
            {...register('patternType')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.patternType ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          {errors.patternType && (
            <p className="mt-1 text-sm text-red-600">{errors.patternType.message}</p>
          )}
        </div>

        {/* Interval */}
        <div>
          <label htmlFor="interval" className="block text-sm font-medium text-gray-700 mb-1">
            Interval
          </label>
          <input
            type="number"
            id="interval"
            min="1"
            {...register('interval', { valueAsNumber: true })}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.interval ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.interval && (
            <p className="mt-1 text-sm text-red-600">{errors.interval.message}</p>
          )}
        </div>
      </div>

      {/* Days of Week (for weekly patterns) */
        watchedPatternType === 'weekly' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days of Week
            </label>
            <div className="grid grid-cols-7 gap-2">
              {(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const).map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    value={day}
                    {...register('daysOfWeek')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">{day.substring(0, 2)}</span>
                </label>
              ))}
            </div>
            {errors.daysOfWeek && (
              <p className="mt-1 text-sm text-red-600">{errors.daysOfWeek.message}</p>
            )}
          </div>
        )}

      {/* Days of Month (for monthly patterns) */
        watchedPatternType === 'monthly' && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days of Month
            </label>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <label key={day} className="flex items-center">
                  <input
                    type="checkbox"
                    value={day}
                    {...register('daysOfMonth', { 
                      setValueAs: (value) => Number(value),
                    })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
            {errors.daysOfMonth && (
              <p className="mt-1 text-sm text-red-600">{errors.daysOfMonth.message}</p>
            )}
          </div>
        )}

      {/* End Condition */}
      <div className="mt-4">
        <label htmlFor="endCondition" className="block text-sm font-medium text-gray-700 mb-1">
          End Condition
        </label>
        <select
          id="endCondition"
          {...register('endCondition')}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
            errors.endCondition ? 'border-red-500' : 'border-gray-300'
          }`}
        >
          <option value="never">Never</option>
          <option value="after_occurrences">After Occurrences</option>
          <option value="on_date">On Date</option>
        </select>
        {errors.endCondition && (
          <p className="mt-1 text-sm text-red-600">{errors.endCondition.message}</p>
        )}
      </div>

      {/* Occurrence Count (when end condition is 'after_occurrences') */
        watchedEndCondition === 'after_occurrences' && (
          <div>
            <label htmlFor="occurrenceCount" className="block text-sm font-medium text-gray-700 mb-1">
              Number of Occurrences
            </label>
            <input
              type="number"
              id="occurrenceCount"
              min="1"
              {...register('occurrenceCount', { valueAsNumber: true })}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.occurrenceCount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.occurrenceCount && (
              <p className="mt-1 text-sm text-red-600">{errors.occurrenceCount.message}</p>
            )}
          </div>
        )}

      {/* End Date (when end condition is 'on_date') */
        watchedEndCondition === 'on_date' && (
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              {...register('endDate')}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Recurrence Pattern
        </button>
      </div>
    </form>
  );
};

export default RecurrenceConfigForm;