# Quickstart Guide

## Prerequisites

- Node.js 18+ (for Next.js frontend)
- Python 3.12+ (for FastAPI backend)
- SQLite (or PostgreSQL for production)
- npm or yarn package manager

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd multi-phase-todo
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration values
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
# or
yarn install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration values
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL=sqlite:///./todo_app.db
JWT_SECRET=your-super-secret-jwt-key
PORT=8000
NODE_ENV=development
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_APP_NAME=Todo App
NODE_ENV=development
```

## Running the Application

### 1. Start the Backend

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn src.main:app --reload --port 8000
```

### 2. Start the Frontend

```bash
cd frontend
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## Running Tests

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
# or
yarn test
```

## Running in Production

### Backend

```bash
cd backend
source venv/bin/activate
# Deploy with gunicorn or similar WSGI server
gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
cd frontend
npm run build
npm start
# or
yarn build
yarn start
```

## Database Migrations

```bash
cd backend
source venv/bin/activate
# Run database migrations
python -m src.database.migrate
```

## API Documentation

The API documentation is available at:
- Development: `http://localhost:8000/docs`
- Production: `<your-domain>/docs`

## Troubleshooting

### Common Issues

1. **Port already in use**: Change the PORT environment variable in .env files
2. **Database connection errors**: Verify DATABASE_URL in backend .env file
3. **Frontend can't connect to backend**: Ensure NEXT_PUBLIC_API_URL is correctly set in frontend .env.local
4. **Dependency installation fails**: Try clearing cache (`npm cache clean --force` or `yarn cache clean`)