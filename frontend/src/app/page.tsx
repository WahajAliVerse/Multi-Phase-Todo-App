'use client'
import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask
} from '@/store/tasksSlice';
import TaskForm from '@/components/TaskForm/TaskForm';
import TaskList from '@/components/TaskList/TaskList';
import Search from '@/components/Search/Search';
import Filters from '@/components/Filters/Filters';

interface Tag {
  id: number;
  name: string;
  color?: string;
}

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dateRange: 'all'
  });
  const dispatch: AppDispatch = useDispatch();
  const { items: tasks, loading, error } = useSelector((state: RootState) => state.tasks);

  // Load tags when component mounts
  useEffect(() => {
    // In a real app, you would fetch tags from the API
    // For now, we'll use mock data
    const mockTags: Tag[] = [
      { id: 1, name: 'work', color: '#FF0000' },
      { id: 2, name: 'personal', color: '#00FF00' },
      { id: 3, name: 'home', color: '#0000FF' },
    ];
    setTags(mockTags);
  }, []);

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch =
      !searchQuery ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    // Apply status filter
    const matchesStatus =
      filters.status === 'all' ||
      (filters.status === 'active' && task.status === 'active') ||
      (filters.status === 'completed' && task.status === 'completed');

    // Apply priority filter
    const matchesPriority =
      filters.priority === 'all' ||
      filters.priority === task.priority;

    // For date range filter, we'll implement a basic version
    let matchesDate = true;
    if (filters.dateRange !== 'all') {
      const taskDate = new Date(task.created_at);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filters.dateRange) {
        case 'today':
          const taskDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
          matchesDate = taskDay.getTime() === today.getTime();
          break;
        case 'week':
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          matchesDate = taskDate >= oneWeekAgo;
          break;
        case 'month':
          const oneMonthAgo = new Date(today);
          oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
          matchesDate = taskDate >= oneMonthAgo;
          break;
        case 'overdue':
          if (task.due_date) {
            const dueDate = new Date(task.due_date);
            matchesDate = dueDate < now && task.status !== 'completed';
          } else {
            matchesDate = false;
          }
          break;
        default:
          matchesDate = true;
      }
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesDate;
  });

  const handleCreateTask = async (taskData: any) => {
    try {
      await dispatch(createTask(taskData));
      setIsFormOpen(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return;

    try {
      await dispatch(updateTask({ id: editingTask.id, ...taskData }));
      setEditingTask(null);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  const handleToggleComplete = async (task: any) => {
    try {
      const updatedStatus = task.status === 'active' ? 'completed' : 'active';
      await dispatch(updateTask({
        id: task.id,
        status: updatedStatus
      }));
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleDeleteTask = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(id));
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Todo App
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Search onSearch={handleSearch} />
      <Filters onFilter={handleFilter} />

      <TaskList
        tasks={filteredTasks}
        onToggleComplete={handleToggleComplete}
        onEdit={handleEditTask}
        onDelete={handleDeleteTask}
      />

      <Fab
        color="primary"
        aria-label="add task"
        onClick={() => setIsFormOpen(true)}
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        <AddIcon />
      </Fab>

      <Dialog
        open={isFormOpen}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <TaskForm
            task={editingTask}
            tags={tags}
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
}