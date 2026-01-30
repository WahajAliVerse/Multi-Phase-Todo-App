# Quickstart Guide: Phase 2 Bug Fixes and Enhancements for Full-Stack Todo App

## Prerequisites

- Python 3.12+
- Node.js 18+ / npm 9+
- Bun (alternative to npm)
- Docker and Docker Compose (optional, for containerized deployment)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd multi-phase-todo
git checkout 001-phase2-bug-fixes
```

### 2. Backend Setup

#### Using uv (recommended):

```bash
# Navigate to backend directory
cd backend

# Install uv if you don't have it
pip install uv

# Install dependencies
uv add fastapi uvicorn python-multipart python-jose[cryptography] passlib[bcrypt] sqlalchemy asyncpg python-multipart

# Or install from requirements.txt if available
uv add -r requirements.txt
```

#### Environment Variables:

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DATABASE_URL=sqlite:///./todo_app.db
DEBUG=false
```

#### Run Backend:

```bash
# From backend directory
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies using Bun
bun install

# Or alternatively with npm:
npm install
```

#### Environment Variables:

Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Todo App
NEXT_PUBLIC_DEFAULT_THEME=light
```

#### Run Frontend:

```bash
# From frontend directory
bun run dev
# or
npm run dev
```

The frontend will be available at http://localhost:3000

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user info (requires auth)
- `POST /auth/logout` - User logout

### Tasks
- `GET /tasks` - Get all tasks (with optional filters)
- `POST /tasks` - Create a new task
- `GET /tasks/{id}` - Get a specific task
- `PUT /tasks/{id}` - Update a specific task
- `DELETE /tasks/{id}` - Delete a specific task

### Tags
- `GET /tags` - Get all tags
- `POST /tags` - Create a new tag
- `PUT /tags/{id}` - Update a tag
- `DELETE /tags/{id}` - Delete a tag

### Recurring Tasks
- `POST /recurring-patterns` - Create a recurrence pattern
- `PUT /recurring-patterns/{id}` - Update a recurrence pattern
- `DELETE /recurring-patterns/{id}` - Delete a recurrence pattern

## Running Tests

### Backend Tests

```bash
# From backend directory
python -m pytest tests/ -v
```

### Frontend Tests

```bash
# From frontend directory
bun run test
# or
npm run test
```

### End-to-End Tests

```bash
# From project root
cd e2e
bun install
bun run cypress open
```

## Building for Production

### Backend

```bash
# From backend directory
uv build
# Or simply deploy with uvicorn in production mode
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
# From frontend directory
bun run build
bun run start
```

## Docker Deployment

If you prefer containerized deployment:

```bash
# From project root
docker-compose up --build
```

This will start both frontend and backend services with all dependencies.

## Troubleshooting

### Common Issues

1. **CORS errors**: Make sure backend allows requests from frontend origin (localhost:3000)
2. **Database connection errors**: Verify DATABASE_URL in backend .env file
3. **Token storage issues**: Check that JWT tokens are properly stored in localStorage with security measures
4. **PWA not working**: Ensure service worker is registered and HTTPS is enabled in production

### Useful Commands

```bash
# Check backend API status
curl http://localhost:8000/health

# Format backend code
black src/

# Format frontend code
bun run format
```