import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  profile: any | null; // In a real app, you'd have a User type
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<any>) => {
      state.profile = action.payload;
    },
    updateUserProfile: (state, action: PayloadAction<any>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
      }
    },
    clearUserProfile: (state) => {
      state.profile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUserProfile, updateUserProfile, clearUserProfile, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;