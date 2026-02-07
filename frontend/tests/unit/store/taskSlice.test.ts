import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  markTaskComplete, 
  markTaskIncomplete 
} from '@/lib/store/slices/taskSlice';
import { TaskRead, TaskCreate, TaskUpdate } from '@/lib/types';
import { RootState } from '@/lib/store';

// Mock the task API
jest.mock('@/lib/api/taskApi', () => ({
  getTasks: jest.fn(),
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  markTaskComplete: jest.fn(),
  markTaskIncomplete: jest.fn(),
}));

const mockTaskApi = require('@/lib/api/taskApi');

describe('Task Slice', () => {
  const mockTask: TaskRead = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    status: 'pending',
    priority: 'medium',
    due_date: '2023-12-31T10:00:00Z',
    created_at: '2023-01-01T10:00:00Z',
    updated_at: '2023-01-01T10:00:00Z',
    user_id: '123e4567-e89b-12d3-a456-426614174001',
    tag_ids: [],
  };

  const mockState: RootState = {
    task: {
      tasks: [mockTask],
      currentTask: null,
      loading: false,
      error: null,
      filters: {
        status: null,
        priority: null,
        search: null,
      },
      pagination: {
        offset: 0,
        limit: 10,
        total: 1,
      },
      unreadCount: 0,
    },
    // Add other necessary state slices
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTasks', () => {
    it('should fetch tasks successfully', async () => {
      // Arrange
      const mockTasksResponse = {
        items: [mockTask],
        total: 1,
        offset: 0,
        limit: 10,
      };
      mockTaskApi.getTasks.mockResolvedValue(mockTasksResponse);
      
      // Act & Assert
      const result = await store.dispatch(fetchTasks({}));
      expect(result.type).toBe('task/fetchTasks/fulfilled');
      expect(result.payload).toEqual(mockTasksResponse);
    });

    it('should handle fetch tasks error', async () => {
      // Arrange
      const mockError = new Error('Failed to fetch tasks');
      mockTaskApi.getTasks.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(fetchTasks({}));
      expect(result.type).toBe('task/fetchTasks/rejected');
      expect(result.error.message).toBe('Failed to fetch tasks');
    });
  });

  describe('createTask', () => {
    it('should create task successfully', async () => {
      // Arrange
      const newTaskData: TaskCreate = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
        due_date: '2023-12-31T10:00:00Z',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        tag_ids: [],
      };
      
      mockTaskApi.createTask.mockResolvedValue({ ...newTaskData, id: 'new-id' });
      
      // Act & Assert
      const result = await store.dispatch(createTask(newTaskData));
      expect(result.type).toBe('task/createTask/fulfilled');
      expect(result.payload).toEqual({ ...newTaskData, id: 'new-id' });
    });

    it('should handle create task error', async () => {
      // Arrange
      const newTaskData: TaskCreate = {
        title: 'New Task',
        description: 'New Description',
        status: 'pending',
        priority: 'medium',
        due_date: '2023-12-31T10:00:00Z',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        tag_ids: [],
      };
      
      const mockError = new Error('Failed to create task');
      mockTaskApi.createTask.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(createTask(newTaskData));
      expect(result.type).toBe('task/createTask/rejected');
      expect(result.error.message).toBe('Failed to create task');
    });
  });

  describe('updateTask', () => {
    it('should update task successfully', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const taskUpdate: TaskUpdate = {
        title: 'Updated Task',
        status: 'completed',
      };
      
      const updatedTask = { ...mockTask, ...taskUpdate };
      mockTaskApi.updateTask.mockResolvedValue(updatedTask);
      
      // Act & Assert
      const result = await store.dispatch(updateTask({ taskId, taskData: taskUpdate }));
      expect(result.type).toBe('task/updateTask/fulfilled');
      expect(result.payload).toEqual(updatedTask);
    });

    it('should handle update task error', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const taskUpdate: TaskUpdate = {
        title: 'Updated Task',
        status: 'completed',
      };
      
      const mockError = new Error('Failed to update task');
      mockTaskApi.updateTask.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(updateTask({ taskId, taskData: taskUpdate }));
      expect(result.type).toBe('task/updateTask/rejected');
      expect(result.error.message).toBe('Failed to update task');
    });
  });

  describe('deleteTask', () => {
    it('should delete task successfully', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      mockTaskApi.deleteTask.mockResolvedValue(undefined);
      
      // Act & Assert
      const result = await store.dispatch(deleteTask(taskId));
      expect(result.type).toBe('task/deleteTask/fulfilled');
      expect(result.payload).toBe(taskId);
    });

    it('should handle delete task error', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const mockError = new Error('Failed to delete task');
      mockTaskApi.deleteTask.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(deleteTask(taskId));
      expect(result.type).toBe('task/deleteTask/rejected');
      expect(result.error.message).toBe('Failed to delete task');
    });
  });

  describe('markTaskComplete', () => {
    it('should mark task as complete successfully', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const completedTask = { ...mockTask, status: 'completed' };
      mockTaskApi.markTaskComplete.mockResolvedValue(completedTask);
      
      // Act & Assert
      const result = await store.dispatch(markTaskComplete(taskId));
      expect(result.type).toBe('task/markTaskComplete/fulfilled');
      expect(result.payload).toEqual(completedTask);
    });

    it('should handle mark task complete error', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const mockError = new Error('Failed to mark task as complete');
      mockTaskApi.markTaskComplete.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(markTaskComplete(taskId));
      expect(result.type).toBe('task/markTaskComplete/rejected');
      expect(result.error.message).toBe('Failed to mark task as complete');
    });
  });

  describe('markTaskIncomplete', () => {
    it('should mark task as incomplete successfully', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const incompleteTask = { ...mockTask, status: 'pending' };
      mockTaskApi.markTaskIncomplete.mockResolvedValue(incompleteTask);
      
      // Act & Assert
      const result = await store.dispatch(markTaskIncomplete(taskId));
      expect(result.type).toBe('task/markTaskIncomplete/fulfilled');
      expect(result.payload).toEqual(incompleteTask);
    });

    it('should handle mark task incomplete error', async () => {
      // Arrange
      const taskId = '123e4567-e89b-12d3-a456-426614174000';
      const mockError = new Error('Failed to mark task as incomplete');
      mockTaskApi.markTaskIncomplete.mockRejectedValue(mockError);
      
      // Act & Assert
      const result = await store.dispatch(markTaskIncomplete(taskId));
      expect(result.type).toBe('task/markTaskIncomplete/rejected');
      expect(result.error.message).toBe('Failed to mark task as incomplete');
    });
  });
});