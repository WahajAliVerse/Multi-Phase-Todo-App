import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1',
    prepareHeaders: (headers, { getState }: any) => {
      // Retrieve the authentication token from state or wherever it's stored
      const token = localStorage.getItem('access_token'); // or however you store the token
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  tagTypes: ['Task', 'Tag', 'RecurrencePattern', 'Reminder'],
  endpoints: () => ({}),
});

export const { reducerPath: apiReducerPath, reducer: apiReducer, middleware: apiMiddleware } = apiSlice;