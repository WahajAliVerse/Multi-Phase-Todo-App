import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from '../models/task';
import { Tag } from '../models/tag';
import { RecurrencePattern } from '../models/recurrence';
import { Reminder } from '../models/reminder';

// Define the base API slice
export const recurrenceApi = createApi({
  reducerPath: 'recurrenceApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['RecurrencePattern'],
  endpoints: (builder) => ({
    getRecurrencePatterns: builder.query<RecurrencePattern[], void>({
      query: () => '/recurrence-patterns',
      providesTags: ['RecurrencePattern'],
    }),
    getRecurrencePattern: builder.query<RecurrencePattern, string>({
      query: (id) => `/recurrence-patterns/${id}`,
      providesTags: (result, error, id) => [{ type: 'RecurrencePattern', id }],
    }),
    addRecurrencePattern: builder.mutation<RecurrencePattern, Partial<RecurrencePattern>>({
      query: (body) => ({
        url: '/recurrence-patterns',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RecurrencePattern'],
    }),
    updateRecurrencePattern: builder.mutation<RecurrencePattern, { id: string; data: Partial<RecurrencePattern> }>({
      query: ({ id, data }) => ({
        url: `/recurrence-patterns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'RecurrencePattern', id }],
    }),
    deleteRecurrencePattern: builder.mutation<void, string>({
      query: (id) => ({
        url: `/recurrence-patterns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['RecurrencePattern'],
    }),
  }),
});

export const { 
  useGetRecurrencePatternsQuery, 
  useGetRecurrencePatternQuery, 
  useAddRecurrencePatternMutation,
  useUpdateRecurrencePatternMutation,
  useDeleteRecurrencePatternMutation 
} = recurrenceApi;