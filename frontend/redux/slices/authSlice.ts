import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/utils/api';
import { LoginData, RegisterData, User } from '@/utils/validators';
import { AuthState } from '@/types';

/**
 * SECURE AUTHENTICATION STATE MANAGEMENT
 * 
 * SECURITY NOTES:
 * - Token is stored in Redux state (memory only) - NOT in localStorage
 * - Token is cleared on page refresh (requires re-authentication)
 * - HTTP-only cookies are used as backup auth (set by backend)
 * - All API calls send token via Authorization header
 * 
 * This approach prevents XSS attacks from stealing tokens via localStorage.
 */

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  token: null,
  loading: false,
  error: null,
};

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginData, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Get current token to invalidate on backend
      const state: any = getState();
      const token = state.auth?.token;
      
      // Call logout endpoint (will clear cookies and blacklist token)
      await authApi.logout();
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getProfile();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(userData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      // Store token in memory only (NOT localStorage)
      state.token = action.payload;
    },
    clearToken: (state) => {
      // Clear token from memory
      state.token = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.token = null; // Clear token from memory
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        
        // Extract user from response
        if (action.payload.user) {
          state.user = action.payload.user;
        } else {
          state.user = action.payload;
        }
        
        // Extract and store token in memory (NOT localStorage)
        if (action.payload.token) {
          state.token = action.payload.token;
        } else if (action.payload.access_token) {
          state.token = action.payload.access_token;
        }
        
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        
        // Store token if returned
        if ((action.payload as any).token) {
          state.token = (action.payload as any).token;
        } else if ((action.payload as any).access_token) {
          state.token = (action.payload as any).access_token;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.token = null; // Clear token from memory
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // Extract user from payload
        const user = (action.payload as any).user || action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        // Handle 401/404 errors - mark as unauthenticated
        const errorMsg = action.payload as string;
        if (
          errorMsg === 'Session expired. Please log in again.' ||
          errorMsg === 'Unauthorized' ||
          errorMsg?.includes('401') ||
          errorMsg?.includes('404')
        ) {
          state.user = null;
          state.isAuthenticated = false;
          state.token = null; // Clear token
          state.error = null;
        } else {
          state.error = errorMsg;
        }
        state.loading = false;
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        if (state.user) {
          const payload = (action.payload as any).user || action.payload;
          state.user = {
            ...state.user,
            ...payload,
            preferences: {
              ...state.user.preferences,
              ...payload.preferences
            }
          } as User;
        }
        state.loading = false;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.error = action.payload as string;
        state.loading = false;
      });
  },
});

export const { clearError, setUser, setToken, clearToken, logout } = authSlice.actions;
export default authSlice.reducer;
