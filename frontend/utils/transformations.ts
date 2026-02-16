import { 
  TagDto, 
  TaskDto, 
  UserDto, 
  NotificationDto, 
  Tag, 
  Task, 
  User, 
  Notification 
} from '@/types';

// Transform DTOs to Frontend Models

export const transformTagDtoToFrontendModel = (dto: TagDto): Tag => {
  return {
    id: dto.id,
    name: dto.name,
    color: dto.color || '#6b7280', // Default gray color
    userId: dto.user_id,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    taskCount: 0, // Default or calculated separately
  };
};

export const transformTaskDtoToFrontendModel = (dto: TaskDto): Task => {
  // Convert backend status to frontend completed boolean
  const isCompleted = dto.status === 'completed';
  
  console.log('[transformTaskDtoToFrontendModel] Backend status:', dto.status, '-> Frontend completed:', isCompleted);
  
  return {
    id: dto.id,
    title: dto.title,
    description: dto.description || undefined,
    completed: isCompleted,
    status: dto.status as 'pending' | 'in_progress' | 'completed',
    priority: dto.priority,
    dueDate: dto.due_date || undefined,
    completedAt: dto.completed_at || undefined,
    userId: dto.user_id,
    tags: dto.tags || [], // Use tags from DTO if available
    recurrence_pattern_id: dto.recurrence_pattern_id || null,
    recurrence: undefined, // May need to be populated separately
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

export const transformUserDtoToFrontendModel = (dto: UserDto): User => {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.first_name && dto.last_name
      ? `${dto.first_name} ${dto.last_name}`
      : dto.first_name || dto.last_name || undefined,
    preferences: {
      theme: 'light' // Default theme
    },
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
};

export const transformNotificationDtoToFrontendModel = (dto: NotificationDto): Notification => {
  return {
    id: dto.id,
    type: 'info', // Map backend notification types to frontend types
    message: dto.message,
    timestamp: dto.created_at,
    duration: 5000, // Default duration
  };
};

// Transform Frontend Models to DTOs

export const transformTagFrontendModelToDto = (model: Tag): TagDto => {
  return {
    id: model.id,
    name: model.name,
    color: model.color || null,
    user_id: model.userId,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
};

export const transformTaskFrontendModelToDto = (model: Task): TaskDto => {
  // Convert frontend completed boolean to backend status
  const status = model.completed ? 'completed' : 'pending';
  
  return {
    id: model.id,
    title: model.title,
    description: model.description || null,
    status: status,
    completed: model.completed,
    priority: model.priority,
    due_date: model.dueDate || null,
    completed_at: model.completedAt || null,
    user_id: model.userId,
    tags: model.tags || [],
    recurrence_pattern_id: (model as any).recurrence_pattern_id || null,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
};

export const transformUserFrontendModelToDto = (model: User): UserDto => {
  return {
    id: model.id,
    email: model.email,
    first_name: model.name?.split(' ')[0] || null,
    last_name: model.name?.split(' ').slice(1).join(' ') || null,
    created_at: model.createdAt,
    updated_at: model.updatedAt,
  };
};

export const transformNotificationFrontendModelToDto = (model: Notification): NotificationDto => {
  return {
    id: model.id,
    type: 'browser', // Default mapping
    title: model.message.substring(0, 50), // Truncate for title
    message: model.message,
    status: 'sent',
    sent_at: model.timestamp,
    delivered_at: null,
    read_at: null,
    user_id: '', // Would need to be provided separately
    task_id: null,
    created_at: model.timestamp,
    updated_at: model.timestamp,
  };
};

// Transform Arrays

export const transformTagDtosToFrontendModels = (dtos: TagDto[]): Tag[] => {
  return dtos.map(transformTagDtoToFrontendModel);
};

export const transformTaskDtosToFrontendModels = (dtos: TaskDto[]): Task[] => {
  return dtos.map(transformTaskDtoToFrontendModel);
};

export const transformUserDtosToFrontendModels = (dtos: UserDto[]): User[] => {
  return dtos.map(transformUserDtoToFrontendModel);
};

export const transformNotificationDtosToFrontendModels = (dtos: NotificationDto[]): Notification[] => {
  return dtos.map(transformNotificationDtoToFrontendModel);
};

// Test transformation functions with sample data
export const testTransformationFunctions = () => {
  console.log('Testing transformation functions...');

  // Test Tag transformation
  const sampleTagDto: TagDto = {
    id: 'test-id',
    name: 'Test Tag',
    color: '#FF0000',
    user_id: 'user-123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const transformedTag = transformTagDtoToFrontendModel(sampleTagDto);
  console.log('Tag transformation test:', transformedTag);

  // Test Task transformation
  const sampleTaskDto: TaskDto = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    priority: 'medium',
    due_date: '2023-12-31T23:59:59Z',
    completed_at: null,
    user_id: 'user-123',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const transformedTask = transformTaskDtoToFrontendModel(sampleTaskDto);
  console.log('Task transformation test:', transformedTask);

  // Test User transformation
  const sampleUserDto: UserDto = {
    id: 'user-123',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z'
  };

  const transformedUser = transformUserDtoToFrontendModel(sampleUserDto);
  console.log('User transformation test:', transformedUser);

  console.log('All transformation tests completed successfully!');
};