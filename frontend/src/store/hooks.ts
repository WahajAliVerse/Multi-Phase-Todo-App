import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import { AppDispatch, RootState } from './store';
import { login as loginAction, logout as logoutAction } from './slices/authSlice';

// Custom hook for getting the dispatch function with proper typing
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Custom hook for getting typed access to the store
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Custom hook for authentication actions
export const useAuth = () => {
  const dispatch = useAppDispatch();

  const login = (credentials: { username: string; password: string }) => {
    return dispatch(loginAction(credentials));
  };

  const logout = () => {
    return dispatch(logoutAction());
  };

  return {
    login,
    logout,
  };
};