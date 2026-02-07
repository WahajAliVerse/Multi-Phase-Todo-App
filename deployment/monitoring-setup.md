# Monitoring and Alerting Configuration for Production Deployment

## Overview
This document outlines the monitoring and alerting setup for the Phase 2 Todo Application in production.

## Infrastructure Monitoring

### Application Performance Monitoring (APM)
We'll use a combination of open-source tools for monitoring the application:

1. **Prometheus** - For metrics collection
2. **Grafana** - For visualization and dashboards
3. **Alertmanager** - For alerting based on defined rules

### Container Monitoring (if using Docker/Kubernetes)
- **cAdvisor** - For container metrics
- **Node Exporter** - For host-level metrics

## Metrics Collection

### Backend Metrics
The FastAPI application will expose metrics at `/metrics` endpoint using `prometheus-fastapi-instrumentator`:

```python
# In backend/src/main.py
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI()

# Configure metrics instrumentation
Instrumentator().instrument(app).expose(app)
```

Key metrics to collect:
- Request rate (requests per second)
- Request duration (histogram of response times)
- Request size (size of incoming requests)
- Response size (size of outgoing responses)
- Error rate (percentage of requests that result in errors)
- Active connections
- Memory usage
- CPU usage
- Database connection pool metrics
- Rate limiter metrics

### Frontend Metrics
For frontend metrics, we'll implement custom tracking:
- Page load times
- API call durations
- Error counts
- User interaction tracking
- Performance metrics (Core Web Vitals)

## Grafana Dashboards

### Dashboard 1: Application Overview
- Overall request rate
- Average response time
- Error rate
- Active users
- Task creation/deletion rates

### Dashboard 2: Performance Metrics
- API endpoint response times
- Database query performance
- Task processing times
- Frontend performance metrics (load times, render times)

### Dashboard 3: User Activity
- Daily/monthly active users
- Task completion rates
- Feature usage statistics
- User engagement metrics

### Dashboard 4: System Resources
- CPU usage
- Memory usage
- Disk I/O
- Network traffic
- Database connection pool usage

## Alerting Rules

### Critical Alerts (Immediate Response Required)
1. **High Error Rate**
   - Condition: Error rate > 5% for 5+ minutes
   - Severity: Critical
   - Channel: SMS, Phone call, Email

2. **High Latency**
   - Condition: 95th percentile response time > 2s for 10+ minutes
   - Severity: Critical
   - Channel: SMS, Phone call, Email

3. **Service Down**
   - Condition: Service unavailable (HTTP 500s or timeouts)
   - Severity: Critical
   - Channel: SMS, Phone call, Email

4. **Database Connection Issues**
   - Condition: Database connection errors > 1% for 5+ minutes
   - Severity: Critical
   - Channel: SMS, Phone call, Email

5. **Disk Space Critical**
   - Condition: Disk usage > 90%
   - Severity: Critical
   - Channel: SMS, Phone call, Email

### Warning Alerts (Monitor and Investigate)
1. **Moderate Error Rate**
   - Condition: Error rate > 2% for 10+ minutes
   - Severity: Warning
   - Channel: Slack, Email

2. **Moderate Latency**
   - Condition: 95th percentile response time > 1s for 15+ minutes
   - Severity: Warning
   - Channel: Slack, Email

3. **Memory Usage High**
   - Condition: Memory usage > 80%
   - Severity: Warning
   - Channel: Slack, Email

4. **CPU Usage High**
   - Condition: CPU usage > 80% for 15+ minutes
   - Severity: Warning
   - Channel: Slack, Email

5. **Rate Limiting Exceeded**
   - Condition: High number of rate limit rejections
   - Severity: Warning
   - Channel: Slack, Email

## Alertmanager Configuration

```yaml
# alertmanager.yml
route:
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 3h
  receiver: 'critical'
  routes:
    - matchers:
        - severity = "warning"
      receiver: 'warning'
      continue: true

receivers:
- name: 'critical'
  email_configs:
  - to: 'admin@todoapp.com'
    from: 'alerts@todoapp.com'
    smarthost: 'smtp.company.com:587'
    auth_username: 'alerts@todoapp.com'
    auth_identity: 'alerts@todoapp.com'
    auth_password: '<password>'
  webhook_configs:
  - url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    send_resolved: true

- name: 'warning'
  email_configs:
  - to: 'dev-team@todoapp.com'
    from: 'alerts@todoapp.com'
    smarthost: 'smtp.company.com:587'
    auth_username: 'alerts@todoapp.com'
    auth_identity: 'alerts@todoapp.com'
    auth_password: '<password>'
  slack_configs:
  - channel: '#alerts'
    api_url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK'
    send_resolved: true
```

## Health Checks

### Liveness Probe
- Endpoint: `/health/liveness`
- Purpose: Determines if the application needs to be restarted
- Returns 200 if the application is running properly

### Readiness Probe
- Endpoint: `/health/readiness`
- Purpose: Determines if the application is ready to serve traffic
- Returns 200 if the application is ready, 503 otherwise

### Health Check Implementation

```python
# In backend/src/api/health.py
from fastapi import APIRouter
from sqlmodel import select
from backend.src.core.database import get_session
from backend.src.models.user import User

router = APIRouter(prefix="/health", tags=["health"])

@router.get("/liveness")
def liveness_check():
    """
    Liveness probe - confirms the application is running
    """
    return {"status": "alive"}

@router.get("/readiness")
def readiness_check():
    """
    Readiness probe - confirms the application is ready to serve requests
    """
    try:
        # Test database connectivity
        with next(get_session()) as session:
            # Simple query to test database connection
            statement = select(User).limit(1)
            session.exec(statement).first()
        
        # Add other readiness checks as needed
        # - Check external service connectivity
        # - Check cache connectivity
        # - etc.
        
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not_ready", "error": str(e)}, 503
```

## Logging Integration

The monitoring system will integrate with the application's logging system to:
- Collect application logs
- Correlate logs with metrics
- Trigger alerts based on log patterns
- Provide unified search across logs and metrics

## Deployment Configuration

### Docker Compose for Local Monitoring Setup
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'

  grafana:
    image: grafana/grafana-enterprise
    ports:
      - "3000:3000"
    volumes:
      - grafana_storage:/var/lib/grafana
      - ./monitoring/dashboards:/etc/grafana/provisioning/dashboards
      - ./monitoring/datasources:/etc/grafana/provisioning/datasources
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin_password
      - GF_USERS_ALLOW_SIGN_UP=false

  alertmanager:
    image: prom/alertmanager:latest
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager.yml:/etc/alertmanager/alertmanager.yml
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'

volumes:
  prometheus_data:
  grafana_storage:
```

### Prometheus Configuration
```yaml
# monitoring/prometheus.yml
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

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
```

## Security Considerations

- All monitoring endpoints should be secured and not exposed publicly
- Use authentication for accessing metrics endpoints
- Encrypt data transmission between components
- Regularly rotate credentials for alert channels
- Implement RBAC for accessing monitoring dashboards

## Maintenance and Operations

### Regular Maintenance Tasks
- Rotate monitoring credentials quarterly
- Review and update alert thresholds monthly
- Archive old metrics data according to retention policy
- Update dashboard panels as new features are added

### Operational Procedures
- Incident response procedures for critical alerts
- Escalation matrix for different alert severities
- Regular review meetings for warning alerts
- Post-mortem process for any service disruptions