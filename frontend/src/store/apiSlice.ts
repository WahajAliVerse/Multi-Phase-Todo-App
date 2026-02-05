import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task } from '../models/task';
import { Tag } from '../models/tag';
import { RecurrencePattern } from '../models/recurrence';
import { Reminder } from '../models/reminder';

// Define the base API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Task', 'Tag', 'RecurrencePattern', 'Reminder'],
  endpoints: (builder) => ({
    // Tasks endpoints
    getTasks: builder.query<Task[], void>({
      query: () => '/tasks',
      providesTags: ['Task'],
    }),
    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),
    addTask: builder.mutation<Task, Partial<Task>>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<Task, { id: string; data: Partial<Task> }>({
      query: ({ id, data }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Task', id }],
    }),
    deleteTask: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),

    // Tags endpoints
    getTags: builder.query<Tag[], void>({
      query: () => '/tags',
      providesTags: ['Tag'],
    }),
    getTag: builder.query<Tag, string>({
      query: (id) => `/tags/${id}`,
      providesTags: (result, error, id) => [{ type: 'Tag', id }],
    }),
    addTag: builder.mutation<Tag, Partial<Tag>>({
      query: (body) => ({
        url: '/tags',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tag'],
    }),
    updateTag: builder.mutation<Tag, { id: string; data: Partial<Tag> }>({
      query: ({ id, data }) => ({
        url: `/tags/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Tag', id }],
    }),
    deleteTag: builder.mutation<void, string>({
      query: (id) => ({
        url: `/tags/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tag'],
    }),

    // Recurrence Patterns endpoints
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

    // Reminders endpoints
    getReminders: builder.query<Reminder[], void>({
      query: () => '/reminders',
      providesTags: ['Reminder'],
    }),
    getReminder: builder.query<Reminder, string>({
      query: (id) => `/reminders/${id}`,
      providesTags: (result, error, id) => [{ type: 'Reminder', id }],
    }),
    addReminder: builder.mutation<Reminder, Partial<Reminder>>({
      query: (body) => ({
        url: '/reminders',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Reminder'],
    }),
    updateReminder: builder.mutation<Reminder, { id: string; data: Partial<Reminder> }>({
      query: ({ id, data }) => ({
        url: `/reminders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Reminder', id }],
    }),
    deleteReminder: builder.mutation<void, string>({
      query: (id) => ({
        url: `/reminders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Reminder'],
    }),
  }),
});

export const {
  // Task hooks
  useGetTasksQuery,
  useGetTaskQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,

  // Tag hooks
  useGetTagsQuery,
  useGetTagQuery,
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation,

  // Recurrence Pattern hooks
  useGetRecurrencePatternsQuery,
  useGetRecurrencePatternQuery,
  useAddRecurrencePatternMutation,
  useUpdateRecurrencePatternMutation,
  useDeleteRecurrencePatternMutation,

  // Reminder hooks
  useGetRemindersQuery,
  useGetReminderQuery,
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation,
} = apiSlice;