import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Reminder } from '../models/reminder';

// Define the base API slice
export const reminderApi = createApi({
  reducerPath: 'reminderApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Reminder'],
  endpoints: (builder) => ({
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
  useGetRemindersQuery, 
  useGetReminderQuery, 
  useAddReminderMutation,
  useUpdateReminderMutation,
  useDeleteReminderMutation 
} = reminderApi;