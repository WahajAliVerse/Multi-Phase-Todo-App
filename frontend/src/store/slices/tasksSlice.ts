import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Task, Tag, RecurrencePattern, Reminder } from '../../lib/types';

// Define the initial state
interface TasksState {
  tasks: Task[];
  selectedTask: Task | null;
  loading: boolean;
  error: string | null;
}

const initialState: TasksState = {
  tasks: [],
  selectedTask: null,
  loading: false,
  error: null,
};

// Create the slice
export const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },

    // Add or update a task
    addOrUpdateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      } else {
        state.tasks.push(action.payload);
      }
      state.selectedTask = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Set multiple tasks
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },

    // Remove a task
    removeTask: (state, action: PayloadAction<number>) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },

    // Select a task
    selectTask: (state, action: PayloadAction<Task | null>) => {
      state.selectedTask = action.payload;
    },

    // Clear selected task
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    },

    // Update task tags
    updateTaskTags: (state, action: PayloadAction<{ taskId: number; tags: Tag[] }>) => {
      const { taskId, tags } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].tags = tags;
        if (state.selectedTask?.id === taskId) {
          state.selectedTask.tags = tags;
        }
      }
    },

    // Update task recurrence pattern
    updateTaskRecurrence: (state, action: PayloadAction<{ taskId: number; recurrencePattern: RecurrencePattern | undefined }>) => {
      const { taskId, recurrencePattern } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].recurrencePattern = recurrencePattern;
        if (state.selectedTask?.id === taskId) {
          state.selectedTask.recurrencePattern = recurrencePattern;
        }
      }
    },

    // Update task reminders
    updateTaskReminders: (state, action: PayloadAction<{ taskId: number; reminders: Reminder[] }>) => {
      const { taskId, reminders } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].reminders = reminders;
        if (state.selectedTask?.id === taskId) {
          state.selectedTask.reminders = reminders;
        }
      }
    },

    // Toggle task completion status
    toggleTaskCompletion: (state, action: PayloadAction<number>) => {
      const taskIndex = state.tasks.findIndex(task => task.id === action.payload);
      if (taskIndex !== -1) {
        const task = state.tasks[taskIndex];
        task.status = task.status === 'completed' ? 'active' : 'completed';
        task.completedAt = task.status === 'completed' ? new Date() : undefined;
        
        if (state.selectedTask?.id === action.payload) {
          state.selectedTask.status = task.status;
          state.selectedTask.completedAt = task.completedAt;
        }
      }
    },

    // Update task priority
    updateTaskPriority: (state, action: PayloadAction<{ taskId: number; priority: 'low' | 'medium' | 'high' }>) => {
      const { taskId, priority } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].priority = priority;
        if (state.selectedTask?.id === taskId) {
          state.selectedTask.priority = priority;
        }
      }
    },

    // Update task due date
    updateTaskDueDate: (state, action: PayloadAction<{ taskId: number; dueDate: Date | undefined }>) => {
      const { taskId, dueDate } = action.payload;
      const taskIndex = state.tasks.findIndex(task => task.id === taskId);
      if (taskIndex !== -1) {
        state.tasks[taskIndex].dueDate = dueDate;
        if (state.selectedTask?.id === taskId) {
          state.selectedTask.dueDate = dueDate;
        }
      }
    },

    // Filter tasks by status
    filterTasksByStatus: (state, action: PayloadAction<'active' | 'completed' | 'all'>) => {
      if (action.payload === 'all') {
        // Already have all tasks
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.filter(task => action.payload === 'all' || task.status === action.payload)
      };
    },

    // Filter tasks by priority
    filterTasksByPriority: (state, action: PayloadAction<'low' | 'medium' | 'high' | 'all'>) => {
      if (action.payload === 'all') {
        // Already have all tasks
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.filter(task => action.payload === 'all' || task.priority === action.payload)
      };
    },

    // Filter tasks by tags
    filterTasksByTags: (state, action: PayloadAction<number[]>) => {
      if (action.payload.length === 0) {
        // No tags selected, return all tasks
        return state;
      }
      return {
        ...state,
        tasks: state.tasks.filter(task => {
          if (!task.tags || task.tags.length === 0) return false;
          return task.tags.some(tag => action.payload.includes(tag.id));
        })
      };
    },

    // Reset state
    reset: (state) => {
      state.tasks = [];
      state.selectedTask = null;
      state.loading = false;
      state.error = null;
    },
  },
});

// Export the actions
export const {
  setLoading,
  setError,
  addOrUpdateTask,
  setTasks,
  removeTask,
  selectTask,
  clearSelectedTask,
  updateTaskTags,
  updateTaskRecurrence,
  updateTaskReminders,
  toggleTaskCompletion,
  updateTaskPriority,
  updateTaskDueDate,
  filterTasksByStatus,
  filterTasksByPriority,
  filterTasksByTags,
  reset,
} = tasksSlice.actions;

// Export the reducer
export default tasksSlice.reducer;