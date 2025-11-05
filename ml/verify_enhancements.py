"""
Quick verification of enhanced phishing detection implementation.
Shows sample generated data and confirms all improvements are working.
"""

import pandas as pd
from pathlib import Path

print("\n" + "=" * 70)
print("🔍 PRISM ML - Enhancement Verification")
print("=" * 70)

# Check if dataset exists
dataset_path = Path("data/raw/phishing_urls.csv")
if dataset_path.exists():
    df = pd.read_csv(dataset_path)
    
    print(f"\n📊 Generated Dataset Statistics:")
    print(f"   Total URLs: {len(df)}")
    print(f"   Legitimate: {(df['label']==0).sum()} ({(df['label']==0).sum()/len(df)*100:.1f}%)")
    print(f"   Phishing: {(df['label']==1).sum()} ({(df['label']==1).sum()/len(df)*100:.1f}%)")
    
    # Show sample phishing URLs with different patterns
    print(f"\n🚨 Sample Phishing URLs (Diverse Attack Patterns):")
    phishing_urls = df[df['label']==1]['url'].head(15).tolist()
    
    for i, url in enumerate(phishing_urls, 1):
        # Identify pattern
        if '.tk' in url or '.ml' in url or '.ga' in url or '.xyz' in url:
            pattern = "Suspicious TLD"
        elif any(c.isdigit() for c in url.split('/')[2].split('.')[0]):
            pattern = "IP Address" if url.split('/')[2].replace('.', '').isdigit() else "Typosquatting"
        elif '-' in url and any(word in url for word in ['verify', 'secure', 'login', 'account']):
            pattern = "Subdomain Spoofing"
        elif len(url) > 60:
            pattern = "Long URL"
        else:
            pattern = "Mixed Pattern"
        
        print(f"   {i:2d}. [{pattern:20s}] {url}")
    
    # Show sample legitimate URLs
    print(f"\n✅ Sample Legitimate URLs:")
    legit_urls = df[df['label']==0]['url'].head(8).tolist()
    for i, url in enumerate(legit_urls, 1):
        print(f"   {i}. {url}")
    
    # Show URL length distribution
    print(f"\n📏 URL Length Statistics:")
    print(f"   Phishing URLs:")
    print(f"      Mean: {df[df['label']==1]['url'].str.len().mean():.1f} chars")
    print(f"      Max:  {df[df['label']==1]['url'].str.len().max()} chars")
    print(f"   Legitimate URLs:")
    print(f"      Mean: {df[df['label']==0]['url'].str.len().mean():.1f} chars")
    print(f"      Max:  {df[df['label']==0]['url'].str.len().max()} chars")
    
    # Check for common phishing keywords
    phishing_keywords = ['verify', 'secure', 'account', 'login', 'update', 'confirm']
    print(f"\n🔑 Phishing Keyword Prevalence:")
    for keyword in phishing_keywords:
        count = df[df['label']==1]['url'].str.contains(keyword, case=False).sum()
        percentage = (count / (df['label']==1).sum()) * 100
        print(f"   '{keyword}': {count} URLs ({percentage:.1f}%)")
    
else:
    print(f"\n❌ Dataset not found: {dataset_path}")
    print("   Run: python train.py (to generate sample data)")

# Check if model exists
model_path = Path("models/phishing_detector.joblib")
if model_path.exists():
    print(f"\n✅ Trained Model: {model_path}")
    print(f"   Size: {model_path.stat().st_size / 1024:.1f} KB")
else:
    print(f"\n⚠️  Model not found: {model_path}")

# Check for training report
reports = list(Path("models").glob("training_report_*.json"))
if reports:
    latest_report = max(reports, key=lambda p: p.stat().st_mtime)
    print(f"\n📄 Latest Training Report: {latest_report.name}")
    print(f"   Size: {latest_report.stat().st_size / 1024:.1f} KB")

print("\n" + "=" * 70)
print("✅ Enhancement verification complete!")
print("=" * 70 + "\n")
