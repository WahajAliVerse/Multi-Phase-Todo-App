import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  CardActions,
  Button
} from '@mui/material';
import {
  CheckCircleOutline,
  CheckCircle,
  Edit,
  Delete,
  Repeat
} from '@mui/icons-material';
import { Task } from '@/types/task';

interface TaskItemProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggleComplete, onEdit, onDelete }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        boxShadow: 2,
        borderLeft: task.status === 'completed' ? '4px solid #4caf50' :
                    task.recurrence_pattern ? '4px solid #ff9800' : '4px solid #2196f3'
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                color: task.status === 'completed' ? 'text.disabled' : 'text.primary'
              }}
            >
              {task.title}
              {task.recurrence_pattern && (
                <Repeat
                  fontSize="small"
                  color="secondary"
                  sx={{ ml: 1, verticalAlign: 'middle' }}
                />
              )}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1 }}
              >
                {task.description}
              </Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                size="small"
                color={getPriorityColor(task.priority)}
                variant="outlined"
              />
              {task.status === 'completed' && (
                <Chip
                  label="Completed"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
              {task.due_date && (
                <Chip
                  label={`Due: ${new Date(task.due_date).toLocaleDateString()}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
              {task.recurrence_pattern && (
                <Chip
                  label="Recurring"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {task.tags && task.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Box>
          <IconButton
            onClick={() => onToggleComplete(task)}
            color={task.status === 'completed' ? 'success' : 'default'}
          >
            {task.status === 'completed' ? <CheckCircle /> : <CheckCircleOutline />}
          </IconButton>
        </Box>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          startIcon={<Edit />}
          onClick={() => onEdit(task)}
        >
          Edit
        </Button>
        <Button
          size="small"
          color="error"
          startIcon={<Delete />}
          onClick={() => onDelete(task.id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
};

export default TaskItem;