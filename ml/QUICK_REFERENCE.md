# 🚀 PRISM ML Quick Reference

## One-Line Commands

```powershell
# Activate environment
cd ml; .\activate.ps1

# Test a URL
python test_url.py "https://www.googgle.com"

# Interactive testing
python test_url.py

# Train model (5-15 min)
python train.py

# Rebuild extension
cd ..; npm run build
```

---

## Test Examples

### ✅ Safe URLs
```
https://www.google.com
https://www.amazon.com
https://github.com
https://www.microsoft.com
```

### 🚨 Phishing URLs
```
https://www.googgle.com         # Repeated chars
https://www.dcsdvsdvsdwvv.com   # Random string
http://g00gle-verify.tk/login   # Typosquatting + TLD + keywords
http://paypa1-secure.ml/verify  # Multiple attacks
```

---

## Quick Checks

**Model trained?**
```powershell
Test-Path models\model_*.pkl
```

**Browser export exists?**
```powershell
Test-Path ..\public\ml\model_lightweight.json
```

**Environment activated?**
```powershell
python --version  # Should show 3.12.10
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Import errors | `.\activate.ps1` then `pip install -r requirements.txt` |
| Model not found | `python train.py` |
| VS Code errors | Select interpreter: `.\venv\Scripts\python.exe` |
| Can't activate | `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` |

---

## Performance Targets

| Metric | Target | Actual |
|--------|--------|--------|
| Accuracy | 92.8% | **96.25%** ✅ |
| Precision | 91.2% | **97.5%** ✅ |
| Recall | 89.5% | **95.0%** ✅ |

---

## What Gets Detected

✅ Typosquatting: `g00gle`, `paypa1`  
✅ Repeated chars: `googgle`, `paypaal`  
✅ Random strings: `dcsdvsdvsdwvv`  
✅ Missing chars: `gogle`, `facbook`  
✅ Suspicious TLDs: `.tk`, `.ml`, `.xyz`  
✅ Keywords: "verify", "urgent", "login"  

---

## Files to Know

| File | Purpose |
|------|---------|
| `test_url.py` | Test URLs interactively |
| `train.py` | Train new model |
| `config.py` | All settings |
| `ML_MODEL_GUIDE.md` | Full documentation |

---

## Need Help?

Read the full guide:
```powershell
cat ML_MODEL_GUIDE.md
```

Or open in editor:
```powershell
code ML_MODEL_GUIDE.md
```

---

**Quick Start:** `.\activate.ps1` → `python test_url.py` 🚀
