import { Task } from '../models/task';
import { Tag } from '../models/tag';

/**
 * Filters tasks by the specified tags
 * @param tasks The array of tasks to filter
 * @param selectedTagIds The IDs of the tags to filter by
 * @param matchAll If true, task must have ALL specified tags; if false, task must have ANY of the specified tags
 * @returns The filtered array of tasks
 */
export const filterTasksByTags = (
  tasks: Task[],
  selectedTagIds: string[],
  matchAll: boolean = false
): Task[] => {
  if (!selectedTagIds || selectedTagIds.length === 0) {
    return tasks;
  }

  return tasks.filter(task => {
    if (!task.tags || task.tags.length === 0) {
      return false;
    }

    const taskTagIds = task.tags.map(tag => tag.id);

    if (matchAll) {
      // Task must have ALL selected tags
      return selectedTagIds.every(tagId => taskTagIds.includes(tagId));
    } else {
      // Task must have AT LEAST ONE of the selected tags
      return selectedTagIds.some(tagId => taskTagIds.includes(tagId));
    }
  });
};

/**
 * Filters tasks by the specified recurrence pattern type
 * @param tasks The array of tasks to filter
 * @param recurrenceType The type of recurrence to filter by (daily, weekly, monthly, yearly)
 * @returns The filtered array of tasks
 */
export const filterTasksByRecurrence = (
  tasks: Task[],
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
): Task[] => {
  if (!recurrenceType) {
    return tasks;
  }

  return tasks.filter(task => {
    return task.recurrencePattern && task.recurrencePattern.patternType === recurrenceType;
  });
};

/**
 * Filters tasks by reminder status
 * @param tasks The array of tasks to filter
 * @param reminderStatus The reminder status to filter by (pending, sent, delivered, failed)
 * @returns The filtered array of tasks
 */
export const filterTasksByReminderStatus = (
  tasks: Task[],
  reminderStatus: 'pending' | 'sent' | 'delivered' | 'failed' | null
): Task[] => {
  if (!reminderStatus) {
    return tasks;
  }

  return tasks.filter(task => {
    if (!task.reminders || task.reminders.length === 0) {
      return false;
    }

    return task.reminders.some(reminder => reminder.deliveryStatus === reminderStatus);
  });
};

/**
 * Combines multiple filters
 * @param tasks The array of tasks to filter
 * @param tagIds The IDs of the tags to filter by
 * @param recurrenceType The type of recurrence to filter by
 * @param reminderStatus The reminder status to filter by
 * @param matchAllTags If true, task must have ALL specified tags; if false, task must have ANY of the specified tags
 * @returns The filtered array of tasks
 */
export const filterTasks = (
  tasks: Task[],
  tagIds: string[] = [],
  recurrenceType: 'daily' | 'weekly' | 'monthly' | 'yearly' | null = null,
  reminderStatus: 'pending' | 'sent' | 'delivered' | 'failed' | null = null,
  matchAllTags: boolean = false
): Task[] => {
  let filteredTasks = [...tasks];

  // Apply tag filter
  if (tagIds.length > 0) {
    filteredTasks = filterTasksByTags(filteredTasks, tagIds, matchAllTags);
  }

  // Apply recurrence filter
  if (recurrenceType) {
    filteredTasks = filterTasksByRecurrence(filteredTasks, recurrenceType);
  }

  // Apply reminder status filter
  if (reminderStatus) {
    filteredTasks = filterTasksByReminderStatus(filteredTasks, reminderStatus);
  }

  return filteredTasks;
};

/**
 * Gets all unique tags from a list of tasks
 * @param tasks The array of tasks to extract tags from
 * @returns An array of unique tags
 */
export const getAllTagsFromTasks = (tasks: Task[]): Tag[] => {
  const tagMap = new Map<string, Tag>();

  tasks.forEach(task => {
    if (task.tags) {
      task.tags.forEach(tag => {
        if (!tagMap.has(tag.id)) {
          tagMap.set(tag.id, tag);
        }
      });
    }
  });

  return Array.from(tagMap.values());
};