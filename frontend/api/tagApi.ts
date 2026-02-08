import { apiClient } from './authApi';
import { Tag } from '@/lib/types';

// Define response type for paginated results
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
  limit: number;
}

// Tag API functions
export const tagApi = {
  // Get all tags for the current user
  getTags: async (params?: { skip?: number; limit?: number }): Promise<PaginatedResponse<Tag>> => {
    const response = await apiClient.get('/tags/', { params });

    // Ensure the response follows the expected format with items, total, offset, and limit
    if (response.data && Array.isArray(response.data)) {
      // If the response is just an array, wrap it in the expected format
      return {
        items: response.data,
        total: response.data.length,
        offset: params?.skip || 0,
        limit: params?.limit || response.data.length
      };
    }
    // Otherwise, return the response as is (assuming it's already in the correct format)
    return response.data;
  },

  // Get a specific tag by ID
  getTagById: async (tagId: string): Promise<Tag> => {
    const response = await apiClient.get(`/tags/${tagId}`);
    return response.data;
  },

  // Create a new tag
  createTag: async (tagData: Omit<Tag, 'id' | 'created_at' | 'updated_at'>): Promise<Tag> => {
    const response = await apiClient.post('/tags/', tagData);
    return response.data;
  },

  // Update a tag
  updateTag: async (tagId: string, tagData: Partial<Omit<Tag, 'id' | 'created_at' | 'updated_at'>>): Promise<Tag> => {
    const response = await apiClient.put(`/tags/${tagId}`, tagData);
    return response.data;
  },

  // Delete a tag
  deleteTag: async (tagId: string): Promise<void> => {
    await apiClient.delete(`/tags/${tagId}`);
  },
};