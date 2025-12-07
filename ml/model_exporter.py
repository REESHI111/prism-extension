"""
Perfect Model Exporter
Exports Logistic Regression model to browser-compatible JSON
Target size: ~7.6 KB as per documentation
"""

import json
import numpy as np
from pathlib import Path
from datetime import datetime
from config import (
    EXPORT_PATH, FEATURE_NAMES, MODEL_VERSION, MODEL_TYPE_NAME,
    DEPLOYMENT_TARGET, PRECISION_DIGITS, COMPRESS_MODEL
)


class ModelExporter:
    """Export trained model to JSON for browser deployment"""
    
    def __init__(self, model, scaler, feature_names):
        """
        Args:
            model: Trained LogisticRegression model
            scaler: Fitted StandardScaler
            feature_names: List of 30 feature names
        """
        self.model = model
        self.scaler = scaler
        self.feature_names = feature_names
    
    def export_to_json(self, output_path: Path = None) -> dict:
        """
        Export model to JSON format
        
        Returns:
            Model dictionary
        """
        if output_path is None:
            output_path = EXPORT_PATH
        
        print("\n" + "="*70)
        print("📦 MODEL EXPORT")
        print("="*70)
        
        # Extract coefficients
        coefficients = self.model.coef_[0].tolist()
        intercept = float(self.model.intercept_[0])
        
        # Extract scaler parameters
        scaler_mean = self.scaler.mean_.tolist()
        scaler_scale = self.scaler.scale_.tolist()
        
        # Round for compression
        coefficients = [round(c, PRECISION_DIGITS) for c in coefficients]
        intercept = round(intercept, PRECISION_DIGITS)
        scaler_mean = [round(m, PRECISION_DIGITS) for m in scaler_mean]
        scaler_scale = [round(s, PRECISION_DIGITS) for s in scaler_scale]
        
        # Create model dictionary
        model_data = {
            'version': MODEL_VERSION,
            'type': MODEL_TYPE_NAME,
            'deployment': DEPLOYMENT_TARGET,
            'features': self.feature_names,
            'coefficients': coefficients,
            'intercept': intercept,
            'scaler': {
                'mean': scaler_mean,
                'scale': scaler_scale
            },
            'metadata': {
                'num_features': len(self.feature_names),
                'training_date': datetime.now().strftime('%Y-%m-%d'),
                'model_size_kb': 0,  # Will be calculated after saving
            },
            'thresholds': {
                'classification': 0.5,  # 50% probability threshold
                'low': 0.5,
                'medium': 0.75,
                'high': 0.9,
            },
            'risk_levels': {
                'low': 'Safe - No blocking',
                'medium': 'Warning - Can proceed',
                'high': 'Danger - Strong warning',
                'critical': 'Blocked - High confidence phishing'
            }
        }
        
        # Save to JSON
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w') as f:
            if COMPRESS_MODEL:
                json.dump(model_data, f, separators=(',', ':'))
            else:
                json.dump(model_data, f, indent=2)
        
        # Calculate file size
        file_size_kb = output_path.stat().st_size / 1024
        model_data['metadata']['model_size_kb'] = round(file_size_kb, 2)
        
        # Update file with size
        with open(output_path, 'w') as f:
            if COMPRESS_MODEL:
                json.dump(model_data, f, separators=(',', ':'))
            else:
                json.dump(model_data, f, indent=2)
        
        print(f"\n  ✅ Model exported to:")
        print(f"    {output_path}")
        print(f"\n  📊 Export Details:")
        print(f"    File size: {file_size_kb:.2f} KB")
        print(f"    Features: {len(self.feature_names)}")
        print(f"    Coefficients: {len(coefficients)}")
        print(f"    Compressed: {'Yes' if COMPRESS_MODEL else 'No'}")
        
        # Validate export
        self.validate_export(output_path)
        
        return model_data
    
    def validate_export(self, json_path: Path):
        """Validate exported JSON file"""
        print(f"\n  🔍 Validating export...")
        
        try:
            with open(json_path, 'r') as f:
                data = json.load(f)
            
            # Check required fields
            required_fields = ['version', 'type', 'features', 'coefficients', 'intercept', 'scaler']
            for field in required_fields:
                assert field in data, f"Missing field: {field}"
            
            # Check dimensions
            assert len(data['features']) == len(self.feature_names), "Feature count mismatch"
            assert len(data['coefficients']) == len(self.feature_names), "Coefficient count mismatch"
            assert len(data['scaler']['mean']) == len(self.feature_names), "Scaler mean count mismatch"
            assert len(data['scaler']['scale']) == len(self.feature_names), "Scaler scale count mismatch"
            
            print(f"    ✅ Export validation passed")
            
            # Test inference
            self.test_inference(data)
            
        except Exception as e:
            print(f"    ❌ Validation failed: {e}")
            raise
    
    def test_inference(self, model_data: dict):
        """Test model inference with sample data"""
        print(f"\n  🧪 Testing inference...")
        
        # Create test feature vector (all zeros)
        test_features = [0.0] * len(self.feature_names)
        
        # Simulate JavaScript inference
        # Step 1: Scale features
        scaled_features = []
        for i, val in enumerate(test_features):
            scaled = (val - model_data['scaler']['mean'][i]) / model_data['scaler']['scale'][i]
            scaled_features.append(scaled)
        
        # Step 2: Calculate logit (linear combination)
        logit = model_data['intercept']
        for i, coef in enumerate(model_data['coefficients']):
            logit += scaled_features[i] * coef
        
        # Step 3: Apply sigmoid
        probability = 1 / (1 + np.exp(-logit))
        
        # Step 4: Classify
        is_phishing = probability >= model_data['thresholds']['classification']
        
        print(f"    Test input (all zeros):")
        print(f"      Probability: {probability:.4f}")
        print(f"      Is phishing: {is_phishing}")
        print(f"    ✅ Inference test passed")
    
    def create_usage_example(self, output_path: Path = None):
        """Create JavaScript usage example"""
        if output_path is None:
            output_path = EXPORT_PATH.parent / 'usage_example.js'
        
        example_code = '''
// Load model
const model = await fetch('/ml/model_lightweight.json').then(r => r.json());

// Extract features from URL (30 features)
function extractFeatures(url) {
    // ... extract 30 features ...
    return features;  // Array of 30 numbers
}

// Make prediction
function predict(url) {
    const features = extractFeatures(url);
    
    // Step 1: Scale features
    const scaledFeatures = features.map((val, i) => {
        return (val - model.scaler.mean[i]) / model.scaler.scale[i];
    });
    
    // Step 2: Calculate logit
    let logit = model.intercept;
    for (let i = 0; i < model.coefficients.length; i++) {
        logit += scaledFeatures[i] * model.coefficients[i];
    }
    
    // Step 3: Sigmoid function
    const probability = 1 / (1 + Math.exp(-logit));
    
    // Step 4: Classify
    const isPhishing = probability >= model.thresholds.classification;
    
    // Step 5: Determine risk level
    let riskLevel;
    if (probability >= model.thresholds.high) {
        riskLevel = 'critical';
    } else if (probability >= model.thresholds.medium) {
        riskLevel = 'high';
    } else if (probability >= model.thresholds.low) {
        riskLevel = 'medium';
    } else {
        riskLevel = 'low';
    }
    
    return {
        isPhishing,
        confidence: probability,
        riskLevel,
        probability
    };
}

// Example usage
const result = predict('http://g00gle-verify.tk/login');
console.log(result);
// {
//   isPhishing: true,
//   confidence: 0.94,
//   riskLevel: 'critical',
//   probability: 0.94
// }
'''
        
        with open(output_path, 'w') as f:
            f.write(example_code)
        
        print(f"\n  📝 Usage example saved to:")
        print(f"    {output_path}")


if __name__ == '__main__':
    print("🧪 ModelExporter test requires a trained model")
    print("Run train.py first to generate a model")
