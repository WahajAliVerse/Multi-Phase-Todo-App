import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { TaskRead, TaskCreate, TaskUpdate } from '@/lib/types';
import { RecurrenceEditor } from './RecurrenceEditor';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: TaskRead | null;
  onSave: (taskData: TaskCreate | TaskUpdate) => void;
  tags: string[]; // Available tags for selection
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, task, onSave, tags }) => {
  const isEditing = !!task;
  const [formData, setFormData] = useState<TaskCreate | TaskUpdate>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: '',
    tag_ids: [],
    recurrence_pattern: null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'pending',
        priority: task.priority || 'medium',
        due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
        tag_ids: task.tag_ids || [],
        recurrence_pattern: task.recurrence_pattern || null,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        due_date: '',
        tag_ids: [],
        recurrence_pattern: null,
      });
    }
    // Clear errors when modal opens or task changes
    setErrors({});
  }, [isEditing, task]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be 200 characters or less';
    }
    
    if (formData.due_date) {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      if (isNaN(dueDate.getTime())) {
        newErrors.due_date = 'Invalid date format';
      } else if (dueDate < now) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTagToggle = (tagId: string) => {
    setFormData(prev => {
      const prevTagIds = (prev.tag_ids as string[]) || [];
      if (prevTagIds.includes(tagId)) {
        return {
          ...prev,
          tag_ids: prevTagIds.filter(id => id !== tagId)
        };
      } else {
        return {
          ...prev,
          tag_ids: [...prevTagIds, tagId]
        };
      }
    });
  };

  const handleRecurrenceChange = (recurrencePattern: any) => {
    setFormData(prev => ({
      ...prev,
      recurrence_pattern: recurrencePattern
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare the task data
    const taskData = {
      ...formData,
      // If recurrence pattern is set to null (no recurrence), ensure it's properly handled
      recurrence_pattern: formData.recurrence_pattern && Object.keys(formData.recurrence_pattern).length > 0 
        ? formData.recurrence_pattern 
        : null
    };
    
    onSave(taskData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                type="datetime-local"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                placeholder="Select due date"
              />
            </div>
          </div>

          {isEditing && (
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="status"
                  checked={formData.status === 'completed'}
                  onCheckedChange={(checked) => handleSelectChange('status', checked ? 'completed' : 'pending')}
                />
                <Label htmlFor="status">Mark as completed</Label>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded">
              {availableTags.map((tag, index) => (
                <Badge
                  key={tag.id}
                  variant={formData.tag_ids.includes(tag.id) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Recurrence</Label>
            <RecurrenceEditor
              recurrencePattern={formData.recurrence_pattern}
              onChange={handleRecurrenceChange}
            />
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="w-full sm:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Task' : 'Create Task')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;