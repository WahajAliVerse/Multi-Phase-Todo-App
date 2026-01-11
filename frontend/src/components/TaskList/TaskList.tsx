import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Task } from '@/types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggleComplete, onEdit, onDelete }) => {
  const [sortMethod, setSortMethod] = useState<'due_date' | 'priority' | 'alphabetical' | 'created_date'>('created_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks);

  // Apply sorting when sort method or order changes
  useEffect(() => {
    let sortedTasks = [...tasks];

    switch (sortMethod) {
      case 'due_date':
        sortedTasks.sort((a, b) => {
          if (!a.due_date && !b.due_date) return 0;
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return sortOrder === 'asc'
            ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
            : new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
        });
        break;
      case 'priority':
        const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
        sortedTasks.sort((a, b) => {
          const aPriority = priorityOrder[a.priority] || 0;
          const bPriority = priorityOrder[b.priority] || 0;
          return sortOrder === 'asc'
            ? aPriority - bPriority
            : bPriority - aPriority;
        });
        break;
      case 'alphabetical':
        sortedTasks.sort((a, b) => {
          return sortOrder === 'asc'
            ? a.title.localeCompare(b.title)
            : b.title.localeCompare(a.title);
        });
        break;
      case 'created_date':
      default:
        sortedTasks.sort((a, b) => {
          return sortOrder === 'asc'
            ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        break;
    }

    setFilteredTasks(sortedTasks);
  }, [tasks, sortMethod, sortOrder]);

  if (filteredTasks.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No tasks found. Create a new task to get started!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Tasks ({filteredTasks.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortMethod}
              label="Sort By"
              onChange={(e) => setSortMethod(e.target.value as any)}
              size="small"
            >
              <MenuItem value="created_date">Date Created</MenuItem>
              <MenuItem value="due_date">Due Date</MenuItem>
              <MenuItem value="priority">Priority</MenuItem>
              <MenuItem value="alphabetical">Alphabetical</MenuItem>
            </Select>
          </FormControl>

          <ToggleButtonGroup
            value={sortOrder}
            exclusive
            onChange={(e, newOrder) => newOrder !== null && setSortOrder(newOrder)}
            aria-label="sort order"
          >
            <ToggleButton value="asc" aria-label="ascending">
              Asc
            </ToggleButton>
            <ToggleButton value="desc" aria-label="descending">
              Desc
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {filteredTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </Box>
  );
};

export default TaskList;