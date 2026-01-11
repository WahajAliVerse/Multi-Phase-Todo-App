# Full-Stack Todo Application

This is a full-stack web application that provides task management functionality with a modern UI/UX. The application allows users to manage their tasks with features like priorities, tags, search/filter/sort capabilities, recurring tasks, and due date reminders.

## Tech Stack

- **Backend**: Python 3.12+, FastAPI, SQLAlchemy, SQLite
- **Frontend**: Next.js, TypeScript, Redux Toolkit, Material UI
- **Authentication**: JWT-based with refresh tokens
- **Database**: SQLite with migration path to PostgreSQL

## Features

- Modern UI with light/dark themes
- Core task management (create, read, update, delete, mark complete)
- Task organization with priorities and tags
- Search, filter, and sort functionality
- Recurring tasks management
- Due dates and reminders
- Responsive design for desktop and mobile

## Setup

### Backend

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
   pip install poetry
   poetry install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run the application:
   ```bash
   poetry run uvicorn src.main:app --reload
   ```

### Frontend

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
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## API Documentation

The API is documented using OpenAPI 3.0. You can access the interactive documentation at:
- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Testing

### Backend Tests
```bash
# Run all backend tests
cd backend
poetry run pytest

# Run with coverage
poetry run pytest --cov=src
```

### Frontend Tests
```bash
# Run all frontend tests
cd frontend
npm test
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.