import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../store';
import { loginStart, loginSuccess, loginFailure, logout, setError } from '../store/slices/authSlice';
import authApi from '../api/authApi';
import { UserLogin, UserPublicProfile } from '../types';

const useAuth = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);
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
      dispatch(loginStart());
      const userProfile = await authApi.getMe();
      dispatch(loginSuccess(userProfile));
    } catch (err) {
      dispatch(loginFailure('Failed to fetch user profile'));
      handleLogout();
    }
  };

  // Handle login
  const handleLogin = async (credentials: UserLogin) => {
    try {
      dispatch(loginStart());
      const response = await authApi.login(credentials);
      
      // Store token in localStorage
      localStorage.setItem('access_token', response.access_token);
      setToken(response.access_token);
      
      dispatch(loginSuccess(response.user));
      router.push('/dashboard'); // Redirect to dashboard after login
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(loginFailure(errorMessage));
    }
  };

  // Handle register
  const handleRegister = async (userData: UserCreate) => {
    try {
      dispatch(loginStart());
      const response = await authApi.register(userData);
      
      // Store token in localStorage
      localStorage.setItem('access_token', response.access_token);
      setToken(response.access_token);
      
      dispatch(loginSuccess(response.user));
      router.push('/dashboard'); // Redirect to dashboard after registration
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      dispatch(loginFailure(errorMessage));
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Remove token from localStorage
    localStorage.removeItem('access_token');
    setToken(null);
    
    dispatch(logout());
    router.push('/login'); // Redirect to login page after logout
  };

  // Handle update profile
  const handleUpdateProfile = async (userData: Partial<UserCreate>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      dispatch(loginSuccess(updatedUser));
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
        const response = await authApi.refreshToken();
        localStorage.setItem('access_token', response.access_token);
        setToken(response.access_token);
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
    isLoading,
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