import { useState } from 'react';
import { z, ZodError } from 'zod';
import { useAppDispatch } from '@/hooks/redux';
import { createTask } from '@/store/slices/taskSlice';
import { Task } from '@/types';
import RecurrenceForm from '@/components/RecurrenceForm/RecurrenceForm';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

const TaskForm = () => {
  const dispatch = useAppDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState('');
  const [recurrencePattern, setRecurrencePattern] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation schema
  const taskSchema = z.object({
    title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
    description: z.string().max(500, 'Description must be less than 500 characters').optional(),
    priority: z.enum(['high', 'medium', 'low']),
    dueDate: z.string().optional(),
    tags: z.string().optional(),
  });

  const validateField = (field: string, value: string) => {
    try {
      taskSchema.parse({ ...{ title, description, priority, dueDate, tags }, [field]: value });
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldError = err.issues.find(e => e.path.join('.') === field);
        if (fieldError) {
          setErrors(prev => ({ ...prev, [field]: fieldError.message }));
        }
      }
    }
  };

  const validateForm = () => {
    try {
      taskSchema.parse({ title, description, priority, dueDate, tags });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.issues.forEach(error => {
          const field = error.path.join('.');
          newErrors[field] = error.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

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
      tags: tags?.split(',').map(tag => tag.trim()).filter(tag => tag) || undefined,
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
      setErrors({});
    } catch (error) {
      console.error('Failed to create task:', error);
      // In a real app, you might want to show an error message to the user
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  validateField('title', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.title
                    ? 'border-destructive focus:ring-destructive focus:border-destructive'
                    : 'border-input focus:ring-ring focus:border-ring'
                }`}
                placeholder="What needs to be done?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  validateField('description', e.target.value);
                }}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.description
                    ? 'border-destructive focus:ring-destructive focus:border-destructive'
                    : 'border-input focus:ring-ring focus:border-ring'
                }`}
                placeholder="Add details..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-1">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-foreground mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring focus:border-ring"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                id="tags"
                value={tags}
                onChange={(e) => {
                  setTags(e.target.value);
                  validateField('tags', e.target.value);
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-ring ${
                  errors.tags
                    ? 'border-destructive focus:ring-destructive focus:border-destructive'
                    : 'border-input focus:ring-ring focus:border-ring'
                }`}
                placeholder="work, personal, urgent..."
              />
              {errors.tags && (
                <p className="mt-1 text-sm text-destructive">{errors.tags}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <RecurrenceForm
                recurrencePattern={recurrencePattern}
                onChange={setRecurrencePattern}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button
              type="submit"
              className="px-6"
              isLoading={isSubmitting}
            >
              Add Task
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TaskForm;