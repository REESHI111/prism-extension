"""
ML Phishing Detector - Training Pipeline
Trains model with grid search, cross-validation, and comprehensive validation
Per ML_SPECIFICATION.md requirements
"""

import sys
import json
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix

# Add ml directory to path
sys.path.append('ml')

from data.training_data import get_training_data, get_dataset_stats
from src.features.feature_extractor import URLFeatureExtractor
from config.ml_config import (
    MIN_ACCURACY, MIN_PRECISION, MIN_RECALL, MIN_F1_SCORE,
    MIN_CV_SCORE, MAX_CV_STD, PHISHING_MIN_CONFIDENCE,
    LEGITIMATE_MAX_CONFIDENCE, MODEL_OUTPUT_PATH,
    PARAM_GRID, RANDOM_STATE, TEST_SIZE, CV_FOLDS,
    MANDATORY_PHISHING_TESTS, MANDATORY_LEGITIMATE_TESTS,
    PUBLIC_MODEL_PATH
)

class PhishingDetectorTrainer:
    """Trains and validates the phishing detection model"""
    
    def __init__(self):
        self.feature_extractor = URLFeatureExtractor()
        self.scaler = StandardScaler()
        self.model = None
        self.best_params = None
        self.training_metrics = {}
        
    def prepare_data(self):
        """Load and prepare training data"""
        print("\n" + "="*80)
        print("STEP 1: PREPARING DATA")
        print("="*80)
        
        # Load training data
        training_data = get_training_data()
        stats = get_dataset_stats()
        
        print(f"\nDataset Statistics:")
        print(f"  Total URLs: {stats['total_urls']}")
        print(f"  Phishing: {stats['phishing_urls']}")
        print(f"  Legitimate: {stats['legitimate_urls']}")
        
        # Extract features
        print("\nExtracting features...")
        X = []
        y = []
        
        for url, label in training_data:
            features = self.feature_extractor.extract_features(url)
            X.append(features)
            y.append(label)
        
        X = np.array(X)
        y = np.array(y)
        
        print(f"  Features extracted: {X.shape[1]} features per URL")
        print(f"  Total samples: {X.shape[0]}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
        )
        
        print(f"\nTrain/Test Split:")
        print(f"  Training samples: {X_train.shape[0]}")
        print(f"  Test samples: {X_test.shape[0]}")
        print(f"  Training phishing: {sum(y_train)}")
        print(f"  Training legitimate: {len(y_train) - sum(y_train)}")
        print(f"  Test phishing: {sum(y_test)}")
        print(f"  Test legitimate: {len(y_test) - sum(y_test)}")
        
        # Standardize features
        print("\nStandardizing features...")
        X_train = self.scaler.fit_transform(X_train)
        X_test = self.scaler.transform(X_test)
        
        return X_train, X_test, y_train, y_test
    
    def train_with_grid_search(self, X_train, y_train):
        """Train model using grid search for hyperparameter tuning"""
        print("\n" + "="*80)
        print("STEP 2: HYPERPARAMETER TUNING (GRID SEARCH)")
        print("="*80)
        
        print(f"\nSearching parameter grid:")
        for param, values in PARAM_GRID.items():
            print(f"  {param}: {values}")
        
        # Grid search with cross-validation
        grid_search = GridSearchCV(
            LogisticRegression(random_state=RANDOM_STATE),
            PARAM_GRID,
            cv=CV_FOLDS,
            scoring='accuracy',
            n_jobs=-1,
            verbose=1
        )
        
        print(f"\nRunning {CV_FOLDS}-fold cross-validation...")
        grid_search.fit(X_train, y_train)
        
        self.model = grid_search.best_estimator_
        self.best_params = grid_search.best_params_
        
        print(f"\nBest parameters found:")
        for param, value in self.best_params.items():
            print(f"  {param}: {value}")
        
        print(f"\nBest cross-validation score: {grid_search.best_score_:.4f}")
        
        return grid_search.best_score_
    
    def evaluate_model(self, X_train, X_test, y_train, y_test):
        """Comprehensive model evaluation"""
        print("\n" + "="*80)
        print("STEP 3: MODEL EVALUATION")
        print("="*80)
        
        # Training set evaluation
        print("\n--- Training Set Performance ---")
        y_train_pred = self.model.predict(X_train)
        train_accuracy = accuracy_score(y_train, y_train_pred)
        train_precision = precision_score(y_train, y_train_pred)
        train_recall = recall_score(y_train, y_train_pred)
        train_f1 = f1_score(y_train, y_train_pred)
        
        print(f"  Accuracy:  {train_accuracy:.4f}")
        print(f"  Precision: {train_precision:.4f}")
        print(f"  Recall:    {train_recall:.4f}")
        print(f"  F1 Score:  {train_f1:.4f}")
        
        # Test set evaluation
        print("\n--- Test Set Performance ---")
        y_test_pred = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, y_test_pred)
        test_precision = precision_score(y_test, y_test_pred)
        test_recall = recall_score(y_test, y_test_pred)
        test_f1 = f1_score(y_test, y_test_pred)
        
        print(f"  Accuracy:  {test_accuracy:.4f}")
        print(f"  Precision: {test_precision:.4f}")
        print(f"  Recall:    {test_recall:.4f}")
        print(f"  F1 Score:  {test_f1:.4f}")
        
        # Confusion matrix
        print("\n--- Confusion Matrix ---")
        cm = confusion_matrix(y_test, y_test_pred)
        print(f"                Predicted")
        print(f"              Legit  Phish")
        print(f"Actual Legit    {cm[0][0]:3d}    {cm[0][1]:3d}")
        print(f"       Phish    {cm[1][0]:3d}    {cm[1][1]:3d}")
        
        # Cross-validation scores
        print("\n--- Cross-Validation Scores ---")
        cv_scores = cross_val_score(self.model, X_train, y_train, cv=CV_FOLDS)
        print(f"  CV Scores: {[f'{score:.4f}' for score in cv_scores]}")
        print(f"  Mean: {cv_scores.mean():.4f}")
        print(f"  Std:  {cv_scores.std():.4f}")
        
        # Store metrics
        self.training_metrics = {
            'train_accuracy': train_accuracy,
            'train_precision': train_precision,
            'train_recall': train_recall,
            'train_f1': train_f1,
            'test_accuracy': test_accuracy,
            'test_precision': test_precision,
            'test_recall': test_recall,
            'test_f1': test_f1,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std()
        }
        
        return test_accuracy, test_precision, test_recall, test_f1, cv_scores
    
    def test_mandatory_cases(self):
        """Test on mandatory test cases from specification"""
        print("\n" + "="*80)
        print("STEP 4: MANDATORY TEST CASES")
        print("="*80)
        
        all_passed = True
        
        print("\n--- Phishing URLs (must be >= threshold) ---")
        for url, min_confidence in MANDATORY_PHISHING_TESTS.items():
            features = self.feature_extractor.extract_features(url)
            features_scaled = self.scaler.transform([features])
            probability = self.model.predict_proba(features_scaled)[0][1]
            
            passed = probability >= min_confidence
            status = "✓ PASS" if passed else "✗ FAIL"
            print(f"  {status} {url}")
            print(f"        Confidence: {probability:.1%} (required: >= {min_confidence:.0%})")
            
            if not passed:
                all_passed = False
        
        print("\n--- Legitimate URLs (must be <= threshold) ---")
        for url, max_confidence in MANDATORY_LEGITIMATE_TESTS.items():
            features = self.feature_extractor.extract_features(url)
            features_scaled = self.scaler.transform([features])
            probability = self.model.predict_proba(features_scaled)[0][1]
            
            passed = probability <= max_confidence
            status = "✓ PASS" if passed else "✗ FAIL"
            print(f"  {status} {url}")
            print(f"        Confidence: {probability:.1%} (required: <= {max_confidence:.0%})")
            
            if not passed:
                all_passed = False
        
        return all_passed
    
    def validate_success_criteria(self, test_accuracy, test_precision, test_recall, test_f1, cv_scores):
        """Validate against ML_SPECIFICATION.md success criteria"""
        print("\n" + "="*80)
        print("STEP 5: SUCCESS CRITERIA VALIDATION")
        print("="*80)
        
        criteria_results = []
        
        # Check accuracy
        accuracy_pass = test_accuracy >= MIN_ACCURACY
        status = "✓ PASS" if accuracy_pass else "✗ FAIL"
        print(f"\n  {status} Accuracy: {test_accuracy:.4f} (required: >= {MIN_ACCURACY})")
        criteria_results.append(accuracy_pass)
        
        # Check precision
        precision_pass = test_precision >= MIN_PRECISION
        status = "✓ PASS" if precision_pass else "✗ FAIL"
        print(f"  {status} Precision: {test_precision:.4f} (required: >= {MIN_PRECISION})")
        criteria_results.append(precision_pass)
        
        # Check recall
        recall_pass = test_recall >= MIN_RECALL
        status = "✓ PASS" if recall_pass else "✗ FAIL"
        print(f"  {status} Recall: {test_recall:.4f} (required: >= {MIN_RECALL})")
        criteria_results.append(recall_pass)
        
        # Check F1 score
        f1_pass = test_f1 >= MIN_F1_SCORE
        status = "✓ PASS" if f1_pass else "✗ FAIL"
        print(f"  {status} F1 Score: {test_f1:.4f} (required: >= {MIN_F1_SCORE})")
        criteria_results.append(f1_pass)
        
        # Check cross-validation
        cv_mean_pass = cv_scores.mean() >= MIN_CV_SCORE
        cv_std_pass = cv_scores.std() <= MAX_CV_STD
        cv_pass = cv_mean_pass and cv_std_pass
        status = "✓ PASS" if cv_pass else "✗ FAIL"
        print(f"  {status} Cross-Validation: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
        print(f"        (required: >= {MIN_CV_SCORE} with std <= {MAX_CV_STD})")
        criteria_results.append(cv_pass)
        
        all_passed = all(criteria_results)
        
        print(f"\n{'='*80}")
        if all_passed:
            print("✓ ALL SUCCESS CRITERIA MET")
        else:
            print("✗ SOME CRITERIA FAILED - MODEL NEEDS IMPROVEMENT")
        print(f"{'='*80}")
        
        return all_passed
    
    def export_model(self):
        """Export model to JSON for browser use"""
        print("\n" + "="*80)
        print("STEP 6: EXPORTING MODEL")
        print("="*80)
        
        # Extract model parameters
        coefficients = self.model.coef_[0].tolist()
        intercept = float(self.model.intercept_[0])
        scaler_mean = self.scaler.mean_.tolist()
        scaler_scale = self.scaler.scale_.tolist()
        feature_names = self.feature_extractor.get_feature_names()
        
        # Create model JSON
        model_data = {
            'version': '4.0',
            'model_type': 'LogisticRegression',
            'trained_on': self.training_metrics.get('test_accuracy', 0) * 100,
            'coefficients': coefficients,
            'intercept': intercept,
            'scaler_mean': scaler_mean,
            'scaler_scale': scaler_scale,
            'feature_names': feature_names,
            'metrics': self.training_metrics,
            'hyperparameters': self.best_params,
            'num_features': len(feature_names)
        }
        
        # Save to models directory
        with open(MODEL_OUTPUT_PATH, 'w') as f:
            json.dump(model_data, f, indent=2)
        print(f"\n  ✓ Saved to: {MODEL_OUTPUT_PATH}")
        
        # Copy to public directory
        import os
        os.makedirs('public/ml', exist_ok=True)
        with open(PUBLIC_MODEL_PATH, 'w') as f:
            json.dump(model_data, f, indent=2)
        print(f"  ✓ Saved to: {PUBLIC_MODEL_PATH}")
        
        print(f"\n  Model version: {model_data['version']}")
        print(f"  Features: {model_data['num_features']}")
        print(f"  Test accuracy: {model_data['trained_on']:.2f}%")

def main():
    """Main training pipeline"""
    print("\n" + "="*80)
    print("ML PHISHING DETECTOR - TRAINING PIPELINE")
    print("="*80)
    
    trainer = PhishingDetectorTrainer()
    
    # Step 1: Prepare data
    X_train, X_test, y_train, y_test = trainer.prepare_data()
    
    # Step 2: Train with grid search
    cv_best_score = trainer.train_with_grid_search(X_train, y_train)
    
    # Step 3: Evaluate model
    test_accuracy, test_precision, test_recall, test_f1, cv_scores = trainer.evaluate_model(
        X_train, X_test, y_train, y_test
    )
    
    # Step 4: Test mandatory cases
    mandatory_passed = trainer.test_mandatory_cases()
    
    # Step 5: Validate success criteria
    criteria_passed = trainer.validate_success_criteria(
        test_accuracy, test_precision, test_recall, test_f1, cv_scores
    )
    
    # Step 6: Export model
    if criteria_passed and mandatory_passed:
        trainer.export_model()
        print("\n✓ Training completed successfully!")
        print("  Model ready for deployment.")
        return 0
    else:
        print("\n✗ Training completed with failures.")
        print("  Model does NOT meet requirements.")
        print("  Review results above and adjust training data or features.")
        return 1

if __name__ == "__main__":
    exit(main())
