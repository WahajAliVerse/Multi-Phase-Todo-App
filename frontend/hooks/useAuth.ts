import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/store';
import { setLoading, setError, setUser, clearUser } from '@/store/slices/authSlice';
import { authApi } from '@/api/authApi';
import { User } from '@/lib/types';

interface UserLogin {
  email: string;
  password: string;
}

interface UserCreate {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  theme_preference?: string;
  notification_settings?: Record<string, any>;
}

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [token, setToken] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      // Optionally fetch user profile to verify token validity
      fetchUserProfile();
    }
  }, []);

  // Fetch user profile if token exists
  const fetchUserProfile = async () => {
    try {
      dispatch(setLoading(true));
      const userProfile = await authApi.getMe();
      dispatch(setUser(userProfile));
      dispatch(setLoading(false));
    } catch (err) {
      dispatch(setError('Failed to fetch user profile'));
      handleLogout();
    }
  };

  // Handle login
  const handleLogin = async (credentials: UserLogin) => {
    try {
      dispatch(setLoading(true));
      const response = await authApi.login(credentials.email, credentials.password);

      // Store token in localStorage
      localStorage.setItem('access_token', response.access_token);
      setToken(response.access_token);

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
      setToken(response.access_token);

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
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('access_token');
    setToken(null);

    dispatch(clearUser());
    router.push('/login'); // Redirect to login page after logout
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

  // Check if token is expired (simplified check)
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, assume it's expired
    }
  };

  // Refresh token if expired
  const refreshTokenIfNeeded = async () => {
    if (!token) return false;

    if (isTokenExpired(token)) {
      try {
        // Note: refreshToken functionality needs to be implemented in authApi
        // const response = await authApi.refreshToken();
        // localStorage.setItem('access_token', response.access_token);
        // setToken(response.access_token);
        return true;
      } catch (err) {
        handleLogout(); // If refresh fails, log out the user
        return false;
      }
    }
    return true;
  };

  return {
    user,
    isAuthenticated,
    loading,
    error,
    token,
    handleLogin,
    handleRegister,
    handleLogout,
    handleUpdateProfile,
    refreshTokenIfNeeded,
  };
};

export default useAuth;