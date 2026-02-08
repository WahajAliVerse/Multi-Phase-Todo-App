import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { setLoading, setError, setUser, clearUser } from '@/store/slices/authSlice';
import { authApi } from '@/api/authApi';
import { User, UserLogin, UserCreate } from '@/lib/types';

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [token, setToken] = useState<string | null>(null);

  // Handle login
  const handleLogin = async (credentials: UserLogin) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.login(credentials.email, credentials.password);

      // Store token in localStorage
      localStorage.setItem('access_token', response.access_token);

      // Fetch user profile after login
      const userProfile = await authApi.getMe();
      dispatch(setUser(userProfile));
      dispatch(setLoading(false));

      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
    }
  };

  // Handle register
  const handleRegister = async (userData: UserCreate) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.register(userData);

      // Store token in localStorage
      localStorage.setItem('access_token', response.access_token);

      dispatch(setUser(response.user));
      dispatch(setLoading(false));
      router.push('/dashboard'); // Redirect to dashboard after registration
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      dispatch(setError(errorMessage));
      dispatch(setLoading(false));
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the logout API endpoint
      await authApi.logout();
    } catch (err) {
      console.error('Logout API call failed:', err);
      // Even if the API call fails, we should still clear the local state
    } finally {
      // Remove token from localStorage
      localStorage.removeItem('access_token');

      dispatch(clearUser());
      router.push('/login'); // Redirect to login page after logout
    }
  };

  // Handle update profile
  const handleUpdateProfile = async (userData: Partial<UserCreate>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      dispatch(setUser(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    }
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
  };
};

export default useAuth;