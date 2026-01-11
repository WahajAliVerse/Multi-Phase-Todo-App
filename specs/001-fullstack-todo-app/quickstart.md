# Quickstart Guide for Full-Stack Todo Application

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm/yarn
- Git
- SQLite (usually pre-installed on most systems)

## Setting Up the Backend

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd multi-phase-todo/backend
   ```

2. **Set up Python virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Run database migrations:**
   ```bash
   python -m src.database.migrate
   ```

6. **Start the backend server:**
   ```bash
   uvicorn src.main:app --reload --port 8000
   ```

## Setting Up the Frontend

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend  # From repository root
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (API URL, etc.)
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Running Tests

### Backend Tests
```bash
# Run all backend tests
cd backend
python -m pytest

# Run with coverage
python -m pytest --cov=src
```

### Frontend Tests
```bash
# Run all frontend tests
cd frontend
npm test
# or
yarn test
```

## API Documentation

The API is documented using OpenAPI 3.0. You can access the interactive documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Environment Variables

### Backend (.env)
- `DATABASE_URL`: Database connection string (default: sqlite:///./todo.db)
- `SECRET_KEY`: Secret key for JWT tokens
- `ALGORITHM`: Hashing algorithm for JWT (default: HS256)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time (default: 7)

### Frontend (.env)
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)
- `NEXT_PUBLIC_APP_NAME`: Application name (default: Todo App)

## Key Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT tokens
- `POST /auth/refresh` - Refresh access token

### Tasks
- `GET /tasks` - Get all tasks with filtering/sorting options
- `POST /tasks` - Create a new task
- `GET /tasks/{id}` - Get a specific task
- `PUT /tasks/{id}` - Update a task (includes optimistic locking via version field)
- `DELETE /tasks/{id}` - Delete a task
- `POST /tasks/{id}/complete` - Mark task as complete
- `POST /tasks/{id}/reopen` - Reopen completed task

### Tags
- `GET /tags` - Get all tags
- `POST /tags` - Create a new tag
- `PUT /tags/{id}` - Update a tag
- `DELETE /tags/{id}` - Delete a tag

## Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to both backend and frontend as needed

3. Write tests for your new functionality

4. Run the test suites to ensure everything works:
   ```bash
   # Backend
   cd backend && python -m pytest
   # Frontend
   cd frontend && npm test
   ```

5. Commit your changes with a descriptive message:
   ```bash
   git add .
   git commit -m "feat: add priority filtering to task list"
   ```

6. Push your branch and create a pull request