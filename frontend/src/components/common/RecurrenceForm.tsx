import React, { useState } from 'react';
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
  Grid
} from '@mui/material';

interface RecurrenceFormProps {
  recurrence?: {
    pattern_type?: string;
    interval?: number;
    days_of_week?: string;
    days_of_month?: string;
    end_date?: string;
    occurrence_count?: number;
  };
  onSubmit: (recurrence: {
    pattern_type: string;
    interval: number;
    days_of_week?: string;
    days_of_month?: string;
    end_date?: string;
    occurrence_count?: number;
  }) => void;
  onCancel?: () => void;
}

const RecurrenceForm: React.FC<RecurrenceFormProps> = ({ recurrence, onSubmit, onCancel }) => {
  const [patternType, setPatternType] = useState(recurrence?.pattern_type || 'daily');
  const [interval, setInterval] = useState(recurrence?.interval?.toString() || '1');
  const [daysOfWeek, setDaysOfWeek] = useState(recurrence?.days_of_week || '');
  const [daysOfMonth, setDaysOfMonth] = useState(recurrence?.days_of_month || '');
  const [endDate, setEndDate] = useState(recurrence?.end_date || '');
  const [occurrenceCount, setOccurrenceCount] = useState(recurrence?.occurrence_count?.toString() || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!patternType) {
      alert('Pattern type is required');
      return;
    }
    
    if (!interval || isNaN(Number(interval)) || Number(interval) < 1) {
      alert('Interval must be a positive number');
      return;
    }
    
    onSubmit({
      pattern_type: patternType,
      interval: parseInt(interval, 10),
      days_of_week: daysOfWeek || undefined,
      days_of_month: daysOfMonth || undefined,
      end_date: endDate || undefined,
      occurrence_count: occurrenceCount ? parseInt(occurrenceCount, 10) : undefined,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {recurrence ? 'Edit Recurring Pattern' : 'Create Recurring Pattern'}
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Pattern Type</InputLabel>
              <Select
                value={patternType}
                label="Pattern Type"
                onChange={(e) => setPatternType(e.target.value)}
              >
                <MenuItem value="daily">Daily</MenuItem>
                <MenuItem value="weekly">Weekly</MenuItem>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Interval"
              type="number"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              margin="normal"
              required
              inputProps={{ min: 1 }}
              helperText="How often to repeat (e.g., every 2 days)"
            />
          </Box>
        </Box>

        {(patternType === 'weekly') && (
          <TextField
            fullWidth
            label="Days of Week"
            value={daysOfWeek}
            onChange={(e) => setDaysOfWeek(e.target.value)}
            margin="normal"
            helperText="Comma-separated days (e.g., mon,tue,fri)"
          />
        )}

        {(patternType === 'monthly') && (
          <TextField
            fullWidth
            label="Days of Month"
            value={daysOfMonth}
            onChange={(e) => setDaysOfMonth(e.target.value)}
            margin="normal"
            helperText="Comma-separated days (e.g., 1,15)"
          />
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              helperText="Leave empty for no end date"
            />
          </Box>

          <Box sx={{ gridColumn: { xs: 'span 12', sm: 'span 6' } }}>
            <TextField
              fullWidth
              label="Occurrence Count"
              type="number"
              value={occurrenceCount}
              onChange={(e) => setOccurrenceCount(e.target.value)}
              margin="normal"
              helperText="Max number of occurrences (leave empty for unlimited)"
            />
          </Box>
        </Box>
      </Box>
      
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button type="submit" variant="contained" color="primary">
          {recurrence ? 'Update Pattern' : 'Create Pattern'}
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

export default RecurrenceForm;