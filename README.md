# Full-Stack Todo Application (Phase II)

This is a full-stack web application for managing todo tasks, built with FastAPI (backend) and Next.js (frontend).

## Features

- User authentication and authorization
- Create, read, update, and delete tasks
- Assign priorities (high/medium/low) to tasks
- Add tags to tasks for better organization
- Search, filter, and sort tasks
- Recurring tasks with customizable patterns
- Due dates and reminders
- Light/dark theme support
- Responsive design for all device sizes

## Tech Stack

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, PostgreSQL
- **Frontend**: Next.js 14+, TypeScript, Redux Toolkit, Material UI
- **Authentication**: JWT tokens
- **Database**: PostgreSQL (with SQLite for development)

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- Docker and Docker Compose (optional, for containerized deployment)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
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
   # Edit .env with your configuration
   ```

5. Initialize the database:
   ```bash
   python -m src.database.init_db
   ```

6. Run the development server:
   ```bash
   uvicorn src.main:app --reload
   ```

The backend will be available at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`.

## API Documentation

API documentation is available at `http://localhost:8000/docs` when the backend is running.

## Running with Docker

To run the entire application with Docker:

```bash
docker-compose up --build
```

The services will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- Database: accessible internally

## Testing

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
# Or for watch mode
npm run test:watch
```

## Project Structure

```
multi-phase-todo/
├── backend/
│   ├── src/
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   ├── api/         # API routes
│   │   ├── database/    # Database utilities
│   │   └── core/        # Configuration and security
│   ├── tests/           # Backend tests
│   ├── requirements.txt # Python dependencies
│   └── .env            # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Next.js pages
│   │   ├── services/    # API clients
│   │   ├── store/       # Redux store
│   │   └── types/       # TypeScript types
│   ├── public/          # Static assets
│   ├── package.json     # Node.js dependencies
│   └── .env.local      # Environment variables
├── specs/               # Feature specifications
├── docs/                # Documentation
└── docker-compose.yml   # Docker configuration
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.