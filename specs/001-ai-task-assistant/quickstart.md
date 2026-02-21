# Quickstart Guide: AI Task Assistant Setup

## Prerequisites

- Python 3.12+
- Node.js 18+
- Google Gemini API key
- Existing Todo application backend running

## Environment Variables Reference

### Backend (.env in backend/todo-backend/)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | Yes | - | Your Google Gemini API key |
| `GEMINI_MODEL` | No | `gemini-1.5-flash` | Model to use for chat completions |
| `OPENAI_BASE_URL` | No | `https://generativelanguage.googleapis.com/v1beta/openai/` | Gemini API base URL |
| `RATE_LIMIT_REQUESTS` | No | `10` | Max requests per window |
| `RATE_LIMIT_WINDOW` | No | `60` | Rate limit window in seconds |
| `LOG_LEVEL` | No | `INFO` | Logging level (DEBUG, INFO, WARNING, ERROR) |

### Frontend (.env.local in frontend/)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_CHAT_API_URL` | No | `http://localhost:8000/api/chat` | Chat API endpoint |
| `NEXT_PUBLIC_AI_AGENT_ENABLED` | No | `true` | Enable/disable AI agent feature |

---

## Step 1: Obtain Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key (format: `AIzaSy...`)
5. **IMPORTANT**: Store this key securely - never commit to version control

## Step 2: Configure Environment Variables

### Backend (.env in backend/todo-backend/)

```bash
# Gemini API Configuration
GEMINI_API_KEY=AIzaSy...your-key-here
GEMINI_MODEL=gemini-1.5-flash

# OpenAI SDK Compatibility
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/

# Rate Limiting
RATE_LIMIT_REQUESTS=10
RATE_LIMIT_WINDOW=60
```

### Frontend (.env.local in frontend/)

```bash
# Chat API Endpoint
NEXT_PUBLIC_CHAT_API_URL=http://localhost:8000/api/chat

# Feature Flags
NEXT_PUBLIC_AI_AGENT_ENABLED=true
```

## Step 3: Install Dependencies

### Backend

```bash
cd backend/todo-backend
pip install openai python-dotenv slowapi
```

### Frontend

```bash
cd frontend
npm install @reduxjs/toolkit react-redux
```

## Step 4: Verify Installation

### Test Gemini Connection

```python
# backend/todo-backend/test_gemini.py
from openai import AsyncOpenAI
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def test_gemini():
    client = AsyncOpenAI(
        api_key=os.getenv("GEMINI_API_KEY"),
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    try:
        response = await client.chat.completions.create(
            model="gemini-1.5-flash",
            messages=[{"role": "user", "content": "Hello!"}]
        )
        print("✅ Gemini connection successful!")
        print(f"Response: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Gemini connection failed: {e}")

asyncio.run(test_gemini())
```

Run: `python test_gemini.py`

### Test Frontend Connection

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and check for chat button in bottom-right corner.

## Step 5: Start the Application

### Start Backend

```bash
cd backend/todo-backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend

```bash
cd frontend
npm run dev
```

## Step 6: Test Chat Functionality

1. Open application in browser (`http://localhost:3000`)
2. Click chat button in bottom-right corner
3. Type: "Create a task to buy groceries tomorrow at 5pm"
4. Verify task appears in your task list

## Troubleshooting

### "GEMINI_API_KEY environment variable is not set"

**Solution**: Ensure .env file is in correct location and contains valid key

```bash
# Verify file exists
ls -la backend/todo-backend/.env

# Check key is set
grep GEMINI_API_KEY backend/todo-backend/.env
```

### "Rate limit exceeded"

**Solution**: Wait 60 seconds or increase rate limit in .env

```bash
# Increase limit (use cautiously)
RATE_LIMIT_REQUESTS=20
RATE_LIMIT_WINDOW=60
```

### "Failed to connect to backend"

**Solution**: Verify backend is running on port 8000

```bash
# Check backend status
curl http://localhost:8000/api/health
```

### Chat button not appearing

**Solution**: Verify frontend build and feature flag

```bash
# Check feature flag
grep NEXT_PUBLIC_AI_AGENT_ENABLED frontend/.env.local

# Rebuild frontend
npm run build
```

### "ModuleNotFoundError: No module named 'openai'"

**Solution**: Reinstall agent dependencies

```bash
cd agent
source .venv/bin/activate
uv add openai python-dotenv slowapi
```

### "CORS error" in browser console

**Solution**: Ensure backend CORS is configured correctly

```bash
# Check backend CORS settings in backend/todo-backend/src/core/config.py
# Ensure frontend origin (http://localhost:3000) is allowed
```

### Typing indicator not showing

**Solution**: Verify Redux state and WebSocket connection

```bash
# Check Redux DevTools for agentChat.typingIndicator state
# Verify backend is sending typing events
```

### Messages not persisting after refresh

**Solution**: Check Redux Persist configuration

```bash
# Verify localStorage in browser DevTools
# Check redux/store.ts for persist configuration
```

---

## Production Deployment

### Environment Variables for Production

```bash
# Backend Production .env
GEMINI_API_KEY=your-production-key
GEMINI_MODEL=gemini-1.5-flash
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
RATE_LIMIT_REQUESTS=30
RATE_LIMIT_WINDOW=60
LOG_LEVEL=WARNING
DATABASE_URL=postgresql://user:pass@host:5432/db

# Frontend Production .env.local
NEXT_PUBLIC_CHAT_API_URL=https://your-api-domain.com/api/chat
NEXT_PUBLIC_AI_AGENT_ENABLED=true
```

### Docker Deployment

```bash
# Build and run with Docker Compose
cd deployment
docker-compose up -d
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f deployment/k8s/
```

### Monitoring Setup

```bash
# Enable Prometheus metrics
# Configure Grafana dashboards
# Set up alerting rules
```

---

## Security Best Practices

1. **Customize Agent Instructions**: Edit `backend/todo-backend/src/agent/agent.py`
2. **Add More Tools**: Create tool wrappers in `backend/todo-backend/src/agent/tools/`
3. **Configure MCP**: Set up Multi-Context Provider integration
4. **Enable Bilingual Support**: Add Urdu language models

## Security Best Practices

- ✅ Never commit .env files to version control
- ✅ Rotate API keys regularly (every 90 days)
- ✅ Use HTTPS in production
- ✅ Implement proper authentication
- ✅ Enable rate limiting
- ✅ Log all agent actions for auditing

## Performance Optimization

- Use `gemini-1.5-flash` for fast responses
- Implement response caching for common queries
- Enable compression for API responses
- Use CDN for static assets
- Monitor response times with Prometheus/Grafana

## Support

For issues or questions:
- Check logs: `backend/todo-backend/logs/agent.log`
- Review documentation: `specs/001-ai-task-assistant/`
- Contact: [Your contact information]
