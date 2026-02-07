# Production Deployment Configuration for Phase 2 Todo Application

## Overview
This document outlines the production deployment configuration for the Phase 2 Todo Application, including infrastructure setup, environment variables, and deployment procedures.

## Infrastructure Requirements

### Backend Server Specifications
- **CPU**: 2-4 cores (depending on expected load)
- **RAM**: 4-8 GB
- **Storage**: SSD with 50GB+ available space
- **OS**: Ubuntu 22.04 LTS or equivalent
- **Network**: Stable internet connection with SSL certificate support

### Database Requirements
- **Service**: Neon Serverless PostgreSQL
- **Connection Pool**: Minimum 10, Maximum 50 connections
- **Backup**: Automated daily backups with 30-day retention

### CDN and Static Assets
- **CDN**: CloudFlare or similar for static asset delivery
- **Compression**: Enable Gzip/Brotli compression for responses

## Environment Variables

### Backend (.env.production)
```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://username:password@neon-host.region.provider.neon.tech/dbname?sslmode=require

# Security
SECRET_KEY=your-super-secret-production-key-change-before-deploy
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_DEFAULT="100 per minute"
RATE_LIMIT_AUTH="10 per minute"

# Email Configuration
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=no-reply@yourdomain.com

# Redis Configuration (for rate limiting and background tasks)
REDIS_URL=redis://your-redis-instance:6379/0

# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=/var/log/todo-app/app.log

# Application Settings
APP_ENV=production
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# CORS Settings
FRONTEND_URL=https://yourdomain.com
```

### Frontend (.env.production)
```env
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_NAME=TodoApp
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
NEXT_PUBLIC_ENVIRONMENT=production
```

## Docker Configuration

### Backend Dockerfile
```Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/src ./src
COPY backend/pyproject.toml .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

EXPOSE 8000

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### Frontend Dockerfile
```Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package.json frontend/bun.lock /app/
COPY frontend/ .

# Install dependencies and build
RUN bun install
RUN bun run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built application
COPY --from=builder /app/out ./out

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npx", "serve", "-s", "out", "-l", "3000"]
```

### Docker Compose for Production
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    image: todo-app-backend:latest
    restart: unless-stopped
    env_file:
      - ./backend/.env.production
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
    ports:
      - "8000:8000"
    depends_on:
      - redis
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/ready"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    image: todo-app-frontend:latest
    restart: unless-stopped
    env_file:
      - ./frontend/.env.production
    ports:
      - "3000:3000"
    networks:
      - app-network
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl/cert.pem:/etc/ssl/certs/cert.pem
      - ./ssl/key.pem:/etc/ssl/private/key.pem
      - static_volume:/var/www/static
    depends_on:
      - frontend
      - backend
    networks:
      - app-network

volumes:
  redis_data:
  static_volume:

networks:
  app-network:
    driver: bridge
```

## Kubernetes Configuration (Alternative)

### Backend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  namespace: todo-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
      - name: backend
        image: todo-app-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: redis-url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: secret-key
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-backend-service
  namespace: todo-app
spec:
  selector:
    app: todo-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
```

### Frontend Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  namespace: todo-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: todo-frontend
  template:
    metadata:
      labels:
        app: todo-frontend
    spec:
      containers:
      - name: frontend
        image: todo-app-frontend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_BASE_URL
          value: "https://api.yourdomain.com"
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend-service
  namespace: todo-app
spec:
  selector:
    app: todo-frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

## CI/CD Pipeline Configuration

### GitHub Actions Workflow (.github/workflows/deploy.yml)
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.12'
        
    - name: Install backend dependencies
      run: |
        cd backend
        pip install -r requirements.txt
        
    - name: Run backend tests
      run: |
        cd backend
        pytest tests/
        
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install frontend dependencies
      run: |
        cd frontend
        bun install
        
    - name: Run frontend tests
      run: |
        cd frontend
        bun run test
        
    - name: Run security scan
      run: |
        # Run security scanning tools like bandit, etc.
        pip install bandit
        bandit -r backend/src/

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v2
      
    - name: Login to DockerHub
      uses: docker/login-action@v2
      with:
        username: ${{ secrets.DOCKERHUB_USERNAME }}
        password: ${{ secrets.DOCKERHUB_TOKEN }}
        
    - name: Build and push backend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./backend/Dockerfile
        push: true
        tags: your-dockerhub-username/todo-backend:latest
        
    - name: Build and push frontend
      uses: docker/build-push-action@v4
      with:
        context: .
        file: ./frontend/Dockerfile
        push: true
        tags: your-dockerhub-username/todo-frontend:latest

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    steps:
    - name: Deploy to production
      run: |
        # Deploy using your preferred method (kubectl, docker swarm, etc.)
        echo "Deploying to production..."
```

## Monitoring and Logging Configuration

### Prometheus Configuration for Production
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'todo-app'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 10s
    scrape_timeout: 5s
```

### Application Logging Configuration
```python
# backend/src/core/logging_config.py
import logging
import logging.config
import os

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "()": "uvicorn.logging.DefaultFormatter",
            "fmt": "%(levelprefix)s %(asctime)s %(message)s",
            "use_colors": None,
        },
        "access": {
            "()": "uvicorn.logging.AccessFormatter",
            "fmt": '%(levelprefix)s %(asctime)s :: %(client_addr)s - "%(request_line)s" %(status_code)s',
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stderr",
        },
        "access": {
            "formatter": "access",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
        "file": {
            "formatter": "default",
            "class": "logging.handlers.RotatingFileHandler",
            "filename": os.getenv("LOG_FILE_PATH", "app.log"),
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "uvicorn.error": {
            "handlers": ["default", "file"],
        },
        "uvicorn.access": {
            "handlers": ["access", "file"],
            "propagate": False,
        },
    },
    "root": {
        "level": os.getenv("LOG_LEVEL", "INFO"),
        "handlers": ["default", "file"],
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
```

## Security Configuration

### Nginx Configuration with Security Headers
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Backup and Recovery Procedures

### Database Backup Script
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="todo_app_prod"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump $DATABASE_URL > $BACKUP_DIR/todo_app_$DATE.sql

# Compress the backup
gzip $BACKUP_DIR/todo_app_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "todo_app_*.sql.gz" -mtime +30 -delete

echo "Database backup completed: todo_app_$DATE.sql.gz"
```

### Backup Schedule (Cron Job)
```cron
# Run database backup daily at 2 AM
0 2 * * * /path/to/backup-db.sh >> /var/log/backup.log 2>&1
```

## Deployment Steps

### Pre-deployment Checklist
- [ ] All tests pass in CI/CD pipeline
- [ ] Security scan completed with no critical vulnerabilities
- [ ] Database migrations tested on staging
- [ ] Performance tests completed and within acceptable limits
- [ ] Backup of current production system completed
- [ ] Rollback plan prepared and tested

### Deployment Process
1. **Prepare staging environment** with latest changes
2. **Run comprehensive tests** on staging
3. **Deploy to production** using blue-green deployment strategy
4. **Monitor application** for any issues during first hour
5. **Update DNS** to point to new deployment if stable
6. **Monitor for 24 hours** post-deployment

### Rollback Procedure
1. **Identify rollback trigger** (error rate, performance issues, etc.)
2. **Revert to previous version** using deployment tools
3. **Verify rollback** by checking application functionality
4. **Notify team** of rollback and reason
5. **Investigate root cause** of the issue that triggered rollback

## Performance Optimization

### Database Indexes
```sql
-- Ensure these indexes exist for optimal performance
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_tags_user_id ON tags(user_id);
```

### Caching Strategy
- Cache frequently accessed data (user profiles, common tag lists)
- Implement Redis for session storage
- Use CDN for static assets
- Implement HTTP caching headers for API responses where appropriate

This configuration provides a solid foundation for deploying the Phase 2 Todo Application to production with security, scalability, and maintainability in mind.