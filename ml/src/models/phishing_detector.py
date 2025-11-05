"""
Phishing Detection Model using ensemble machine learning.
Combines Random Forest and Logistic Regression for robust predictions.
"""

import numpy as np
import joblib
from pathlib import Path
from typing import Optional, Dict, Any, Tuple, List
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix, classification_report
)
from src.config.config import get_config
from src.utils.logger import get_logger


logger = get_logger(__name__)


class PhishingDetector:
    """
    Ensemble phishing detection model combining Random Forest and Logistic Regression.
    
    This model uses a voting ensemble approach to combine predictions from
    multiple classifiers for improved accuracy and robustness.
    
    Features:
    - Ensemble of Random Forest + Logistic Regression
    - Feature normalization with StandardScaler
    - Model persistence (save/load)
    - Comprehensive evaluation metrics
    - Feature importance analysis
    
    Example:
        >>> detector = PhishingDetector()
        >>> detector.train(X_train, y_train)
        >>> predictions = detector.predict(X_test)
        >>> metrics = detector.evaluate(X_test, y_test)
    """
    
    def __init__(
        self,
        model_type: str = "ensemble",
        scaler: Optional[StandardScaler] = None
    ):
        """
        Initialize phishing detector.
        
        Args:
            model_type: Type of model ('ensemble', 'random_forest', 'logistic_regression')
            scaler: Pre-fitted StandardScaler (if None, creates new one)
        """
        self.config = get_config()
        self.model_type = model_type
        self.scaler = scaler or StandardScaler()
        self.model: Optional[Any] = None
        self.feature_names: List[str] = []
        self.is_trained = False
        
        logger.info(f"Initializing PhishingDetector with model_type='{model_type}'")
        
        # Initialize model based on type
        self._initialize_model()
    
    def _initialize_model(self):
        """Initialize the machine learning model based on configuration."""
        random_state = self.config.model.random_state
        n_jobs = self.config.model.n_jobs
        
        if self.model_type == "random_forest":
            # Random Forest only
            self.model = RandomForestClassifier(
                n_estimators=self.config.model.n_estimators,
                max_depth=self.config.model.max_depth,
                min_samples_split=self.config.model.min_samples_split,
                min_samples_leaf=self.config.model.min_samples_leaf,
                class_weight=self.config.model.class_weight,
                random_state=random_state,
                n_jobs=n_jobs,
                verbose=0
            )
            logger.info("Initialized Random Forest classifier")
            
        elif self.model_type == "logistic_regression":
            # Logistic Regression only
            self.model = LogisticRegression(
                max_iter=1000,
                class_weight=self.config.model.class_weight,
                random_state=random_state,
                n_jobs=n_jobs,
                verbose=0
            )
            logger.info("Initialized Logistic Regression classifier")
            
        else:  # ensemble (default)
            # Ensemble of Random Forest + Logistic Regression
            rf = RandomForestClassifier(
                n_estimators=self.config.model.n_estimators,
                max_depth=self.config.model.max_depth,
                min_samples_split=self.config.model.min_samples_split,
                min_samples_leaf=self.config.model.min_samples_leaf,
                class_weight=self.config.model.class_weight,
                random_state=random_state,
                n_jobs=n_jobs,
                verbose=0
            )
            
            lr = LogisticRegression(
                max_iter=1000,
                class_weight=self.config.model.class_weight,
                random_state=random_state,
                n_jobs=n_jobs,
                verbose=0
            )
            
            self.model = VotingClassifier(
                estimators=[('rf', rf), ('lr', lr)],
                voting='soft',
                n_jobs=n_jobs
            )
            logger.info("Initialized Ensemble classifier (Random Forest + Logistic Regression)")
    
    def train(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray,
        feature_names: Optional[List[str]] = None
    ) -> Dict[str, float]:
        """
        Train the phishing detection model.
        
        Args:
            X_train: Training features (n_samples, n_features)
            y_train: Training labels (n_samples,)
            feature_names: List of feature names
            
        Returns:
            Dictionary containing training metrics
        """
        logger.info("=== Starting model training ===")
        logger.info(f"Training set shape: {X_train.shape}")
        logger.info(f"Class distribution: {np.bincount(y_train)}")
        
        # Store feature names
        if feature_names:
            self.feature_names = feature_names
        
        # Fit scaler and transform features
        logger.info("Normalizing features with StandardScaler...")
        X_train_scaled = self.scaler.fit_transform(X_train)
        
        # Train model
        logger.info(f"Training {self.model_type} model...")
        self.model.fit(X_train_scaled, y_train)
        
        # Mark as trained
        self.is_trained = True
        
        # Evaluate on training set
        y_train_pred = self.model.predict(X_train_scaled)
        train_accuracy = accuracy_score(y_train, y_train_pred)
        
        logger.info(f"Training complete! Training accuracy: {train_accuracy:.4f}")
        logger.info("=== Model training complete ===")
        
        return {
            "train_accuracy": train_accuracy,
            "model_type": self.model_type,
            "n_samples": len(X_train),
            "n_features": X_train.shape[1]
        }
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict phishing labels for URLs.
        
        Args:
            X: Feature matrix (n_samples, n_features)
            
        Returns:
            Predicted labels (0=legitimate, 1=phishing)
            
        Raises:
            ValueError: If model is not trained
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict
        predictions = self.model.predict(X_scaled)
        
        return predictions
    
    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        """
        Predict probability of phishing for URLs.
        
        Args:
            X: Feature matrix (n_samples, n_features)
            
        Returns:
            Probability matrix (n_samples, 2) [prob_legitimate, prob_phishing]
            
        Raises:
            ValueError: If model is not trained
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before making predictions")
        
        # Scale features
        X_scaled = self.scaler.transform(X)
        
        # Predict probabilities
        probabilities = self.model.predict_proba(X_scaled)
        
        return probabilities
    
    def evaluate(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray,
        detailed: bool = True
    ) -> Dict[str, Any]:
        """
        Evaluate model performance on test set.
        
        Args:
            X_test: Test features
            y_test: Test labels
            detailed: Whether to include detailed metrics
            
        Returns:
            Dictionary containing evaluation metrics
        """
        logger.info("=== Evaluating model ===")
        
        # Make predictions
        y_pred = self.predict(X_test)
        y_proba = self.predict_proba(X_test)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, zero_division=0)
        recall = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        try:
            auc_roc = roc_auc_score(y_test, y_proba[:, 1])
        except:
            auc_roc = 0.0
            logger.warning("Could not calculate AUC-ROC")
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        tn, fp, fn, tp = cm.ravel() if cm.size == 4 else (0, 0, 0, 0)
        
        metrics = {
            "accuracy": float(accuracy),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "auc_roc": float(auc_roc),
            "confusion_matrix": cm.tolist(),
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        }
        
        # Log results
        logger.info(f"Accuracy:  {accuracy:.4f}")
        logger.info(f"Precision: {precision:.4f}")
        logger.info(f"Recall:    {recall:.4f}")
        logger.info(f"F1 Score:  {f1:.4f}")
        logger.info(f"AUC-ROC:   {auc_roc:.4f}")
        logger.info(f"Confusion Matrix:\n{cm}")
        
        # Add detailed classification report
        if detailed:
            report = classification_report(
                y_test, y_pred,
                target_names=['Legitimate', 'Phishing'],
                output_dict=True,
                zero_division=0
            )
            metrics["classification_report"] = report
            logger.info(f"\n{classification_report(y_test, y_pred, target_names=['Legitimate', 'Phishing'], zero_division=0)}")
        
        logger.info("=== Evaluation complete ===")
        
        return metrics
    
    def get_feature_importance(self, top_n: int = 20) -> Optional[Dict[str, float]]:
        """
        Get feature importance from Random Forest.
        
        Args:
            top_n: Number of top features to return
            
        Returns:
            Dictionary mapping feature names to importance scores,
            or None if model doesn't support feature importance
        """
        if not self.is_trained:
            logger.warning("Model is not trained yet")
            return None
        
        # Get feature importance based on model type
        if self.model_type == "random_forest":
            importances = self.model.feature_importances_
        elif self.model_type == "ensemble":
            # Get from Random Forest in ensemble
            rf_model = self.model.named_estimators_['rf']
            importances = rf_model.feature_importances_
        else:
            logger.warning(f"Feature importance not available for {self.model_type}")
            return None
        
        # Create feature importance dictionary
        if self.feature_names:
            feature_importance = dict(zip(self.feature_names, importances))
        else:
            feature_importance = {f"feature_{i}": imp for i, imp in enumerate(importances)}
        
        # Sort by importance
        sorted_features = sorted(
            feature_importance.items(),
            key=lambda x: x[1],
            reverse=True
        )[:top_n]
        
        return dict(sorted_features)
    
    def save(self, model_name: str = "phishing_detector") -> Path:
        """
        Save trained model to disk.
        
        Args:
            model_name: Name for saved model file
            
        Returns:
            Path to saved model
            
        Raises:
            ValueError: If model is not trained
        """
        if not self.is_trained:
            raise ValueError("Cannot save untrained model")
        
        model_path = self.config.paths.get_model_path(model_name, "joblib")
        
        # Create model data
        model_data = {
            "model": self.model,
            "scaler": self.scaler,
            "model_type": self.model_type,
            "feature_names": self.feature_names,
            "is_trained": self.is_trained,
            "config": self.config.model.to_dict()
        }
        
        # Save with joblib
        joblib.dump(model_data, model_path)
        
        logger.info(f"Model saved to {model_path}")
        
        return model_path
    
    @classmethod
    def load(cls, model_name: str = "phishing_detector") -> 'PhishingDetector':
        """
        Load trained model from disk.
        
        Args:
            model_name: Name of saved model file
            
        Returns:
            Loaded PhishingDetector instance
            
        Raises:
            FileNotFoundError: If model file doesn't exist
        """
        config = get_config()
        model_path = config.paths.get_model_path(model_name, "joblib")
        
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        
        logger.info(f"Loading model from {model_path}")
        
        # Load model data
        model_data = joblib.load(model_path)
        
        # Create detector instance
        detector = cls(
            model_type=model_data["model_type"],
            scaler=model_data["scaler"]
        )
        
        # Restore model state
        detector.model = model_data["model"]
        detector.feature_names = model_data["feature_names"]
        detector.is_trained = model_data["is_trained"]
        
        logger.info("Model loaded successfully")
        
        return detector
    
    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the model.
        
        Returns:
            Dictionary containing model information
        """
        return {
            "model_type": self.model_type,
            "is_trained": self.is_trained,
            "n_features": len(self.feature_names),
            "feature_names": self.feature_names,
            "config": self.config.model.to_dict()
        }
