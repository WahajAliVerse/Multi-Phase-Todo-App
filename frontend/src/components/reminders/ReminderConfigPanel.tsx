import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reminderSchema, ReminderFormData } from '../../utils/validation';
import { Reminder } from '../../models/reminder';

interface ReminderConfigPanelProps {
  initialReminder?: Partial<Reminder>;
  taskId: string;
  onSave: (reminder: Reminder) => void;
  onCancel: () => void;
}

const ReminderConfigPanel: React.FC<ReminderConfigPanelProps> = ({ 
  initialReminder, 
  taskId,
  onSave, 
  onCancel 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<ReminderFormData>({
    resolver: zodResolver(reminderSchema),
    defaultValues: initialReminder || {
      taskId,
      scheduledTime: new Date(Date.now() + 1000 * 60 * 60).toISOString().slice(0, 16), // Default to 1 hour from now
    },
  });

  // Watch the delivery methods to handle multi-select
  const watchedDeliveryMethods = watch('deliveryMethods') || [];

  const toggleDeliveryMethod = (method: 'browser' | 'email' | 'inApp') => {
    const currentMethods = Array.isArray(watchedDeliveryMethods) ? [...watchedDeliveryMethods] : [];
    const methodIndex = currentMethods.indexOf(method);
    
    if (methodIndex > -1) {
      // Remove method if already selected
      currentMethods.splice(methodIndex, 1);
    } else {
      // Add method if not selected
      currentMethods.push(method);
    }
    
    setValue('deliveryMethods', currentMethods as any);
  };

  const onSubmit = (data: ReminderFormData) => {
    // Convert form data to Reminder model
    const reminder: Reminder = {
      id: initialReminder?.id || crypto.randomUUID(),
      taskId: data.taskId || taskId,
      scheduledTime: data.scheduledTime,
      deliveryStatus: 'pending',
      deliveryMethods: data.deliveryMethods as ('browser' | 'email' | 'inApp')[] || [],
      createdAt: initialReminder?.createdAt || new Date().toISOString(),
      sentAt: initialReminder?.sentAt,
    };

    onSave(reminder);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {initialReminder ? 'Edit Reminder' : 'Create Reminder'}
      </h3>

      {/* Hidden field for taskId */}
      <input type="hidden" value={taskId} {...register('taskId')} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scheduled Time */}
        <div>
          <label htmlFor="scheduledTime" className="block text-sm font-medium text-gray-700 mb-1">
            Scheduled Time
          </label>
          <input
            type="datetime-local"
            id="scheduledTime"
            {...register('scheduledTime')}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.scheduledTime ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.scheduledTime && (
            <p className="mt-1 text-sm text-red-600">{errors.scheduledTime.message}</p>
          )}
        </div>

        {/* Delivery Methods */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Methods
          </label>
          <div className="space-y-2">
            {(['browser', 'email', 'inApp'] as const).map((method) => (
              <label key={method} className="flex items-center">
                <input
                  type="checkbox"
                  checked={watchedDeliveryMethods.includes(method)}
                  onChange={() => toggleDeliveryMethod(method)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">
                  {method === 'inApp' ? 'In-App' : method}
                </span>
              </label>
            ))}
          </div>
          {errors.deliveryMethods && (
            <p className="mt-1 text-sm text-red-600">{errors.deliveryMethods.message}</p>
          )}
        </div>
      </div>

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
          {initialReminder ? 'Update Reminder' : 'Create Reminder'}
        </button>
      </div>
    </form>
  );
};

export default ReminderConfigPanel;