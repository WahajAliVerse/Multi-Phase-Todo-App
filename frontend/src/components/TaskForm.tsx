import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { RecurrenceEditor } from './RecurrenceEditor';
import { TagSelector } from './TagSelector';
import { ReminderSetter } from './ReminderSetter';
import { Task, Tag, RecurrencePattern, Reminder } from '@/lib/types';
import { formatForDisplay } from '@/lib/timezone-utils';

interface TaskFormProps {
  initialTask?: Task;
  tags: Tag[];
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ 
  initialTask, 
  tags, 
  onSubmit, 
  onCancel 
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [status, setStatus] = useState<'active' | 'completed'>(initialTask?.status || 'active');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(initialTask?.priority || 'medium');
  const [dueDate, setDueDate] = useState<string>(initialTask?.dueDate ? new Date(initialTask.dueDate).toISOString().split('T')[0] : '');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTask?.tags || []);
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern | undefined>(initialTask?.recurrencePattern);
  const [reminders, setReminders] = useState<Reminder[]>(initialTask?.reminders || []);
  const [showRecurrenceEditor, setShowRecurrenceEditor] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    // Create the task object
    const task: Task = {
      id: initialTask?.id || Date.now(), // Use existing ID or generate a temporary one
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      ...(dueDate && { dueDate: new Date(dueDate) }),
      tags: selectedTags,
      recurrencePattern,
      reminders,
      createdAt: initialTask?.createdAt || new Date(),
      updatedAt: new Date(),
      userId: initialTask?.userId || 1, // This would come from auth context in a real app
      ...(status === 'completed' && { completedAt: new Date() }),
    };
    
    onSubmit(task);
  };

  const handleRecurrenceSave = (pattern: RecurrencePattern) => {
    setRecurrencePattern(pattern);
    setShowRecurrenceEditor(false);
  };

  const handleAddReminder = (reminder: Reminder) => {
    setReminders([...reminders, reminder]);
  };

  const handleRemoveReminder = (id: number) => {
    setReminders(reminders.filter(r => r.id !== id));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 bg-white rounded-lg shadow"
      role="form"
      aria-label={initialTask ? 'Edit Task Form' : 'Create Task Form'}
    >
      <h3 className="text-lg font-semibold" id="task-form-heading">
        {initialTask ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      {error && (
        <div className="p-2 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'completed', label: 'Completed' },
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              options={[
                { value: 'low', label: 'Low' },
                { value: 'medium', label: 'Medium' },
                { value: 'high', label: 'High' },
              ]}
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <TagSelector
            allTags={tags}
            selectedTags={selectedTags}
            onSelectTags={setSelectedTags}
          />
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-1">Recurrence Pattern</label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => setShowRecurrenceEditor(!showRecurrenceEditor)}
            >
              {recurrencePattern ? 'Edit Pattern' : 'Add Pattern'}
            </Button>
          </div>
          
          {showRecurrenceEditor && (
            <RecurrenceEditor
              initialValue={recurrencePattern}
              onSave={handleRecurrenceSave}
              onCancel={() => setShowRecurrenceEditor(false)}
            />
          )}
          
          {recurrencePattern && !showRecurrenceEditor && (
            <div className="p-2 bg-blue-50 rounded text-sm">
              <p><strong>Type:</strong> {recurrencePattern.patternType}</p>
              <p><strong>Interval:</strong> Every {recurrencePattern.interval} {recurrencePattern.patternType}(s)</p>
              <p><strong>Ends:</strong> {recurrencePattern.endCondition === 'never' ? 'Never' :
                  recurrencePattern.endCondition === 'after_occurrences' ? `After ${recurrencePattern.occurrenceCount} occurrences` :
                  `On ${recurrencePattern.endDate ? formatForDisplay(recurrencePattern.endDate) : ''}`}</p>
            </div>
          )}
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium mb-1">Reminders</label>
            <ReminderSetter
              onAddReminder={handleAddReminder}
              reminders={reminders}
              onRemoveReminder={handleRemoveReminder}
            />
          </div>
          
          {reminders.length > 0 && (
            <div className="mt-2 space-y-2">
              {reminders.map(reminder => (
                <div key={reminder.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                  <span>{formatForDisplay(reminder.scheduledTime)}</span>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleRemoveReminder(reminder.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialTask ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};