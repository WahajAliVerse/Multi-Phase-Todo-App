import os
from celery import Celery
from kombu import Queue


def make_celery():
    """
    Create and configure Celery instance
    """
    # Use Redis URL from environment or default to local Redis
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    
    celery = Celery(
        "task_queue",
        broker=redis_url,
        backend=redis_url,
        include=[
            "backend.src.worker.tasks",
        ]
    )
    
    # Additional configuration
    celery.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
        worker_prefetch_multiplier=1,
        task_acks_late=True,
        broker_connection_retry_on_startup=True,
    )
    
    # Define task queues
    celery.conf.task_queues = (
        Queue("default", routing_key="default"),
        Queue("recurring_tasks", routing_key="recurring_tasks"),
        Queue("notifications", routing_key="notifications"),
    )
    
    # Route specific tasks to specific queues
    celery.conf.task_routes = {
        "backend.src.worker.tasks.create_recurring_tasks": {
            "queue": "recurring_tasks"
        },
        "backend.src.worker.tasks.process_task_notifications": {
            "queue": "notifications"
        }
    }
    
    return celery


# Create the Celery instance
celery_app = make_celery()


def init_redis():
    """
    Initialize Redis connection for other parts of the application
    """
    import redis
    
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    redis_client = redis.from_url(redis_url)
    
    return redis_client


# Create a Redis client instance
redis_client = init_redis()