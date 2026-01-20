# Quickstart Guide: Full-Stack Web Application (Phase II)

## Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.12+
- pip package manager
- Git

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your configuration
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
cp .env.local.example .env.local
# Edit .env.local file with your configuration
```

### 4. Database Setup
```bash
# From backend directory
# Initialize the database
python -c "from src.database.connection import engine; from src.database.base import Base; Base.metadata.create_all(bind=engine)"

# Or run the main application which will create tables
python main.py
```

### 5. Running the Applications

#### Backend
```bash
# From backend directory
python -m uvicorn main:app --reload
```

#### Frontend
```bash
# From frontend directory
npm run dev
# or
yarn dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./todo_app.db
JWT_SECRET=your-super-secret-jwt-secret
PORT=8000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## API Endpoints
- Backend API: `http://localhost:8000/api/v1/`
- Frontend: `http://localhost:3000`

## Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
cd frontend
npm run test
# or
yarn test
```

## Building for Production
```bash
# Frontend
cd frontend
npm run build
# or
yarn build

# Backend (using Docker)
docker build -t todo-backend .
docker run -p 8000:8000 todo-backend
```