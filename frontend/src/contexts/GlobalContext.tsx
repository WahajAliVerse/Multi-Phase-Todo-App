// Context-based state management for shared data
import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Define the shape of our global state
interface GlobalState {
  user: {
    id: string | null;
    name: string | null;
    email: string | null;
    isAuthenticated: boolean;
  };
  theme: {
    mode: 'light' | 'dark';
    language: string;
  };
  ui: {
    loading: boolean;
    notifications: Array<{
      id: string;
      message: string;
      type: 'info' | 'success' | 'warning' | 'error';
      timestamp: Date;
    }>;
  };
}

// Define the actions that can modify the state
type GlobalAction =
  | { type: 'SET_USER'; payload: { id: string; name: string; email: string } }
  | { type: 'LOGOUT_USER' }
  | { type: 'SET_THEME_MODE'; payload: 'light' | 'dark' }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_NOTIFICATION'; payload: { message: string; type: 'info' | 'success' | 'warning' | 'error' } }
  | { type: 'REMOVE_NOTIFICATION'; payload: string };

// Initial state
const initialState: GlobalState = {
  user: {
    id: null,
    name: null,
    email: null,
    isAuthenticated: false,
  },
  theme: {
    mode: 'light',
    language: 'en',
  },
  ui: {
    loading: false,
    notifications: [],
  },
};

// Reducer function
const globalReducer = (state: GlobalState, action: GlobalAction): GlobalState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: {
          id: action.payload.id,
          name: action.payload.name,
          email: action.payload.email,
          isAuthenticated: true,
        },
      };
    case 'LOGOUT_USER':
      return {
        ...state,
        user: {
          id: null,
          name: null,
          email: null,
          isAuthenticated: false,
        },
      };
    case 'SET_THEME_MODE':
      return {
        ...state,
        theme: {
          ...state.theme,
          mode: action.payload,
        },
      };
    case 'SET_LANGUAGE':
      return {
        ...state,
        theme: {
          ...state.theme,
          language: action.payload,
        },
      };
    case 'SET_LOADING':
      return {
        ...state,
        ui: {
          ...state.ui,
          loading: action.payload,
        },
      };
    case 'ADD_NOTIFICATION':
      const newNotification = {
        id: Math.random().toString(36).substr(2, 9),
        message: action.payload.message,
        type: action.payload.type,
        timestamp: new Date(),
      };
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, newNotification],
        },
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(notification => notification.id !== action.payload),
        },
      };
    default:
      return state;
  }
};

// Create the context
interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<GlobalAction>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

// Provider component
export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

// Custom hook to use the global state
export const useGlobalState = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
};

// Selector hooks for specific parts of the state
export const useUser = () => {
  const { state } = useGlobalState();
  return state.user;
};

export const useTheme = () => {
  const { state } = useGlobalState();
  return state.theme;
};

export const useUi = () => {
  const { state } = useGlobalState();
  return state.ui;
};