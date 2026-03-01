#!/bin/bash

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Multi-Phase Todo App - Kubernetes Deployment (Minikube) ║"
echo "╚═══════════════════════════════════════════════════════════╝"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

echo ""
echo "📍 Project Root: $PROJECT_ROOT"
echo "📁 K8s Config: $SCRIPT_DIR"
echo ""

# Step 1: Check minikube status
echo "🔍 Step 1: Checking minikube status..."
if ! minikube status > /dev/null 2>&1; then
    echo "❌ Minikube is not running. Starting minikube..."
    minikube start
else
    echo "✅ Minikube is running"
    minikube status | head -5
fi
echo ""

# Step 2: Build Docker images in minikube
echo "🔨 Step 2: Building Docker images for minikube..."

# Point Docker daemon to minikube
eval $(minikube docker-env)

echo "   Building backend image..."
cd "$PROJECT_ROOT/backend/todo-backend"
docker build -t todo-backend:latest .

echo "   Building frontend image..."
cd "$PROJECT_ROOT/frontend"
docker build -t todo-frontend:latest .

echo "✅ Images built successfully"
docker images | grep todo-
echo ""

# Step 3: Apply Kubernetes manifests
echo "📦 Step 3: Applying Kubernetes manifests..."

cd "$SCRIPT_DIR"

# Option 1: Using kustomize
echo "   Using kustomize to apply all resources..."
kubectl apply -k .

echo ""
echo "⏳ Step 4: Waiting for deployments to be ready..."
kubectl wait --for=condition=available deployment/backend -n todo-app --timeout=120s
kubectl wait --for=condition=available deployment/frontend -n todo-app --timeout=120s
kubectl wait --for=condition=available deployment/redis -n todo-app --timeout=60s

echo ""
echo "✅ Deployment complete!"
echo ""

# Step 5: Show status
echo "📊 Deployment Status:"
echo "═══════════════════════════════════════════════════════════"
kubectl get all -n todo-app
echo ""

# Step 6: Show access URLs
echo "🌐 Access URLs:"
echo "═══════════════════════════════════════════════════════════"

# Get minikube IP
MINIKUBE_IP=$(minikube ip)

echo "   Frontend: http://$MINIKUBE_IP:30007"
echo "   Backend:  http://$MINIKUBE_IP:30007/api (via frontend proxy)"
echo "   Backend Direct: http://$MINIKUBE_IP:8000 (if port-forwarded)"
echo ""

# Alternative: port-forward
echo "🔌 Alternative: Port Forwarding"
echo "═══════════════════════════════════════════════════════════"
echo "   Run these commands in separate terminals:"
echo ""
echo "   # Frontend (http://localhost:3000)"
echo "   kubectl port-forward svc/frontend-service 3000:3000 -n todo-app"
echo ""
echo "   # Backend (http://localhost:8000)"
echo "   kubectl port-forward svc/backend-service 8000:8000 -n todo-app"
echo ""
echo "   # Redis (localhost:6379)"
echo "   kubectl port-forward svc/redis-service 6379:6379 -n todo-app"
echo ""

# Show logs command
echo "📝 Useful Commands:"
echo "═══════════════════════════════════════════════════════════"
echo "   # View logs"
echo "   kubectl logs -n todo-app -l app.kubernetes.io/component=api -f"
echo "   kubectl logs -n todo-app -l app.kubernetes.io/component=web -f"
echo ""
echo "   # Check events"
echo "   kubectl get events -n todo-app --sort-by='.lastTimestamp'"
echo ""
echo "   # Open dashboard"
echo "   minikube dashboard"
echo ""
echo "   # Open frontend in browser"
echo "   minikube service frontend-service -n todo-app --url"
echo ""

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              🎉 Deployment Successful!                    ║"
echo "╚═══════════════════════════════════════════════════════════╝"
