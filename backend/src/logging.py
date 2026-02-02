"""
Logging configuration for the application.

This module implements comprehensive logging throughout the application
as specified in the requirements.
"""

import logging
import sys
from datetime import datetime
from typing import Optional
from logging.handlers import RotatingFileHandler
import os


# Create logs directory if it doesn't exist
logs_dir = "logs"
if not os.path.exists(logs_dir):
    os.makedirs(logs_dir)


def setup_logging(
    log_level: int = logging.INFO,
    log_file: Optional[str] = "logs/app.log",
    max_bytes: int = 10 * 1024 * 1024,  # 10 MB
    backup_count: int = 5
):
    """
    Set up comprehensive logging for the application.
    
    Args:
        log_level: Logging level (default: INFO)
        log_file: Path to log file (default: logs/app.log)
        max_bytes: Maximum size of log file before rotation (default: 10MB)
        backup_count: Number of backup files to keep (default: 5)
    """
    # Create formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    # Create root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Remove any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    
    # Create file handler if log_file is specified
    if log_file:
        file_handler = RotatingFileHandler(
            log_file,
            maxBytes=max_bytes,
            backupCount=backup_count
        )
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    
    # Set specific log levels for certain loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("urllib3").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger with the specified name.
    
    Args:
        name: Name of the logger
    
    Returns:
        logging.Logger instance
    """
    return logging.getLogger(name)


def log_info(logger: logging.Logger, message: str, extra: Optional[dict] = None):
    """
    Log an info message.
    
    Args:
        logger: Logger instance
        message: Message to log
        extra: Extra context information
    """
    logger.info(message, extra=extra)


def log_warning(logger: logging.Logger, message: str, extra: Optional[dict] = None):
    """
    Log a warning message.
    
    Args:
        logger: Logger instance
        message: Message to log
        extra: Extra context information
    """
    logger.warning(message, extra=extra)


def log_error(logger: logging.Logger, message: str, extra: Optional[dict] = None, exc_info: bool = False):
    """
    Log an error message.
    
    Args:
        logger: Logger instance
        message: Message to log
        extra: Extra context information
        exc_info: Include exception information if True
    """
    logger.error(message, extra=extra, exc_info=exc_info)


def log_debug(logger: logging.Logger, message: str, extra: Optional[dict] = None):
    """
    Log a debug message.
    
    Args:
        logger: Logger instance
        message: Message to log
        extra: Extra context information
    """
    logger.debug(message, extra=extra)


# Initialize logging when module is imported
setup_logging()