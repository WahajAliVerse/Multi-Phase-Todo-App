import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  theme: 'light' | 'dark'
  drawerOpen: boolean
  snackbar: {
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }
}

const initialState: UiState = {
  theme: 'light',
  drawerOpen: false,
  snackbar: {
    open: false,
    message: '',
    severity: 'info',
  },
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light'
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.theme = action.payload
    },
    toggleDrawer: (state) => {
      state.drawerOpen = !state.drawerOpen
    },
    openSnackbar: (
      state,
      action: PayloadAction<{ message: string; severity: 'success' | 'error' | 'warning' | 'info' }>
    ) => {
      state.snackbar = {
        open: true,
        message: action.payload.message,
        severity: action.payload.severity,
      }
    },
    closeSnackbar: (state) => {
      state.snackbar.open = false
    },
  },
})

export const { toggleTheme, setTheme, toggleDrawer, openSnackbar, closeSnackbar } = uiSlice.actions
export default uiSlice.reducer