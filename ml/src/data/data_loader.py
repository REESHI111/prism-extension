"""
Data loading and preprocessing for phishing detection.
Handles CSV/JSON data loading, validation, cleaning, and feature extraction.
"""

import numpy as np
import pandas as pd
from pathlib import Path
from typing import Tuple, Optional, List, Union
from sklearn.model_selection import train_test_split
from imblearn.over_sampling import SMOTE
from src.config.config import get_config
from src.features.url_features import URLFeatureExtractor
from src.utils.logger import get_logger


logger = get_logger(__name__)


class DataLoader:
    """
    Handles loading and preprocessing of phishing detection datasets.
    
    Features:
    - Load data from CSV or JSON
    - Validate and clean data
    - Extract features from URLs
    - Handle class imbalance with SMOTE
    - Split data into train/test sets
    - Cache processed data
    
    Example:
        >>> loader = DataLoader()
        >>> X_train, X_test, y_train, y_test = loader.load_and_split("data.csv")
    """
    
    def __init__(self, feature_extractor: Optional[URLFeatureExtractor] = None):
        """
        Initialize data loader.
        
        Args:
            feature_extractor: URLFeatureExtractor instance. 
                             If None, creates a new one.
        """
        self.config = get_config()
        self.feature_extractor = feature_extractor or URLFeatureExtractor()
        self.feature_names = []
        logger.info("DataLoader initialized")
    
    def load_csv(
        self,
        file_path: Union[str, Path],
        url_column: str = "url",
        label_column: str = "label"
    ) -> pd.DataFrame:
        """
        Load data from CSV file.
        
        Args:
            file_path: Path to CSV file
            url_column: Name of column containing URLs
            label_column: Name of column containing labels (0=legitimate, 1=phishing)
            
        Returns:
            DataFrame with URL and label columns
            
        Raises:
            FileNotFoundError: If file doesn't exist
            ValueError: If required columns are missing
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Data file not found: {file_path}")
        
        logger.info(f"Loading data from {file_path}")
        
        try:
            df = pd.read_csv(file_path)
            logger.info(f"Loaded {len(df)} rows from CSV")
            
            # Validate required columns
            if url_column not in df.columns:
                raise ValueError(f"URL column '{url_column}' not found in CSV")
            if label_column not in df.columns:
                raise ValueError(f"Label column '{label_column}' not found in CSV")
            
            # Keep only required columns
            df = df[[url_column, label_column]].copy()
            df.columns = ['url', 'label']
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading CSV: {str(e)}")
            raise
    
    def load_json(
        self,
        file_path: Union[str, Path],
        url_key: str = "url",
        label_key: str = "label"
    ) -> pd.DataFrame:
        """
        Load data from JSON file.
        
        Args:
            file_path: Path to JSON file
            url_key: Key for URL in JSON objects
            label_key: Key for label in JSON objects
            
        Returns:
            DataFrame with URL and label columns
        """
        file_path = Path(file_path)
        
        if not file_path.exists():
            raise FileNotFoundError(f"Data file not found: {file_path}")
        
        logger.info(f"Loading data from {file_path}")
        
        try:
            df = pd.read_json(file_path)
            logger.info(f"Loaded {len(df)} rows from JSON")
            
            # Validate required keys
            if url_key not in df.columns:
                raise ValueError(f"URL key '{url_key}' not found in JSON")
            if label_key not in df.columns:
                raise ValueError(f"Label key '{label_key}' not found in JSON")
            
            # Keep only required columns
            df = df[[url_key, label_key]].copy()
            df.columns = ['url', 'label']
            
            return df
            
        except Exception as e:
            logger.error(f"Error loading JSON: {str(e)}")
            raise
    
    def clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Clean and validate data.
        
        Args:
            df: DataFrame with 'url' and 'label' columns
            
        Returns:
            Cleaned DataFrame
        """
        logger.info("Cleaning data...")
        initial_count = len(df)
        
        # Remove duplicates
        df = df.drop_duplicates(subset=['url'])
        logger.info(f"Removed {initial_count - len(df)} duplicate URLs")
        
        # Remove null values
        df = df.dropna()
        logger.info(f"Removed {initial_count - len(df)} null values")
        
        # Validate labels (should be 0 or 1)
        df = df[df['label'].isin([0, 1])]
        
        # Convert labels to int
        df['label'] = df['label'].astype(int)
        
        # Remove empty URLs
        df = df[df['url'].str.strip() != '']
        
        # Remove URLs that are too short or too long
        min_length = 10
        max_length = self.config.features.max_url_length
        df = df[df['url'].str.len().between(min_length, max_length)]
        
        logger.info(f"Cleaned data: {len(df)} rows remaining ({initial_count - len(df)} removed)")
        
        # Log class distribution
        class_counts = df['label'].value_counts()
        logger.info(f"Class distribution: {dict(class_counts)}")
        
        return df.reset_index(drop=True)
    
    def extract_features(
        self,
        df: pd.DataFrame,
        batch_size: Optional[int] = None
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extract features from URLs in DataFrame.
        
        Args:
            df: DataFrame with 'url' and 'label' columns
            batch_size: Number of URLs to process at once
            
        Returns:
            Tuple of (features_array, labels_array)
        """
        logger.info(f"Extracting features from {len(df)} URLs...")
        
        batch_size = batch_size or self.config.features.batch_size
        urls = df['url'].tolist()
        labels = df['label'].values
        
        # Extract features in batches
        all_features = []
        
        for i in range(0, len(urls), batch_size):
            batch_urls = urls[i:i + batch_size]
            logger.info(f"Processing batch {i // batch_size + 1}/{(len(urls) + batch_size - 1) // batch_size}")
            
            batch_features = self.feature_extractor.extract_batch(batch_urls)
            
            # Convert to feature vectors
            for features in batch_features:
                if features is not None:
                    all_features.append(features.to_list())
                else:
                    # Use zeros for failed extractions
                    all_features.append([0] * self.feature_extractor.feature_count)
        
        # Convert to numpy array
        X = np.array(all_features, dtype=np.float32)
        y = labels
        
        # Store feature names
        if not self.feature_names:
            from src.features.url_features import URLFeatures
            self.feature_names = URLFeatures.feature_names()
        
        logger.info(f"Feature extraction complete. Shape: {X.shape}")
        
        return X, y
    
    def balance_classes(
        self,
        X: np.ndarray,
        y: np.ndarray,
        method: str = "smote"
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Balance dataset using oversampling techniques.
        
        Args:
            X: Feature matrix
            y: Labels
            method: Balancing method ('smote' or 'none')
            
        Returns:
            Balanced (X, y) tuple
        """
        if method == "none":
            return X, y
        
        logger.info("Balancing classes using SMOTE...")
        
        # Count classes before balancing
        unique, counts = np.unique(y, return_counts=True)
        logger.info(f"Before balancing: {dict(zip(unique, counts))}")
        
        try:
            smote = SMOTE(
                random_state=self.config.model.random_state,
                k_neighbors=min(5, min(counts) - 1) if min(counts) > 1 else 1
            )
            X_balanced, y_balanced = smote.fit_resample(X, y)
            
            # Count classes after balancing
            unique, counts = np.unique(y_balanced, return_counts=True)
            logger.info(f"After balancing: {dict(zip(unique, counts))}")
            
            return X_balanced, y_balanced
            
        except Exception as e:
            logger.warning(f"SMOTE failed: {str(e)}. Returning original data.")
            return X, y
    
    def split_data(
        self,
        X: np.ndarray,
        y: np.ndarray,
        test_size: Optional[float] = None,
        random_state: Optional[int] = None,
        stratify: bool = True
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Split data into training and testing sets.
        
        Args:
            X: Feature matrix
            y: Labels
            test_size: Proportion of data for testing (default from config)
            random_state: Random seed (default from config)
            stratify: Whether to stratify split by class labels
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        test_size = test_size or self.config.model.test_size
        random_state = random_state or self.config.model.random_state
        
        logger.info(f"Splitting data: {100 * (1 - test_size):.0f}% train, {100 * test_size:.0f}% test")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y,
            test_size=test_size,
            random_state=random_state,
            stratify=y if stratify else None
        )
        
        logger.info(f"Train set: {X_train.shape}, Test set: {X_test.shape}")
        
        return X_train, X_test, y_train, y_test
    
    def load_and_split(
        self,
        file_path: Union[str, Path],
        url_column: str = "url",
        label_column: str = "label",
        balance: bool = True,
        cache: bool = True
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Complete pipeline: load, clean, extract features, and split data.
        
        Args:
            file_path: Path to data file (CSV or JSON)
            url_column: Name of URL column
            label_column: Name of label column
            balance: Whether to balance classes with SMOTE
            cache: Whether to cache processed data
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info("=== Starting data loading pipeline ===")
        
        # Load data
        file_path = Path(file_path)
        if file_path.suffix == '.csv':
            df = self.load_csv(file_path, url_column, label_column)
        elif file_path.suffix == '.json':
            df = self.load_json(file_path, url_column, label_column)
        else:
            raise ValueError(f"Unsupported file format: {file_path.suffix}")
        
        # Clean data
        df = self.clean_data(df)
        
        # Extract features
        X, y = self.extract_features(df)
        
        # Balance classes
        if balance:
            X, y = self.balance_classes(X, y)
        
        # Split data
        X_train, X_test, y_train, y_test = self.split_data(X, y)
        
        # Cache processed data
        if cache and self.config.features.use_cache:
            self._cache_data(X_train, X_test, y_train, y_test)
        
        logger.info("=== Data loading pipeline complete ===")
        
        return X_train, X_test, y_train, y_test
    
    def _cache_data(
        self,
        X_train: np.ndarray,
        X_test: np.ndarray,
        y_train: np.ndarray,
        y_test: np.ndarray
    ):
        """
        Cache processed data to disk for faster loading.
        
        Args:
            X_train: Training features
            X_test: Test features
            y_train: Training labels
            y_test: Test labels
        """
        try:
            cache_path = self.config.paths.processed_data_path
            cache_path.parent.mkdir(parents=True, exist_ok=True)
            
            np.savez_compressed(
                cache_path,
                X_train=X_train,
                X_test=X_test,
                y_train=y_train,
                y_test=y_test,
                feature_names=self.feature_names
            )
            
            logger.info(f"Cached processed data to {cache_path}")
            
        except Exception as e:
            logger.warning(f"Failed to cache data: {str(e)}")
    
    def load_cached_data(self) -> Optional[Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]]:
        """
        Load previously cached data.
        
        Returns:
            Tuple of (X_train, X_test, y_train, y_test) or None if cache doesn't exist
        """
        cache_path = self.config.paths.processed_data_path
        
        if not cache_path.exists():
            logger.info("No cached data found")
            return None
        
        try:
            logger.info(f"Loading cached data from {cache_path}")
            data = np.load(cache_path, allow_pickle=True)
            
            X_train = data['X_train']
            X_test = data['X_test']
            y_train = data['y_train']
            y_test = data['y_test']
            self.feature_names = data['feature_names'].tolist()
            
            logger.info(f"Loaded cached data: Train={X_train.shape}, Test={X_test.shape}")
            
            return X_train, X_test, y_train, y_test
            
        except Exception as e:
            logger.error(f"Error loading cached data: {str(e)}")
            return None
    
    def get_feature_names(self) -> List[str]:
        """
        Get list of feature names.
        
        Returns:
            List of feature names
        """
        if not self.feature_names:
            from src.features.url_features import URLFeatures
            self.feature_names = URLFeatures.feature_names()
        
        return self.feature_names
