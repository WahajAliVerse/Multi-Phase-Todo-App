import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Task, TaskFormData, PaginationParams, FilterParams } from '@/lib/types';
import { taskApi } from '@/api/taskApi';

// Define the initial state for the task slice
interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  currentTask: Task | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
  currentTask: null,
  total: 0,
  page: 1,
  limit: 10,
};

// Async thunks for task operations
export const fetchTasks = createAsyncThunk(
  'task/fetchTasks',
  async (params: { page?: number; limit?: number; status?: string; priority?: string; search?: string } = {}) => {
    // In a real app, this would make an API call
    // For now, returning mock data
    return { tasks: [], total: 0 };
  }
);

export const fetchTaskById = createAsyncThunk(
  'task/fetchTaskById',
  async (taskId: string) => {
    // In a real app, this would make an API call
    // For now, returning mock data
    return {} as Task;
  }
);

export const createTask = createAsyncThunk(
  'task/createTask',
  async (taskData: TaskFormData) => {
    // In a real app, this would make an API call
    // For now, returning mock data
    return {} as Task;
  }
);

export const updateTask = createAsyncThunk(
  'task/updateTask',
  async ({ id, data }: { id: string; data: TaskFormData }) => {
    // In a real app, this would make an API call
    // For now, returning mock data
    return {} as Task;
  }
);

export const deleteTask = createAsyncThunk(
  'task/deleteTask',
  async (taskId: string) => {
    // In a real app, this would make an API call
    // For now, returning mock data
    return taskId;
  }
);

const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    setPagination: (state, action: PayloadAction<{ page: number; limit: number; total: number }>) => {
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.total = action.payload.total;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        // In a real app, you would set the tasks from action.payload
        // state.tasks = action.payload.tasks;
        // state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch task';
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        // In a real app, you would add the new task to the list
        // state.tasks.push(action.payload);
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        // In a real app, you would update the task in the list
        // const index = state.tasks.findIndex(task => task.id === action.payload.id);
        // if (index !== -1) state.tasks[index] = action.payload;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        // In a real app, you would remove the task from the list
        // state.tasks = state.tasks.filter(task => task.id !== action.payload);
      });
  },
});

export const { setLoading, setError, setCurrentTask, clearCurrentTask, setPagination } = taskSlice.actions;

export default taskSlice.reducer;