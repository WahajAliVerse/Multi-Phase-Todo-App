import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { User } from '@/types';
import { authApi } from '@/services/api';

// Define the async thunks for auth operations
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.login({ email: username, password }); // Note: In the UI, the login field might be labeled as username but actually expects email

      // Store the token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    { username, email, password }: { username: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await authApi.register({ username, email, password });

      // Store the token in localStorage
      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || error.message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  // Remove the token from localStorage
  localStorage.removeItem('access_token');
  return null;
});

export const checkAuthStatus = createAsyncThunk('auth/checkStatus', async (_, { dispatch }) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    try {
      // Verify token by making a request to a protected endpoint
      const response = await authApi.getCurrentUser();

      if (response.status === 200) {
        return { isAuthenticated: true, user: response.data };
      } else {
        // Token is invalid/expired, logout the user
        dispatch(logout());
        return { isAuthenticated: false, user: null };
      }
    } catch (error: any) {
      // Network error or other issues, logout the user
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      return { isAuthenticated: false, user: null };
    }
  } else {
    return { isAuthenticated: false, user: null };
  }
});

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout case
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Check auth status cases
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;