import { useState, useEffect } from 'react';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  const showNotification = async (options: NotificationOptions): Promise<void> => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.error('Notifications are not supported in this browser');
      return;
    }

    // Check if permission is granted
    if (permission !== 'granted') {
      console.warn('Notifications permission not granted');
      return;
    }

    // Create the notification
    new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      tag: options.tag,
    });
  };

  const showTaskDueNotification = async (taskTitle: string, dueDate: string): Promise<void> => {
    const options: NotificationOptions = {
      title: 'Task Due Soon!',
      body: `Your task "${taskTitle}" is due on ${dueDate}`,
      icon: '/favicon.ico', // Use your app's icon
    };

    await showNotification(options);
  };

  return {
    permission,
    requestPermission,
    showNotification,
    showTaskDueNotification,
  };
};

export default useNotifications;