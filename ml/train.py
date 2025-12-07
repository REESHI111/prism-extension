"""
Perfect ML Training Pipeline
Trains model to achieve 92.8% accuracy as documented
"""

import pandas as pd
import numpy as np
import colorlog
import logging
import sys
from pathlib import Path
from datetime import datetime
import argparse

# Import our modules
from config import (
    FEATURE_NAMES, LOG_FILE, LOG_COLORS, CONSOLE_LOG_FORMAT,
    TARGET_ACCURACY, PERFORMANCE_TARGETS
)
from data_collector import DataCollector
from feature_extractor import FeatureExtractor
from model_trainer import ModelTrainer
from model_exporter import ModelExporter


def setup_logging():
    """Setup colored logging"""
    # Console handler with colors
    console_handler = colorlog.StreamHandler()
    console_handler.setFormatter(colorlog.ColoredFormatter(
        CONSOLE_LOG_FORMAT,
        log_colors=LOG_COLORS
    ))
    
    # File handler
    file_handler = logging.FileHandler(LOG_FILE)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    ))
    
    # Root logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    
    return logger


def print_header(title: str):
    """Print formatted header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def main():
    """Main training pipeline"""
    # Parse arguments
    parser = argparse.ArgumentParser(description='Train Perfect ML Phishing Detector')
    parser.add_argument('--force-download', action='store_true',
                       help='Force download fresh data')
    parser.add_argument('--quick-test', action='store_true',
                       help='Quick test with small dataset')
    args = parser.parse_args()
    
    # Setup logging
    logger = setup_logging()
    
    print("\n" + "="*70)
    print("  🧠 PERFECT ML PHISHING DETECTION SYSTEM")
    print("  Training Pipeline v1.0")
    print("="*70)
    print(f"  Start time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Target accuracy: {TARGET_ACCURACY*100:.1f}%")
    print(f"  Features: {len(FEATURE_NAMES)}")
    print("="*70)
    
    try:
        # ====================================================================
        # STEP 1: DATA COLLECTION
        # ====================================================================
        
        print_header("STEP 1/5: DATA COLLECTION")
        
        collector = DataCollector()
        
        if args.quick_test:
            print("  ⚡ Quick test mode - using small dataset")
            # For testing, just use cached data or small subset
            phishing_urls = ['http://phishing1.tk', 'http://phishing2.ml']
            legitimate_urls = ['https://google.com', 'https://amazon.com']
        else:
            phishing_urls, legitimate_urls = collector.collect_all_data(
                force_download=args.force_download
            )
        
        # Create dataset
        dataset = collector.create_dataset(phishing_urls, legitimate_urls)
        
        logger.info(f"Dataset created: {len(dataset):,} samples")
        
        # ====================================================================
        # STEP 2: FEATURE EXTRACTION
        # ====================================================================
        
        print_header("STEP 2/5: FEATURE EXTRACTION")
        
        print(f"  Extracting {len(FEATURE_NAMES)} features from {len(dataset):,} URLs...")
        
        extractor = FeatureExtractor()
        
        # Extract features for all URLs
        features_list = []
        
        from tqdm import tqdm
        for url in tqdm(dataset['url'], desc="  Extracting features"):
            features = extractor.extract_features(url)
            features_list.append(features)
        
        # Convert to DataFrame
        features_df = pd.DataFrame(features_list)
        labels = dataset['label']
        
        logger.info(f"Features extracted: {features_df.shape}")
        
        # Save features
        features_path = Path('data/processed/features.csv')
        features_df.to_csv(features_path, index=False)
        logger.info(f"Features saved to {features_path}")
        
        # ====================================================================
        # STEP 3: MODEL TRAINING
        # ====================================================================
        
        print_header("STEP 3/5: MODEL TRAINING")
        
        trainer = ModelTrainer()
        
        # Prepare data
        X_train, X_test, y_train, y_test = trainer.prepare_data(features_df, labels)
        
        # Train model
        model = trainer.train_model()
        
        logger.info("Model training completed")
        
        # ====================================================================
        # STEP 4: MODEL EVALUATION
        # ====================================================================
        
        print_header("STEP 4/5: MODEL EVALUATION")
        
        metrics = trainer.evaluate_model()
        
        # Get feature importance
        importance_df = trainer.get_feature_importance()
        
        # Save model
        model_path = trainer.save_model()
        
        logger.info(f"Model saved to {model_path}")
        
        # ====================================================================
        # STEP 5: MODEL EXPORT
        # ====================================================================
        
        print_header("STEP 5/5: MODEL EXPORT TO BROWSER")
        
        exporter = ModelExporter(
            model=trainer.model,
            scaler=trainer.scaler,
            feature_names=FEATURE_NAMES
        )
        
        # Export to JSON
        model_data = exporter.export_to_json()
        
        # Create usage example
        exporter.create_usage_example()
        
        logger.info(f"Model exported to {exporter.export_to_json.__defaults__[0]}")
        
        # ====================================================================
        # FINAL SUMMARY
        # ====================================================================
        
        print("\n" + "="*70)
        print("  ✅ TRAINING COMPLETE")
        print("="*70)
        
        print(f"\n  📊 FINAL PERFORMANCE:")
        print(f"    Accuracy:           {metrics['accuracy']*100:.2f}%")
        print(f"    Precision:          {metrics['precision']*100:.2f}%")
        print(f"    Recall:             {metrics['recall']*100:.2f}%")
        print(f"    F1 Score:           {metrics['f1_score']:.4f}")
        print(f"    ROC-AUC:            {metrics['roc_auc']:.4f}")
        print(f"    False Positive Rate: {metrics['false_positive_rate']*100:.2f}%")
        
        print(f"\n  📁 OUTPUT FILES:")
        print(f"    Model (PKL):  {model_path}")
        print(f"    Model (JSON): {model_data['metadata'].get('export_path', 'public/ml/model_lightweight.json')}")
        print(f"    Features:     data/processed/features.csv")
        print(f"    Logs:         {LOG_FILE}")
        
        print(f"\n  🎯 TARGET ACHIEVEMENT:")
        targets_met = 0
        total_targets = 3
        
        if metrics['accuracy'] >= PERFORMANCE_TARGETS['accuracy']:
            print(f"    ✅ Accuracy target met ({metrics['accuracy']:.4f} >= {PERFORMANCE_TARGETS['accuracy']:.4f})")
            targets_met += 1
        else:
            print(f"    ⚠️  Accuracy below target ({metrics['accuracy']:.4f} < {PERFORMANCE_TARGETS['accuracy']:.4f})")
        
        if metrics['precision'] >= PERFORMANCE_TARGETS['precision']:
            print(f"    ✅ Precision target met ({metrics['precision']:.4f} >= {PERFORMANCE_TARGETS['precision']:.4f})")
            targets_met += 1
        else:
            print(f"    ⚠️  Precision below target ({metrics['precision']:.4f} < {PERFORMANCE_TARGETS['precision']:.4f})")
        
        if metrics['recall'] >= PERFORMANCE_TARGETS['recall']:
            print(f"    ✅ Recall target met ({metrics['recall']:.4f} >= {PERFORMANCE_TARGETS['recall']:.4f})")
            targets_met += 1
        else:
            print(f"    ⚠️  Recall below target ({metrics['recall']:.4f} < {PERFORMANCE_TARGETS['recall']:.4f})")
        
        print(f"\n  📈 Overall: {targets_met}/{total_targets} targets achieved")
        
        print(f"\n  💡 NEXT STEPS:")
        print(f"    1. Test model in browser extension")
        print(f"    2. Verify model_lightweight.json loads correctly")
        print(f"    3. Test with real phishing URLs")
        print(f"    4. Monitor false positive rate")
        print(f"    5. Collect user feedback for improvements")
        
        print(f"\n  End time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("="*70)
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Training interrupted by user")
        return 1
    
    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        print(f"\n❌ Training failed: {e}")
        return 1


if __name__ == '__main__':
    sys.exit(main())
