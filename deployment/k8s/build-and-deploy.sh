#!/bin/bash

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Building Docker Images for Minikube                     ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Set Docker environment to minikube
eval $(minikube docker-env)

PROJECT_ROOT="/home/wahaj-ali/Desktop/multi-phase-todo"

echo ""
echo "🔨 Building backend image..."
cd "$PROJECT_ROOT/backend/todo-backend"
docker build -t todo-backend:latest .

echo ""
echo "🔨 Building frontend image..."
cd "$PROJECT_ROOT/frontend"
docker build -t todo-frontend:latest .

echo ""
echo "✅ Images built successfully!"
docker images | grep todo-

echo ""
echo "🔄 Restarting deployments to use new images..."
kubectl rollout restart deployment/backend -n todo-app
kubectl rollout restart deployment/frontend -n todo-app

echo ""
echo "⏳ Waiting for pods to be ready..."
kubectl wait --for=condition=available deployment/backend -n todo-app --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n todo-app --timeout=300s

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Status:"
kubectl get all -n todo-app

echo ""
echo "🌐 Access URLs:"
MINIKUBE_IP=$(minikube ip)
echo "   Frontend: http://$MINIKUBE_IP:30007"
echo "   Backend:  http://$MINIKUBE_IP:8000"
