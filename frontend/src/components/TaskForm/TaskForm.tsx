import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Typography,
  Chip,
  Autocomplete,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Task } from '@/types/task';

interface Tag {
  id: number;
  name: string;
  color?: string;
}

interface RecurrencePattern {
  pattern_type: string;
  interval: number;
  days_of_week?: string;
  days_of_month?: string;
  end_date?: string;
  occurrence_count?: number;
}

interface TaskFormProps {
  task?: Task;
  tags: Tag[];
  onSubmit: (task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, tags, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState(task?.priority || 'medium');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [selectedTags, setSelectedTags] = useState<string[]>(task?.tags || []);
  const [isRecurring, setIsRecurring] = useState(!!task?.recurrence_pattern);
  const [isReminderEnabled, setIsReminderEnabled] = useState(false); // New state for reminders
  const [reminderTime, setReminderTime] = useState('1'); // Default to 1 hour before
  const [recurrencePattern, setRecurrencePattern] = useState<RecurrencePattern>({
    pattern_type: task?.recurrence_pattern || 'daily',
    interval: task?.next_occurrence ? 1 : 1, // Default to 1 if not set
    days_of_week: undefined,
    days_of_month: undefined,
    end_date: undefined,
    occurrence_count: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    if (title.length < 1 || title.length > 255) {
      alert('Title must be between 1 and 255 characters');
      return;
    }

    const taskData: any = {
      title,
      description,
      priority: priority as 'low' | 'medium' | 'high',
      due_date: dueDate || undefined,
      tags: selectedTags,
      status: task?.status || 'active',
    };

    // Add reminder information if enabled
    if (isReminderEnabled && dueDate) {
      taskData.reminder_enabled = true;
      taskData.reminder_time = reminderTime;
    }

    // Add recurrence pattern if the task is recurring
    if (isRecurring) {
      taskData.recurrence_pattern = recurrencePattern.pattern_type;
      taskData.interval = recurrencePattern.interval;
      taskData.days_of_week = recurrencePattern.days_of_week;
      taskData.days_of_month = recurrencePattern.days_of_month;
      taskData.end_date = recurrencePattern.end_date;
      taskData.occurrence_count = recurrencePattern.occurrence_count;
    }

    onSubmit(taskData);
  };

  const handleRecurrenceChange = (field: keyof RecurrencePattern, value: any) => {
    setRecurrencePattern(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {task ? 'Edit Task' : 'Create New Task'}
      </Typography>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
        inputProps={{ maxLength: 255 }}
      />

      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>

      <Autocomplete
        multiple
        options={tags.map(tag => tag.name)}
        value={selectedTags}
        onChange={(event, newValue) => {
          setSelectedTags(newValue);
        }}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            label="Tags"
            placeholder="Select tags"
            margin="normal"
          />
        )}
      />

      <TextField
        fullWidth
        label="Due Date"
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        margin="normal"
        InputLabelProps={{
          shrink: true,
        }}
      />

      {dueDate && (
        <Accordion sx={{ mt: 2 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="reminder-content"
            id="reminder-header"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={isReminderEnabled}
                  onChange={(e) => setIsReminderEnabled(e.target.checked)}
                  aria-label="enable-reminder"
                />
              }
              label="Enable Reminder"
            />
          </AccordionSummary>
          <AccordionDetails>
            <FormControl fullWidth margin="normal">
              <InputLabel>Reminder Time</InputLabel>
              <Select
                value={reminderTime}
                label="Reminder Time"
                onChange={(e) => setReminderTime(e.target.value)}
              >
                <MenuItem value="1">1 hour before</MenuItem>
                <MenuItem value="24">1 day before</MenuItem>
                <MenuItem value="168">1 week before</MenuItem>
                <MenuItem value="custom">Custom time</MenuItem>
              </Select>
            </FormControl>
          </AccordionDetails>
        </Accordion>
      )}

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="recurring-content"
          id="recurring-header"
        >
          <FormControlLabel
            control={
              <Switch
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                aria-label="recurring-task"
              />
            }
            label="Recurring Task"
          />
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth margin="normal">
            <InputLabel>Pattern Type</InputLabel>
            <Select
              value={recurrencePattern.pattern_type}
              label="Pattern Type"
              onChange={(e) => handleRecurrenceChange('pattern_type', e.target.value)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Interval"
            type="number"
            value={recurrencePattern.interval}
            onChange={(e) => handleRecurrenceChange('interval', parseInt(e.target.value))}
            margin="normal"
            inputProps={{ min: 1 }}
            helperText="How often to repeat (e.g., every 2 days)"
          />

          {(recurrencePattern.pattern_type === 'weekly') && (
            <TextField
              fullWidth
              label="Days of Week"
              value={recurrencePattern.days_of_week || ''}
              onChange={(e) => handleRecurrenceChange('days_of_week', e.target.value)}
              margin="normal"
              helperText="Comma-separated days (e.g., mon,tue,fri)"
            />
          )}

          {(recurrencePattern.pattern_type === 'monthly') && (
            <TextField
              fullWidth
              label="Days of Month"
              value={recurrencePattern.days_of_month || ''}
              onChange={(e) => handleRecurrenceChange('days_of_month', e.target.value)}
              margin="normal"
              helperText="Comma-separated days (e.g., 1,15)"
            />
          )}

          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={recurrencePattern.end_date || ''}
            onChange={(e) => handleRecurrenceChange('end_date', e.target.value)}
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
            helperText="Leave empty for no end date"
          />

          <TextField
            fullWidth
            label="Occurrence Count"
            type="number"
            value={recurrencePattern.occurrence_count || ''}
            onChange={(e) => handleRecurrenceChange('occurrence_count', e.target.value ? parseInt(e.target.value) : undefined)}
            margin="normal"
            helperText="Max number of occurrences (leave empty for unlimited)"
          />
        </AccordionDetails>
      </Accordion>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {task ? 'Update Task' : 'Create Task'}
        </Button>
        {onCancel && (
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TaskForm;