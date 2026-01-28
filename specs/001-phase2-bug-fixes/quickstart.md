# Quickstart Guide for Phase 2 Todo Application

## Overview
This guide provides instructions for setting up and running the Phase 2 Todo Application with all bug fixes and enhancements implemented.

## Prerequisites
- Python 3.12+
- Node.js 18+ and npm/yarn
- PostgreSQL (for production) or SQLite (for development)
- Git

## Backend Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <repository-name>
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Set Up Environment Variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 5. Initialize Database
```bash
python -m src.database.init_db
```

### 6. Run Backend Server
```bash
uvicorn src.main:app --reload
```

The backend will be available at `http://localhost:8000`.

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend  # From repository root
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

### 4. Run Frontend Development Server
```bash
npm run dev
# or
yarn dev
```

The frontend will be available at `http://localhost:3000`.

## API Documentation
API documentation is available at `http://localhost:8000/docs` when the backend is running.

## Running Tests

### Backend Tests
```bash
# Run all backend tests
cd backend
source venv/bin/activate
pytest

# Run tests with coverage
pytest --cov=src --cov-report=html
```

### Frontend Tests
```bash
# Run all frontend tests
cd frontend
npm test
# or for watch mode
npm run test:watch

# Run end-to-end tests
npm run e2e
```

## Key Features Setup

### 1. Authentication
- Register a new user via the `/auth/register` endpoint
- Login via the `/auth/login` endpoint to get JWT tokens
- Include the token in the `Authorization` header as `Bearer <token>` for protected endpoints

### 2. CORS Configuration
- The backend is configured to allow requests from `localhost:3000`, `localhost:3001`, and `localhost:3002`
- All necessary methods and headers are allowed for frontend-backend communication

### 3. Dark Mode
- Toggle between light and dark themes using the theme toggle in the UI
- Theme preference is saved in user settings

### 4. PWA Features
- The application is configured as a Progressive Web App
- Install the PWA to access offline functionality
- Sync data when connectivity is restored

## Troubleshooting

### Common Issues

#### 1. CORS Errors
- Ensure the backend is running on `localhost:8000`
- Verify that the frontend is running on one of the allowed origins (`localhost:3000`, `localhost:3001`, `localhost:3002`)

#### 2. Authentication Issues
- Ensure JWT tokens are properly stored and included in API requests
- Check that tokens are not expired
- Verify that the `Authorization` header is formatted correctly as `Bearer <token>`

#### 3. Database Connection Issues
- Verify that the database URL in your `.env` file is correct
- Ensure the database server is running
- Run the database initialization script if needed

#### 4. Frontend Build Issues
- Clear node_modules and reinstall dependencies if encountering build errors
- Ensure you're using the correct Node.js version (18+)

## Production Deployment

### Backend
```bash
# Build and run with gunicorn
pip install gunicorn
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend
```bash
# Build for production
npm run build

# Serve with a production server
npm run start
```

## Environment Variables

### Backend (.env)
- `SECRET_KEY`: Secret key for JWT signing (generate a strong random key)
- `DATABASE_URL`: Database connection string (e.g., `sqlite:///./todo_app.db` or `postgresql://user:pass@localhost/dbname`)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Token expiration time in minutes (default: 30)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Refresh token expiration time in days (default: 7)

### Frontend (.env.local)
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `http://localhost:8000`)
- `NEXT_PUBLIC_APP_NAME`: Name of the application
- `NEXT_PUBLIC_DEFAULT_THEME`: Default theme (light or dark)

## Security Best Practices
- Store JWT tokens securely (preferably in httpOnly cookies)
- Use HTTPS in production
- Validate and sanitize all user inputs
- Regularly update dependencies
- Monitor authentication logs for suspicious activity