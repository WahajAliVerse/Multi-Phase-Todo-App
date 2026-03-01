# Qwen Model Configuration with OpenRouter

## Overview

The backend AI agent now uses **Qwen via OpenRouter** as the default model instead of Gemini.

### Configuration Summary

| Setting | Value |
|---------|-------|
| **Provider** | `openrouter` |
| **Default Model** | `qwen/qwen3-14b` |
| **Base URL** | `https://openrouter.ai/api/v1` |
| **API Key Required** | Yes (from openrouter.ai) |

---

## 📝 Available Qwen Models

The following Qwen models are configured and available:

### 1. Qwen3-14B (Default)
- **Model ID**: `qwen/qwen3-14b`
- **Context Window**: 131,072 tokens
- **Max Output**: 8,192 tokens
- **Capabilities**: Function calling, text generation
- **Use Case**: Balanced performance and cost

### 2. Qwen2.5-72B-Instruct
- **Model ID**: `qwen/qwen-2.5-72b-instruct`
- **Context Window**: 131,072 tokens
- **Max Output**: 8,192 tokens
- **Capabilities**: Function calling, advanced reasoning
- **Use Case**: Complex tasks requiring higher accuracy

---

## 🔑 Getting OpenRouter API Key

1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key and add it to your configuration

---

## ⚙️ Configuration Files Updated

### Kubernetes (k8s)

**configmap.yaml:**
```yaml
data:
  MODEL_PROVIDER: "openrouter"
  MODEL_NAME: "qwen/qwen3-14b"
  USE_LITELLM: "false"
  DEFAULT_MODEL: "qwen/qwen3-14b"
  MODEL_TEMPERATURE: "0.4"
  MODEL_MAX_TOKENS: "700"
  MODEL_TOP_P: "0.9"
```

**secrets.yaml:**
```yaml
stringData:
  OPENROUTER_API_KEY: "your-openrouter-api-key-here"
  OPENROUTER_BASE_URL: "https://openrouter.ai/api/v1"
  OPENROUTER_REFERER: "http://localhost:30007"
  OPENROUTER_TITLE: "Multi-Phase Todo App"
```

### Docker Compose

**.env (Development):**
```env
MODEL_PROVIDER=openrouter
MODEL_NAME=qwen/qwen3-14b
USE_LITELLM=false
DEFAULT_MODEL=qwen/qwen3-14b
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_REFERER=http://localhost:3000
OPENROUTER_TITLE=Multi-Phase Todo App
```

**.env.docker (Production):**
```env
MODEL_PROVIDER=openrouter
MODEL_NAME=qwen/qwen3-14b
OPENROUTER_API_KEY=your-openrouter-api-key-here
OPENROUTER_REFERER=https://yourdomain.com
```

---

## 🚀 Deployment

### Kubernetes (Minikube)

After updating the configuration:

```bash
# Rebuild and redeploy
cd deployment/k8s
./deploy.sh

# Or manually
kubectl apply -k .
kubectl rollout restart deployment/backend -n todo-app
```

### Docker Compose

```bash
# Update .env with your OpenRouter API key
# Then restart
docker compose --profile dev up -d
```

---

## 🧪 Testing

### Test Qwen Model

```bash
# Via backend API
curl http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, what model are you using?"}'

# Check backend logs
kubectl logs -n todo-app deployment/backend | grep -i "qwen\|openrouter"
```

### Verify Configuration

```bash
# Kubernetes
kubectl get configmap backend-config -n todo-app -o yaml | grep MODEL_
kubectl get secret backend-secret -n todo-app -o jsonpath='{.data.OPENROUTER_API_KEY}' | base64 -d

# Docker Compose
docker compose exec backend env | grep MODEL_
```

---

## 🔄 Switching Models

### To Use Different Qwen Model

Update configuration to use `qwen/qwen-2.5-72b-instruct`:

**Kubernetes:**
```bash
kubectl patch configmap backend-config -n todo-app \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/MODEL_NAME", "value": "qwen/qwen-2.5-72b-instruct"}]'

kubectl rollout restart deployment/backend -n todo-app
```

**Docker Compose:**
Update `.env`:
```env
MODEL_NAME=qwen/qwen-2.5-72b-instruct
DEFAULT_MODEL=qwen/qwen-2.5-72b-instruct
```

### To Switch Back to Gemini

**Kubernetes:**
```bash
kubectl patch configmap backend-config -n todo-app \
  --type='json' \
  -p='[
    {"op": "replace", "path": "/data/MODEL_PROVIDER", "value": "gemini"},
    {"op": "replace", "path": "/data/MODEL_NAME", "value": "gemini-2.0-flash"},
    {"op": "replace", "path": "/data/DEFAULT_MODEL", "value": "gemini-2.0-flash"}
  ]'

kubectl rollout restart deployment/backend -n todo-app
```

---

## 💰 Pricing

OpenRouter pricing (as of 2024):

| Model | Input (per 1M tokens) | Output (per 1M tokens) |
|-------|----------------------|------------------------|
| Qwen3-14B | ~$0.15 | ~$0.45 |
| Qwen2.5-72B | ~$0.35 | ~$0.70 |

**Note**: Prices may vary. Check [openrouter.ai](https://openrouter.ai) for current pricing.

---

## 📊 Model Settings

### Temperature: 0.4
- Balanced between deterministic and creative
- Good for task management and structured responses

### Max Tokens: 700
- Sufficient for most responses
- Can be increased for longer conversations

### Top P: 0.9
- Nucleus sampling for diverse but focused output

---

## 🐛 Troubleshooting

### API Key Issues

```
Error: 401 Unauthorized
```

**Solution**: Verify your OpenRouter API key is correct and has credits.

### Model Not Found

```
Error: Model qwen/qwen3-14b not found
```

**Solution**: 
1. Check model name is exactly `qwen/qwen3-14b`
2. Verify OpenRouter has this model available
3. Check OPENROUTER_BASE_URL is correct

### Rate Limiting

```
Error: 429 Too Many Requests
```

**Solution**: 
- Default: 10 requests per 60 seconds
- Increase `RATE_LIMIT_REQUESTS` or `RATE_LIMIT_WINDOW` in config

---

## 📚 References

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Qwen Models](https://huggingface.co/Qwen)
- [Agent Configuration Guide](../../../backend/todo-backend/agent/docs/)
- [Model Configuration Code](../../../backend/todo-backend/agent/config/model_config.py)

---

## ✅ Checklist

- [ ] Get OpenRouter API key
- [ ] Update `OPENROUTER_API_KEY` in secrets
- [ ] Verify `MODEL_PROVIDER=openrouter`
- [ ] Verify `MODEL_NAME=qwen/qwen3-14b`
- [ ] Redeploy application
- [ ] Test chat functionality
- [ ] Monitor logs for errors
- [ ] Check OpenRouter dashboard for usage
