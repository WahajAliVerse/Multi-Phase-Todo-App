 import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tasksApi } from '@/utils/api';
import { Task, CreateTaskData, UpdateTaskData } from '@/utils/validators';
import { TasksState } from '@/types';

// Initial state
const initialState: TasksState = {
  tasks: [],
  loading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    tag: 'all',
  },
};

// Async thunks for tasks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params: any | null = null, { rejectWithValue }) => {
    console.log('[fetchTasks] Starting fetch with params:', params);
    try {
      const response = await tasksApi.getAll(params || {});
      console.log('[fetchTasks] Full API response object:', response);
      console.log('[fetchTasks] response.tasks:', (response as any)?.tasks);
      console.log('[fetchTasks] response.tasks length:', (response as any)?.tasks?.length);
      
      // The tasksApi.getAll now returns { tasks: [...], pagination: {...} }
      return response;
    } catch (error: any) {
      console.error('[fetchTasks] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await tasksApi.getById(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData & { userId?: string }, { rejectWithValue }) => {
    console.log('[createTask] Starting create with data:', taskData);
    try {
      const response = await tasksApi.create(taskData);
      console.log('[createTask] API response:', response);
      return response;
    } catch (error: any) {
      console.error('[createTask] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: UpdateTaskData & { userId?: string } }, { rejectWithValue }) => {
    try {
      const response = await tasksApi.update(id, taskData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await tasksApi.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Tasks slice
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilterStatus: (state, action: PayloadAction<'all' | 'active' | 'completed'>) => {
      state.filters.status = action.payload;
    },
    setFilterPriority: (state, action: PayloadAction<'low' | 'medium' | 'high' | 'all'>) => {
      state.filters.priority = action.payload;
    },
    setFilterTag: (state, action: PayloadAction<string | 'all'>) => {
      state.filters.tag = action.payload;
    },
    setFilterSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
    },
    setFilterSort: (state, action: PayloadAction<{ sortBy: 'title' | 'priority' | 'dueDate' | 'createdAt'; sortOrder: 'asc' | 'desc' }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },
    // Optimistic update for task completion
    toggleTaskCompletion: (state, action: PayloadAction<{ id: string; completed: boolean }>) => {
      const task = state.tasks.find(task => task.id === action.payload.id);
      if (task) {
        task.completed = action.payload.completed;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle rehydration from Redux Persist
      .addCase('persist/REHYDRATE', (state, action: any) => {
        console.log('[tasksSlice] REHYDRATE action received:', action.payload);
        const incomingState = action.payload;
        if (incomingState && Array.isArray(incomingState.tasks)) {
          console.log('[tasksSlice] Rehydrating tasks:', incomingState.tasks);
          if (!state.tasks || state.tasks.length === 0) {
            state.tasks = incomingState.tasks;
            console.log('[tasksSlice] Tasks rehydrated successfully, count:', state.tasks.length);
          }
        }
        state.loading = false;
      })
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        console.log('[tasksSlice] fetchTasks.pending - loading set to true');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        console.log('[tasksSlice] fetchTasks.fulfilled - payload:', action.payload);
        console.log('[tasksSlice] payload type:', typeof action.payload);
        console.log('[tasksSlice] payload keys:', Object.keys(action.payload || {}));
        
        state.loading = false;
        
        // The payload is { tasks: [...], pagination: {...} }
        const payload = action.payload as any;
        
        if (payload && Array.isArray(payload.tasks)) {
          console.log('[tasksSlice] Setting state.tasks from payload.tasks, count:', payload.tasks.length);
          state.tasks = payload.tasks;
        } else if (Array.isArray(payload)) {
          // Fallback if payload is directly an array
          console.log('[tasksSlice] Payload is array, using directly, count:', payload.length);
          state.tasks = payload;
        } else {
          console.warn('[tasksSlice] Unexpected payload format, setting empty array');
          state.tasks = [];
        }
        
        console.log('[tasksSlice] fetchTasks.fulfilled - state.tasks updated, count:', state.tasks.length);
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        console.log('[tasksSlice] fetchTasks.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch task by ID
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        // Ensure tasks is an array before accessing
        if (!Array.isArray(state.tasks)) {
          state.tasks = [];
        }
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        } else {
          state.tasks.push(action.payload);
        }
      })
      // Create task
      .addCase(createTask.fulfilled, (state, action) => {
        console.log('[tasksSlice] createTask.fulfilled - payload:', action.payload);
        // Ensure tasks is an array before pushing
        if (!Array.isArray(state.tasks)) {
          state.tasks = [];
        }
        state.tasks.push(action.payload);
        state.loading = false;
        console.log('[tasksSlice] createTask.fulfilled - task added, total count:', state.tasks.length);
      })
      .addCase(createTask.rejected, (state, action) => {
        console.log('[tasksSlice] createTask.rejected - error:', action.payload);
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update task
      .addCase(updateTask.fulfilled, (state, action) => {
        // Ensure tasks is an array before accessing
        if (!Array.isArray(state.tasks)) {
          state.tasks = [];
        }
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        state.loading = false;
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete task
      .addCase(deleteTask.fulfilled, (state, action) => {
        // Ensure tasks is an array before filtering
        if (!Array.isArray(state.tasks)) {
          state.tasks = [];
        }
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.loading = false;
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilterStatus, setFilterPriority, setFilterTag, setFilterSearch, setFilterSort, toggleTaskCompletion } = tasksSlice.actions;
export default tasksSlice.reducer;