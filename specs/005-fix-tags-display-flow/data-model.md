# Data Model: Fix Tags Display Flow

## DTOs (Backend Representation - snake_case)

### TagDto
- `id: string` - Unique identifier for the tag
- `name: string` - Name of the tag
- `color: string | null` - Color code for the tag (optional)
- `user_id: string` - ID of the user who owns the tag
- `created_at: string` - Timestamp when the tag was created
- `updated_at: string` - Timestamp when the tag was last updated

### TaskDto
- `id: string` - Unique identifier for the task
- `title: string` - Title of the task
- `description: string | null` - Description of the task (optional)
- `completed: boolean` - Whether the task is completed
- `priority: 'low' | 'medium' | 'high'` - Priority level of the task
- `due_date: string | null` - Due date for the task (optional)
- `completed_at: string | null` - Timestamp when task was completed (optional)
- `user_id: string` - ID of the user who owns the task
- `created_at: string` - Timestamp when the task was created
- `updated_at: string` - Timestamp when the task was last updated

### UserDto
- `id: string` - Unique identifier for the user
- `email: string` - Email address of the user
- `first_name: string | null` - First name of the user (optional)
- `last_name: string | null` - Last name of the user (optional)
- `created_at: string` - Timestamp when the user was created
- `updated_at: string` - Timestamp when the user was last updated

### NotificationDto
- `id: string` - Unique identifier for the notification
- `type: 'email' | 'browser' | 'push'` - Type of notification
- `title: string` - Title of the notification
- `message: string` - Content of the notification
- `status: 'sent' | 'delivered' | 'read' | 'failed'` - Status of the notification
- `sent_at: string | null` - Timestamp when notification was sent (optional)
- `delivered_at: string | null` - Timestamp when notification was delivered (optional)
- `read_at: string | null` - Timestamp when notification was read (optional)
- `user_id: string` - ID of the user who receives the notification
- `task_id: string | null` - ID of the associated task (optional)
- `created_at: string` - Timestamp when the notification was created
- `updated_at: string` - Timestamp when the notification was last updated

## Frontend Models (camelCase)

### Tag
- `id: string` - Unique identifier for the tag
- `name: string` - Name of the tag
- `color: string` - Color code for the tag (with default)
- `userId: string` - ID of the user who owns the tag
- `createdAt: string` - Timestamp when the tag was created
- `updatedAt: string` - Timestamp when the tag was last updated
- `taskCount: number` - Number of tasks associated with this tag

### Task
- `id: string` - Unique identifier for the task
- `title: string` - Title of the task
- `description: string | undefined` - Description of the task (optional)
- `completed: boolean` - Whether the task is completed
- `priority: 'low' | 'medium' | 'high'` - Priority level of the task
- `dueDate: string | undefined` - Due date for the task (optional)
- `completedAt: string | undefined` - Timestamp when task was completed (optional)
- `userId: string` - ID of the user who owns the task
- `tags: string[]` - IDs of tags associated with the task
- `recurrence?: { pattern: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval: number }` - Recurrence pattern (optional)
- `createdAt: string` - Timestamp when the task was created
- `updatedAt: string` - Timestamp when the task was last updated

### User
- `id: string` - Unique identifier for the user
- `email: string` - Email address of the user
- `name?: string` - Full name of the user (optional)
- `preferences?: { theme?: 'light' | 'dark' }` - User preferences (optional)
- `createdAt: string` - Timestamp when the user was created
- `updatedAt: string` - Timestamp when the user was last updated
- `authenticationStatus?: 'authenticated' | 'unauthenticated' | 'pending'` - User's authentication status

### Notification
- `id: string` - Unique identifier for the notification
- `type: 'success' | 'error' | 'warning' | 'info'` - Type of notification for UI
- `message: string` - Content of the notification
- `timestamp: string` - Timestamp when the notification was created
- `duration?: number` - Duration to show notification (optional)

## Transformation Functions

### Tag Transformation
- `transformTagDtoToFrontendModel(dto: TagDto): Tag`
- `transformTagFrontendModelToDto(model: Tag): TagDto`
- `transformTagDtosToFrontendModels(dtos: TagDto[]): Tag[]`

### Task Transformation
- `transformTaskDtoToFrontendModel(dto: TaskDto): Task`
- `transformTaskFrontendModelToDto(model: Task): TaskDto`
- `transformTaskDtosToFrontendModels(dtos: TaskDto[]): Task[]`

### User Transformation
- `transformUserDtoToFrontendModel(dto: UserDto): User`
- `transformUserFrontendModelToDto(model: User): UserDto`
- `transformUserDtosToFrontendModels(dtos: UserDto[]): User[]`

### Notification Transformation
- `transformNotificationDtoToFrontendModel(dto: NotificationDto): Notification`
- `transformNotificationFrontendModelToDto(model: Notification): NotificationDto`
- `transformNotificationDtosToFrontendModels(dtos: NotificationDto[]): Notification[]`

## State Management

### Tags State
- `tags: Tag[]` - Array of all tags for the current user
- `loading: boolean` - Loading state for tag operations
- `error: string | null` - Error state for tag operations