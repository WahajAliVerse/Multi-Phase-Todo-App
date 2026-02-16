import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@/utils/api';
import { LoginData, RegisterData, User } from '@/utils/validators';
import { AuthState } from '@/types';

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
  async (_, { rejectWithValue }) => {
    try {
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
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
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
        // The action.payload might contain both user and token
        if (action.payload.user) {
          state.user = action.payload.user;
        } else {
          state.user = action.payload;
        }
        state.isAuthenticated = true;
        state.error = null; // Clear any previous errors
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
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch profile
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        // Extract user from payload (could be User or { user: User, token: any })
        const user = (action.payload as any).user || action.payload;
        state.user = user;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null; // Clear any previous errors
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        // Don't set error for unauthorized access - just mark as not authenticated
        // Only update state if we're not in the middle of a login process
        if (action.payload === 'Session expired. Please log in again.' ||
            action.payload === 'Unauthorized' ||
            (action.payload as string)?.includes('401') ||
            (action.payload as string)?.includes('404')) {
          // Reset state to unauthenticated if we get a 401/404 error
          // This prevents infinite loops when the token is invalid/expired
          state.user = null;
          state.isAuthenticated = false;
          state.error = null; // Don't show error for unauthorized access
        } else {
          state.error = action.payload as string;
        }
        state.loading = false;
      })
      // Update profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        // Ensure we're properly updating the user object with the latest data
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
      })
      // Handle rehydration from persisted state
      .addMatcher(
        (action) => action.type === 'persist/REHYDRATE' && (action as any).payload?.auth,
        (state, action) => {
          const rehydratedAuth = (action as any).payload.auth;
          if (rehydratedAuth) {
            // Only update if we have actual auth data
            state.user = rehydratedAuth.user || state.user;
            state.isAuthenticated = rehydratedAuth.isAuthenticated || state.isAuthenticated;
            state.token = rehydratedAuth.token || state.token;
          }
        }
      );
  },
});

export const { clearError, setUser, logout } = authSlice.actions;
export default authSlice.reducer;