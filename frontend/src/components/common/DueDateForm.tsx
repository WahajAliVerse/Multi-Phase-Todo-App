import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Typography,
  Grid,
  Switch,
  FormControlLabel
} from '@mui/material';

interface DueDateFormProps {
  dueDate?: string;
  reminderEnabled?: boolean;
  reminderTime?: string;
  onSubmit: (dueDateData: {
    due_date: string;
    reminder_enabled: boolean;
    reminder_time?: string;
  }) => void;
  onCancel?: () => void;
}

const DueDateForm: React.FC<DueDateFormProps> = ({ 
  dueDate, 
  reminderEnabled = false, 
  reminderTime, 
  onSubmit, 
  onCancel 
}) => {
  const [selectedDate, setSelectedDate] = useState(dueDate || '');
  const [enableReminder, setEnableReminder] = useState(reminderEnabled);
  const [selectedReminderTime, setSelectedReminderTime] = useState(reminderTime || '1h');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!selectedDate) {
      alert('Due date is required');
      return;
    }
    
    // Check if due date is in the past
    const now = new Date();
    const dueDateTime = new Date(selectedDate);
    if (dueDateTime < now) {
      alert('Due date cannot be in the past');
      return;
    }
    
    onSubmit({
      due_date: selectedDate,
      reminder_enabled: enableReminder,
      reminder_time: enableReminder ? selectedReminderTime : undefined
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {dueDate ? 'Update Due Date & Reminder' : 'Set Due Date & Reminder'}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Due Date"
          type="datetime-local"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          margin="normal"
          required
          InputLabelProps={{
            shrink: true,
          }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={enableReminder}
              onChange={(e) => setEnableReminder(e.target.checked)}
              color="primary"
            />
          }
          label="Enable Reminder"
        />

        {enableReminder && (
          <FormControl fullWidth margin="normal">
            <InputLabel>Reminder Time</InputLabel>
            <Select
              value={selectedReminderTime}
              label="Reminder Time"
              onChange={(e) => setSelectedReminderTime(e.target.value)}
            >
              <MenuItem value="1h">1 hour before</MenuItem>
              <MenuItem value="24h">1 day before</MenuItem>
              <MenuItem value="1w">1 week before</MenuItem>
              <MenuItem value="custom">Custom time</MenuItem>
            </Select>
          </FormControl>
        )}

        {enableReminder && selectedReminderTime === 'custom' && (
          <TextField
            fullWidth
            label="Custom Reminder Time"
            type="text"
            placeholder="e.g., 2d 3h (2 days and 3 hours before)"
            margin="normal"
          />
        )}
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {dueDate ? 'Update Due Date' : 'Set Due Date'}
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

export default DueDateForm;