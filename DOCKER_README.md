# Docker Deployment Guide

Complete Docker configuration for the Multi-Phase Todo Application.

## 📁 File Structure

```
multi-phase-todo/
├── docker-compose.yml          # Main Docker Compose configuration
├── .env                        # Development environment variables
├── .env.docker                 # Production environment template
├── frontend/
│   ├── Dockerfile              # Next.js multi-stage build
│   └── .dockerignore           # Frontend build exclusions
└── backend/
    └── todo-backend/
        ├── Dockerfile          # FastAPI multi-stage build
        └── .dockerignore       # Backend build exclusions
```

## 🚀 Quick Start

### Development Mode (SQLite)

```bash
# Navigate to project root
cd /home/wahaj-ali/Desktop/multi-phase-todo

# Start all services
docker compose --profile dev up --build

# Or run in detached mode (background)
docker compose --profile dev up -d --build

# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop services
docker compose down

# Stop and remove volumes (clean slate)
docker compose down -v
```

### Production Mode (Neon PostgreSQL)

```bash
# 1. Copy production template
cp .env.docker .env

# 2. Edit .env with your production values:
#    - Generate SECRET_KEY
#    - Set NEON_DATABASE_URL
#    - Update domain URLs

# 3. Start production stack
docker compose --profile prod up -d --build

# 4. Verify services
docker compose ps
```

## 🔧 Available Commands

```bash
# Build images only
docker compose build

# Build with no cache
docker compose build --no-cache

# Start services
docker compose up

# Start in detached mode
docker compose up -d

# Stop services
docker compose down

# View running containers
docker compose ps

# View logs
docker compose logs -f

# Access backend shell
docker compose exec backend bash

# Access frontend shell
docker compose exec frontend sh

# Restart a service
docker compose restart backend

# Scale services (if needed)
docker compose up -d --scale backend=3
```

## 🌐 Access Points

| Service    | URL                          | Port |
|------------|------------------------------|------|
| Frontend   | http://localhost:3000        | 3000 |
| Backend API| http://localhost:8000        | 8000 |
| Swagger UI | http://localhost:8000/docs   | 8000 |
| Redis      | localhost:6379               | 6379 |

## ⚙️ Environment Variables

### Development (.env)

Most variables have sensible defaults. Key configurations:

- `DATABASE_URL=sqlite:///./todo_app.db` - SQLite for development
- `ENVIRONMENT=development` - Enables Swagger docs, debug mode
- `REDIS_URL=redis://redis:6379/0` - Redis for caching

### Production (.env.docker)

**Required changes:**

1. **SECRET_KEY**: Generate secure key
   ```bash
   python3 -c 'import secrets; print(secrets.token_urlsafe(32))'
   ```

2. **NEON_DATABASE_URL**: Get from [Neon Console](https://console.neon.tech)
   ```
   postgresql://user:password@host.region.provider.neon.tech/dbname?sslmode=require
   ```

3. **FRONTEND_BASE_URL**: Your production domain
   ```
   https://yourdomain.com
   ```

4. **NEXT_PUBLIC_API_BASE_URL**: Your production API URL
   ```
   https://api.yourdomain.com/api
   ```

## 🏗️ Architecture

### Services

1. **Backend** (`todo-backend`)
   - FastAPI + Python 3.12
   - SQLModel ORM
   - JWT Authentication
   - Port: 8000

2. **Frontend** (`todo-frontend`)
   - Next.js 16 + TypeScript
   - Redux Toolkit
   - Port: 3000

3. **Redis** (`todo-redis`)
   - Caching layer
   - Rate limiting
   - Port: 6379

### Networks

- `app-network`: Bridge network connecting all services

### Volumes

- `backend-data`: Persistent backend data (SQLite, logs)
- `redis-data`: Redis persistence (AOF)

## 🔒 Security Features

- ✅ Non-root users in containers
- ✅ Multi-stage builds (smaller images)
- ✅ Proper signal handling (dumb-init)
- ✅ Health checks for all services
- ✅ Environment variable isolation
- ✅ Network segmentation

## 📊 Health Checks

```bash
# Check service health
docker compose ps

# Backend health endpoint
curl http://localhost:8000/health

# Frontend health endpoint
curl http://localhost:3000

# Redis health
docker compose exec redis redis-cli ping
```

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs
docker compose logs backend

# Rebuild without cache
docker compose build --no-cache backend

# Remove and recreate
docker compose down -v
docker compose up --build
```

### Frontend can't connect to backend

Ensure `NEXT_PUBLIC_API_BASE_URL` is set correctly:
- Development: `http://localhost:8000/api`
- Production: `https://api.yourdomain.com/api`

### Database issues

```bash
# Check database file (SQLite)
docker compose exec backend ls -la /app/data/

# Reset database (development only!)
docker compose down -v
docker compose up --build
```

### Redis connection issues

```bash
# Check Redis is running
docker compose ps redis

# Test Redis connection
docker compose exec redis redis-cli ping

# View Redis logs
docker compose logs redis
```

## 📈 Monitoring

### Resource Usage

```bash
# View container stats
docker stats

# View specific service stats
docker stats todo-backend
```

### Logs

```bash
# All logs
docker compose logs -f

# Backend logs only
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend
```

## 🔄 Updates & Redeployment

```bash
# Pull latest code
git pull

# Rebuild and restart
docker compose --profile dev up -d --build

# Clean rebuild
docker compose build --no-cache
docker compose up -d
```

## 📝 Production Checklist

- [ ] Set `ENVIRONMENT=production`
- [ ] Generate secure `SECRET_KEY` (32+ chars)
- [ ] Configure `NEON_DATABASE_URL`
- [ ] Set up Redis (Redis Cloud, ElastiCache)
- [ ] Update `FRONTEND_BASE_URL` to production domain
- [ ] Update `NEXT_PUBLIC_API_BASE_URL`
- [ ] Configure email settings (SendGrid, etc.)
- [ ] Set up SSL/TLS termination
- [ ] Configure backup strategy
- [ ] Set up monitoring/alerting
- [ ] Test health endpoints
- [ ] Review security headers
- [ ] Enable log aggregation

## 🎯 Next Steps

1. **Development**: Start with `docker compose --profile dev up`
2. **Testing**: Run tests locally before deploying
3. **Production**: Follow `.env.docker` checklist
4. **Monitoring**: Set up health check alerts
5. **Backup**: Configure database backups

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neon Database Guide](https://neon.tech/docs/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
