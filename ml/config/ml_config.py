"""
ML Configuration
Defines all hyperparameters and constants per ML_SPECIFICATION.md
"""

# Success Criteria Thresholds
MIN_ACCURACY = 0.95
MIN_PRECISION = 0.95
MIN_RECALL = 0.95
MIN_F1_SCORE = 0.95
MIN_CV_SCORE = 0.95
MAX_CV_STD = 0.05

# Confidence Thresholds
PHISHING_MIN_CONFIDENCE = 0.85
PHISHING_TARGET_CONFIDENCE = 0.90  # Target for most phishing URLs
LEGITIMATE_MAX_CONFIDENCE = 0.15
LEGITIMATE_TARGET_CONFIDENCE = 0.10  # Target for most legitimate URLs

# Dataset Requirements
MIN_TOTAL_URLS = 300
MIN_PHISHING_URLS = 150
MIN_LEGITIMATE_URLS = 150

# Model Configuration
MODEL_TYPE = "LogisticRegression"
RANDOM_STATE = 42
TEST_SIZE = 0.20
CV_FOLDS = 5

# Hyperparameter Grid for Grid Search
PARAM_GRID = {
    'C': [0.1, 1.0, 10.0, 100.0, 1000.0],
    'class_weight': ['balanced', {0: 2, 1: 1}, {0: 3, 1: 1}, {0: 1, 1: 1}],
    'solver': ['lbfgs', 'liblinear'],
    'max_iter': [2000]
}

# Feature Engineering Requirements
MIN_FEATURES = 50

# Export Paths
MODEL_OUTPUT_PATH = "ml/models/trained_model.json"
PUBLIC_MODEL_PATH = "public/ml/enhanced_model.json"
DIST_MODEL_PATH = "dist/ml/enhanced_model.json"

# Mandatory Test Cases (URL -> Expected Min Confidence)
MANDATORY_PHISHING_TESTS = {
    "http://g00gle-verify.tk/login": 0.90,
    "http://faceb00k-security.com/verify": 0.85,
    "http://paypal.secure-account.xyz/update": 0.85,
    "http://192.168.1.1/admin/login.php": 0.90,
    "http://bank-security-verify.com/signin": 0.85,
}

MANDATORY_LEGITIMATE_TESTS = {
    "https://google.com/search": 0.15,
    "https://paypal.com/signin": 0.20,
    "https://amazon.com/products": 0.15,
    "https://github.com/repositories": 0.15,
    "https://microsoft.com": 0.15,
}

# Logging
ENABLE_DEBUG_LOGGING = True
LOG_TRAINING_METRICS = True
LOG_PREDICTION_DETAILS = True
