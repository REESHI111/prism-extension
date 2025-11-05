"""
Logging configuration and utilities for PRISM ML module.
Provides structured logging with color-coded console output.
"""

import logging
import sys
from pathlib import Path
from typing import Optional
from datetime import datetime
import colorlog


class MLLogger:
    """
    Centralized logging system for ML pipeline.
    
    Features:
    - Color-coded console output
    - File logging with rotation
    - Structured log format
    - Multiple log levels
    """
    
    _instance: Optional['MLLogger'] = None
    _loggers: dict = {}
    
    def __new__(cls):
        """Singleton pattern to ensure one logger instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        """Initialize logger configuration."""
        if self._initialized:
            return
        
        self._initialized = True
        self.log_dir = Path("logs")
        self.log_dir.mkdir(exist_ok=True)
        
        # Create log file with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.log_file = self.log_dir / f"ml_pipeline_{timestamp}.log"
    
    def get_logger(
        self,
        name: str,
        level: str = "INFO"
    ) -> logging.Logger:
        """
        Get or create a logger with the specified name.
        
        Args:
            name: Logger name (usually module name)
            level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
            
        Returns:
            Configured logger instance
        """
        if name in self._loggers:
            return self._loggers[name]
        
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, level.upper()))
        
        # Prevent duplicate handlers
        if logger.hasHandlers():
            logger.handlers.clear()
        
        # Console handler with colors
        console_handler = colorlog.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.DEBUG)
        
        console_format = colorlog.ColoredFormatter(
            "%(log_color)s%(levelname)-8s%(reset)s %(blue)s%(name)s%(reset)s: %(message)s",
            datefmt=None,
            reset=True,
            log_colors={
                'DEBUG': 'cyan',
                'INFO': 'green',
                'WARNING': 'yellow',
                'ERROR': 'red',
                'CRITICAL': 'red,bg_white',
            },
            secondary_log_colors={},
            style='%'
        )
        console_handler.setFormatter(console_format)
        
        # File handler with detailed format
        file_handler = logging.FileHandler(self.log_file, encoding='utf-8')
        file_handler.setLevel(logging.DEBUG)
        
        file_format = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        file_handler.setFormatter(file_format)
        
        # Add handlers
        logger.addHandler(console_handler)
        logger.addHandler(file_handler)
        
        # Store logger
        self._loggers[name] = logger
        
        return logger
    
    def close_all(self):
        """Close all loggers and handlers."""
        for logger in self._loggers.values():
            for handler in logger.handlers:
                handler.close()
            logger.handlers.clear()
        self._loggers.clear()


def get_logger(name: str, level: str = "INFO") -> logging.Logger:
    """
    Convenience function to get a logger.
    
    Args:
        name: Logger name (usually __name__)
        level: Log level
        
    Returns:
        Configured logger instance
        
    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("Starting training...")
    """
    ml_logger = MLLogger()
    return ml_logger.get_logger(name, level)
