import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode library

interface User {
  id: string;
  email: string;
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  isAuthenticated: boolean;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on app startup
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      try {
        const decodedToken: any = jwtDecode(storedToken);
        // Check if token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          // Set user based on token
          setUser({
            id: decodedToken.userId || decodedToken.sub,
            email: decodedToken.email,
            name: decodedToken.name || decodedToken.email.split('@')[0],
          });
        } else {
          // Token is expired, remove it
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call to your backend
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token, user } = data;

        // Store the token
        localStorage.setItem('access_token', access_token);
        setToken(access_token);

        // Decode token to get user info
        const decodedToken: any = jwtDecode(access_token);
        setUser({
          id: decodedToken.userId || decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name || email.split('@')[0],
        });

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      if (response.ok) {
        // Auto-login after registration
        return await login(email, password);
      } else {
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    // Remove token from storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
    setToken(null);
    setUser(null);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const { access_token } = data;

        // Store new token
        localStorage.setItem('access_token', access_token);
        setToken(access_token);

        // Decode token to get user info
        const decodedToken: any = jwtDecode(access_token);
        setUser({
          id: decodedToken.userId || decodedToken.sub,
          email: decodedToken.email,
          name: decodedToken.name || decodedToken.email.split('@')[0],
        });

        return true;
      } else {
        // Refresh failed, user needs to log in again
        logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      logout();
      return false;
    }
  };

  // Check if user is authenticated (token exists and is not expired)
  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        register,
        isAuthenticated,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};