#!/bin/bash

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  Kubernetes Secrets Generator for Todo App               ║"
echo "╚═══════════════════════════════════════════════════════════╝"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_FILE="$SCRIPT_DIR/secrets-actual.yaml"

echo ""
echo "🔐 This script will generate secure Kubernetes secrets"
echo ""

# Check if secrets file already exists
if [ -f "$SECRETS_FILE" ]; then
    echo "⚠️  secrets-actual.yaml already exists!"
    read -p "Do you want to overwrite it? (y/N): " confirm
    if [[ ! $confirm =~ ^[Yy]$ ]]; then
        echo "ℹ️  Keeping existing secrets file"
        echo "   To apply: kubectl apply -f $SECRETS_FILE"
        exit 0
    fi
fi

# Generate secure random strings
echo "🎲 Generating secure random values..."
SECRET_KEY=$(python3 -c 'import secrets; print(secrets.token_urlsafe(32))')

# Prompt for API keys
echo ""
echo "📝 Enter your API keys (press Enter to skip optional values):"
echo ""

read -p "OpenRouter API Key (REQUIRED for Qwen model): " OPENROUTER_KEY
if [ -z "$OPENROUTER_KEY" ]; then
    echo "⚠️  Warning: OpenRouter API key is required for Qwen model"
    echo "   Get one from: https://openrouter.ai/keys"
    OPENROUTER_KEY="your-openrouter-api-key-here"
fi

read -p "Gemini API Key (Optional): " GEMINI_KEY
if [ -z "$GEMINI_KEY" ]; then
    GEMINI_KEY=""
fi

read -p "Email Username (Optional): " EMAIL_USERNAME
read -p "Email Password (Optional): " EMAIL_PASSWORD
read -p "Support Email (Optional): " SUPPORT_EMAIL

# Create secrets file
echo ""
echo "📝 Creating secrets file..."

cat > "$SECRETS_FILE" << EOF
# ════════════════════════════════════════════════════════
# KUBERNETES SECRETS - AUTO-GENERATED
# Generated: $(date -Iseconds)
# ⚠️  DO NOT COMMIT THIS FILE TO GIT! ⚠️
# ════════════════════════════════════════════════════════

apiVersion: v1
kind: Secret
metadata:
  name: backend-secret
  namespace: todo-app
  labels:
    app.kubernetes.io/name: backend
    app.kubernetes.io/component: api
type: Opaque
stringData:
  # JWT Security
  SECRET_KEY: "$SECRET_KEY"
  
  # OpenRouter API (Qwen Model)
  OPENROUTER_API_KEY: "$OPENROUTER_KEY"
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1"
  OPENROUTER_REFERER: "http://localhost:30007"
  OPENROUTER_TITLE: "Multi-Phase Todo App"
  
  # Gemini API (Optional)
  GEMINI_API_KEY: "$GEMINI_KEY"
  
  # Email Configuration (Optional)
  EMAIL_USERNAME: "$EMAIL_USERNAME"
  EMAIL_PASSWORD: "$EMAIL_PASSWORD"
  SUPPORT_EMAIL: "$SUPPORT_EMAIL"
EOF

echo "✅ Secrets file created: $SECRETS_FILE"
echo ""
echo "🔒 Security Recommendations:"
echo "   1. Set restrictive permissions: chmod 600 $SECRETS_FILE"
echo "   2. Apply to cluster: kubectl apply -f $SECRETS_FILE"
echo "   3. Delete file after applying: rm $SECRETS_FILE"
echo "   4. Never commit this file to version control!"
echo ""

# Set restrictive permissions
chmod 600 "$SECRETS_FILE"
echo "🔐 File permissions set to 600 (owner read/write only)"
echo ""

# Ask if user wants to apply now
read -p "Do you want to apply secrets to the cluster now? (y/N): " apply_confirm
if [[ $apply_confirm =~ ^[Yy]$ ]]; then
    echo ""
    echo "📦 Applying secrets to Kubernetes cluster..."
    kubectl apply -f "$SECRETS_FILE"
    
    echo ""
    echo "🔄 Restarting backend deployment to use new secrets..."
    kubectl rollout restart deployment/backend -n todo-app
    kubectl rollout status deployment/backend -n todo-app --timeout=120s
    
    echo ""
    echo "✅ Secrets applied and backend restarted!"
    
    # Ask if user wants to delete the file
    read -p "Do you want to delete the secrets file for security? (y/N): " delete_confirm
    if [[ $delete_confirm =~ ^[Yy]$ ]]; then
        rm "$SECRETS_FILE"
        echo "🗑️  Secrets file deleted"
    else
        echo "ℹ️  Keeping secrets file. Remember to delete it manually after use!"
    fi
else
    echo ""
    echo "📋 To apply secrets manually:"
    echo "   kubectl apply -f $SECRETS_FILE"
    echo "   kubectl rollout restart deployment/backend -n todo-app"
    echo ""
    echo "⚠️  Remember to delete the file after applying!"
    echo "   rm $SECRETS_FILE"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              ✅ Secrets Generation Complete!              ║"
echo "╚═══════════════════════════════════════════════════════════╝"
