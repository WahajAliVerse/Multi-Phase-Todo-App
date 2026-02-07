# Quickstart Guide: Phase 2 Todo Application

## Prerequisites

- Node.js 18+ and bun package manager
- Python 3.12+
- uv package manager
- Docker (for local development)
- Access to Neon serverless database

## Setting Up the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```
   
   Or if you don't have uv installed:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Neon database credentials and other settings
   ```

4. Run database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the development server:
   ```bash
   uv run dev
   ```
   
   Or:
   ```bash
   python -m uvicorn src.main:app --reload
   ```

## Setting Up the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies using bun:
   ```bash
   bun install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your backend API URL and other settings
   ```

4. Start the development server:
   ```bash
   bun run dev
   ```

## Key Architecture Patterns

### Backend Architecture
- **Repository Pattern**: Abstracts data access logic in `src/repositories/`
- **Service Layer**: Business logic in `src/services/`
- **Dependency Injection**: Managed through FastAPI's dependency system in `src/api/deps.py`
- **OOP Design**: Models in `src/models/` inherit from SQLModel for type safety

### Frontend Architecture
- **Redux Toolkit**: State management in `src/lib/store/`
- **Single Modal Pattern**: Task creation/editing handled by one modal with Redux state (0=create, 1=edit)
- **Component Structure**: Organized in `src/components/ui/` and `src/components/layout/`
- **API Layer**: Abstraction in `src/lib/api/` for all backend communications

## Running Tests

### Backend Tests
```bash
# Run all tests
pytest

# Run unit tests
pytest tests/unit/

# Run integration tests
pytest tests/integration/

# Run with coverage
pytest --cov=src
```

### Frontend Tests
```bash
# Run unit tests
bun run test

# Run integration tests
bun run test:integration

# Run end-to-end tests
bun run test:e2e
```

## Key Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks with filtering/sorting
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Tags
- `GET /api/tags` - Get all tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/{id}` - Update tag
- `DELETE /api/tags/{id}` - Delete tag

## Common Development Tasks

### Adding a New Model
1. Create the model in `backend/src/models/`
2. Create the corresponding schema in `backend/src/schemas/`
3. Create a repository in `backend/src/repositories/`
4. Create a service in `backend/src/services/`
5. Add API endpoints in `backend/src/api/`

### Adding a New Component
1. Create the component in `frontend/src/components/ui/`
2. Add TypeScript types in `frontend/src/lib/types/`
3. Connect to Redux store if needed in `frontend/src/lib/store/slices/`
4. Create API functions in `frontend/src/lib/api/` if needed

### Adding a New Page
1. Create the page in `frontend/src/app/` using the App Router
2. Connect to the required data via API calls
3. Update navigation if needed

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: Neon database connection string
- `SECRET_KEY`: Secret key for JWT signing
- `ALGORITHM`: Hash algorithm (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time
- `EMAIL_HOST`: SMTP host for sending emails
- `EMAIL_PORT`: SMTP port
- `EMAIL_USERNAME`: SMTP username
- `EMAIL_PASSWORD`: SMTP password

### Frontend (.env)
- `NEXT_PUBLIC_API_BASE_URL`: Base URL for backend API
- `NEXT_PUBLIC_APP_NAME`: Name of the application
- `NEXT_PUBLIC_SENTRY_DSN`: Sentry DSN for error tracking (optional)

## Troubleshooting

### Common Issues
1. **Database Connection**: Ensure Neon database is properly configured and accessible
2. **CORS Errors**: Check backend CORS settings in `src/main.py`
3. **Cookie Authentication**: Ensure frontend and backend are served from compatible domains/ports
4. **Rate Limiting**: Check rate limiter configuration in `src/core/rate_limiter.py`

### Development Tips
1. Use the API documentation at `/docs` when running the backend
2. Check Redux DevTools for state management debugging
3. Use the browser's Network tab to inspect API requests
4. Enable debug logging in the backend for detailed request/response information