#!/bin/bash

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Multi-Phase Todo App - Kubernetes Cleanup (Minikube)    ║"
echo "╚═══════════════════════════════════════════════════════════╝"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "⚠️  This will delete all resources in the todo-app namespace"
echo ""
read -p "Are you sure? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled"
    exit 0
fi

echo ""
echo "🗑️  Deleting namespace and all resources..."
kubectl delete namespace todo-app --ignore-not-found=true

echo ""
echo "🧹 Cleaning up Docker images from minikube..."
eval $(minikube docker-env)
docker rmi todo-backend:latest 2>/dev/null || true
docker rmi todo-frontend:latest 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Remaining resources in cluster:"
kubectl get all --all-namespaces
