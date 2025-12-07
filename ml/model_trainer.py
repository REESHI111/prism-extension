"""
Perfect ML Model Trainer
Trains Logistic Regression model to achieve 92.8% accuracy
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report, confusion_matrix, roc_auc_score
)
from imblearn.over_sampling import SMOTE
import joblib
from pathlib import Path
from datetime import datetime
from config import (
    FEATURE_NAMES, TEST_SIZE, VALIDATION_SIZE, RANDOM_STATE,
    USE_SMOTE, LOGISTIC_REGRESSION_PARAMS, CV_FOLDS,
    TARGET_ACCURACY, TARGET_PRECISION, TARGET_RECALL,
    MODELS_DIR, MODEL_BACKUP_PATH
)


class ModelTrainer:
    """Train and evaluate Logistic Regression model"""
    
    def __init__(self):
        self.feature_names = FEATURE_NAMES
        self.model = None
        self.scaler = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
    
    def prepare_data(self, features_df: pd.DataFrame, labels: pd.Series):
        """
        Prepare data for training
        
        Args:
            features_df: DataFrame with 30 features
            labels: Series with 0 (legitimate) or 1 (phishing)
        """
        print("\n" + "="*70)
        print("📊 DATA PREPARATION")
        print("="*70)
        
        # Split train/test
        X_train, X_test, y_train, y_test = train_test_split(
            features_df, labels,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE,
            stratify=labels
        )
        
        print(f"  Training set: {len(X_train):,} samples")
        print(f"  Test set: {len(X_test):,} samples")
        
        # Apply SMOTE for class balancing
        if USE_SMOTE:
            print(f"\n  🔄 Applying SMOTE for class balancing...")
            smote = SMOTE(random_state=RANDOM_STATE)
            X_train, y_train = smote.fit_resample(X_train, y_train)
            print(f"    ✅ Balanced training set: {len(X_train):,} samples")
        
        # Feature scaling
        print(f"\n  📏 Scaling features...")
        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        self.X_train = X_train_scaled
        self.X_test = X_test_scaled
        self.y_train = y_train
        self.y_test = y_test
        
        print(f"    ✅ Features scaled (mean=0, std=1)")
        
        return X_train_scaled, X_test_scaled, y_train, y_test
    
    def train_model(self):
        """Train Logistic Regression model"""
        print("\n" + "="*70)
        print("🧠 MODEL TRAINING")
        print("="*70)
        
        print(f"  Model: Logistic Regression")
        print(f"  Features: {len(self.feature_names)}")
        print(f"  Samples: {len(self.X_train):,}")
        
        # Create model
        self.model = LogisticRegression(**LOGISTIC_REGRESSION_PARAMS)
        
        # Train
        print(f"\n  🔄 Training model...")
        self.model.fit(self.X_train, self.y_train)
        print(f"    ✅ Model trained successfully")
        
        # Cross-validation
        print(f"\n  📊 Cross-validation ({CV_FOLDS} folds)...")
        cv_scores = cross_val_score(
            self.model, self.X_train, self.y_train,
            cv=CV_FOLDS, scoring='accuracy'
        )
        
        print(f"    CV Accuracy: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        return self.model
    
    def evaluate_model(self) -> dict:
        """
        Evaluate model performance
        
        Returns:
            Dictionary with all metrics
        """
        print("\n" + "="*70)
        print("📈 MODEL EVALUATION")
        print("="*70)
        
        # Predictions
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # Calculate metrics
        accuracy = accuracy_score(self.y_test, y_pred)
        precision = precision_score(self.y_test, y_pred)
        recall = recall_score(self.y_test, y_pred)
        f1 = f1_score(self.y_test, y_pred)
        roc_auc = roc_auc_score(self.y_test, y_pred_proba)
        
        # Confusion matrix
        tn, fp, fn, tp = confusion_matrix(self.y_test, y_pred).ravel()
        
        # Calculate rates
        false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0
        false_negative_rate = fn / (fn + tp) if (fn + tp) > 0 else 0
        
        metrics = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'roc_auc': roc_auc,
            'false_positive_rate': false_positive_rate,
            'false_negative_rate': false_negative_rate,
            'true_negatives': tn,
            'false_positives': fp,
            'false_negatives': fn,
            'true_positives': tp,
        }
        
        # Print results
        print(f"\n  ✅ PERFORMANCE METRICS")
        print(f"  " + "-"*60)
        print(f"    Accuracy:           {accuracy:.4f} ({accuracy*100:.2f}%)")
        print(f"    Precision:          {precision:.4f} ({precision*100:.2f}%)")
        print(f"    Recall:             {recall:.4f} ({recall*100:.2f}%)")
        print(f"    F1 Score:           {f1:.4f}")
        print(f"    ROC-AUC:            {roc_auc:.4f}")
        print(f"    False Positive Rate: {false_positive_rate:.4f} ({false_positive_rate*100:.2f}%)")
        print(f"    False Negative Rate: {false_negative_rate:.4f} ({false_negative_rate*100:.2f}%)")
        
        print(f"\n  📊 CONFUSION MATRIX")
        print(f"  " + "-"*60)
        print(f"    True Negatives:  {tn:,} (Correct legitimate)")
        print(f"    False Positives: {fp:,} (Legitimate flagged as phishing)")
        print(f"    False Negatives: {fn:,} (Phishing not detected)")
        print(f"    True Positives:  {tp:,} (Correct phishing)")
        
        # Compare with targets
        print(f"\n  🎯 TARGET COMPARISON")
        print(f"  " + "-"*60)
        print(f"    Accuracy:      {accuracy:.4f} vs {TARGET_ACCURACY:.4f} ({'✅' if accuracy >= TARGET_ACCURACY else '⚠️'})")
        print(f"    Precision:     {precision:.4f} vs {TARGET_PRECISION:.4f} ({'✅' if precision >= TARGET_PRECISION else '⚠️'})")
        print(f"    Recall:        {recall:.4f} vs {TARGET_RECALL:.4f} ({'✅' if recall >= TARGET_RECALL else '⚠️'})")
        
        # Detailed classification report
        print(f"\n  📋 CLASSIFICATION REPORT")
        print(f"  " + "-"*60)
        print(classification_report(
            self.y_test, y_pred,
            target_names=['Legitimate', 'Phishing'],
            digits=4
        ))
        
        return metrics
    
    def get_feature_importance(self) -> pd.DataFrame:
        """Get feature coefficients (importance)"""
        coefficients = self.model.coef_[0]
        
        importance_df = pd.DataFrame({
            'feature': self.feature_names,
            'coefficient': coefficients,
            'abs_coefficient': np.abs(coefficients)
        })
        
        importance_df = importance_df.sort_values('abs_coefficient', ascending=False)
        
        print(f"\n  🔍 TOP 10 MOST IMPORTANT FEATURES")
        print(f"  " + "-"*60)
        
        for i, row in importance_df.head(10).iterrows():
            sign = '+' if row['coefficient'] > 0 else ''
            print(f"    {row['feature']:25s}: {sign}{row['coefficient']:7.4f}")
        
        return importance_df
    
    def save_model(self, filename: str = None):
        """Save trained model and scaler"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f'model_{timestamp}.pkl'
        
        filepath = MODELS_DIR / filename
        
        # Save model and scaler
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'training_date': datetime.now().isoformat(),
        }
        
        joblib.dump(model_data, filepath)
        
        # Also save to standard location
        joblib.dump(model_data, MODEL_BACKUP_PATH)
        
        print(f"\n  💾 Model saved to:")
        print(f"    {filepath}")
        print(f"    {MODEL_BACKUP_PATH}")
        
        return filepath
    
    def load_model(self, filepath: Path):
        """Load trained model"""
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.feature_names = model_data['feature_names']
        
        print(f"  ✅ Model loaded from {filepath}")
        
        return self.model


if __name__ == '__main__':
    # Test with dummy data
    import numpy as np
    
    print("🧪 Testing ModelTrainer with dummy data...")
    
    # Create dummy features
    n_samples = 1000
    n_features = 30
    
    X = np.random.randn(n_samples, n_features)
    y = np.random.randint(0, 2, n_samples)
    
    features_df = pd.DataFrame(X, columns=FEATURE_NAMES)
    labels = pd.Series(y)
    
    # Train
    trainer = ModelTrainer()
    trainer.prepare_data(features_df, labels)
    trainer.train_model()
    metrics = trainer.evaluate_model()
    trainer.get_feature_importance()
    
    print("\n✅ ModelTrainer test complete")
