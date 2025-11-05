# PRISM ML Setup Script
# Run this to set up the ML environment

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PRISM ML Environment Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python not found. Please install Python 3.8+`n" -ForegroundColor Red
    exit 1
}
Write-Host "Found: $pythonVersion`n" -ForegroundColor Green

# Check if we're in the ml directory
if (-not (Test-Path "requirements.txt")) {
    Write-Host "ERROR: Please run this script from the ml/ directory`n" -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "Creating virtual environment..." -ForegroundColor Yellow
    python -m venv venv
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Failed to create virtual environment`n" -ForegroundColor Red
        exit 1
    }
    Write-Host "Virtual environment created`n" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists`n" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& ".\venv\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip --quiet

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes...`n" -ForegroundColor Cyan
pip install -r requirements.txt

if ($LASTEXITCODE -ne 0) {
    Write-Host "`nERROR: Failed to install dependencies`n" -ForegroundColor Red
    exit 1
}

# Create .env file if it doesn't exist
if (-not (Test-Path ".env")) {
    Write-Host "`nCreating .env configuration file..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host ".env file created (using defaults)`n" -ForegroundColor Green
} else {
    Write-Host "`n.env file already exists`n" -ForegroundColor Green
}

# Create required directories
Write-Host "Creating directory structure..." -ForegroundColor Yellow
$directories = @("data\raw", "data\processed", "models", "logs", "models\tfjs")
foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "Directory structure created`n" -ForegroundColor Green

# Display success message
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Train the model:   python train.py" -ForegroundColor White
Write-Host "2. Test predictions:  python test_predictions.py`n" -ForegroundColor White

Write-Host "For more information, see README.md`n" -ForegroundColor Yellow
