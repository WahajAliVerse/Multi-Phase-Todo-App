import React, { useState } from 'react';
import { 
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';

interface FiltersProps {
  onFilter: (filters: {
    status: string;
    priority: string;
    dateRange: string;
  }) => void;
}

const Filters: React.FC<FiltersProps> = ({ onFilter }) => {
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  const handleApplyFilters = () => {
    onFilter({ status, priority, dateRange });
  };

  const handleResetFilters = () => {
    setStatus('all');
    setPriority('all');
    setDateRange('all');
    onFilter({ status: 'all', priority: 'all', dateRange: 'all' });
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Status</InputLabel>
        <Select
          value={status}
          label="Status"
          onChange={(e) => setStatus(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Priority</InputLabel>
        <Select
          value={priority}
          label="Priority"
          onChange={(e) => setPriority(e.target.value)}
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Date Range</InputLabel>
        <Select
          value={dateRange}
          label="Date Range"
          onChange={(e) => setDateRange(e.target.value)}
        >
          <MenuItem value="all">All Dates</MenuItem>
          <MenuItem value="today">Today</MenuItem>
          <MenuItem value="week">This Week</MenuItem>
          <MenuItem value="month">This Month</MenuItem>
          <MenuItem value="overdue">Overdue</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={handleApplyFilters}>
          Apply
        </Button>
        <Button variant="outlined" onClick={handleResetFilters}>
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default Filters;