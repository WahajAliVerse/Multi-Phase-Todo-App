# Multi-Phase Todo Application - Complete Documentation

A comprehensive, production-ready todo application that evolved through multiple phases: from a simple console-based CLI to a full-stack web application with AI-powered task management using Qwen models via OpenRouter.

![Status](https://img.shields.io/badge/status-production--ready-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.12+-blue)
![Node](https://img.shields.io/badge/node-20+-green)
![Kubernetes](https://img.shields.io/badge/kubernetes-1.25+-blue)

---

## 📖 Table of Contents

1. [Project Overview](#-project-overview)
2. [Evolution Phases](#-evolution-phases)
3. [Complete Feature List](#-complete-feature-list)
4. [Architecture](#-architecture)
5. [Tech Stack](#-tech-stack)
6. [API Reference](#-api-reference)
7. [Database Schema](#-database-schema)
8. [Frontend Routes](#-frontend-routes)
9. [AI Integration](#-ai-integration)
10. [Installation](#-installation)
11. [Configuration](#-configuration)
12. [Testing](#-testing)
13. [Project Structure](#-project-structure)
14. [DevOps & Deployment](#-devops--deployment)
15. [Security](#-security)
16. [Performance](#-performance)
17. [Contributing](#-contributing)
18. [Troubleshooting](#-troubleshooting)

---

## 🎯 Project Overview

The Multi-Phase Todo Application is a comprehensive task management system that demonstrates modern full-stack development practices. Starting as a simple console-based Python application, it has evolved into a sophisticated web application featuring:

- **Full-Stack Web Interface**: Modern React/Next.js frontend with Material UI
- **RESTful API**: FastAPI backend with JWT authentication
- **AI-Powered Assistance**: Natural language task management using Qwen models
- **Cloud-Native Deployment**: Docker and Kubernetes support
- **Production-Ready**: Rate limiting, caching, monitoring, and comprehensive testing

The application is designed with modularity and extensibility in mind, following best practices for security, performance, and maintainability.

---

## 🚀 Evolution Phases

### Phase 1: Console-Based Todo App (Foundation)

**Status**: ✅ Complete | **Location**: `specs/001-console-todo-app/`

A simple in-memory Python console application for task management.

**Features**:
- ➕ Add tasks with title (1-255 chars) and optional description (0-1000 chars)
- 📋 View all tasks with IDs, titles, and completion status
- ✅ Mark tasks as complete/incomplete by ID
- ✏️ Update task details (title/description) by ID
- 🗑️ Delete tasks by ID
- 🛡️ Error handling for invalid IDs and empty lists
- ⚡ Performance target: <100ms for all operations

**Technical Highlights**:
- In-memory storage using Python lists/dicts (no persistence)
- Auto-incrementing unique IDs to prevent duplicates
- Console-based menu interface
- Input validation and error messages
- Modular design for future extensibility

**Quick Start**:
```python
# Run the console app
python backend/todo-backend/console_app.py

# Menu Options:
# 1. Add Task
# 2. View Task List
# 3. Mark Task as Complete
# 4. Update Task
# 5. Delete Task
# 6. Exit
```

---

### Phase 2: Full-Stack Web Application

**Status**: ✅ Complete | **Location**: `specs/001-phase2-todo-app/`

A production-ready web application with FastAPI backend and Next.js frontend.

**New Features**:
- 🔐 User authentication with JWT tokens
- 🗄️ Persistent storage with SQLite/PostgreSQL
- 🏷️ Tag management system
- 🔍 Advanced search, filter, and sort
- 📅 Due dates and recurring tasks
- 🔔 Notifications and reminders
- 🌓 Light/dark theme support
- 📱 Responsive design

---

### Phase 3: AI-Powered Features

**Status**: ✅ Complete | **Location**: `specs/001-ai-task-assistant/`

Integration of Qwen AI models for natural language task management.

**New Features**:
- 🤖 Conversational task management
- 🎯 Intent recognition for quick actions
- 📝 Natural language task creation
- 🔍 Smart search and filtering
- 💬 Context-aware suggestions

---

## ✨ Complete Feature List

### Core Task Management

#### Task Operations
- ✅ **Create Tasks**: Add new tasks with title, description, priority, due date
- ✅ **Read Tasks**: View individual tasks or task lists
- ✅ **Update Tasks**: Modify task details (title, description, status, priority, due date)
- ✅ **Delete Tasks**: Remove tasks permanently
- ✅ **Bulk Operations**: Complete or delete multiple tasks at once
- ✅ **Task Status**: Pending, In Progress, Completed
- ✅ **Task Priority**: Low, Medium, High with color coding
- ✅ **Task Completion**: Mark tasks complete with timestamp

#### Advanced Task Features
- 🔁 **Recurring Tasks**: Daily, weekly, monthly, yearly patterns with custom intervals
- 📅 **Due Dates**: With timezone support and natural language parsing
- ⏰ **Reminders**: Browser notifications and email reminders
- 🔍 **Search**: Full-text search in titles and descriptions
- 🎯 **Filtering**: By status, priority, due date, tags, date ranges
- 📊 **Sorting**: By due date, priority, alphabetical, created date
- 📄 **Pagination**: Configurable page sizes (default 100, max 1000)

### Tag Management

- 🏷️ **Create Tags**: Custom tags with names and colors
- 🏷️ **Edit Tags**: Update tag names and colors
- 🏷️ **Delete Tags**: Remove unused tags
- 🏷️ **Assign Tags**: Link tags to tasks for organization
- 🏷️ **Filter by Tags**: View tasks with specific tags
- 🏷️ **Color Coding**: Hex color codes for visual organization

### User Management & Authentication

- 🔐 **User Registration**: Create new user accounts
- 🔐 **User Login**: JWT-based authentication
- 🔐 **Token Management**: Access and refresh tokens
- 🔐 **Password Security**: Bcrypt hashing
- 🔐 **Session Management**: Secure session handling
- 👤 **User Profiles**: View and update profile information

### AI-Powered Features (Qwen via OpenRouter)

- 🤖 **Natural Language Interface**: "Create a task to buy groceries tomorrow"
- 🎯 **Intent Recognition**: Automatically detect task operations
- 💬 **Conversational UI**: Chat-based task management
- 🔍 **Smart Search**: "Show me urgent tasks due this week"
- 📝 **Auto-Categorization**: AI suggests tags and priorities
- ⚡ **Quick Actions**: "Mark all completed", "Delete old tasks"

**Supported Models**:
- `qwen/qwen3-14b` (Default) - Balanced performance
- `qwen/qwen-2.5-72b-instruct` (Advanced) - Higher accuracy

### User Experience

- 🌓 **Theme Support**: Light and dark modes with auto-detection
- 📱 **Responsive Design**: Mobile, tablet, desktop optimized
- ⌨️ **Keyboard Shortcuts**: Power user features
- 🔔 **Toast Notifications**: Success/error feedback
- ⚡ **Real-time Updates**: Instant UI refresh
- ♿ **Accessibility**: WCAG 2.1 AA compliant
- 🎨 **Modern UI**: Material Design principles

### Security & Performance

- 🔐 **JWT Authentication**: Secure token-based auth
- 🛡️ **Rate Limiting**: 10 req/min (AI), 50 req/min (API)
- 🔒 **CORS Protection**: Configurable origins
- 🚫 **SQL Injection Prevention**: ORM with parameterized queries
- 📦 **Input Validation**: Pydantic schemas
- ⚡ **Redis Caching**: Frequently accessed data
- 📊 **Connection Pooling**: Database optimization
- 📝 **Structured Logging**: JSON logs for monitoring

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           Next.js 16+ Frontend                        │ │
│  │  • Redux Toolkit State Management                     │ │
│  │  • Material UI Components                             │ │
│  │  • React Hook Forms + Zod Validation                  │ │
│  │  • Framer Motion Animations                           │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API LAYER                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │              FastAPI Backend                          │ │
│  │  • JWT Authentication (python-jose)                   │ │
│  │  • Rate Limiting (SlowAPI)                            │ │
│  │  • CORS Middleware                                    │ │
│  │  • Request Validation (Pydantic)                      │ │
│  └───────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────┐ │
│  │           AI Agent (OpenAI Agents SDK)                │ │
│  │  • Qwen Models via OpenRouter                         │ │
│  │  • Intent Recognition                                 │ │
│  │  • Tool Execution (Task/Tag Operations)               │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ ORM (SQLModel)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                              │
│  ┌──────────────┐         ┌──────────────┐                │
│  │   SQLite     │         │    Redis     │                │
│  │ (Dev/Local)  │         │   (Cache)    │                │
│  └──────────────┘         └──────────────┘                │
│  ┌──────────────────────────────────────────────┐         │
│  │      Neon PostgreSQL (Production)            │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ API Integration
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    AI SERVICES                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │         OpenRouter (Qwen Models)                      │ │
│  │  • qwen/qwen3-14b (Default)                           │ │
│  │  • qwen/qwen-2.5-72b-instruct (Advanced)              │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Language** | Python | 3.12+ | Core programming language |
| **Framework** | FastAPI | 0.134+ | Web framework |
| **ORM** | SQLModel | 0.0.37+ | Database ORM (SQLAlchemy 2.0) |
| **Database** | SQLite / PostgreSQL | 3.x / 15+ | Data persistence |
| **Cache** | Redis | 7+ | Caching layer |
| **Auth** | python-jose | 3.5+ | JWT tokens |
| **Security** | passlib[bcrypt] | 1.7+ | Password hashing |
| **Validation** | Pydantic | 2.12+ | Data validation |
| **Rate Limiting** | SlowAPI | 0.1.9 | API rate limiting |
| **AI SDK** | openai-agents | 0.10+ | AI agent framework |
| **LLM Router** | LiteLLM | 1.82+ | Model routing |
| **Email** | emails, aiosmtplib | 0.6, 1.1.7 | Email notifications |
| **Testing** | pytest, httpx | 9.0+, 0.28+ | API testing |
| **Task Queue** | Celery | 5.6+ | Background tasks |

### Frontend Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Framework** | Next.js | 16+ | React framework |
| **Language** | TypeScript | 5.x | Type safety |
| **State** | Redux Toolkit | 2.11+ | State management |
| **Data Fetching** | RTK Query | 2.11+ | API data fetching |
| **UI Library** | Material UI | 5+ | Component library |
| **Styling** | Tailwind CSS | 4+ | Utility-first CSS |
| **Forms** | React Hook Form | 7.71+ | Form handling |
| **Validation** | Zod | 4.3+ | Schema validation |
| **Animations** | Framer Motion | 12.33+ | Animations |
| **Notifications** | react-hot-toast | 2.6+ | Toast notifications |
| **Icons** | Heroicons | 2.2+ | Icon library |
| **Charts** | Recharts | 3.7+ | Data visualization |
| **Persistence** | redux-persist | 6.0+ | State persistence |
| **Testing** | Jest, Testing Library | 29.7+ | Unit testing |

### DevOps & Infrastructure

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Containerization** | Docker | Latest | Container platform |
| **Orchestration** | Kubernetes | 1.25+ | Container orchestration |
| **Compose** | Docker Compose | 3.8+ | Multi-container setup |
| **Database** | Neon | Serverless | PostgreSQL cloud |
| **Cache** | Redis | 7-alpine | In-memory cache |
| **CI/CD** | GitHub Actions | Latest | Automation |
| **Monitoring** | Health checks | - | Service health |

---

## 📡 API Reference

### Base URL
```
Development: http://localhost:8000/api
Production:  https://api.yourdomain.com/api
```

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/auth/login
Authenticate and receive JWT tokens.

**Request**:
```json
{
  "username": "john_doe",
  "password": "securepassword123"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Task Endpoints

#### GET /api/tasks
Retrieve all tasks with filtering, sorting, and pagination.

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `skip` | int | 0 | Number of records to skip |
| `limit` | int | 100 | Number of records (max 1000) |
| `status` | string | - | Filter: pending, in_progress, completed |
| `priority` | string | - | Filter: low, medium, high |
| `search` | string | - | Search in title/description |
| `sort_by` | string | - | Sort: due_date, priority, created_at |
| `sort_order` | string | asc | Sort: asc, desc |
| `tag_ids` | string | - | Comma-separated tag UUIDs |

**Response** (200):
```json
[
  {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "pending",
    "priority": "medium",
    "due_date": "2024-01-15T10:00:00Z",
    "completed_at": null,
    "user_id": "uuid",
    "tags": [{"id": "uuid", "name": "work", "color": "#FF5733"}],
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### GET /api/tasks/{task_id}
Retrieve a specific task by ID.

**Response** (200):
```json
{
  "id": "uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "pending",
  "priority": "medium",
  "due_date": "2024-01-15T10:00:00Z",
  "tags": [...],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### POST /api/tasks
Create a new task.

**Request**:
```json
{
  "title": "Complete project",
  "description": "Finish the Multi-Phase Todo app",
  "priority": "high",
  "due_date": "2024-01-20T23:59:59Z",
  "tag_ids": ["uuid1", "uuid2"]
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "title": "Complete project",
  "description": "Finish the Multi-Phase Todo app",
  "status": "pending",
  "priority": "high",
  "due_date": "2024-01-20T23:59:59Z",
  "tags": [...],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### PUT /api/tasks/{task_id}
Update an existing task.

**Request** (all fields optional):
```json
{
  "title": "Updated title",
  "status": "completed",
  "priority": "low"
}
```

#### DELETE /api/tasks/{task_id}
Delete a task permanently.

**Response** (200):
```json
{
  "message": "Task deleted successfully"
}
```

### Tag Endpoints

#### GET /api/tags
Retrieve all user tags.

**Response** (200):
```json
[
  {
    "id": "uuid",
    "name": "work",
    "color": "#FF5733",
    "user_id": "uuid"
  }
]
```

#### POST /api/tags
Create a new tag.

**Request**:
```json
{
  "name": "personal",
  "color": "#33FF57"
}
```

#### PUT /api/tags/{tag_id}
Update a tag.

**Request**:
```json
{
  "name": "updated-name",
  "color": "#FF33A1"
}
```

#### DELETE /api/tags/{tag_id}
Delete a tag.

### AI Chat Endpoints

#### POST /api/chat
Send a message to the AI assistant.

**Request**:
```json
{
  "message": "Create a task to buy groceries tomorrow at 5pm"
}
```

**Response** (200):
```json
{
  "message": "✓ Created task \"Buy groceries\" for tomorrow at 5:00 PM",
  "action": {
    "type": "create_task",
    "task_id": "uuid",
    "confirmed": true
  }
}
```

### Rate Limits

| Endpoint Type | Limit | Window |
|--------------|-------|--------|
| GET (tasks, tags) | 10-15 req | 1 minute |
| POST/PUT/DELETE | 5 req | 1 minute |
| AI Chat | 10 req | 1 minute |

### Error Responses

All errors follow this format:

```json
{
  "status_code": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "reason": "Field required"
    }
  }
}
```

**Common Error Codes**:
- `VALIDATION_ERROR` (400): Invalid input
- `UNAUTHORIZED` (401): Missing/invalid token
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Duplicate resource
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## 🗄️ Database Schema

### User Model
```python
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    username: str = Field(unique=True, index=True, min_length=3, max_length=50)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    tasks: List[Task] = Relationship(back_populates="user")
    tags: List[Tag] = Relationship(back_populates="user")
```

### Task Model
```python
class Task(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None)
    status: TaskStatus = Field(default=TaskStatus.PENDING)  # pending, in_progress, completed
    priority: TaskPriority = Field(default=TaskPriority.MEDIUM)  # low, medium, high
    due_date: Optional[datetime] = Field(default=None)
    completed_at: Optional[datetime] = Field(default=None)
    user_id: UUID = Field(foreign_key="user.id", index=True)
    recurrence_pattern_id: Optional[UUID] = Field(default=None, foreign_key="recurrencepattern.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="tasks")
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model=TaskTag)
    recurrence_pattern: Optional[RecurrencePattern] = Relationship(back_populates="tasks")
    notifications: List[Notification] = Relationship(back_populates="task")
```

### Tag Model
```python
class Tag(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(min_length=1, max_length=50)
    color: Optional[str] = Field(default="#808080", max_length=7)  # Hex color
    user_id: UUID = Field(foreign_key="user.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: User = Relationship(back_populates="tags")
    tasks: List[Task] = Relationship(back_populates="tags", link_model=TaskTag)
```

### TaskTag Association (Many-to-Many)
```python
class TaskTag(SQLModel, table=True):
    task_id: UUID = Field(foreign_key="task.id", primary_key=True)
    tag_id: UUID = Field(foreign_key="tag.id", primary_key=True)
```

### RecurrencePattern Model
```python
class RecurrencePattern(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    pattern_type: RecurrenceType  # daily, weekly, monthly, yearly
    interval: int = Field(default=1, ge=1)
    end_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    tasks: List[Task] = Relationship(back_populates="recurrence_pattern")
```

### Notification Model
```python
class Notification(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    task_id: UUID = Field(foreign_key="task.id", index=True)
    notification_type: NotificationType  # email, browser, push
    scheduled_time: datetime
    delivered: bool = Field(default=False)
    delivered_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    task: Task = Relationship(back_populates="notifications")
```

### Database Indexes
```sql
-- Performance indexes
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tags_user_id ON tags(user_id);
CREATE INDEX idx_notifications_task_id ON notifications(task_id);
```

---

## 🌐 Frontend Routes

### Public Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Home Page | Landing page with features |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |

### Protected Routes (Require Authentication)

| Route | Component | Description |
|-------|-----------|-------------|
| `/dashboard` | Dashboard | Main task overview and stats |
| `/tasks` | TaskList | All tasks with filters |
| `/tasks/new` | TaskForm | Create new task |
| `/tasks/[id]` | TaskDetail | View/edit single task |
| `/tags` | TagManagement | Manage tags |
| `/profile` | ProfilePage | User profile settings |
| `/chat` | ChatInterface | AI assistant chat |

### Route Structure
```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx          # Login page
│   └── register/
│       └── page.tsx          # Registration page
├── dashboard/
│   └── page.tsx              # Main dashboard
├── tasks/
│   ├── page.tsx              # Task list
│   ├── new/
│   │   └── page.tsx          # Create task form
│   └── [id]/
│       └── page.tsx          # Task detail
├── tags/
│   └── page.tsx              # Tag management
├── profile/
│   └── page.tsx              # User profile
├── api/                      # API routes (Next.js)
├── layout.tsx                # Root layout
└── page.tsx                  # Home page
```

---

## 🤖 AI Integration with OpenAI Agents SDK

### Overview

The application uses the **OpenAI Agents SDK** (`openai-agents`) for advanced AI-powered task management. This provides:

- **Function Calling**: Direct tool execution for task operations
- **Intent Recognition**: Understanding user intent from natural language
- **Multi-Provider Support**: OpenRouter, Gemini, OpenAI, Anthropic via LiteLLM
- **Conversation Management**: Context-aware conversations
- **Error Handling**: Graceful degradation and user-friendly messages

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│              OpenAI Agents SDK                          │
│  ┌───────────────────────────────────────────────────┐ │
│  │  Agent (OpenAI Agents SDK)                        │ │
│  │  • Intent Recognition                              │ │
│  │  • Tool Selection                                  │ │
│  │  • Response Generation                             │ │
│  └───────────────────────────────────────────────────┘ │
│                        │                                │
│  ┌─────────────────────┴───────────────────────────┐   │
│  │              Tools (Functions)                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │   │
│  │  │   Task   │  │   Tag    │  │ Recurrence   │  │   │
│  │  │  Tools   │  │  Tools   │  │    Tools     │  │   │
│  │  └──────────┘  └──────────┘  └──────────────┘  │   │
│  │  ┌──────────┐  ┌──────────┐                    │   │
│  │  │Conversation│ │ Reasoning │                   │   │
│  │  │  Tools   │  │  (MCP)   │                    │   │
│  │  └──────────┘  └──────────┘                    │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                        │
                        │ API Call
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Model Providers                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  OpenRouter  │  │   Gemini     │  │   OpenAI     │ │
│  │  (Qwen)      │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### OpenAI Agents SDK Implementation

#### Agent Creation

```python
from agents import Agent, Runner, ModelSettings, OpenAIChatCompletionsModel
from openai import AsyncOpenAI

# Configure model (OpenRouter with Qwen)
openrouter_client = AsyncOpenAI(
    api_key=OPENROUTER_API_KEY,
    base_url="https://openrouter.ai/api/v1",
    organization=None,
)

# Create model instance
model = OpenAIChatCompletionsModel(
    model="qwen/qwen3-14b",
    openai_client=openrouter_client,
)

# Create agent with tools
agent = Agent(
    name="TodoAssistant",
    instructions="You are a senior AI assistant for a production Todo app...",
    tools=[
        create_task,
        get_tasks,
        update_task,
        delete_task,
        mark_task_complete,
        create_tag,
        get_tags,
        assign_tag_to_task,
        create_recurring_task,
        cancel_recurrence,
    ],
    model=model,
    model_settings=ModelSettings(
        temperature=0.4,
        max_tokens=700,
        top_p=0.9,
        tool_choice="auto",
    ),
)
```

#### Agent Runner

```python
class AgentRunner:
    """Manages agent execution and conversation state."""
    
    def __init__(self, agent: Agent):
        self.agent = agent
        self.conversation_state = {}
    
    async def run(self, user_message: str, conversation_id: str) -> RunnerResult:
        """Run agent with conversation context."""
        # Get conversation history
        history = self.get_conversation_history(conversation_id)
        
        # Run agent
        result = await Runner.run(
            self.agent,
            input=user_message,
            conversation_history=history,
        )
        
        # Store updated history
        self.save_conversation_history(conversation_id, result.history)
        
        return result
```

### Model Configuration

**Default Model**: `qwen/qwen3-14b` via OpenRouter

**Configuration**:
```env
# Model Provider
MODEL_PROVIDER=openrouter
MODEL_NAME=qwen/qwen3-14b
USE_LITELLM=false

# OpenRouter Configuration
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_REFERER=http://localhost:30007
OPENROUTER_TITLE=Multi-Phase Todo App

# Model Settings
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Supported Providers

| Provider | Models | Configuration |
|----------|--------|---------------|
| **OpenRouter** | qwen/qwen3-14b, qwen/qwen-2.5-72b-instruct | Default, recommended |
| **Gemini** | gemini-2.0-flash, gemini-2.5-flash | Via OpenAI-compatible API |
| **OpenAI** | gpt-4.1-mini, gpt-5.2 | Direct OpenAI API |
| **Anthropic** | claude-3-5-sonnet-20240620 | Via LiteLLM |

### AI Tools Reference

#### Task Tools

**`create_task(title, description, due_date, priority, tag_ids)`**
- Creates a new task
- Returns: Task object with UUID
- Example: "Create a task to buy groceries tomorrow"

**`get_tasks(skip, limit, status, priority, search, sort_by)`**
- Retrieves tasks with filtering
- Returns: List of tasks
- Example: "Show me all high priority tasks"

**`update_task(task_id, title, description, status, priority, due_date)`**
- Updates existing task
- Returns: Updated task object
- Example: "Change the meeting task to high priority"

**`delete_task(task_id)`**
- Deletes a task
- Returns: Success message
- Example: "Delete the old shopping task"

**`mark_task_complete(task_id)`**
- Marks task as completed
- Returns: Completed task object
- Example: "Mark the report task as done"

#### Tag Tools

**`create_tag(name, color)`**
- Creates a new tag
- Returns: Tag object with UUID
- Example: "Create a work tag in blue"

**`get_tags()`**
- Retrieves all user tags
- Returns: List of tags
- Example: "Show me all my tags"

**`assign_tag_to_task(task_id, tag_id)`**
- Assigns tag to task
- Returns: Assignment confirmation
- Example: "Add the urgent tag to the meeting task"

#### Recurrence Tools

**`create_recurring_task(title, pattern, interval, end_date)`**
- Creates recurring task
- Returns: Task with recurrence pattern
- Example: "Create a daily standup task every weekday"

**`cancel_recurrence(task_id)`**
- Cancels recurring pattern
- Returns: Cancellation confirmation

#### Conversation Tools

**`get_conversations()`**
- Retrieves conversation history
- Returns: List of conversations

**`delete_conversation(conversation_id)`**
- Deletes specific conversation
- Returns: Deletion confirmation

**`clear_all_conversations()`**
- Clears all conversation history
- Returns: Clear confirmation

### Intent Recognition (MCP Reasoning)

The application uses an MCP (Model Context Protocol) reasoning module for intent recognition:

```python
from agent.mcp.reasoning import (
    parse_intent,
    detect_ambiguity,
    generate_clarification_questions,
    IntentResult,
)

# Parse user message
intent: IntentResult = await parse_intent(user_message)

# Intent structure
{
    "intent_type": "create_task",
    "entities": {
        "title": "buy groceries",
        "due_date": "tomorrow at 5pm",
        "priority": "high"
    },
    "confidence": 0.95,
    "ambiguities": []
}

# Check for ambiguities
if detect_ambiguity(intent):
    questions = generate_clarification_questions(intent)
    # Ask user for clarification
```

### Clarification Flow

When the AI detects ambiguity, it initiates a clarification flow:

**User**: "Create a task for the meeting"

**AI** (detects missing due_date):
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "I need clarification: When should this meeting task be due?"
  },
  "clarification": {
    "questions": ["When exactly is the meeting?"],
    "intent_type": "create_task",
    "entities": {
      "title": "the meeting"
    }
  }
}
```

**User**: "Tomorrow at 2pm"

**AI**: Creates task with clarified due_date

### API Endpoint

**POST /api/chat**

```bash
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Create a task to review PR tomorrow at 3pm",
    "conversation_id": "optional-uuid-for-context"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": {
    "role": "assistant",
    "content": "✓ Created task \"Review PR\" for tomorrow at 3:00 PM"
  },
  "action": {
    "type": "tool_call",
    "tool_name": "create_task",
    "arguments": {
      "title": "Review PR",
      "due_date": "2024-01-15T15:00:00Z",
      "priority": "medium"
    },
    "result": {
      "id": "uuid-123",
      "title": "Review PR",
      "status": "pending"
    }
  },
  "metadata": {
    "conversation_id": "uuid-456",
    "model": "qwen/qwen3-14b",
    "processing_time_ms": 234
  }
}
```

### Example Interactions

#### Task Creation
**User**: "Create a task to buy groceries tomorrow at 5pm"

**AI**: 
```json
{
  "message": "✓ Created task \"Buy groceries\" for tomorrow at 5:00 PM",
  "action": {
    "type": "create_task",
    "task_id": "uuid-123",
    "details": {
      "title": "Buy groceries",
      "due_date": "2024-01-15T17:00:00Z",
      "priority": "medium"
    }
  }
}
```

#### Task Query
**User**: "Show me all high priority tasks due this week"

**AI**: Retrieves and displays matching tasks with details

#### Task Update
**User**: "Change the meeting to high priority"

**AI**: 
```json
{
  "message": "✓ Updated priority of \"Meeting\" to high 🔴",
  "action": {
    "type": "update_task",
    "task_id": "uuid-456",
    "details": {
      "priority": "high"
    }
  }
}
```

#### Natural Language
**User**: "I finished the report"

**AI**: 
```json
{
  "message": "✓ Marked \"Report\" as complete ✅",
  "action": {
    "type": "complete_task",
    "task_id": "uuid-789"
  }
}
```

### Error Handling

The SDK implementation includes comprehensive error handling:

```python
from agent.error_handler import (
    LLMError,
    BackendError,
    ToolExecutionError,
    ClarificationNeededError,
    get_user_friendly_message,
)

try:
    result = await runner.run(user_message)
except ClarificationNeededError as e:
    # Return clarification request
    return create_clarification_response(e.questions)
except LLMError as e:
    # Return user-friendly error message
    return ChatResponse(
        message=get_user_friendly_message(e),
        error={"code": e.code, "message": str(e)}
    )
except ToolExecutionError as e:
    # Handle tool execution failures
    return ChatResponse(
        message="I encountered an error executing that action.",
        error={"code": "TOOL_ERROR", "message": str(e)}
    )
```

### Conversation State Management

```python
# In-memory conversation state (use Redis in production)
_conversation_state: Dict[str, Dict[str, Any]] = {}

def get_conversation_state(conversation_id: str) -> Dict[str, Any]:
    """Get or create conversation state."""
    if conversation_id not in _conversation_state:
        _conversation_state[conversation_id] = {
            "created_at": datetime.utcnow().isoformat(),
            "message_count": 0,
            "last_intent": None,
            "pending_clarification": None,
            "entities": {},
        }
    return _conversation_state[conversation_id]

def update_conversation_state(
    conversation_id: str,
    intent_type: Optional[str] = None,
    pending_clarification: Optional[Dict] = None,
    entities: Optional[Dict] = None,
):
    """Update conversation state with new information."""
    state = get_conversation_state(conversation_id)
    state["message_count"] += 1
    if intent_type:
        state["last_intent"] = intent_type
    if pending_clarification is not None:
        state["pending_clarification"] = pending_clarification
    if entities:
        state["entities"].update(entities)
```

### Rate Limiting

Chat endpoint has specific rate limiting:

```python
from src.core.rate_limiter_session import rate_limit_chat

@router.post("")
@rate_limit_chat  # 10 requests per minute per user session
async def chat(...):
    ...
```

### Performance

| Metric | Target | Actual |
|--------|--------|--------|
| Intent Recognition | <500ms | ~200ms |
| Tool Execution | <1s | ~500ms |
| Response Generation | <2s | ~1-1.5s |
| End-to-End | <3s | ~2-2.5s |

### Best Practices

1. **Always validate entities** before tool execution
2. **Ask for clarification** when confidence < 0.8
3. **Maintain conversation context** for follow-up messages
4. **Provide actionable feedback** with tool results
5. **Handle errors gracefully** with user-friendly messages
6. **Log all interactions** for debugging and improvement
7. **Rate limit** to prevent abuse

### References

- **[OpenAI Agents SDK](https://github.com/openai/openai-agents-python)**: Official documentation
- **[OpenRouter](https://openrouter.ai/)**: Model provider
- **[LiteLLM](https://docs.litellm.ai/)**: Multi-provider support
- **[Qwen Models](https://huggingface.co/Qwen)**: Model details
- **Implementation**: `backend/todo-backend/agent/`

---

## 📦 Installation

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker & Docker Compose (optional)
- Minikube (for Kubernetes deployment)

### Option 1: Local Development

#### Backend Setup
```bash
cd backend/todo-backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
# At minimum, set OPENROUTER_API_KEY

# Initialize database
python -c "from src.core.database import init_db; init_db()"

# Start server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install  # or bun install

# Copy environment template
cp .env.local.example .env.local

# Edit .env.local
# Set NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Start development server
npm run dev  # or bun run dev
```

### Option 2: Docker Compose

```bash
# Development (SQLite)
docker compose --profile dev up --build

# Production (Neon DB)
cp .env.docker .env
# Edit .env with production values
docker compose --profile prod up -d --build
```

### Option 3: Kubernetes (Minikube)

```bash
# Start minikube
minikube start

# Navigate to K8s configs
cd deployment/k8s

# Generate secure secrets
./generate-secrets.sh

# Deploy application
./deploy.sh

# Access application
minikube service frontend-service -n todo-app
```

---

## ⚙️ Configuration

### Backend Environment Variables

```env
# ════════════════════════════════════════════════════════
# ENVIRONMENT
# ════════════════════════════════════════════════════════
ENVIRONMENT=development  # development | production


# ════════════════════════════════════════════════════════
# SECURITY - JWT CONFIGURATION
# ════════════════════════════════════════════════════════
SECRET_KEY=your-secret-key-here  # 32+ characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
JWT_AUDIENCE=multi-phase-todo-api
JWT_ISSUER=multi-phase-todo-backend


# ════════════════════════════════════════════════════════
# DATABASE CONFIGURATION
# ════════════════════════════════════════════════════════
# SQLite (Development)
DATABASE_URL=sqlite:///./todo_app.db

# Neon PostgreSQL (Production)
# NEON_DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require


# ════════════════════════════════════════════════════════
# AI/LLM CONFIGURATION
# ════════════════════════════════════════════════════════
MODEL_PROVIDER=openrouter
MODEL_NAME=qwen/qwen3-14b
USE_LITELLM=false
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
MODEL_TEMPERATURE=0.4
MODEL_MAX_TOKENS=700
MODEL_TOP_P=0.9


# ════════════════════════════════════════════════════════
# CACHE & RATE LIMITING
# ════════════════════════════════════════════════════════
REDIS_URL=redis://localhost:6379/0
RATE_LIMIT_DEFAULT=50 per minute
RATE_LIMIT_AUTH=10 per minute


# ════════════════════════════════════════════════════════
# EMAIL CONFIGURATION (Optional)
# ════════════════════════════════════════════════════════
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_SENDER=your-email@gmail.com
SUPPORT_EMAIL=support@example.com


# ════════════════════════════════════════════════════════
# SERVER CONFIGURATION
# ════════════════════════════════════════════════════════
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO
```

### Frontend Environment Variables

```env
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=TodoApp
NEXT_PUBLIC_ENVIRONMENT=development
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend/todo-backend
source .venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/unit/test_task_service.py -v

# Run with verbose output
pytest -v

# Run tests matching pattern
pytest -k "test_task"
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### E2E Tests

```bash
cd e2e

# Run end-to-end tests
pytest test_*.py -v
```

---

## 📁 Project Structure

```
multi-phase-todo/
├── backend/
│   └── todo-backend/
│       ├── src/
│       │   ├── api/              # API routes
│       │   │   ├── auth.py       # Authentication endpoints
│       │   │   ├── tasks.py      # Task CRUD endpoints
│       │   │   ├── tags.py       # Tag management endpoints
│       │   │   ├── chat.py       # AI chat endpoint
│       │   │   └── notifications.py
│       │   ├── models/           # SQLAlchemy models
│       │   │   ├── user.py
│       │   │   ├── task.py
│       │   │   ├── tag.py
│       │   │   ├── recurrence_pattern.py
│       │   │   └── notification.py
│       │   ├── schemas/          # Pydantic schemas
│       │   ├── repositories/     # Data access layer
│       │   ├── services/         # Business logic
│       │   ├── core/             # Configuration & security
│       │   │   ├── config.py
│       │   │   ├── database.py
│       │   │   ├── auth.py
│       │   │   ├── security.py
│       │   │   ├── rate_limiter.py
│       │   │   └── cache.py
│       │   ├── utils/            # Helper functions
│       │   └── worker/           # Celery tasks
│       ├── agent/                # AI agent
│       │   ├── agent.py          # Main agent logic
│       │   ├── config/           # Model configuration
│       │   ├── tools/            # AI tools
│       │   └── utils/            # AI utilities
│       ├── tests/                # Backend tests
│       ├── Dockerfile
│       ├── requirements.txt
│       └── .env.example
│
├── frontend/
│   ├── app/                      # Next.js app router
│   │   ├── (auth)/               # Auth pages
│   │   ├── dashboard/            # Dashboard
│   │   ├── tasks/                # Task pages
│   │   ├── tags/                 # Tag management
│   │   └── profile/              # User profile
│   ├── components/               # React components
│   ├── redux/                    # Redux store
│   ├── lib/                      # Utilities
│   ├── hooks/                    # Custom hooks
│   ├── types/                    # TypeScript types
│   ├── tests/                    # Frontend tests
│   ├── Dockerfile
│   └── package.json
│
├── deployment/
│   ├── k8s/                      # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secrets.yaml
│   │   ├── backend-*.yaml
│   │   ├── frontend-*.yaml
│   │   ├── redis-*.yaml
│   │   ├── pvcs.yaml
│   │   ├── kustomization.yaml
│   │   ├── generate-secrets.sh
│   │   ├── deploy.sh
│   │   └── SECURITY.md
│   └── config.md
│
├── specs/                        # Feature specifications
│   ├── 001-console-todo-app/     # Phase 1 specs
│   ├── 001-phase2-todo-app/      # Phase 2 specs
│   └── 001-ai-task-assistant/    # Phase 3 specs
│
├── docs/                         # Documentation
├── tests/                        # E2E tests
├── docker-compose.yml
├── .env
├── .env.docker
└── README.md
```

---

## 🚀 DevOps & Deployment

### Docker Deployment

**Backend Dockerfile**:
- Multi-stage build (builder + runtime)
- Python 3.12-slim base
- Non-root user for security
- Health checks included

**Frontend Dockerfile**:
- Multi-stage build (deps → builder → runner)
- Node.js 20-alpine base
- Standalone output for Next.js
- dumb-init for signal handling

### Kubernetes Deployment

**Resources**:
- Namespace: `todo-app`
- Deployments: backend (2 replicas), frontend (2 replicas), redis (1 replica)
- Services: backend (ClusterIP), frontend (NodePort:30007), redis (ClusterIP)
- PVCs: backend-data (1Gi), redis-data (512Mi)
- ConfigMaps: backend-config, frontend-config
- Secrets: backend-secret (generated via script)

**Deploy**:
```bash
cd deployment/k8s
./generate-secrets.sh  # Create secure secrets
./deploy.sh            # Deploy to cluster
```

**Access**:
```bash
# Get minikube IP
minikube ip

# Access frontend
http://<minikube-ip>:30007
```

---

## 🔐 Security

### Authentication & Authorization
- JWT tokens with HS256 algorithm
- Access token expiration: 30 minutes
- Refresh token expiration: 7 days
- Password hashing with bcrypt (12 rounds)
- Secure cookie flags (HttpOnly, Secure, SameSite)

### API Security
- Rate limiting (SlowAPI)
- CORS protection
- Input validation (Pydantic)
- SQL injection prevention (ORM)
- XSS protection headers

### Secrets Management
- Kubernetes Secrets for sensitive data
- Environment variables for configuration
- Never commit actual secrets to Git
- Regular secret rotation recommended

### Security Checklist
- [ ] Generate secure SECRET_KEY (32+ chars)
- [ ] Set actual API keys before production
- [ ] Enable HTTPS in production
- [ ] Configure CORS properly
- [ ] Set `ENVIRONMENT=production`
- [ ] Review and rotate secrets regularly

See [`deployment/k8s/SECURITY.md`](deployment/k8s/SECURITY.md) for complete security guide.

---

## ⚡ Performance

### Optimizations Implemented

**Backend**:
- Redis caching for frequently accessed data
- Database connection pooling
- Async/await for I/O operations
- Indexed database queries
- Rate limiting to prevent abuse

**Frontend**:
- Code splitting with Next.js
- Image optimization
- Static generation where possible
- Redux state persistence
- Lazy loading of components

**Database**:
- Indexed columns (user_id, status, priority, due_date)
- Connection pooling
- Query optimization

**Caching Strategy**:
- Redis for session data
- Cache frequently accessed tasks
- Cache invalidation on updates

### Performance Targets

| Operation | Target | Actual |
|-----------|--------|--------|
| API Response (p95) | <200ms | ~50ms |
| Database Query | <50ms | ~10ms |
| Frontend Load | <2s | ~1s |
| AI Response | <5s | ~2-3s |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Write/update tests
5. Ensure all tests pass
6. Update documentation
7. Commit your changes (`git commit -m 'Add amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

### Development Guidelines
- Follow PEP 8 (Python) and ESLint (TypeScript)
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Keep PRs focused and small

---

## 🔧 Troubleshooting

### Common Issues

#### Backend won't start
```bash
# Check logs
docker compose logs backend

# Verify database
docker compose exec backend ls -la /app/data/

# Rebuild
docker compose build --no-cache backend
```

#### Frontend can't connect to backend
```bash
# Check API URL in .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Verify backend is running
curl http://localhost:8000/health
```

#### AI chat not working
```bash
# Verify OPENROUTER_API_KEY is set
# Check model configuration
kubectl get configmap backend-config -n todo-app -o yaml

# View logs
kubectl logs -n todo-app deployment/backend | grep -i "qwen\|openrouter"
```

#### Kubernetes pods not starting
```bash
# Check pod status
kubectl get pods -n todo-app

# Describe failing pod
kubectl describe pod <pod-name> -n todo-app

# View logs
kubectl logs <pod-name> -n todo-app
```

### Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: [GitHub Issues](https://github.com/your-org/multi-phase-todo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/multi-phase-todo/discussions)

---

## 📞 Support & Contact

- **Documentation**: See `/docs` and `/specs` folders
- **API Docs**: http://localhost:8000/docs (when running)
- **Issues**: GitHub Issues tab
- **Security**: See `deployment/k8s/SECURITY.md`

---

**Built with ❤️ using FastAPI, Next.js, Kubernetes, and Qwen AI**

*From console to cloud - a complete full-stack evolution*
