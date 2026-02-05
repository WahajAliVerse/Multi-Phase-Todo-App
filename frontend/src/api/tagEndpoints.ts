import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Tag } from '../models/tag';

// Define the base API slice
export const tagApi = createApi({
  reducerPath: 'tagApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  tagTypes: ['Tag'],
  endpoints: (builder) => ({
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
  }),
});

export const { 
  useGetTagsQuery, 
  useGetTagQuery, 
  useAddTagMutation,
  useUpdateTagMutation,
  useDeleteTagMutation 
} = tagApi;