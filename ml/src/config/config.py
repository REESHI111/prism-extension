"""
Configuration management for PRISM ML pipeline.
Handles environment variables, paths, and model parameters.
"""

import os
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional, Literal
from dotenv import load_dotenv


# Load environment variables from .env file
load_dotenv()


@dataclass
class PathConfig:
    """
    Configuration for file paths and directories.
    All paths are resolved to absolute paths.
    """
    
    # Base paths
    project_root: Path = field(default_factory=lambda: Path(__file__).parent.parent.parent)
    data_dir: Path = field(init=False)
    models_dir: Path = field(init=False)
    logs_dir: Path = field(init=False)
    
    # Data paths
    raw_data_path: Path = field(init=False)
    processed_data_path: Path = field(init=False)
    train_data_path: Path = field(init=False)
    test_data_path: Path = field(init=False)
    
    # Model export paths
    tfjs_output_dir: Path = field(init=False)
    
    def __post_init__(self):
        """Initialize and create all required directories."""
        # Set directory paths
        self.data_dir = self.project_root / os.getenv("DATA_DIR", "data")
        self.models_dir = self.project_root / os.getenv("MODELS_DIR", "models")
        self.logs_dir = self.project_root / os.getenv("LOGS_DIR", "logs")
        
        # Set data file paths
        self.raw_data_path = self.project_root / os.getenv(
            "RAW_DATA_PATH", "data/raw/phishing_urls.csv"
        )
        self.processed_data_path = self.project_root / os.getenv(
            "PROCESSED_DATA_PATH", "data/processed/processed_data.npz"
        )
        self.train_data_path = self.project_root / os.getenv(
            "TRAIN_DATA_PATH", "data/processed/train.csv"
        )
        self.test_data_path = self.project_root / os.getenv(
            "TEST_DATA_PATH", "data/processed/test.csv"
        )
        
        # Set export paths
        self.tfjs_output_dir = self.project_root / os.getenv(
            "TFJS_OUTPUT_DIR", "models/tfjs"
        )
        
        # Create directories
        self._create_directories()
    
    def _create_directories(self):
        """Create all required directories if they don't exist."""
        directories = [
            self.data_dir,
            self.data_dir / "raw",
            self.data_dir / "processed",
            self.models_dir,
            self.logs_dir,
            self.tfjs_output_dir,
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
    
    def get_model_path(self, model_name: str, extension: str = "joblib") -> Path:
        """
        Get full path for a model file.
        
        Args:
            model_name: Name of the model
            extension: File extension (joblib, pkl, h5)
            
        Returns:
            Full path to model file
        """
        return self.models_dir / f"{model_name}.{extension}"


@dataclass
class ModelConfig:
    """
    Configuration for machine learning models.
    Includes hyperparameters and training settings.
    """
    
    # Model type
    model_type: Literal["ensemble", "random_forest", "logistic_regression"] = field(
        default_factory=lambda: os.getenv("MODEL_TYPE", "ensemble")
    )
    
    # Random Forest parameters
    n_estimators: int = field(
        default_factory=lambda: int(os.getenv("N_ESTIMATORS", "100"))
    )
    max_depth: Optional[int] = field(
        default_factory=lambda: int(os.getenv("MAX_DEPTH", "20")) if os.getenv("MAX_DEPTH") else None
    )
    min_samples_split: int = field(
        default_factory=lambda: int(os.getenv("MIN_SAMPLES_SPLIT", "5"))
    )
    min_samples_leaf: int = field(
        default_factory=lambda: int(os.getenv("MIN_SAMPLES_LEAF", "2"))
    )
    class_weight: str = field(
        default_factory=lambda: os.getenv("CLASS_WEIGHT", "balanced")
    )
    
    # Training parameters
    random_state: int = field(
        default_factory=lambda: int(os.getenv("RANDOM_STATE", "42"))
    )
    test_size: float = field(
        default_factory=lambda: float(os.getenv("TEST_SIZE", "0.2"))
    )
    validation_size: float = field(
        default_factory=lambda: float(os.getenv("VALIDATION_SIZE", "0.1"))
    )
    
    # Performance settings
    n_jobs: int = field(
        default_factory=lambda: int(os.getenv("N_JOBS", "-1"))
    )
    
    def to_dict(self) -> dict:
        """Convert configuration to dictionary."""
        return {
            "model_type": self.model_type,
            "n_estimators": self.n_estimators,
            "max_depth": self.max_depth,
            "min_samples_split": self.min_samples_split,
            "min_samples_leaf": self.min_samples_leaf,
            "class_weight": self.class_weight,
            "random_state": self.random_state,
            "test_size": self.test_size,
            "validation_size": self.validation_size,
            "n_jobs": self.n_jobs,
        }


@dataclass
class FeatureConfig:
    """
    Configuration for feature extraction.
    """
    
    max_url_length: int = field(
        default_factory=lambda: int(os.getenv("MAX_URL_LENGTH", "200"))
    )
    min_domain_length: int = field(
        default_factory=lambda: int(os.getenv("MIN_DOMAIN_LENGTH", "3"))
    )
    extract_whois: bool = field(
        default_factory=lambda: os.getenv("EXTRACT_WHOIS", "false").lower() == "true"
    )
    use_cache: bool = field(
        default_factory=lambda: os.getenv("USE_CACHE", "true").lower() == "true"
    )
    
    # Feature extraction settings
    batch_size: int = field(
        default_factory=lambda: int(os.getenv("BATCH_SIZE", "1000"))
    )


@dataclass
class LoggingConfig:
    """
    Configuration for logging system.
    """
    
    log_level: str = field(
        default_factory=lambda: os.getenv("LOG_LEVEL", "INFO").upper()
    )
    log_format: Literal["simple", "detailed", "json"] = field(
        default_factory=lambda: os.getenv("LOG_FORMAT", "detailed")
    )


@dataclass
class ExportConfig:
    """
    Configuration for model export and deployment.
    """
    
    export_tfjs: bool = field(
        default_factory=lambda: os.getenv("EXPORT_TFJS", "true").lower() == "true"
    )
    
    # API configuration (for future use)
    api_enabled: bool = field(
        default_factory=lambda: os.getenv("API_ENABLED", "false").lower() == "true"
    )
    api_host: str = field(
        default_factory=lambda: os.getenv("API_HOST", "localhost")
    )
    api_port: int = field(
        default_factory=lambda: int(os.getenv("API_PORT", "5000"))
    )


@dataclass
class Config:
    """
    Master configuration class combining all config sections.
    Provides a single interface to access all configuration.
    """
    
    paths: PathConfig = field(default_factory=PathConfig)
    model: ModelConfig = field(default_factory=ModelConfig)
    features: FeatureConfig = field(default_factory=FeatureConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)
    export: ExportConfig = field(default_factory=ExportConfig)
    
    @classmethod
    def load(cls) -> 'Config':
        """
        Load configuration from environment variables.
        
        Returns:
            Fully configured Config instance
            
        Example:
            >>> config = Config.load()
            >>> print(config.paths.models_dir)
            >>> print(config.model.n_estimators)
        """
        return cls()
    
    def validate(self) -> bool:
        """
        Validate configuration values.
        
        Returns:
            True if configuration is valid
            
        Raises:
            ValueError: If configuration contains invalid values
        """
        # Validate model config
        if self.model.test_size <= 0 or self.model.test_size >= 1:
            raise ValueError(f"test_size must be between 0 and 1, got {self.model.test_size}")
        
        if self.model.validation_size <= 0 or self.model.validation_size >= 1:
            raise ValueError(f"validation_size must be between 0 and 1, got {self.model.validation_size}")
        
        if self.model.n_estimators < 1:
            raise ValueError(f"n_estimators must be >= 1, got {self.model.n_estimators}")
        
        # Validate feature config
        if self.features.max_url_length < 10:
            raise ValueError(f"max_url_length must be >= 10, got {self.features.max_url_length}")
        
        if self.features.min_domain_length < 1:
            raise ValueError(f"min_domain_length must be >= 1, got {self.features.min_domain_length}")
        
        return True
    
    def to_dict(self) -> dict:
        """
        Convert entire configuration to dictionary.
        
        Returns:
            Dictionary containing all configuration values
        """
        return {
            "paths": {
                "project_root": str(self.paths.project_root),
                "data_dir": str(self.paths.data_dir),
                "models_dir": str(self.paths.models_dir),
                "logs_dir": str(self.paths.logs_dir),
            },
            "model": self.model.to_dict(),
            "features": {
                "max_url_length": self.features.max_url_length,
                "min_domain_length": self.features.min_domain_length,
                "extract_whois": self.features.extract_whois,
                "use_cache": self.features.use_cache,
                "batch_size": self.features.batch_size,
            },
            "logging": {
                "log_level": self.logging.log_level,
                "log_format": self.logging.log_format,
            },
            "export": {
                "export_tfjs": self.export.export_tfjs,
                "api_enabled": self.export.api_enabled,
                "api_host": self.export.api_host,
                "api_port": self.export.api_port,
            },
        }


# Global configuration instance
_config: Optional[Config] = None


def get_config() -> Config:
    """
    Get global configuration instance (singleton pattern).
    
    Returns:
        Global Config instance
        
    Example:
        >>> config = get_config()
        >>> model_path = config.paths.get_model_path("phishing_detector")
    """
    global _config
    if _config is None:
        _config = Config.load()
        _config.validate()
    return _config


def reload_config() -> Config:
    """
    Reload configuration from environment variables.
    Useful for testing or configuration updates.
    
    Returns:
        Newly loaded Config instance
    """
    global _config
    load_dotenv(override=True)  # Reload .env file
    _config = Config.load()
    _config.validate()
    return _config
