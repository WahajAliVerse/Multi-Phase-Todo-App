# Data Model: Frontend Web Application

## Application State
Represents the current state of the application managed by Redux Toolkit
- **Properties**:
  - `tasks`: Array of Task objects
  - `loading`: Boolean indicating if data is being loaded
  - `error`: String containing error message if any
  - `filters`: Object containing current filter settings
  - `uiState`: Object containing UI-specific state (modals, selections, etc.)
  - `auth`: Object containing authentication state (token, user info, etc.)

## Task
Represents a single task in the application
- **Properties**:
  - `id`: Unique identifier for the task
  - `title`: String representing the task title (1-100 characters)
  - `description`: String with detailed task description (0-1000 characters)
  - `status`: Enum ('pending', 'in-progress', 'completed')
  - `priority`: Enum ('low', 'medium', 'high')
  - `tags`: Array of strings representing categories
  - `dueDate`: Date object for when the task is due
  - `createdAt`: Date object for creation timestamp
  - `updatedAt`: Date object for last update timestamp
  - `assignedTo`: String identifying who the task is assigned to (optional)

## User
Represents a user of the application
- **Properties**:
  - `id`: Unique identifier for the user
  - `name`: String with the user's name
  - `email`: String with the user's email address (follows standard email format)
  - `preferences`: Object containing user preferences (theme, notification settings, etc.)
  - `jwtToken`: String containing the JWT authentication token

## Filter
Represents filtering criteria applied to task lists
- **Properties**:
  - `status`: Optional enum to filter by task status
  - `priority`: Optional enum to filter by task priority
  - `tags`: Optional array of tags to filter by
  - `searchQuery`: Optional string for text-based search
  - `dueDateRange`: Optional object with start/end dates for due date filtering

## API Response
Standardized response format from backend APIs
- **Properties**:
  - `success`: Boolean indicating if the request was successful
  - `data`: Object containing the response data
  - `message`: Optional string with additional information
  - `errors`: Optional array of error objects if the request failed

## Authentication State
Represents the authentication state in the application
- **Properties**:
  - `isLoggedIn`: Boolean indicating if user is authenticated
  - `token`: String containing JWT token
  - `user`: User object containing user information
  - `isLoading`: Boolean indicating if auth state is being loaded
  - `error`: String containing error message if auth failed

## Validation Rules
- Task titles must be 1-100 characters
- Task descriptions must be 0-1000 characters
- Due dates must be valid dates in the future (for new tasks)
- Priority values must be one of the defined enums ('low', 'medium', 'high')
- Tags must be alphanumeric with hyphens/underscores, 2-30 characters each
- Email addresses must follow standard email format
- JWT tokens must be properly formatted

## State Transitions
- Task status can transition from 'pending' → 'in-progress' → 'completed'
- Task status can transition from 'completed' → 'pending' (reopening)
- Task status can transition from 'in-progress' → 'pending' (pausing)
- Authentication state can transition from 'unauthenticated' → 'authenticated' → 'unauthenticated'

## Client-Side Storage Model
- **Local Storage Keys**:
  - `authState`: Stores authentication information (token, user details)
  - `appPreferences`: Stores user preferences (theme, language, etc.)
  - `recentFilters`: Stores recently used filter settings
  - `offlineCache`: Stores cached API responses for offline access