"""
PRISM ML - Phishing Detection Model Training
--------------------------------------------
Trains a phishing detection model and generates performance reports.

Usage:
    python train.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from src.training.train_pipeline import TrainingPipeline
from src.utils.logger import get_logger

logger = get_logger(__name__)


def main():
    print("\n" + "=" * 60)
    print("🚀 PRISM ML - Model Training Pipeline")
    print("=" * 60 + "\n")

    pipeline = TrainingPipeline(
        model_type="ensemble",
        use_sample_data=True,  # Use generated data if no dataset is provided
    )

    try:
        results = pipeline.run(save_model=True, generate_report=True)

        if results.get("success"):
            print("\n" + "=" * 70)
            print("✅ TRAINING SUCCESSFUL!")
            print("=" * 70)
            
            # Model information
            print(f"\n🧠 Model Configuration:")
            print(f"   Type: {results.get('model_type', 'ensemble').upper()}")
            print(f"   Training Time: {results['elapsed_time']:.2f} seconds")
            
            # Training metrics with cross-validation
            train_metrics = results.get("train_metrics", {})
            if train_metrics:
                print(f"\n🎯 Training Performance:")
                print(f"   Training Accuracy: {train_metrics.get('accuracy', 0):.4f}")
                if 'cv_mean_accuracy' in train_metrics:
                    print(f"   Cross-Validation: {train_metrics['cv_mean_accuracy']:.4f} ± {train_metrics['cv_std_accuracy']:.4f}")
            
            # Test metrics
            test_metrics = results.get("test_metrics", {})
            print(f"\n📊 Test Performance:")
            print(f"   Accuracy:  {test_metrics.get('accuracy', 0):.4f}")
            print(f"   Precision: {test_metrics.get('precision', 0):.4f}")
            print(f"   Recall:    {test_metrics.get('recall', 0):.4f}")
            print(f"   F1-Score:  {test_metrics.get('f1_score', 0):.4f}")
            if 'roc_auc' in test_metrics:
                print(f"   ROC-AUC:   {test_metrics.get('roc_auc', 0):.4f}")
            
            # Confusion Matrix
            if 'confusion_matrix' in test_metrics:
                cm = test_metrics['confusion_matrix']
                print(f"\n📋 Confusion Matrix:")
                print(f"                   Predicted")
                print(f"                Legit    Phishing")
                print(f"   Actual Legit    {cm[0][0]:<8d} {cm[0][1]:<8d}")
                print(f"   Actual Phish    {cm[1][0]:<8d} {cm[1][1]:<8d}")

            # Feature importance
            if results.get("feature_importance"):
                print(f"\n🔍 Top 10 Most Important Features:")
                for i, (feature, importance) in enumerate(
                    list(results["feature_importance"].items())[:10], 1
                ):
                    bar_length = int(importance * 40)  # Visual bar
                    bar = "█" * bar_length
                    print(f"   {i:2d}. {feature:25s} {bar} {importance:.4f}")
            
            # File paths
            print(f"\n💾 Output Files:")
            print(f"   Model: {results.get('model_path')}")
            print(f"   Report: {results.get('report_path')}")

            print("\n" + "=" * 70)
            print("🎉 Ready for predictions! Run: python test_predictions.py")
            print("=" * 70 + "\n")
        else:
            print("\n" + "=" * 70)
            print(f"❌ Training failed: {results.get('error', 'Unknown error')}")
            print("=" * 70 + "\n")
            sys.exit(1)

    except Exception as e:
        logger.error(f"Training failed: {e}", exc_info=True)
        print(f"❌ Error during training: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
