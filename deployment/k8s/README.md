# Kubernetes Deployment Guide (Minikube)

Complete Kubernetes configuration for running the Multi-Phase Todo Application locally with Minikube.

## 📁 File Structure

```
deployment/k8s/
├── namespace.yaml           # Todo-app namespace
├── configmap.yaml           # Backend & Frontend configuration
├── secrets.yaml             # Sensitive data (JWT, API keys)
├── pvcs.yaml                # Persistent volumes (SQLite, Redis)
├── backend-deployment.yaml  # Backend pods (2 replicas)
├── backend-service.yaml     # Backend service (ClusterIP)
├── frontend-deployment.yaml # Frontend pods (2 replicas)
├── frontend-service.yaml    # Frontend service (NodePort:30007)
├── redis-deployment.yaml    # Redis cache pod
├── redis-service.yaml       # Redis service (ClusterIP)
├── kustomization.yaml       # Kustomize configuration
├── deploy.sh                # Deployment script
└── undeploy.sh              # Cleanup script
```

## 🚀 Quick Start

### 1. Deploy Application

```bash
cd /home/wahaj-ali/Desktop/multi-phase-todo/deployment/k8s

# Run deployment script
./deploy.sh
```

Or manually:

```bash
# Point Docker to minikube
eval $(minikube docker-env)

# Build images
cd backend/todo-backend && docker build -t todo-backend:latest .
cd ../../frontend && docker build -t todo-frontend:latest .

# Apply manifests
cd ../deployment/k8s
kubectl apply -k .
```

### 2. Access Application

**Via NodePort (Recommended for Minikube):**

```bash
# Get minikube IP
minikube ip

# Access frontend
http://$(minikube ip):30007
```

**Via Port Forwarding:**

```bash
# Terminal 1: Frontend
kubectl port-forward svc/frontend-service 3000:3000 -n todo-app

# Terminal 2: Backend
kubectl port-forward svc/backend-service 8000:8000 -n todo-app

# Access
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

**Via Minikube Service:**

```bash
# Opens browser automatically
minikube service frontend-service -n todo-app

# Or get URL
minikube service frontend-service -n todo-app --url
```

### 3. Check Status

```bash
# View all resources
kubectl get all -n todo-app

# View pods
kubectl get pods -n todo-app

# View services
kubectl get svc -n todo-app

# Check pod logs
kubectl logs -n todo-app -l app.kubernetes.io/component=api
kubectl logs -n todo-app -l app.kubernetes.io/component=web

# Follow logs in real-time
kubectl logs -n todo-app -l app.kubernetes.io/component=api -f
```

### 4. Undeploy

```bash
cd deployment/k8s
./undeploy.sh

# Or manually
kubectl delete -k .
```

## 📊 Architecture

```
                    ┌─────────────────┐
                    │   Minikube      │
                    │   Cluster       │
                    └─────────────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
    ┌─────────▼──────────┐   ┌─────────▼──────────┐
    │   Frontend         │   │   Backend          │
    │   Deployment       │   │   Deployment       │
    │   (2 replicas)     │   │   (2 replicas)     │
    │   Port: 3000       │   │   Port: 8000       │
    └─────────┬──────────┘   └─────────┬──────────┘
              │                         │
    ┌─────────▼──────────┐   ┌─────────▼──────────┐
    │   frontend-service │   │   backend-service  │
    │   NodePort:30007   │   │   ClusterIP        │
    └─────────┬──────────┘   └─────────┬──────────┘
              │                         │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Redis Service         │
              │   ClusterIP:6379        │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │   Redis Deployment      │
              │   (1 replica)           │
              └─────────────────────────┘
```

## 🔧 Configuration

### ConfigMaps

**Backend Config (`backend-config`):**
- `ENVIRONMENT`: development
- `DATABASE_URL`: sqlite:///./data/todo_app.db
- `REDIS_URL`: redis://redis-service:6379/0
- `PORT`: 8000

**Frontend Config (`frontend-config`):**
- `NEXT_PUBLIC_API_BASE_URL`: http://backend-service:8000/api
- `NEXT_PUBLIC_APP_NAME`: Multi-Phase Todo
- `NEXT_PUBLIC_ENVIRONMENT`: development

### Secrets

**Backend Secret (`backend-secret`):**
- `SECRET_KEY`: JWT signing key
- `GEMINI_API_KEY`: AI/LLM API key
- Email credentials

### Persistent Volumes

- `backend-data-pvc`: 1Gi (SQLite database)
- `redis-data-pvc`: 512Mi (Redis persistence)

## 📝 Useful Commands

### View Resources

```bash
# All resources in namespace
kubectl get all -n todo-app

# Specific resource types
kubectl get deployments -n todo-app
kubectl get pods -n todo-app
kubectl get svc -n todo-app
kubectl get pvc -n todo-app
kubectl get configmap -n todo-app
kubectl get secret -n todo-app

# Detailed view
kubectl describe pod <pod-name> -n todo-app
kubectl describe svc backend-service -n todo-app
```

### Logs

```bash
# Backend logs
kubectl logs -n todo-app deployment/backend

# Frontend logs
kubectl logs -n todo-app deployment/frontend

# Redis logs
kubectl logs -n todo-app deployment/redis

# Follow logs
kubectl logs -n todo-app -l app.kubernetes.io/component=api -f
kubectl logs -n todo-app -l app.kubernetes.io/component=web -f

# Last N lines
kubectl logs -n todo-app deployment/backend --tail=100
```

### Debugging

```bash
# Exec into pod
kubectl exec -it -n todo-app deployment/backend -- bash
kubectl exec -it -n todo-app deployment/frontend -- sh

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods -n todo-app
kubectl top nodes

# Test connectivity
kubectl run test --rm -it --image=busybox --restart=Never -n todo-app -- sh
# Inside pod:
# wget -qO- http://backend-service:8000/health
# wget -qO- http://redis-service:6379
```

### Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=3 -n todo-app

# Scale frontend
kubectl scale deployment/frontend --replicas=4 -n todo-app
```

### Updates

```bash
# Rebuild and redeploy
./deploy.sh

# Or manually
eval $(minikube docker-env)
docker build -t todo-backend:latest backend/todo-backend
docker build -t todo-frontend:latest frontend
kubectl rollout restart deployment/backend -n todo-app
kubectl rollout restart deployment/frontend -n todo-app
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/backend -n todo-app

# Rollback to previous
kubectl rollout undo deployment/backend -n todo-app
```

## 🐛 Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods -n todo-app

# Describe pod for events
kubectl describe pod <pod-name> -n todo-app

# Check logs
kubectl logs <pod-name> -n todo-app
```

### Image Pull Errors

```bash
# Ensure Docker images are built in minikube
eval $(minikube docker-env)
docker images | grep todo-

# Rebuild if needed
docker build -t todo-backend:latest backend/todo-backend
docker build -t todo-frontend:latest frontend
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints backend-service -n todo-app

# Test from within cluster
kubectl run test --rm -it --image=busybox --restart=Never -n todo-app -- wget -qO- http://backend-service:8000/health
```

### Database Issues

```bash
# Check PVC status
kubectl get pvc -n todo-app

# Exec into backend pod
kubectl exec -it -n todo-app deployment/backend -- bash
ls -la /app/data/
```

## 🔒 Security Notes

- Secrets are stored as base64-encoded strings
- For production, use external secret management (HashiCorp Vault, AWS Secrets Manager)
- Network policies can be added for pod-to-pod communication restrictions
- Consider using RBAC for access control

## 📈 Monitoring

```bash
# Install metrics-server (if not already)
minikube addons enable metrics-server

# View resource usage
kubectl top pods -n todo-app
kubectl top nodes

# View cluster resources
minikube ssh "top"
```

## 🎯 Next Steps

1. **Deploy**: Run `./deploy.sh`
2. **Access**: Open `http://$(minikube ip):30007`
3. **Monitor**: Check logs and events
4. **Test**: Verify all features work
5. **Cleanup**: Run `./undeploy.sh` when done
