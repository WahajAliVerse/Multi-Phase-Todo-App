# Quickstart Guide: Phase 2 Bug Fixes and Enhancements for Full-Stack Todo App

## Overview
This guide provides instructions for setting up, running, and testing the full-stack Todo application after implementing the bug fixes and enhancements identified in the root cause analysis.

## Prerequisites
- Python 3.12+
- Node.js 18+ (for frontend development)
- PostgreSQL (for production) or SQLite (for development)
- Docker and Docker Compose (optional, for containerized deployment)

## Setup Instructions

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

5. Run database migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the backend server:
   ```bash
   uvicorn src.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your specific configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Running the Application

### Development Mode
1. Start the backend server (see above)
2. In a separate terminal, start the frontend server (see above)
3. Access the application at `http://localhost:3000`

### Production Mode
1. Build the frontend:
   ```bash
   cd frontend && npm run build
   ```

2. Start the backend with production settings:
   ```bash
   cd backend && uvicorn src.main:app --host 0.0.0.0 --port 8000
   ```

### Using Docker
1. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

## Testing

### Backend Tests
Run all backend tests:
```bash
cd backend
pytest
```

Run specific test files:
```bash
pytest tests/unit/test_auth_service.py
```

Run tests with coverage:
```bash
pytest --cov=src
```

### Frontend Tests
Run all frontend tests:
```bash
cd frontend
npm run test
```

Run specific test files:
```bash
npm run test -- src/components/LoginForm.test.tsx
```

### End-to-End Tests
Run end-to-end tests:
```bash
npm run test:e2e
```

## Key Fixes Implemented

### Authentication Fixes
- Consolidated JWT implementations into a single module (`src/core/security.py`)
- Fixed token payload mismatch (now consistently using "sub" field)
- Standardized authentication method to cookie-based approach

### Security Improvements
- Restricted CORS configuration to specific origins and methods
- Implemented proper session management
- Improved input validation and sanitization

### Performance Optimizations
- Added database indexes to frequently queried fields (status, priority, due_date)
- Fixed N+1 query problems in task service
- Optimized database queries with proper joins and eager loading

### Code Quality Improvements
- Removed duplicate JWT implementations
- Standardized error handling with specific exception classes
- Improved logging for debugging

## API Endpoints

### Authentication
- `POST /auth/login` - User login with JWT token in HTTP-only cookie
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user info

### Tasks
- `GET /tasks` - Get all tasks for current user
- `POST /tasks` - Create a new task
- `GET /tasks/{id}` - Get a specific task
- `PUT /tasks/{id}` - Update a task
- `DELETE /tasks/{id}` - Delete a task

### Tags
- `GET /tags` - Get all tags for current user
- `POST /tags` - Create a new tag
- `GET /tags/{id}` - Get a specific tag
- `PUT /tags/{id}` - Update a tag
- `DELETE /tags/{id}` - Delete a tag

## Troubleshooting

### Common Issues
1. **Authentication failures**: Check that token payload structure is consistent across all modules
2. **CORS errors**: Verify that your frontend origin is included in the allowed origins
3. **Database connection issues**: Ensure your database is running and credentials are correct
4. **Performance issues**: Check that database indexes have been created properly

### Debugging Tips
- Enable debug logging by setting `DEBUG=true` in your environment
- Check the logs in the respective backend and frontend consoles
- Use browser developer tools to inspect network requests and cookies

## Next Steps
1. Review the updated API documentation at `/docs`
2. Run the full test suite to ensure all fixes are working correctly
3. Perform security scanning to verify vulnerabilities have been addressed
4. Load test the application to verify performance improvements