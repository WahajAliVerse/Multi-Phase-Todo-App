from celery import Celery
from kombu import Queue
import os

# Initialize Celery app
celery_app = Celery("task_processor")

# Configure Celery using environment variables
celery_app.conf.update(
    broker_url=os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    result_backend=os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_routes={
        "tasks.create_recurring_tasks": {"queue": "recurring_tasks"},
        "tasks.process_task_notifications": {"queue": "notifications"},
    },
    task_default_queue="default",
    worker_prefetch_multiplier=1,
    task_acks_late=True,
)

# Define task queues
celery_app.conf.task_queues = (
    Queue("default", routing_key="default"),
    Queue("recurring_tasks", routing_key="recurring_tasks"),
    Queue("notifications", routing_key="notifications"),
)

# Import task modules
celery_app.autodiscover_tasks(["backend.src.worker.tasks"])