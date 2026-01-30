import logging
import sys
from datetime import datetime
from typing import Any, Dict
from pathlib import Path
import json


class AppLogger:
    """
    Centralized logging configuration for the application
    """
    
    def __init__(self, name: str = "todo_app", level: int = logging.INFO):
        self.logger = logging.getLogger(name)
        self.logger.setLevel(level)
        
        # Prevent duplicate handlers if logger already has handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Set up console and file handlers"""
        # Console handler
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        console_formatter = ColoredFormatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"
        )
        console_handler.setFormatter(console_formatter)
        self.logger.addHandler(console_handler)
        
        # File handler
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        file_handler = logging.FileHandler(log_dir / "app.log")
        file_handler.setLevel(logging.DEBUG)
        file_formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s (%(filename)s:%(lineno)d)"
        )
        file_handler.setFormatter(file_formatter)
        self.logger.addHandler(file_handler)
    
    def get_logger(self):
        """Return the configured logger instance"""
        return self.logger


class ColoredFormatter(logging.Formatter):
    """
    Custom formatter to add colors to log levels
    """
    
    # Define color codes
    COLORS = {
        'DEBUG': '\033[36m',    # Cyan
        'INFO': '\033[32m',     # Green
        'WARNING': '\033[33m',  # Yellow
        'ERROR': '\033[31m',    # Red
        'CRITICAL': '\033[35m', # Magenta
    }
    RESET = '\033[0m'  # Reset to default color
    
    def format(self, record):
        # Add color to the level name
        level_color = self.COLORS.get(record.levelname, '')
        record.levelname = f"{level_color}{record.levelname}{self.RESET}"
        
        # Call parent format method
        return super().format(record)


def setup_logging(name: str = "todo_app", level: int = logging.INFO) -> logging.Logger:
    """
    Set up and return a configured logger instance
    """
    app_logger = AppLogger(name, level)
    return app_logger.get_logger()


def log_api_call(
    logger: logging.Logger,
    endpoint: str,
    method: str,
    user_id: str = None,
    status_code: int = None,
    response_time: float = None,
    extra_data: Dict[str, Any] = None
):
    """
    Log API call details
    """
    log_data = {
        "type": "api_call",
        "endpoint": endpoint,
        "method": method,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "status_code": status_code,
        "response_time_ms": response_time,
        "extra_data": extra_data or {}
    }
    
    logger.info(f"API CALL: {json.dumps(log_data)}")


def log_error(
    logger: logging.Logger,
    error: Exception,
    context: str = "",
    user_id: str = None,
    extra_data: Dict[str, Any] = None
):
    """
    Log error details
    """
    log_data = {
        "type": "error",
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "extra_data": extra_data or {}
    }
    
    logger.error(f"ERROR: {json.dumps(log_data)}")


def log_business_event(
    logger: logging.Logger,
    event_name: str,
    user_id: str = None,
    details: Dict[str, Any] = None
):
    """
    Log business events
    """
    log_data = {
        "type": "business_event",
        "event_name": event_name,
        "timestamp": datetime.utcnow().isoformat(),
        "user_id": user_id,
        "details": details or {}
    }
    
    logger.info(f"BUSINESS EVENT: {json.dumps(log_data)}")