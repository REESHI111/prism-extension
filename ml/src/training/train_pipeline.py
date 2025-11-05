"""
Training pipeline orchestration for phishing detection model.
Coordinates data loading, feature extraction, model training, and evaluation.
"""

import json
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import numpy as np
from sklearn.model_selection import cross_val_score, StratifiedKFold
from sklearn.metrics import classification_report
from src.config.config import get_config
from src.data.data_loader import DataLoader
from src.models.phishing_detector import PhishingDetector
from src.utils.logger import get_logger
from src.utils.sample_data_generator import SampleDataGenerator


logger = get_logger(__name__)


class TrainingPipeline:
    """
    End-to-end training pipeline for phishing detection model.
    
    Orchestrates the complete workflow:
    1. Data loading and preprocessing
    2. Feature extraction
    3. Model training
    4. Evaluation
    5. Model persistence
    6. Report generation
    
    Example:
        >>> pipeline = TrainingPipeline()
        >>> results = pipeline.run("data/phishing_urls.csv")
        >>> print(f"Model accuracy: {results['test_metrics']['accuracy']:.4f}")
    """
    
    def __init__(
        self,
        model_type: str = "ensemble",
        use_sample_data: bool = False
    ):
        """
        Initialize training pipeline.
        
        Args:
            model_type: Type of model to train ('ensemble', 'random_forest', 'logistic_regression')
            use_sample_data: Whether to generate sample data if no data file exists
        """
        self.config = get_config()
        self.model_type = model_type
        self.use_sample_data = use_sample_data
        
        # Initialize components
        self.data_loader = DataLoader()
        self.detector = PhishingDetector(model_type=model_type)
        
        # Training history
        self.history: Dict[str, Any] = {}
        
        logger.info(f"TrainingPipeline initialized with model_type='{model_type}'")
    
    def run(
        self,
        data_path: Optional[Path] = None,
        save_model: bool = True,
        generate_report: bool = True
    ) -> Dict[str, Any]:
        """
        Run complete training pipeline.
        
        Args:
            data_path: Path to training data CSV/JSON
            save_model: Whether to save trained model
            generate_report: Whether to generate training report
            
        Returns:
            Dictionary containing training results and metrics
        """
        logger.info("=" * 60)
        logger.info("STARTING TRAINING PIPELINE")
        logger.info("=" * 60)
        
        start_time = time.time()
        
        try:
            # Step 1: Prepare data
            X_train, X_test, y_train, y_test = self._prepare_data(data_path)
            
            # Step 2: Train model
            train_metrics = self._train_model(X_train, y_train)
            
            # Step 3: Evaluate model
            test_metrics = self._evaluate_model(X_test, y_test)
            
            # Step 4: Get feature importance
            feature_importance = self._get_feature_importance()
            
            # Step 5: Save model
            model_path = None
            if save_model:
                model_path = self._save_model()
            
            # Step 6: Generate report
            if generate_report:
                report_path = self._generate_report(
                    train_metrics, test_metrics, feature_importance
                )
            else:
                report_path = None
            
            # Calculate total time
            elapsed_time = time.time() - start_time
            
            # Compile results
            results = {
                "success": True,
                "model_type": self.model_type,
                "train_metrics": train_metrics,
                "test_metrics": test_metrics,
                "feature_importance": feature_importance,
                "model_path": str(model_path) if model_path else None,
                "report_path": str(report_path) if report_path else None,
                "elapsed_time": elapsed_time,
                "timestamp": datetime.now().isoformat()
            }
            
            self.history = results
            
            logger.info("=" * 60)
            logger.info(f"TRAINING COMPLETE! (Time: {elapsed_time:.2f}s)")
            logger.info(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
            logger.info(f"F1 Score: {test_metrics['f1_score']:.4f}")
            logger.info("=" * 60)
            
            return results
            
        except Exception as e:
            logger.error(f"Training pipeline failed: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }
    
    def _prepare_data(
        self,
        data_path: Optional[Path]
    ) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
        """
        Prepare data for training.
        
        Args:
            data_path: Path to data file
            
        Returns:
            Tuple of (X_train, X_test, y_train, y_test)
        """
        logger.info("Step 1: Preparing data...")
        
        # Determine data source
        if data_path is None:
            data_path = self.config.paths.raw_data_path
        
        data_path = Path(data_path)
        
        # Generate sample data if needed
        if not data_path.exists() and self.use_sample_data:
            logger.info("No data file found. Generating sample data...")
            generator = SampleDataGenerator()
            data_path = generator.save_sample_data(n_samples=2000)
        
        # Check if data exists
        if not data_path.exists():
            raise FileNotFoundError(
                f"Data file not found: {data_path}\n"
                f"Set use_sample_data=True to generate sample data automatically."
            )
        
        # Load and split data
        X_train, X_test, y_train, y_test = self.data_loader.load_and_split(
            data_path,
            balance=True,
            cache=True
        )
        
        logger.info(f"Data prepared: {len(X_train)} train samples, {len(X_test)} test samples")
        
        return X_train, X_test, y_train, y_test
    
    def _train_model(
        self,
        X_train: np.ndarray,
        y_train: np.ndarray
    ) -> Dict[str, float]:
        """
        Train the phishing detection model with cross-validation.
        
        Args:
            X_train: Training features
            y_train: Training labels
            
        Returns:
            Training metrics including cross-validation scores
        """
        logger.info("Step 2: Training model...")
        
        feature_names = self.data_loader.get_feature_names()
        
        # Standard training
        train_metrics = self.detector.train(
            X_train, y_train,
            feature_names=feature_names
        )
        
        # Cross-validation for robust performance assessment
        logger.info("  Performing 5-fold cross-validation...")
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
        cv_scores = cross_val_score(
            self.detector.model, X_train, y_train,
            cv=cv, scoring='accuracy', n_jobs=-1
        )
        
        train_metrics['cv_mean_accuracy'] = float(np.mean(cv_scores))
        train_metrics['cv_std_accuracy'] = float(np.std(cv_scores))
        
        logger.info(f"  Cross-validation accuracy: {train_metrics['cv_mean_accuracy']:.4f} ± {train_metrics['cv_std_accuracy']:.4f}")
        logger.info("Model training complete")
        
        return train_metrics
    
    def _evaluate_model(
        self,
        X_test: np.ndarray,
        y_test: np.ndarray
    ) -> Dict[str, Any]:
        """
        Evaluate trained model with comprehensive metrics.
        
        Args:
            X_test: Test features
            y_test: Test labels
            
        Returns:
            Evaluation metrics including confusion matrix and classification report
        """
        logger.info("Step 3: Evaluating model...")
        
        test_metrics = self.detector.evaluate(X_test, y_test, detailed=True)
        
        # Generate predictions for classification report
        y_pred = self.detector.predict(X_test)
        
        # Log classification report
        logger.info("\n" + "="*60)
        logger.info("Classification Report:")
        logger.info("="*60)
        report = classification_report(
            y_test, y_pred,
            target_names=['Legitimate', 'Phishing'],
            digits=4
        )
        for line in report.split('\n'):
            if line.strip():
                logger.info("  " + line)
        
        # Log confusion matrix
        if 'confusion_matrix' in test_metrics:
            cm = test_metrics['confusion_matrix']
            logger.info("\n" + "="*60)
            logger.info("Confusion Matrix:")
            logger.info("="*60)
            logger.info(f"                 Predicted Legitimate  Predicted Phishing")
            logger.info(f"Actual Legitimate:        {cm[0][0]:<15d}  {cm[0][1]:<15d}")
            logger.info(f"Actual Phishing:          {cm[1][0]:<15d}  {cm[1][1]:<15d}")
            logger.info("="*60)
        
        logger.info("Model evaluation complete")
        
        return test_metrics
    
    def _get_feature_importance(self) -> Optional[Dict[str, float]]:
        """
        Get feature importance from trained model.
        
        Returns:
            Feature importance dictionary
        """
        logger.info("Step 4: Extracting feature importance...")
        
        feature_importance = self.detector.get_feature_importance(top_n=20)
        
        if feature_importance:
            logger.info("Top 5 features:")
            for i, (feature, importance) in enumerate(list(feature_importance.items())[:5], 1):
                logger.info(f"  {i}. {feature}: {importance:.4f}")
        
        return feature_importance
    
    def _save_model(self) -> Path:
        """
        Save trained model to disk.
        
        Returns:
            Path to saved model
        """
        logger.info("Step 5: Saving model...")
        
        model_path = self.detector.save("phishing_detector")
        
        logger.info(f"Model saved successfully")
        
        return model_path
    
    def _generate_report(
        self,
        train_metrics: Dict[str, Any],
        test_metrics: Dict[str, Any],
        feature_importance: Optional[Dict[str, float]]
    ) -> Path:
        """
        Generate training report in JSON format.
        
        Args:
            train_metrics: Training metrics
            test_metrics: Test metrics
            feature_importance: Feature importance scores
            
        Returns:
            Path to report file
        """
        logger.info("Step 6: Generating training report...")
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "model_type": self.model_type,
            "configuration": self.config.to_dict(),
            "train_metrics": train_metrics,
            "test_metrics": test_metrics,
            "feature_importance": feature_importance or {},
            "model_info": self.detector.get_model_info()
        }
        
        # Save report
        report_path = self.config.paths.models_dir / f"training_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, default=str)
        
        logger.info(f"Training report saved to {report_path}")
        
        return report_path
    
    def get_history(self) -> Dict[str, Any]:
        """
        Get training history.
        
        Returns:
            Dictionary containing training history
        """
        return self.history


if __name__ == "__main__":
    # Run training pipeline when script is executed directly
    pipeline = TrainingPipeline(
        model_type="ensemble",
        use_sample_data=True  # Generate sample data if no data file exists
    )
    
    results = pipeline.run()
    
    if results["success"]:
        print("\n" + "=" * 60)
        print("TRAINING SUCCESSFUL!")
        print("=" * 60)
        print(f"Model Type: {results['model_type']}")
        print(f"Accuracy: {results['test_metrics']['accuracy']:.4f}")
        print(f"Precision: {results['test_metrics']['precision']:.4f}")
        print(f"Recall: {results['test_metrics']['recall']:.4f}")
        print(f"F1 Score: {results['test_metrics']['f1_score']:.4f}")
        print(f"Model saved to: {results['model_path']}")
        print("=" * 60)
    else:
        print(f"\nTraining failed: {results.get('error')}")
