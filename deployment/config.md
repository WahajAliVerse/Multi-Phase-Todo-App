# Deployment Configuration for Full-Stack Todo App

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://todo_user:todo_password@db:5432/todo_db
      - SECRET_KEY=your-super-secret-key-here
      - ALGORITHM=HS256
      - ACCESS_TOKEN_EXPIRE_MINUTES=30
      - REFRESH_TOKEN_EXPIRE_DAYS=7
    depends_on:
      - db
    restart: unless-stopped
    networks:
      - app-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
    depends_on:
      - backend
    restart: unless-stopped
    networks:
      - app-network

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: todo_db
      POSTGRES_USER: todo_user
      POSTGRES_PASSWORD: todo_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
      - frontend
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://todo_user:todo_password@db:5432/todo_db
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://yourdomain.com/api/v1
```

## Kubernetes Configuration (Optional)

### Deployment for Backend
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
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
        image: your-registry/todo-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: url
        - name: SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: app-secret
              key: secret-key
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
spec:
  selector:
    app: todo-backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8000
  type: ClusterIP
```

## SSL/TLS Configuration

For production deployment, ensure you have:
1. Valid SSL certificates from a trusted CA
2. Proper certificate renewal mechanism (e.g., using Certbot with Let's Encrypt)
3. HSTS headers enabled
4. Secure cookies with HttpOnly and Secure flags

## Monitoring and Logging

### Health Checks
- Backend: `GET /health` endpoint
- Frontend: Simple HTML response check

### Logging
- Centralized logging using ELK stack or similar
- Structured logging in JSON format
- Log rotation and archival

## Security Considerations

1. Use HTTPS in production
2. Implement proper CORS policy
3. Sanitize all user inputs
4. Use parameterized queries to prevent SQL injection
5. Implement rate limiting
6. Regular security audits
7. Keep dependencies updated

## Backup Strategy

1. Daily database backups
2. Encrypted backup storage
3. Off-site backup copies
4. Regular backup restoration tests
5. Automated backup verification

## Performance Optimization

1. Database indexing on frequently queried fields
2. Caching layer (Redis) for frequently accessed data
3. CDN for static assets
4. Image optimization
5. Database connection pooling
6. API response caching
```