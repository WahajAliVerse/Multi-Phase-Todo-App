import { useState } from 'react';
import { useAppDispatch } from '@/hooks/redux';
import { createTask } from '@/store/slices/taskSlice';
import { Task } from '@/types';
import RecurrenceForm from '@/components/RecurrenceForm/RecurrenceForm';

const TaskForm = () => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If there's a recurrence pattern, we need to create it first
    let recurrencePatternId: string | undefined;
    if (recurrencePattern && recurrencePattern.patternType !== 'none') {
      // In a real app, we would dispatch an action to create the recurrence pattern
      // and wait for the response to get the ID. For now, we'll simulate this.
      // For simplicity in this implementation, we'll assume the recurrence pattern
      // is created separately and we're just storing its ID in the task.
      recurrencePatternId = recurrencePattern.id;
    }

    // Create task object
    const newTask: Omit<Task, 'id'> = {
      title,
      description: description || undefined,
      status: 'active', // New tasks are created as active by default
      priority,
      dueDate: dueDate || undefined,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag) || undefined,
      recurrencePatternId: recurrencePatternId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: undefined, // New tasks are not completed
      userId: 'current-user-id', // This would come from auth state in a real app
    };

    try {
      // Dispatch create task action and await the result
      await dispatch(createTask(newTask)).unwrap();

      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags('');
      setRecurrencePattern(null);
    } catch (error) {
      console.error('Failed to create task:', error);
      // In a real app, you might want to show an error message to the user
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="What needs to be done?"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="Add details..."
          />
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            placeholder="work, personal, urgent..."
          />
        </div>

        <div className="md:col-span-2">
          <RecurrenceForm
            recurrencePattern={recurrencePattern}
            onChange={setRecurrencePattern}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Add Task
        </button>
      </div>
    </form>
  );
};

export default TaskForm;