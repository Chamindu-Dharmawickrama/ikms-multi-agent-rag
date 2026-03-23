#!/usr/bin/env python3
"""
Render Deployment Verification Script

Run this script to verify your backend is ready for Render deployment.
Usage: python verify_render_deployment.py
"""

import os
import sys
from pathlib import Path

def check_files():
    """Check if all required Render deployment files exist."""
    print("\n✓ Checking deployment files...")
    
    required_files = {
        "Procfile": "backend/Procfile",
        "Dockerfile": "backend/Dockerfile",
        "requirements.txt": "backend/requirements.txt",
        "runtime.txt": "backend/runtime.txt",
        "Health endpoint": "backend/src/app/main.py",
        "GitHub workflow": ".github/workflows/keep-alive.yml",
        "Config management": "backend/src/app/core/config.py",
    }
    
    all_present = True
    for name, path in required_files.items():
        full_path = Path(path)
        if full_path.exists():
            print(f"   ✅ {name}: {path}")
        else:
            print(f"   ❌ {name}: {path} (MISSING!)")
            all_present = False
    
    return all_present

def check_procfile():
    """Verify Procfile is correctly configured for Render."""
    print("\n✓ Checking Procfile configuration...")
    
    procfile_path = Path("backend/Procfile")
    if not procfile_path.exists():
        print("   ❌ Procfile not found")
        return False
    
    content = procfile_path.read_text().strip()
    
    required_configs = [
        ("uvicorn", "uvicorn server configured"),
        ("src.app.main:server", "correct app module referenced"),
        ("--host 0.0.0.0", "listening on all interfaces"),
        ("--port $PORT", "using Render PORT variable"),
        ("--timeout-keep-alive", "keep-alive timeout set"),
    ]
    
    all_good = True
    for keyword, description in required_configs:
        if keyword in content:
            print(f"   ✅ {description}")
        else:
            print(f"   ⚠️  {description} - NOT FOUND")
            all_good = False
    
    print(f"\n   Current Procfile content:")
    print(f"   {content}")
    
    return all_good

def check_health_endpoint():
    """Verify health endpoint exists."""
    print("\n✓ Checking health endpoint...")
    
    main_py = Path("backend/src/app/main.py")
    if not main_py.exists():
        print("   ❌ main.py not found")
        return False
    
    content = main_py.read_text()
    
    if "@server.get(\"/health\")" in content or '@server.get("/health")' in content:
        print("   ✅ Health endpoint found")
        if "database" in content.lower():
            print("   ✅ Database connectivity check included")
        return True
    else:
        print("   ❌ Health endpoint not found")
        return False

def check_cors_config():
    """Verify CORS is configured for production."""
    print("\n✓ Checking CORS configuration...")
    
    main_py = Path("backend/src/app/main.py")
    content = main_py.read_text()
    
    checks = [
        ("CORSMiddleware", "CORS middleware configured"),
        ("RENDER", "Render environment check present"),
        ("FRONTEND_URL", "Frontend URL from environment"),
        ("allow_origins", "allow_origins configured"),
    ]
    
    all_good = True
    for keyword, description in checks:
        if keyword in content:
            print(f"   ✅ {description}")
        else:
            print(f"   ⚠️  {description} - NOT FOUND")
            all_good = False
    
    return all_good

def check_dependencies():
    """Check if critical dependencies are available."""
    print("\n✓ Checking Python dependencies...")
    
    req_path = Path("backend/requirements.txt")
    if not req_path.exists():
        print("   ❌ requirements.txt not found")
        return False
    
    content = req_path.read_text()
    
    critical = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("psycopg", "PostgreSQL driver"),
        ("pydantic", "Pydantic"),
        ("langchain", "LangChain"),
    ]
    
    all_present = True
    for pkg, name in critical:
        if pkg in content.lower():
            print(f"   ✅ {name}")
        else:
            print(f"   ❌ {name} - NOT IN REQUIREMENTS")
            all_present = False
    
    return all_present

def check_workflow():
    """Verify GitHub Actions keep-alive workflow."""
    print("\n✓ Checking GitHub Actions workflow...")
    
    workflow_path = Path(".github/workflows/keep-alive.yml")
    if not workflow_path.exists():
        print("   ❌ Workflow file not found")
        return False
    
    try:
        content = workflow_path.read_text(encoding='utf-8', errors='ignore')
    except Exception as e:
        print(f"   ⚠️  Could not read workflow file: {e}")
        return False
    
    checks = [
        ("Keep Render", "Render-specific workflow naming"),
        ("RENDER_SERVICE_URL", "Render service URL secret used"),
        ("*/5 * * * *", "5-minute schedule configured"),
        ("/health", "Health endpoint pinged"),
    ]
    
    all_good = True
    for keyword, description in checks:
        if keyword in content:
            print(f"   ✅ {description}")
        else:
            print(f"   ⚠️  {description} - NOT FOUND")
            all_good = False
    
    return all_good

def check_runtime():
    """Verify Python runtime is specified."""
    print("\n✓ Checking Python runtime version...")
    
    runtime_path = Path("backend/runtime.txt")
    if not runtime_path.exists():
        print("   ❌ runtime.txt not found")
        return False
    
    version = runtime_path.read_text().strip()
    print(f"   ✅ Python version specified: {version}")
    
    if "3.10" in version or "3.11" in version or "3.12" in version:
        print(f"   ✅ Python version is modern and supported")
        return True
    else:
        print(f"   ⚠️  Consider using Python 3.10+")
        return False

def main():
    """Run all checks."""
    print("=" * 60)
    print("🚀 RENDER DEPLOYMENT VERIFICATION")
    print("=" * 60)
    
    checks = [
        check_files,
        check_procfile,
        check_health_endpoint,
        check_cors_config,
        check_dependencies,
        check_workflow,
        check_runtime,
    ]
    
    results = []
    for check in checks:
        try:
            results.append(check())
        except Exception as e:
            print(f"   ❌ Error running check: {e}")
            results.append(False)
    
    print("\n" + "=" * 60)
    print("📊 RESULTS SUMMARY")
    print("=" * 60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Checks passed: {passed}/{total}")
    
    if all(results):
        print("\n✅ YOUR BACKEND IS READY FOR RENDER!")
        print("\nNext steps:")
        print("1. Push changes to GitHub: git push origin main")
        print("2. Create Render service at https://render.com")
        print("3. Set RENDER_SERVICE_URL secret in GitHub")
        print("4. Verify health endpoint: curl https://your-service.onrender.com/health")
        return 0
    else:
        print("\n⚠️  Some checks failed. Please fix the issues above.")
        print("See RENDER_DEPLOYMENT.md for help.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
