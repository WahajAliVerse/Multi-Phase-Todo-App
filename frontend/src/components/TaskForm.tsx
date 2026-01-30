import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { Tag } from '../types/tag';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Label } from './ui/Label';
import api from '../services/api';

interface TaskFormProps {
  task?: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export const TaskForm = ({ task, onSuccess, onCancel }: TaskFormProps) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>((task?.priority as 'low' | 'medium' | 'high') || 'medium');
  const [dueDate, setDueDate] = useState(task?.dueDate || '');
  const [recurrencePattern, setRecurrencePattern] = useState(task?.recurrencePatternId || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      setAllTags(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const taskData = {
        title,
        description,
        priority,
        due_date: dueDate || null,
        recurrence_pattern: recurrencePattern || null,
        tag_ids: selectedTags,
      };

      if (task) {
        // Update existing task
        await api.put(`/tasks/${task.id}`, taskData);
      } else {
        // Create new task
        await api.post('/tasks', taskData);
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="recurrencePattern">Recurrence Pattern</Label>
        <Input
          id="recurrencePattern"
          value={recurrencePattern}
          onChange={(e) => setRecurrencePattern(e.target.value)}
          placeholder="Cron-like pattern (e.g., '0 9 * * 1' for weekly on Mondays at 9 AM)"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <Button
              key={tag.id}
              type="button"
              variant={selectedTags.includes(tag.id.toString()) ? "default" : "outline"}
              size="sm"
              onClick={() => handleTagToggle(tag.id.toString())}
              style={{
                backgroundColor: selectedTags.includes(tag.id.toString()) ? tag.color : 'transparent',
                borderColor: tag.color,
                color: selectedTags.includes(tag.id.toString()) ? '#fff' : tag.color
              }}
            >
              {tag.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};