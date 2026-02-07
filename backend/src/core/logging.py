import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
import json
from datetime import datetime
from typing import Any, Dict


class LoggerSetup:
    """
    Centralized logging configuration for the Todo Application
    """
    
    def __init__(self, app_name: str = "todo-app"):
        self.app_name = app_name
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        
        # Set up the main logger
        self.logger = logging.getLogger(self.app_name)
        self.logger.setLevel(logging.DEBUG)
        
        # Prevent duplicate handlers if already configured
        if not self.logger.handlers:
            self._setup_console_handler()
            self._setup_file_handler()
            self._setup_error_file_handler()
    
    def _setup_console_handler(self):
        """Set up console logging for development"""
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)
    
    def _setup_file_handler(self):
        """Set up file logging for general application logs"""
        file_handler = RotatingFileHandler(
            self.log_dir / "app.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        file_handler.setLevel(logging.DEBUG)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
        )
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
    
    def _setup_error_file_handler(self):
        """Set up file logging specifically for errors"""
        error_handler = RotatingFileHandler(
            self.log_dir / "errors.log",
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        error_handler.setLevel(logging.ERROR)
        
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(funcName)s() - %(message)s'
        )
        error_handler.setFormatter(formatter)
        self.logger.addHandler(error_handler)
    
    def get_logger(self, name: str) -> logging.Logger:
        """
        Get a logger instance with the specified name
        """
        return logging.getLogger(f"{self.app_name}.{name}")


# Global logger instance
logger_setup = LoggerSetup()
get_logger = logger_setup.get_logger


# Specific loggers for different parts of the application
auth_logger = get_logger("auth")
task_logger = get_logger("task")
api_logger = get_logger("api")
database_logger = get_logger("database")
notification_logger = get_logger("notification")


def log_api_call(endpoint: str, method: str, user_id: str = None, status_code: int = None, execution_time: float = None):
    """
    Log API calls with relevant information
    """
    api_logger.info(
        f"API_CALL - {method} {endpoint} - "
        f"User: {user_id or 'Anonymous'} - "
        f"Status: {status_code or 'N/A'} - "
        f"Time: {execution_time or 'N/A'}ms"
    )


def log_database_operation(operation: str, table: str, user_id: str = None, execution_time: float = None):
    """
    Log database operations
    """
    database_logger.debug(
        f"DB_OP - {operation} on {table} - "
        f"User: {user_id or 'N/A'} - "
        f"Time: {execution_time or 'N/A'}ms"
    )


def log_user_action(user_id: str, action: str, details: Dict[str, Any] = None):
    """
    Log user actions for audit trail
    """
    auth_logger.info(
        f"USER_ACTION - User: {user_id} - Action: {action} - "
        f"Details: {json.dumps(details) if details else 'N/A'}"
    )


def log_security_event(event_type: str, user_id: str = None, ip_address: str = None, details: str = None):
    """
    Log security-related events
    """
    auth_logger.warning(
        f"SECURITY_EVENT - Type: {event_type} - "
        f"User: {user_id or 'N/A'} - "
        f"IP: {ip_address or 'N/A'} - "
        f"Details: {details or 'N/A'}"
    )


def log_error(error: Exception, context: str = "", user_id: str = None):
    """
    Log errors with context information
    """
    task_logger.error(
        f"ERROR in {context} - User: {user_id or 'N/A'} - "
        f"Error: {str(error)} - "
        f"Traceback: {getattr(error, '__traceback__', 'N/A')}"
    )


def log_performance(metric: str, value: float, unit: str = "", user_id: str = None):
    """
    Log performance metrics
    """
    task_logger.info(
        f"PERFORMANCE - Metric: {metric} - Value: {value} {unit} - "
        f"User: {user_id or 'N/A'}"
    )


# Global logger instance
logger_setup = LoggerSetup()
get_logger = logger_setup.get_logger


# Specific loggers for different parts of the application
auth_logger = get_logger("auth")
task_logger = get_logger("task")
api_logger = get_logger("api")
database_logger = get_logger("database")
notification_logger = get_logger("notification")


def log_api_call(endpoint: str, method: str, user_id: str = None, status_code: int = None, execution_time: float = None):
    """
    Log API calls with relevant information
    """
    api_logger.info(
        f"API_CALL - {method} {endpoint} - "
        f"User: {user_id or 'Anonymous'} - "
        f"Status: {status_code or 'N/A'} - "
        f"Time: {execution_time or 'N/A'}ms"
    )


def log_database_operation(operation: str, table: str, user_id: str = None, execution_time: float = None):
    """
    Log database operations
    """
    database_logger.debug(
        f"DB_OP - {operation} on {table} - "
        f"User: {user_id or 'N/A'} - "
        f"Time: {execution_time or 'N/A'}ms"
    )


def log_user_action(user_id: str, action: str, details: Dict[str, Any] = None):
    """
    Log user actions for audit trail
    """
    auth_logger.info(
        f"USER_ACTION - User: {user_id} - Action: {action} - "
        f"Details: {json.dumps(details) if details else 'N/A'}"
    )


def log_security_event(event_type: str, user_id: str = None, ip_address: str = None, details: str = None):
    """
    Log security-related events
    """
    auth_logger.warning(
        f"SECURITY_EVENT - Type: {event_type} - "
        f"User: {user_id or 'N/A'} - "
        f"IP: {ip_address or 'N/A'} - "
        f"Details: {details or 'N/A'}"
    )


def log_error(error: Exception, context: str = "", user_id: str = None):
    """
    Log errors with context information
    """
    task_logger.error(
        f"ERROR in {context} - User: {user_id or 'N/A'} - "
        f"Error: {str(error)} - "
        f"Traceback: {error.__traceback__}"
    )


def log_performance(metric: str, value: float, unit: str = "", user_id: str = None):
    """
    Log performance metrics
    """
    task_logger.info(
        f"PERFORMANCE - Metric: {metric} - Value: {value} {unit} - "
        f"User: {user_id or 'N/A'}"
    )


# Example usage in a service
class TaskService:
    def __init__(self):
        self.logger = get_logger("task_service")
    
    def create_task(self, task_data: dict, user_id: str):
        start_time = datetime.now()
        
        try:
            # Perform task creation
            task = self._perform_task_creation(task_data, user_id)
            
            # Log successful creation
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            self.logger.info(
                f"Task created successfully - ID: {task.id} - "
                f"User: {user_id} - Time: {execution_time:.2f}ms"
            )
            
            log_performance("task_creation_time", execution_time, "ms", user_id)
            log_user_action(user_id, "create_task", {"task_id": task.id})
            
            return task
        except Exception as e:
            # Log error
            execution_time = (datetime.now() - start_time).total_seconds() * 1000
            self.logger.error(
                f"Failed to create task - User: {user_id} - "
                f"Time: {execution_time:.2f}ms - Error: {str(e)}"
            )
            
            log_error(e, "create_task", user_id)
            raise
    
    def _perform_task_creation(self, task_data: dict, user_id: str):
        # This would contain the actual task creation logic
        pass