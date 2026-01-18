# Quickstart Guide: Full-Stack Web Application (Phase II)

## Prerequisites

- Python 3.12+
- Node.js 18+ and npm/yarn
- Docker and Docker Compose (for containerized deployment)
- Git

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/multi-phase-todo.git
cd multi-phase-todo
git checkout 001-fullstack-todo-app
```

### 2. Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

#### 2.3 Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2.4 Environment Configuration
Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./todo_app.db
# For PostgreSQL in production:
# DATABASE_URL=postgresql://user:password@localhost/todo_db

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Server configuration
SERVER_HOST=localhost
SERVER_PORT=8000
DEBUG=True

# CORS settings
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### 2.5 Initialize Database
```bash
# Run database migrations
python -m src.database.migrations.init_db
```

#### 2.6 Run Backend Server
```bash
# For development
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

# Or using the run script if available
python -m src.main
```

Backend will be available at `http://localhost:8000`

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
cd ../frontend  # From backend directory
```

#### 3.2 Install Dependencies
```bash
npm install
# Or if using yarn
yarn install
```

#### 3.3 Environment Configuration
Create a `.env.local` file in the frontend directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/v1
NEXT_PUBLIC_APP_NAME=Multi-Phase Todo App
NEXT_PUBLIC_DEFAULT_THEME=system  # Options: light, dark, system

# For production deployment
# NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/v1
```

#### 3.4 Run Frontend Development Server
```bash
npm run dev
# Or if using yarn
yarn dev
```

Frontend will be available at `http://localhost:3000`

### 4. Running Both Services Together

#### 4.1 Using Docker Compose (Recommended)
From the project root directory:

```bash
docker-compose up --build
```

Services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: Internal to container (not exposed)

#### 4.2 Manual Start
Open separate terminals:

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication
- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Logout: `POST /api/auth/logout`

### Tasks
- Get all tasks: `GET /api/tasks`
- Get specific task: `GET /api/tasks/{taskId}`
- Create task: `POST /api/tasks`
- Update task: `PUT /api/tasks/{taskId}`
- Delete task: `DELETE /api/tasks/{taskId}`
- Update task status: `PATCH /api/tasks/{taskId}/status`

### Tags
- Get all tags: `GET /api/tags`
- Create tag: `POST /api/tags`
- Update tag: `PUT /api/tags/{tagId}`
- Delete tag: `DELETE /api/tags/{tagId}`

## Running Tests

### Backend Tests
```bash
# From backend directory
python -m pytest tests/ -v
```

### Frontend Tests
```bash
# From frontend directory
npm run test
# Or for watch mode
npm run test:watch
```

## Production Build

### Backend
```bash
# From backend directory
pip install -r requirements-prod.txt
# Deploy with a WSGI server like Gunicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend
```bash
# From frontend directory
npm run build
npm run start  # Runs the built application
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   - Change ports in `.env` files or terminate conflicting processes

2. **Database connection errors**
   - Ensure database service is running
   - Check database URL in `.env` file

3. **Environment variables not loaded**
   - Verify `.env` files are in the correct directories
   - Restart development servers after changing environment variables

4. **Dependency conflicts**
   - Clean install: delete `node_modules` and `venv`, then reinstall dependencies

### Useful Commands

```bash
# Check backend API health
curl http://localhost:8000/health

# Format backend code
black src/

# Format frontend code
npm run format
```