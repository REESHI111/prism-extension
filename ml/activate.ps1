# Activate ML Virtual Environment
Write-Host "🔧 Activating ML Virtual Environment..." -ForegroundColor Cyan

# Activate the virtual environment
& "$PSScriptRoot\venv\Scripts\Activate.ps1"

# Verify activation
if ($env:VIRTUAL_ENV) {
    Write-Host "✅ Virtual environment activated successfully!" -ForegroundColor Green
    Write-Host "📍 Python: $env:VIRTUAL_ENV\Scripts\python.exe" -ForegroundColor Yellow
    
    # Show Python version
    python --version
    
    # Show installed packages
    Write-Host "`n📦 Key packages installed:" -ForegroundColor Cyan
    python -c "import numpy; print('  ✅ numpy', numpy.__version__)"
    python -c "import pandas; print('  ✅ pandas', pandas.__version__)"
    python -c "import sklearn; print('  ✅ scikit-learn', sklearn.__version__)"
    python -c "import tldextract; print('  ✅ tldextract', tldextract.__version__)"
    python -c "import Levenshtein; print('  ✅ Levenshtein', Levenshtein.__version__)"
    
    Write-Host "`n🚀 Ready to train! Run: python train.py" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to activate virtual environment" -ForegroundColor Red
}
