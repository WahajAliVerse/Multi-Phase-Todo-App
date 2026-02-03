import { useState, useEffect, useCallback } from 'react';
import { Reminder } from '@/src/lib/types';
import { createNotification, scheduleNotification, cancelScheduledNotification } from '../lib/notifications';

// Custom hook for managing reminders
export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [activeTimers, setActiveTimers] = useState<Record<number, number>>({}); // Maps reminder ID to timer ID

  // Add a new reminder
  const addReminder = useCallback((reminder: Reminder) => {
    setReminders(prev => [...prev, reminder]);
  }, []);

  // Update an existing reminder
  const updateReminder = useCallback((updatedReminder: Reminder) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === updatedReminder.id ? updatedReminder : reminder
      )
    );
  }, []);

  // Remove a reminder
  const removeReminder = useCallback((id: number) => {
    setReminders(prev => prev.filter(reminder => reminder.id !== id));
    
    // Cancel any scheduled notification for this reminder
    if (activeTimers[id]) {
      cancelScheduledNotification(activeTimers[id]);
      setActiveTimers(prev => {
        const newTimers = { ...prev };
        delete newTimers[id];
        return newTimers;
      });
    }
  }, [activeTimers]);

  // Schedule notification for a reminder
  const scheduleReminderNotification = useCallback((reminder: Reminder) => {
    if (reminder.scheduledTime && new Date(reminder.scheduledTime) > new Date()) {
      // Cancel any existing timer for this reminder
      if (activeTimers[reminder.id]) {
        cancelScheduledNotification(activeTimers[reminder.id]);
      }
      
      // Schedule new notification
      const timerId = scheduleNotification(
        `Task Reminder: ${reminder.taskId}`, // In a real app, you'd fetch the task title
        `A task reminder is due`,
        new Date(reminder.scheduledTime),
        () => {
          // Update reminder status when notification is shown
          updateReminder({
            ...reminder,
            deliveryStatus: 'sent'
          });
        }
      );
      
      // Store the timer ID
      setActiveTimers(prev => ({
        ...prev,
        [reminder.id]: timerId
      }));
    }
  }, [activeTimers, updateReminder]);

  // Process reminders when they change
  useEffect(() => {
    reminders.forEach(reminder => {
      // Schedule notification if not already scheduled
      if (!activeTimers[reminder.id] && reminder.deliveryStatus === 'pending') {
        scheduleReminderNotification(reminder);
      }
    });
  }, [reminders, activeTimers, scheduleReminderNotification]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      Object.values(activeTimers).forEach(timerId => {
        if (timerId !== -1) {
          cancelScheduledNotification(timerId);
        }
      });
    };
  }, [activeTimers]);

  // Function to get reminders by task ID
  const getRemindersByTaskId = useCallback((taskId: number) => {
    return reminders.filter(reminder => reminder.taskId === taskId);
  }, [reminders]);

  // Function to get upcoming reminders
  const getUpcomingReminders = useCallback(() => {
    const now = new Date();
    return reminders.filter(reminder => 
      new Date(reminder.scheduledTime) > now && 
      (reminder.deliveryStatus === 'pending' || reminder.deliveryStatus === 'sent')
    );
  }, [reminders]);

  // Function to get overdue reminders
  const getOverdueReminders = useCallback(() => {
    const now = new Date();
    return reminders.filter(reminder => 
      new Date(reminder.scheduledTime) <= now && 
      reminder.deliveryStatus === 'pending'
    );
  }, [reminders]);

  // Function to mark a reminder as delivered
  const markReminderAsDelivered = useCallback((id: number) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, deliveryStatus: 'delivered', sentAt: new Date() } 
          : reminder
      )
    );
  }, []);

  // Function to mark a reminder as failed
  const markReminderAsFailed = useCallback((id: number) => {
    setReminders(prev => 
      prev.map(reminder => 
        reminder.id === id 
          ? { ...reminder, deliveryStatus: 'failed', sentAt: new Date() } 
          : reminder
      )
    );
  }, []);

  return {
    reminders,
    addReminder,
    updateReminder,
    removeReminder,
    getRemindersByTaskId,
    getUpcomingReminders,
    getOverdueReminders,
    markReminderAsDelivered,
    markReminderAsFailed,
    scheduleReminderNotification,
  };
};