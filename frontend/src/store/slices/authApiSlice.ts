import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { User } from '@/lib/types';

// Define the base API with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Get token from auth state and add to headers
    const token = (getState() as any).auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
      headers.set('Content-Type', 'application/json');
    }
    return headers;
  },
});

export const authApiSlice = createApi({
  reducerPath: 'authApi',
  baseQuery,
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Login endpoint
    login: builder.mutation<User, { username: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
        credentials: 'include', // Important for handling HTTP-only cookies
      }),
      invalidatesTags: ['User'],
    }),

    // Logout endpoint
    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
        credentials: 'include', // Important for handling HTTP-only cookies
      }),
      invalidatesTags: ['User'],
    }),

    // Register endpoint
    register: builder.mutation<User, { username: string; email: string; password: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
        credentials: 'include', // Important for handling HTTP-only cookies
      }),
      invalidatesTags: ['User'],
    }),

    // Get current user profile
    getCurrentUser: builder.query<User, void>({
      query: () => ({
        url: '/auth/me',
        credentials: 'include', // Important for handling HTTP-only cookies
      }),
      providesTags: ['User'],
    }),

    // Update user profile
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (profileData) => ({
        url: '/auth/profile',
        method: 'PUT',
        body: profileData,
        credentials: 'include', // Important for handling HTTP-only cookies
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
} = authApiSlice;