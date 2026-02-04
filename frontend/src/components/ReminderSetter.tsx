import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Reminder } from '@/lib/types';
import { formatForDisplay } from '@/lib/timezone-utils';

interface ReminderSetterProps {
  onAddReminder: (reminder: Reminder) => void;
  reminders: Reminder[];
  onRemoveReminder: (id: number) => void;
}

export const ReminderSetter: React.FC<ReminderSetterProps> = ({ 
  onAddReminder, 
  reminders,
  onRemoveReminder
}) => {
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [deliveryStatus, setDeliveryStatus] = useState<'pending' | 'sent' | 'delivered' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!scheduledTime) {
      setError('Scheduled time is required');
      return;
    }
    
    // Validate that the scheduled time is in the future
    const scheduledDateTime = new Date(scheduledTime);
    if (scheduledDateTime <= new Date()) {
      setError('Scheduled time must be in the future');
      return;
    }
    
    const newReminder: Reminder = {
      id: Date.now(), // Generate temporary ID
      taskId: 0, // Will be set when attached to a task
      scheduledTime: scheduledDateTime,
      deliveryStatus,
      createdAt: new Date(),
    };
    
    onAddReminder(newReminder);
    setScheduledTime('');
    setDeliveryStatus('pending');
    setError(null);
  };

  return (
    <div className="w-full" role="region" aria-label="Reminder Settings">
      <form onSubmit={handleSubmit} className="space-y-2" role="form" aria-labelledby="reminder-setter-heading">
        <h3 id="reminder-setter-heading" className="sr-only">Reminder Settings</h3>
        {error && (
          <div
            className="p-2 bg-red-100 text-red-700 rounded text-sm"
            role="alert"
            aria-live="assertive"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="datetime-local"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="flex-1"
            aria-label="Reminder scheduled time"
            aria-describedby="reminder-help-text"
          />
          <Button
            type="submit"
            variant="outline"
            size="sm"
            aria-label="Add reminder"
          >
            Add Reminder
          </Button>
        </div>
        <div id="reminder-help-text" className="sr-only">
          Select the date and time for the reminder to be scheduled
        </div>
      </form>
      
      {reminders.length > 0 && (
        <div className="mt-3 space-y-2">
          {reminders.map(reminder => (
            <div key={reminder.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
              <div>
                <span className="font-medium">
                  {formatForDisplay(reminder.scheduledTime)}
                </span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  reminder.deliveryStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  reminder.deliveryStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
                  reminder.deliveryStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {reminder.deliveryStatus}
                </span>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => onRemoveReminder(reminder.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};