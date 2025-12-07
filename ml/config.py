"""
Perfect ML Configuration
Based on ML_MODEL_DOCUMENTATION.md specifications
"""

import os
from pathlib import Path

# ============================================================================
# PROJECT PATHS
# ============================================================================

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / 'data'
RAW_DATA_DIR = DATA_DIR / 'raw'
PROCESSED_DATA_DIR = DATA_DIR / 'processed'
MODELS_DIR = BASE_DIR / 'models'
LOGS_DIR = BASE_DIR / 'logs'
PUBLIC_DIR = BASE_DIR.parent / 'public' / 'ml'

# Create directories
for directory in [RAW_DATA_DIR, PROCESSED_DATA_DIR, MODELS_DIR, LOGS_DIR, PUBLIC_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

# ============================================================================
# DATA COLLECTION SETTINGS
# ============================================================================

# Target dataset size (10,000 phishing + 10,000 legitimate)
TARGET_PHISHING_URLS = 10000
TARGET_LEGITIMATE_URLS = 10000

# Data sources
PHISHING_SOURCES = [
    'https://data.phishtank.com/data/online-valid.csv',  # PhishTank
    'https://openphish.com/feed.txt',  # OpenPhish
]

LEGITIMATE_SOURCES = [
    'http://s3.amazonaws.com/alexa-static/top-1m.csv.zip',  # Alexa Top 1M
]

# Known legitimate domains (built-in safe list)
TRUSTED_DOMAINS = [
    # Search engines
    'google.com', 'bing.com', 'yahoo.com', 'yandex.com', 'duckduckgo.com', 'baidu.com',
    
    # Major platforms
    'youtube.com', 'facebook.com', 'twitter.com', 'x.com', 'instagram.com', 
    'linkedin.com', 'reddit.com', 'pinterest.com', 'tumblr.com', 'snapchat.com',
    
    # Tech companies
    'microsoft.com', 'apple.com', 'amazon.com', 'netflix.com', 'spotify.com',
    'github.com', 'gitlab.com', 'bitbucket.org', 'stackoverflow.com',
    
    # Email & Communication
    'gmail.com', 'outlook.com', 'yahoo.com', 'protonmail.com', 'zoho.com',
    'slack.com', 'discord.com', 'telegram.org', 'whatsapp.com',
    
    # Cloud & Developer
    'aws.amazon.com', 'azure.microsoft.com', 'cloud.google.com', 'heroku.com',
    'vercel.com', 'netlify.com', 'cloudflare.com',
    
    # E-commerce
    'ebay.com', 'alibaba.com', 'walmart.com', 'etsy.com', 'shopify.com',
    
    # News & Media
    'cnn.com', 'bbc.com', 'reuters.com', 'nytimes.com', 'theguardian.com',
    
    # Education
    'wikipedia.org', 'coursera.org', 'udemy.com', 'edx.org', 'khanacademy.org',
]

# ============================================================================
# FEATURE ENGINEERING - 30 FEATURES (from documentation)
# ============================================================================

FEATURE_NAMES = [
    # URL Structure Features (10)
    'urlLength',
    'domainLength',
    'pathLength',
    'numDots',
    'numHyphens',
    'numUnderscores',
    'numPercent',
    'numAmpersand',
    'numEquals',
    'numQuestion',
    
    # Security Features (5)
    'hasHTTPS',
    'hasAt',
    'hasIP',
    'hasPort',
    'hasSuspiciousTLD',
    
    # Domain Features (7)
    'numSubdomains',
    'maxSubdomainLength',
    'typosquattingScore',
    'missingCharScore',
    'hasBrandName',
    'digitRatio',
    'entropy',
    
    # Keyword Features (8)
    'hasLoginKeyword',
    'hasVerifyKeyword',
    'hasSecureKeyword',
    'hasAccountKeyword',
    'hasUpdateKeyword',
    'hasUrgencyKeyword',
    'suspiciousPatternCount',
    'combinedSuspicious',
]

# Known brands for typosquatting detection
KNOWN_BRANDS = [
    'google', 'facebook', 'paypal', 'microsoft', 'apple', 'amazon', 'netflix',
    'instagram', 'twitter', 'linkedin', 'ebay', 'yahoo', 'github', 'dropbox',
    'spotify', 'adobe', 'oracle', 'samsung', 'sony', 'walmart', 'target',
    'chase', 'bankofamerica', 'wellsfargo', 'citibank', 'usbank', 'capitalone',
]

# Suspicious TLDs (cheap/free domains)
SUSPICIOUS_TLDS = [
    'tk', 'ml', 'ga', 'cf', 'gq',  # Free domains
    'xyz', 'top', 'work', 'click', 'link',  # Cheap domains
    'pw', 'cc', 'info', 'biz', 'online',  # Commonly abused
    'club', 'website', 'site', 'space', 'tech',
]

# Legitimate TLDs
LEGITIMATE_TLDS = [
    'com', 'org', 'net', 'edu', 'gov', 'mil',  # Official
    'uk', 'us', 'ca', 'au', 'de', 'fr', 'jp', 'cn', 'in', 'br',  # Country codes
    'io', 'dev', 'ai', 'app', 'tech', 'cloud',  # Tech domains
    'google', 'microsoft', 'apple', 'amazon',  # Brand TLDs
    'me', 'tv', 'co', 'ly',  # Popular short TLDs
]

# Phishing keywords
PHISHING_KEYWORDS = {
    'login': ['login', 'log-in', 'signin', 'sign-in', 'logon'],
    'verify': ['verify', 'verification', 'confirm', 'validate'],
    'secure': ['secure', 'security', 'protection', 'protected', 'safe'],
    'account': ['account', 'billing', 'payment', 'wallet', 'bank'],
    'update': ['update', 'upgrade', 'renew', 'restore', 'recover'],
    'urgency': ['urgent', 'immediate', 'suspend', 'suspended', 'expire', 'expired', 
                'limited', 'act-now', 'alert', 'warning', 'blocked'],
}

# Digit to letter substitutions for typosquatting
DIGIT_SUBSTITUTIONS = {
    '0': 'o',
    '1': 'i',
    '3': 'e',
    '4': 'a',
    '5': 's',
    '7': 't',
}

# ============================================================================
# MODEL TRAINING SETTINGS
# ============================================================================

# Model type (Logistic Regression as per documentation)
MODEL_TYPE = 'logistic_regression'

# Train/Test split
TEST_SIZE = 0.2
VALIDATION_SIZE = 0.1
RANDOM_STATE = 42

# Class balancing
USE_SMOTE = True  # Handle imbalanced data

# Logistic Regression hyperparameters
LOGISTIC_REGRESSION_PARAMS = {
    'max_iter': 1000,
    'solver': 'lbfgs',
    'penalty': 'l2',
    'C': 1.0,
    'class_weight': 'balanced',
    'random_state': RANDOM_STATE,
}

# Cross-validation
CV_FOLDS = 5

# Target accuracy (as per documentation: 92.8%)
TARGET_ACCURACY = 0.928
TARGET_PRECISION = 0.912
TARGET_RECALL = 0.895
TARGET_FALSE_POSITIVE_RATE = 0.032

# ============================================================================
# MODEL EXPORT SETTINGS
# ============================================================================

# Export paths
EXPORT_PATH = PUBLIC_DIR / 'model_lightweight.json'
MODEL_BACKUP_PATH = MODELS_DIR / 'model.pkl'

# JSON export settings
PRECISION_DIGITS = 6  # Coefficient precision
COMPRESS_MODEL = True  # Remove unnecessary whitespace

# Model metadata
MODEL_VERSION = '1.0'
MODEL_TYPE_NAME = 'Logistic Regression'
DEPLOYMENT_TARGET = 'Browser JavaScript'

# ============================================================================
# LOGGING SETTINGS
# ============================================================================

LOG_FILE = LOGS_DIR / 'training.log'
LOG_LEVEL = 'INFO'
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'

# Colored console logging
CONSOLE_LOG_FORMAT = '%(log_color)s%(levelname)-8s%(reset)s %(blue)s%(message)s'
LOG_COLORS = {
    'DEBUG': 'cyan',
    'INFO': 'green',
    'WARNING': 'yellow',
    'ERROR': 'red',
    'CRITICAL': 'red,bg_white',
}

# ============================================================================
# VALIDATION SETTINGS
# ============================================================================

# URL validation
MIN_URL_LENGTH = 10
MAX_URL_LENGTH = 2048
REQUIRE_VALID_DOMAIN = True

# Data quality
MIN_SAMPLES_PER_CLASS = 5000  # Minimum 5k samples per class
MAX_DUPLICATE_RATIO = 0.1  # Max 10% duplicates allowed

# ============================================================================
# PERFORMANCE TARGETS (from documentation)
# ============================================================================

PERFORMANCE_TARGETS = {
    'accuracy': 0.928,  # 92.8%
    'precision': 0.912,  # 91.2%
    'recall': 0.895,  # 89.5%
    'false_positive_rate': 0.032,  # 3.2%
    'false_negative_rate': 0.105,  # 10.5%
    'inference_time_ms': 5,  # <5ms per URL
    'model_size_kb': 10,  # <10KB JSON
}

print(f"✅ Configuration loaded successfully")
print(f"📁 Base directory: {BASE_DIR}")
print(f"🎯 Target: {TARGET_PHISHING_URLS:,} phishing + {TARGET_LEGITIMATE_URLS:,} legitimate URLs")
print(f"🧠 Model: {MODEL_TYPE_NAME} with {len(FEATURE_NAMES)} features")
print(f"📊 Target accuracy: {TARGET_ACCURACY*100:.1f}%")
